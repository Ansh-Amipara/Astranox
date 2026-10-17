import '../../../tests/setup';
import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../../app';
import { prismaTest } from '../../../tests/setup';
import { prisma } from '../../../core/db/prisma';

describe('Auth Module Integration', { timeout: 30000 }, () => {
  const validRegisterPayload = {
    username: 'newTrainer',
    email: 'new@trainer.com',
    password: 'securePassword123',
  };

  beforeEach(async () => {
    try {
      const user = await prisma.user.findUnique({ where: { username: validRegisterPayload.username } });
      if (user) {
        await prisma.refreshToken.deleteMany({ where: { userId: user.id } }).catch(() => {});
        await prisma.trainerSave.deleteMany({ where: { userId: user.id } }).catch(() => {});
        await prisma.user.delete({ where: { id: user.id } }).catch(() => {});
      }
    } catch {}
  });

  describe('POST /auth/register', () => {
    it('should create a user and return 201', async () => {
      const res = await request(app).post('/auth/register').send(validRegisterPayload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);

      const userInDb = await prismaTest.user.findUnique({ where: { username: 'newTrainer' } });
      expect(userInDb).toBeDefined();
    });

    it('should reject duplicate usernames (400 ValidationError)', async () => {
      await request(app).post('/auth/register').send(validRegisterPayload);
      const res = await request(app).post('/auth/register').send(validRegisterPayload);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject invalid payloads via Zod (400)', async () => {
      const res = await request(app).post('/auth/register').send({ username: 'ab' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /auth/login', () => {
    it('should set accessToken and refreshToken HTTP-only cookies and return user', async () => {
      await request(app).post('/auth/register').send(validRegisterPayload);

      const res = await request(app).post('/auth/login').send({
        username: validRegisterPayload.username,
        password: validRegisterPayload.password,
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.username).toBe(validRegisterPayload.username);

      const cookies = res.headers['set-cookie'] as unknown as string[];
      expect(cookies.some((c) => c.includes('accessToken='))).toBe(true);
      expect(cookies.some((c) => c.includes('refreshToken='))).toBe(true);
      expect(cookies.every((c) => c.includes('HttpOnly'))).toBe(true);
    });

    it('should return 401 Unauthorized for incorrect passwords', async () => {
      await request(app).post('/auth/register').send(validRegisterPayload);

      const res = await request(app).post('/auth/login').send({
        username: validRegisterPayload.username,
        password: 'wrongPassword',
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('GET /auth/profile', () => {
    it('should return the user profile when providing cookie auth', async () => {
      await request(app).post('/auth/register').send(validRegisterPayload);
      const loginRes = await request(app).post('/auth/login').send({
        username: validRegisterPayload.username,
        password: validRegisterPayload.password,
      });

      const cookies = loginRes.headers['set-cookie'];

      const profileRes = await request(app)
        .get('/auth/profile')
        .set('Cookie', cookies);

      expect(profileRes.status).toBe(200);
      expect(profileRes.body.success).toBe(true);
      expect(profileRes.body.data.username).toBe(validRegisterPayload.username);
      expect(profileRes.body.data.passwordHash).toBeUndefined();
    });

    it('should return 401 if no credentials provided', async () => {
      const profileRes = await request(app).get('/auth/profile');
      expect(profileRes.status).toBe(401);
    });
  });

  describe('Refresh Token Rotation and Reuse Detection', () => {
    it('rotates refresh token and preserves valid session', async () => {
      await request(app).post('/auth/register').send(validRegisterPayload);
      const loginRes = await request(app).post('/auth/login').send({
        username: validRegisterPayload.username,
        password: validRegisterPayload.password,
      });

      const initialCookies = loginRes.headers['set-cookie'];

      const refreshRes = await request(app)
        .post('/auth/refresh')
        .set('Cookie', initialCookies);

      expect(refreshRes.status).toBe(200);
      expect(refreshRes.body.success).toBe(true);

      const newCookies = refreshRes.headers['set-cookie'] as unknown as string[];
      expect(newCookies.some((c) => c.includes('accessToken='))).toBe(true);
      expect(newCookies.some((c) => c.includes('refreshToken='))).toBe(true);

      // Verify the new cookies work on protected profile route
      const profileRes = await request(app)
        .get('/auth/profile')
        .set('Cookie', newCookies);
      expect(profileRes.status).toBe(200);
    });

    it('detects token reuse and revokes the whole token family', async () => {
      await request(app).post('/auth/register').send(validRegisterPayload);
      const loginRes = await request(app).post('/auth/login').send({
        username: validRegisterPayload.username,
        password: validRegisterPayload.password,
      });

      const initialCookies = loginRes.headers['set-cookie'];

      // First refresh: valid rotation
      const firstRefreshRes = await request(app)
        .post('/auth/refresh')
        .set('Cookie', initialCookies);
      expect(firstRefreshRes.status).toBe(200);
      const activeCookies = firstRefreshRes.headers['set-cookie'];

      // Attempt REUSING the old revoked refresh token
      const replayedRes = await request(app)
        .post('/auth/refresh')
        .set('Cookie', initialCookies);

      expect(replayedRes.status).toBe(401);
      expect(replayedRes.body.error.message).toContain('Token reuse detected');

      // The entire family must now be revoked: active token is now rejected too!
      const subsequentRefreshRes = await request(app)
        .post('/auth/refresh')
        .set('Cookie', activeCookies);

      expect(subsequentRefreshRes.status).toBe(401);
    });
  });

  describe('Session Termination (Logout & Logout-All)', () => {
    it('revokes current session on /auth/logout', async () => {
      await request(app).post('/auth/register').send(validRegisterPayload);
      const loginRes = await request(app).post('/auth/login').send({
        username: validRegisterPayload.username,
        password: validRegisterPayload.password,
      });

      const cookies = loginRes.headers['set-cookie'];

      const logoutRes = await request(app)
        .post('/auth/logout')
        .set('Cookie', cookies);

      expect(logoutRes.status).toBe(200);

      // Refreshing with the logged-out cookie must now fail
      const refreshRes = await request(app)
        .post('/auth/refresh')
        .set('Cookie', cookies);
      expect(refreshRes.status).toBe(401);
    });

    it('revokes all sessions on /auth/logout-all', async () => {
      await request(app).post('/auth/register').send(validRegisterPayload);

      // Create two sessions (e.g. mobile and desktop)
      const session1 = await request(app).post('/auth/login').send({
        username: validRegisterPayload.username,
        password: validRegisterPayload.password,
      });
      const session2 = await request(app).post('/auth/login').send({
        username: validRegisterPayload.username,
        password: validRegisterPayload.password,
      });

      const cookies1 = session1.headers['set-cookie'];
      const cookies2 = session2.headers['set-cookie'];

      // Logout all from session 1
      const logoutAllRes = await request(app)
        .post('/auth/logout-all')
        .set('Cookie', cookies1);

      expect(logoutAllRes.status).toBe(200);

      // Both session 1 and session 2 refresh attempts must now fail
      const refresh1 = await request(app).post('/auth/refresh').set('Cookie', cookies1);
      const refresh2 = await request(app).post('/auth/refresh').set('Cookie', cookies2);

      expect(refresh1.status).toBe(401);
      expect(refresh2.status).toBe(401);
    });
  });

  describe('CSRF Protection', () => {
    it('blocks state-changing requests with an unauthorized origin', async () => {
      const res = await request(app)
        .post('/auth/login')
        .set('Origin', 'https://malicious-attacker.com')
        .send({
          username: validRegisterPayload.username,
          password: validRegisterPayload.password,
        });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('allows state-changing requests with an authorized origin', async () => {
      const res = await request(app)
        .post('/auth/login')
        .set('Origin', 'http://localhost:4001')
        .send({
          username: validRegisterPayload.username,
          password: 'wrongPassword',
        });

      // Bypasses CSRF (not 403), reaches business logic (401 for wrong password)
      expect(res.status).toBe(401);
    });
  });
});
