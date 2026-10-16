import 'reflect-metadata';
import { PrismaClient } from '@prisma/client';
import { env } from '../config/env';

// Override the env var to use a test database before any prisma instantiation
const testDbUrl = env.DATABASE_URL.replace('/astranox?', '/astranox_test?');
process.env.DATABASE_URL = testDbUrl;
env.DATABASE_URL = testDbUrl;

export const prismaTest = new PrismaClient({
  datasources: {
    db: {
      url: testDbUrl
    }
  }
});

import { beforeAll, afterAll, beforeEach } from 'vitest';

export const clearDatabase = async () => {
  // Clear all collections safely
  const collections = [
    prismaTest.trainerSave.deleteMany(),
    prismaTest.user.deleteMany()
    // add others if needed, but for auth/trainers we mainly need these
  ];
  await prismaTest.$transaction(collections);
};

beforeAll(async () => {
  try {
    await prismaTest.$connect();
  } catch (err) {
    console.warn('Could not connect to test database. Database integration tests will fail or be skipped.');
  }
});

beforeEach(async () => {
  try {
    await clearDatabase();
  } catch {}
});

afterAll(async () => {
  try {
    await prismaTest.$disconnect();
  } catch {}
});
