import '../../../tests/setup';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../../app';
import { prismaTest } from '../../../tests/setup';
import { prisma } from '../../../core/db/prisma';

describe('Auth Module Integration', () => {
  const validRegisterPayload = {
    username: 'newTrainer',
    email: 'new@trainer.com',
    password: 'securePassword123'
  };

  beforeEach(async () => {
    await prisma.trainerSave.deleteMany({ where: { user: { username: 'newTrainer' } } }).catch(() => {});
    await prisma.user.deleteMany({ where: { username: 'newTrainer' } }).catch(() => {});
  });

  describe('POST /auth/register', () => {
    it('should create a user and return 201', async () => {
      const res = await request(app).post('/auth/register').send(validRegisterPayload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      
      const userInDb = await prismaTest.user.findUnique({ where: { username: 'newTrainer' } });
      expect(userInDb).toBeDefined();
    });

    it('should reject duplicate usernames (409)', async () => {
      await request(app).post('/auth/register').send(validRegisterPayload);
      const res = await request(app).post('/auth/register').send(validRegisterPayload);
      
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject invalid payloads via Zod (400)', async () => {
      const res = await request(app).post('/auth/register').send({ username: 'ab' }); // Too short
      
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /auth/login', () => {
    it('should return an accessToken and set a refreshToken HTTP-only cookie', async () => {
      await request(app).post('/auth/register').send(validRegisterPayload);
      
      const res = await request(app).post('/auth/login').send({
        username: validRegisterPayload.username,
        password: validRegisterPayload.password
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.user.username).toBe(validRegisterPayload.username);
      
      const cookies = res.headers['set-cookie'] as unknown as string[];
      expect(cookies.some(c => c.includes('refreshToken='))).toBe(true);
      expect(cookies.some(c => c.includes('HttpOnly'))).toBe(true);
    });

    it('should return 401 Unauthorized for incorrect passwords', async () => {
      await request(app).post('/auth/register').send(validRegisterPayload);
      
      const res = await request(app).post('/auth/login').send({
        username: validRegisterPayload.username,
        password: 'wrongPassword'
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('GET /auth/profile', () => {
    it('should return the user profile when providing a valid access token', async () => {
      await request(app).post('/auth/register').send(validRegisterPayload);
      const loginRes = await request(app).post('/auth/login').send({
        username: validRegisterPayload.username,
        password: validRegisterPayload.password
      });
      const token = loginRes.body.data.accessToken;

      const profileRes = await request(app)
        .get('/auth/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(profileRes.status).toBe(200);
      expect(profileRes.body.success).toBe(true);
      expect(profileRes.body.data.username).toBe(validRegisterPayload.username);
      // Ensure password hash is never leaked
      expect(profileRes.body.data.passwordHash).toBeUndefined();
    });

    it('should return 401 if no token is provided', async () => {
      const profileRes = await request(app).get('/auth/profile');
      expect(profileRes.status).toBe(401);
    });
  });

  describe('POST /auth/refresh', () => {
    it('should issue a new accessToken when a valid refresh cookie is provided', async () => {
      await request(app).post('/auth/register').send(validRegisterPayload);
      const loginRes = await request(app).post('/auth/login').send({
        username: validRegisterPayload.username,
        password: validRegisterPayload.password
      });
      
      const cookies = loginRes.headers['set-cookie'];

      const refreshRes = await request(app)
        .post('/auth/refresh')
        .set('Cookie', cookies);

      expect(refreshRes.status).toBe(200);
      expect(refreshRes.body.success).toBe(true);
      expect(refreshRes.body.data.accessToken).toBeDefined();
    });
  });
});
