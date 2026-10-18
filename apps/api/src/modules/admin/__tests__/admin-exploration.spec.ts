import { describe, it, expect, beforeEach } from 'vitest';
import express, { Request, Response, NextFunction } from 'express';
import request from 'supertest';
import { container } from 'tsyringe';
import { AdminController } from '../admin.controller';
import { AdminService } from '../admin.service';
import { ALL_MAPS } from '@astranox/game-map';
import { EXPLORATION_CONSTANTS, CATCH_CONSTANTS } from '@astranox/constants';

describe('Admin Exploration Overview Hook', () => {
  let app: express.Express;
  let controller: AdminController;
  let service: AdminService;

  beforeEach(() => {
    service = container.resolve(AdminService);
    controller = container.resolve(AdminController);

    app = express();
    app.use(express.json());

    // Mock auth middleware for testing endpoint contract
    const mockStaffAuth = (req: Request, _res: Response, next: NextFunction) => {
      req.user = {
        id: '664b1f417e2941001a111111',
        username: 'staffuser',
        email: 'staff@astranox.internal',
        role: 'MODERATOR',
      };
      next();
    };

    app.get('/admin/exploration', mockStaffAuth, controller.getExplorationOverview);
  });

  it('service returns registered maps and exploration/catch constants', () => {
    const overview = service.getExplorationOverview();

    expect(overview.maps).toBeDefined();
    expect(overview.maps['pallet-town']).toBeDefined();
    expect(overview.maps['pallet-town'].id).toBe('pallet-town');
    expect(overview.maps['route-1']).toBeDefined();
    expect(overview.maps['route-1'].id).toBe('route-1');
    expect(overview.maps['route-1'].encounterTables).toBeDefined();

    expect(overview.constants).toBeDefined();
    expect(overview.constants.EXPLORATION_CONSTANTS).toEqual(EXPLORATION_CONSTANTS);
    expect(overview.constants.CATCH_CONSTANTS).toEqual(CATCH_CONSTANTS);
  });

  it('GET /admin/exploration responds with success envelope and data', async () => {
    const res = await request(app).get('/admin/exploration');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.maps['pallet-town']).toBeDefined();
    expect(res.body.data.maps['route-1']).toBeDefined();
    expect(res.body.data.constants.EXPLORATION_CONSTANTS.MOVE_COOLDOWN_MS).toBe(180);
    expect(res.body.data.constants.CATCH_CONSTANTS.REQUIRED_SHAKES).toBe(4);
  });
});
