import { describe, it, expect, beforeEach, vi } from 'vitest';
import express, { Request, Response } from 'express';
import request from 'supertest';
import { container } from 'tsyringe';
import { requestIdMiddleware } from '../core/middleware/request-id';
import { errorHandler } from '../core/middleware/error-handler';
import { requireFeatureFlag } from '../core/middleware/require-feature-flag';
import { FeatureFlagService } from '../core/services/feature-flag.service';
import { verifySocketRole, verifySocketFeatureFlag } from '../socket';
import { prismaTest } from './setup';
import type { UserPayload } from '@astranox/types';

describe('Phase 3: Platform Integrity (Request IDs, Feature Flags, Admin Checks)', () => {
  let app: express.Express;
  let flagService: FeatureFlagService;

  beforeEach(() => {
    flagService = container.resolve(FeatureFlagService);
    app = express();
    app.use(express.json());
    app.use(requestIdMiddleware);
  });

  describe('Request ID & Error Propagation', () => {
    it('generates an X-Request-Id header if missing and attaches it to error responses', async () => {
      app.get('/api/test-error', () => {
        throw new Error('Test unhandled crash');
      });
      app.use(errorHandler);

      const res = await request(app).get('/api/test-error');

      expect(res.status).toBe(500);
      expect(res.headers['x-request-id']).toBeDefined();
      expect(typeof res.headers['x-request-id']).toBe('string');
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
      expect(res.body.error.requestId).toBe(res.headers['x-request-id']);
    });

    it('sanitizes and preserves valid incoming X-Request-Id header', async () => {
      const incomingId = 'client-custom-req-12345';
      app.get('/api/test-id', (_req: Request, res: Response) => {
        res.status(200).json({ success: true });
      });
      app.use(errorHandler);

      const res = await request(app)
        .get('/api/test-id')
        .set('X-Request-Id', incomingId);

      expect(res.status).toBe(200);
      expect(res.headers['x-request-id']).toBe(incomingId);
    });
  });

  describe('Feature Flag Middleware & Maintenance Mode', () => {
    it('returns 503 FEATURE_DISABLED when feature flag is disabled', async () => {
      vi.spyOn(flagService, 'isEnabled').mockImplementation(async (key) => {
        if (key === 'maintenanceMode') return false;
        if (key === 'trading') return false;
        return true;
      });

      app.get('/api/trades', requireFeatureFlag('trading'), (_req: Request, res: Response) => {
        res.status(200).json({ success: true });
      });
      app.use(errorHandler);

      const res = await request(app).get('/api/trades');

      expect(res.status).toBe(503);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FEATURE_DISABLED');
      expect(res.body.error.message).toContain('trading');
      expect(res.body.error.requestId).toBeDefined();
    });

    it('enforces maintenanceMode returning 503 for normal users but permits ADMIN bypass', async () => {
      vi.spyOn(flagService, 'isEnabled').mockImplementation(async (key) => {
        if (key === 'maintenanceMode') return true;
        return true;
      });

      // Normal User
      app.get(
        '/api/game-action-user',
        (req, _res, next) => {
          req.user = { id: 'user1', username: 'trainer1', role: 'USER', email: 'u1@t.com' };
          next();
        },
        requireFeatureFlag('battles'),
        (_req: Request, res: Response) => {
          res.status(200).json({ success: true });
        }
      );

      // Admin User
      app.get(
        '/api/game-action-admin',
        (req, _res, next) => {
          req.user = { id: 'admin1', username: 'adminTrainer', role: 'ADMIN', email: 'adm@t.com' };
          next();
        },
        requireFeatureFlag('battles'),
        (_req: Request, res: Response) => {
          res.status(200).json({ success: true, bypassed: true });
        }
      );

      app.use(errorHandler);

      const userRes = await request(app).get('/api/game-action-user');
      expect(userRes.status).toBe(503);
      expect(userRes.body.error.code).toBe('FEATURE_DISABLED');
      expect(userRes.body.error.message).toContain('maintenance mode');

      const adminRes = await request(app).get('/api/game-action-admin');
      expect(adminRes.status).toBe(200);
      expect(adminRes.body.data?.bypassed || adminRes.body.bypassed).toBe(true);
    });
  });

  describe('Socket Platform Guards', () => {
    it('verifySocketRole allows authorized roles and emits FORBIDDEN with requestId on violation', () => {
      const emitted: any[] = [];
      const mockAdminSocket: any = {
        data: { user: { id: 'a1', role: 'ADMIN' }, currentRequestId: 'req-sock-1' },
        emit: (event: string, payload: any) => emitted.push({ event, payload }),
      };
      const mockUserSocket: any = {
        data: { user: { id: 'u1', role: 'USER' }, currentRequestId: 'req-sock-2' },
        emit: (event: string, payload: any) => emitted.push({ event, payload }),
      };

      const adminAllowed = verifySocketRole(mockAdminSocket, ['ADMIN', 'MODERATOR']);
      expect(adminAllowed).toBe(true);
      expect(emitted.length).toBe(0);

      const userAllowed = verifySocketRole(mockUserSocket, ['ADMIN', 'MODERATOR']);
      expect(userAllowed).toBe(false);
      expect(emitted.length).toBe(1);
      expect(emitted[0].event).toBe('error');
      expect(emitted[0].payload.code).toBe('FORBIDDEN');
      expect(emitted[0].payload.requestId).toBe('req-sock-2');
    });

    it('verifySocketFeatureFlag emits FEATURE_DISABLED with requestId when flag is off', async () => {
      vi.spyOn(flagService, 'isEnabled').mockResolvedValue(false);

      const emitted: any[] = [];
      const mockSocket: any = {
        data: { user: { id: 'u1', role: 'USER' }, currentRequestId: 'req-flag-test' },
        emit: (event: string, payload: any) => emitted.push({ event, payload }),
      };

      const allowed = await verifySocketFeatureFlag(mockSocket, 'trading');
      expect(allowed).toBe(false);
      expect(emitted.length).toBe(1);
      expect(emitted[0].event).toBe('error');
      expect(emitted[0].payload.code).toBe('FEATURE_DISABLED');
      expect(emitted[0].payload.requestId).toBe('req-flag-test');
    });
  });
});
