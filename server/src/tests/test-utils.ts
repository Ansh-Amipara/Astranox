import request from 'supertest';
import { app } from '../app';

export async function createTestUserAndLogin(username = 'testuser', password = 'password123', email = 'test@example.com') {
  // Register the user
  await request(app).post('/auth/register').send({
    username,
    email,
    password
  });

  // Login
  const res = await request(app).post('/auth/login').send({
    username,
    password
  });

  const accessToken = res.body.data.accessToken;
  const cookie = res.headers['set-cookie'] as unknown as string[];

  return {
    accessToken,
    cookie,
    user: res.body.data.user
  };
}
