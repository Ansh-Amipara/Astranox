import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../app';
import { prisma } from '../core/db/prisma';
import { generateAccessToken } from '../core/utils/jwt';

describe('Admin & Pokémart Shop Integration Suite', () => {
  const adminId = '507f191e810c19729de860ea';
  const moderatorId = '507f191e810c19729de860eb';
  const playerId = '507f191e810c19729de860ec';

  const adminToken = generateAccessToken({
    id: adminId,
    username: 'adminUser',
    email: 'admin@test.com',
    role: 'ADMIN',
  });

  const moderatorToken = generateAccessToken({
    id: moderatorId,
    username: 'modUser',
    email: 'mod@test.com',
    role: 'MODERATOR',
  });

  const playerToken = generateAccessToken({
    id: playerId,
    username: 'playerUser',
    email: 'player@test.com',
    role: 'USER',
  });

  beforeEach(async () => {
    // Ensure test shop item exists and has clean baseline
    await prisma.shopItem.upsert({
      where: { key: 'test-ball' },
      update: {
        price: 1000,
        salePrice: null,
        saleStartsAt: null,
        saleEndsAt: null,
        enabled: true,
        dailyLimitPerUser: 5,
        totalStock: 10,
        stockRemaining: 10,
      },
      create: {
        key: 'test-ball',
        name: 'Test Ball',
        category: 'balls',
        description: 'A test ball for unit tests',
        currency: 'astralCoins',
        price: 1000,
        enabled: true,
        dailyLimitPerUser: 5,
        totalStock: 10,
        stockRemaining: 10,
        sortOrder: 999,
      },
    });

    // Ensure player trainer save exists with funds
    await prisma.trainerSave.upsert({
      where: { userId: playerId },
      update: {
        astralCoins: 5000,
        infinityCoins: 1000,
      },
      create: {
        userId: playerId,
        astralCoins: 5000,
        infinityCoins: 1000,
      },
    });

    // Clean user daily purchase records for this test player
    await prisma.userDailyPurchase.deleteMany({
      where: { userId: playerId },
    });
  });

  describe('Effective Price & Sale Windows', () => {
    it('returns regular price when sale window is in the future', async () => {
      const futureStart = new Date(Date.now() + 86400000).toISOString();
      const futureEnd = new Date(Date.now() + 172800000).toISOString();

      await prisma.shopItem.update({
        where: { key: 'test-ball' },
        data: {
          price: 1000,
          salePrice: 500,
          saleStartsAt: new Date(futureStart),
          saleEndsAt: new Date(futureEnd),
        },
      });

      const res = await request(app)
        .get('/shop/items')
        .set('Authorization', `Bearer ${playerToken}`);

      expect(res.status).toBe(200);
      const item = res.body.data.find((i: any) => i.key === 'test-ball');
      expect(item).toBeDefined();
      expect(item.effectivePrice).toBe(1000);
      expect(item.isOnSale).toBe(false);
    });

    it('returns sale price when sale window is active', async () => {
      const pastStart = new Date(Date.now() - 3600000).toISOString();
      const futureEnd = new Date(Date.now() + 3600000).toISOString();

      await prisma.shopItem.update({
        where: { key: 'test-ball' },
        data: {
          price: 1000,
          salePrice: 750,
          saleStartsAt: new Date(pastStart),
          saleEndsAt: new Date(futureEnd),
        },
      });

      const res = await request(app)
        .get('/shop/items')
        .set('Authorization', `Bearer ${playerToken}`);

      expect(res.status).toBe(200);
      const item = res.body.data.find((i: any) => i.key === 'test-ball');
      expect(item).toBeDefined();
      expect(item.effectivePrice).toBe(750);
      expect(item.isOnSale).toBe(true);
    });
  });

  describe('Shop Purchase Rules & Idempotency', () => {
    it('returns 409 PRICE_CHANGED if expectedPrice does not match server effective price', async () => {
      const res = await request(app)
        .post('/shop/purchase')
        .set('Authorization', `Bearer ${playerToken}`)
        .set('Idempotency-Key', 'idemp-test-price-change-1')
        .send({
          itemKey: 'test-ball',
          quantity: 1,
          expectedPrice: 800, // Actual price is 1000
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('PRICE_CHANGED');
      expect(res.body.error.newPrice).toBe(1000);
      expect(res.body.error.itemKey).toBe('test-ball');
    });

    it('returns 400 if user has insufficient funds', async () => {
      await prisma.trainerSave.update({
        where: { userId: playerId },
        data: { astralCoins: 100 },
      });

      const res = await request(app)
        .post('/shop/purchase')
        .set('Authorization', `Bearer ${playerToken}`)
        .set('Idempotency-Key', 'idemp-insufficient-funds-1')
        .send({
          itemKey: 'test-ball',
          quantity: 1, // Cost 1000
          expectedPrice: 1000,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toContain('Not enough Astral Coins');
    });

    it('enforces daily purchase limits', async () => {
      // Limit is 5
      const res = await request(app)
        .post('/shop/purchase')
        .set('Authorization', `Bearer ${playerToken}`)
        .set('Idempotency-Key', 'idemp-daily-limit-1')
        .send({
          itemKey: 'test-ball',
          quantity: 6,
          expectedPrice: 1000,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toContain('Daily purchase limit reached');
    });

    it('enforces stock limits when item is out of stock', async () => {
      await prisma.shopItem.update({
        where: { key: 'test-ball' },
        data: { stockRemaining: 1 },
      });

      const res = await request(app)
        .post('/shop/purchase')
        .set('Authorization', `Bearer ${playerToken}`)
        .set('Idempotency-Key', 'idemp-stock-limit-1')
        .send({
          itemKey: 'test-ball',
          quantity: 2,
          expectedPrice: 1000,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toContain('Insufficient stock remaining');
    });

    it('handles idempotent replay without double-charging funds', async () => {
      const idempotencyKey = crypto.randomUUID();

      // First purchase of 1 ball (cost 1000, initial 5000)
      const res1 = await request(app)
        .post('/shop/purchase')
        .set('Authorization', `Bearer ${playerToken}`)
        .set('Idempotency-Key', idempotencyKey)
        .send({
          itemKey: 'test-ball',
          quantity: 1,
          expectedPrice: 1000,
        });

      expect(res1.status).toBe(200);
      expect(res1.body.success).toBe(true);
      expect(res1.body.data.trainer.astralCoins).toBe(4000);

      // Replay with exact same idempotency key
      const res2 = await request(app)
        .post('/shop/purchase')
        .set('Authorization', `Bearer ${playerToken}`)
        .set('Idempotency-Key', idempotencyKey)
        .send({
          itemKey: 'test-ball',
          quantity: 1,
          expectedPrice: 1000,
        });

      expect(res2.status).toBe(200);
      expect(res2.headers['x-idempotent-replay']).toBe('true');
      expect(res2.body.data.trainer.astralCoins).toBe(4000);

      // Verify DB funds were only deducted once
      const trainer = await prisma.trainerSave.findUnique({ where: { userId: playerId } });
      expect(trainer?.astralCoins).toBe(4000);
    });
  });

  describe('Admin Shop Endpoints & Role Checks', () => {
    it('allows admin to edit price with reason and writes history', async () => {
      const res = await request(app)
        .patch('/admin/shop/items/test-ball')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          price: 1200,
          reason: 'Adjusting price for economy test balance',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.price).toBe(1200);

      // Verify history row
      const historyRes = await request(app)
        .get('/admin/shop/items/test-ball/history')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(historyRes.status).toBe(200);
      expect(historyRes.body.data.length).toBeGreaterThan(0);
      expect(historyRes.body.data[0].newPrice).toBe(1200);
      expect(historyRes.body.data[0].reason).toContain('Adjusting price');
    });

    it('rejects extreme price changes (>50%) unless confirmExtreme is true', async () => {
      // 1000 -> 2500 is +150% change
      const res = await request(app)
        .patch('/admin/shop/items/test-ball')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          price: 2500,
          reason: 'Extreme jump without confirmation flag',
        });

      expect(res.status).toBe(400);
      expect(res.body.error.message).toContain('Extreme price change detected');
    });

    it('supports bulk price preview mode with dryRun: true without saving', async () => {
      const res = await request(app)
        .post('/admin/shop/items/bulk-price')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          itemKeys: ['test-ball'],
          mode: 'percent_inc',
          value: 20,
          dryRun: true,
          reason: 'Testing 20 percent increase preview',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.dryRun).toBe(true);
      expect(res.body.data.items[0].oldPrice).toBe(1000);
      expect(res.body.data.items[0].newPrice).toBe(1200);

      // Verify item price did NOT change in database
      const item = await prisma.shopItem.findUnique({ where: { key: 'test-ball' } });
      expect(item?.price).toBe(1000);
    });

    it('denies moderator access to admin-only shop editing (403 Forbidden)', async () => {
      const res = await request(app)
        .patch('/admin/shop/items/test-ball')
        .set('Authorization', `Bearer ${moderatorToken}`)
        .send({
          price: 900,
          reason: 'Moderator attempting price change',
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('allows moderator access to staff routes like /admin/users and /admin/dashboard/stats', async () => {
      const resUsers = await request(app)
        .get('/admin/users')
        .set('Authorization', `Bearer ${moderatorToken}`);

      expect(resUsers.status).toBe(200);
      expect(resUsers.body.success).toBe(true);

      const resStats = await request(app)
        .get('/admin/dashboard/stats')
        .set('Authorization', `Bearer ${moderatorToken}`);

      expect(resStats.status).toBe(200);
      expect(resStats.body.success).toBe(true);
      expect(resStats.body.data.currencyInCirculation).toBeDefined();
    });
  });
});
