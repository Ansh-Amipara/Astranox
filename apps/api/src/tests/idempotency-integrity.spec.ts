import './setup';
import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express, { Request, Response } from 'express';
import { requireIdempotency } from '../core/middleware/idempotency';
import { errorHandler } from '../core/middleware/error-handler';
import { prismaTest } from './setup';

describe('Idempotency & Game Balance Integrity', { timeout: 30000 }, () => {
  const testUserId = '654321654321654321654321';
  let app: express.Express;
  let executionCount = 0;

  beforeEach(async () => {
    executionCount = 0;
    await prismaTest.idempotencyKey.deleteMany().catch(() => {});

    app = express();
    app.use(express.json());

    // Inject fake authenticated user
    app.use((req, _res, next) => {
      req.user = {
        id: testUserId,
        role: 'USER',
        username: 'idempTester',
        email: 'idempTester@example.com',
        isBanned: false,
      };
      next();
    });

    app.post('/api/test-mutation', requireIdempotency(), (req: Request, res: Response) => {
      executionCount++;
      res.status(200).json({
        success: true,
        data: {
          actionId: req.body.actionId,
          processedCount: executionCount,
        },
      });
    });

    // Mount centralized error handler
    app.use(errorHandler);
  });

  it('rejects mutation if Idempotency-Key header is missing (400)', async () => {
    const res = await request(app)
      .post('/api/test-mutation')
      .send({ actionId: 'grant_1' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('BAD_REQUEST');
  });

  it('executes once and replays identical response on matching key + payload', async () => {
    const key = 'test-key-replay-123';
    const payload = { actionId: 'claim_reward' };

    // 1. Initial request
    const res1 = await request(app)
      .post('/api/test-mutation')
      .set('Idempotency-Key', key)
      .send(payload);

    expect(res1.status).toBe(200);
    expect(res1.body.data.processedCount).toBe(1);
    expect(res1.headers['x-idempotent-replay']).toBeUndefined();

    // 2. Exact same request replayed
    const res2 = await request(app)
      .post('/api/test-mutation')
      .set('Idempotency-Key', key)
      .send(payload);

    expect(res2.status).toBe(200);
    expect(res2.body.data.processedCount).toBe(1); // Handler was not re-executed!
    expect(res2.headers['x-idempotent-replay']).toBe('true');
    expect(executionCount).toBe(1);
  });

  it('returns 422 if same key is reused with a different payload', async () => {
    const key = 'test-key-conflict-456';

    // 1. Initial request
    await request(app)
      .post('/api/test-mutation')
      .set('Idempotency-Key', key)
      .send({ actionId: 'buy_potion', quantity: 1 });

    // 2. Key reused with differing payload
    const resMismatch = await request(app)
      .post('/api/test-mutation')
      .set('Idempotency-Key', key)
      .send({ actionId: 'buy_potion', quantity: 99 });

    expect(resMismatch.status).toBe(422);
    expect(resMismatch.body.error.code).toBe('IDEMPOTENCY_KEY_MISMATCH');
  });

  it('returns 409 Conflict if request with same key is currently in processing state', async () => {
    const key = 'test-key-processing-789';

    // Manually insert an in-flight processing key into MongoDB
    await prismaTest.idempotencyKey.create({
      data: {
        key,
        userId: testUserId,
        route: '/api/test-mutation',
        requestHash: 'mock-hash',
        status: 'processing',
      },
    });

    const res = await request(app)
      .post('/api/test-mutation')
      .set('Idempotency-Key', key)
      .send({ actionId: 'some_action' });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('CONCURRENT_REQUEST');
  });
});
