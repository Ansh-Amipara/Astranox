import { describe, it, expect } from 'vitest';
import express, { Request, Response } from 'express';
import request from 'supertest';
import { z } from 'zod';
import { validate } from '../core/middleware/validate';
import { errorHandler } from '../core/middleware/error-handler';
import {
  ValidationError,
  UnauthorizedError,
  NotFoundError,
  ConflictError,
  RateLimitError,
} from '../core/errors/AppError';

describe('API Validation Middleware & Error Handler', () => {
  it('passes validation when input matches schema', async () => {
    const testApp = express();
    testApp.use(express.json());

    const testSchema = z.object({
      name: z.string().min(3),
    });

    testApp.post('/test', validate({ body: testSchema }), (req: Request, res: Response) => {
      res.json({ success: true, data: req.body });
    });
    testApp.use(errorHandler);

    const res = await request(testApp).post('/test').send({ name: 'ValidName' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('ValidName');
  });

  it('returns 400 VALIDATION_ERROR with structured fields on validation failure', async () => {
    const testApp = express();
    testApp.use(express.json());

    const testSchema = z.object({
      username: z.string().min(3, 'Username must be at least 3 characters'),
      age: z.number().min(18, 'Must be at least 18'),
    });

    testApp.post('/test', validate(testSchema), (_req: Request, res: Response) => {
      res.json({ success: true });
    });
    testApp.use(errorHandler);

    const res = await request(testApp).post('/test').send({ username: 'ab', age: 10 });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input',
        fields: {
          username: 'Username must be at least 3 characters',
          age: 'Must be at least 18',
        },
      },
    });
  });

  it('validates params, query, and body simultaneously', async () => {
    const testApp = express();
    testApp.use(express.json());

    const paramsSchema = z.object({ id: z.string().min(1) });
    const querySchema = z.object({ page: z.coerce.number().min(1) });
    const bodySchema = z.object({ title: z.string().min(2) });

    testApp.post(
      '/items/:id',
      validate({ params: paramsSchema, query: querySchema, body: bodySchema }),
      (req: Request, res: Response) => {
        res.json({
          success: true,
          data: { params: req.params, query: req.query, body: req.body },
        });
      }
    );
    testApp.use(errorHandler);

    // Failing request
    const failRes = await request(testApp).post('/items/123?page=0').send({ title: 'A' });
    expect(failRes.status).toBe(400);
    expect(failRes.body.error.code).toBe('VALIDATION_ERROR');
    expect(failRes.body.error.fields).toHaveProperty('page');
    expect(failRes.body.error.fields).toHaveProperty('title');

    // Passing request
    const passRes = await request(testApp).post('/items/123?page=2').send({ title: 'Valid Title' });
    expect(passRes.status).toBe(200);
    expect(passRes.body.data.query.page).toBe(2);
  });

  it('formats custom AppError subclasses correctly', async () => {
    const testApp = express();
    testApp.get('/unauthorized', () => {
      throw new UnauthorizedError('Custom unauthorized');
    });
    testApp.get('/not-found', () => {
      throw new NotFoundError('Custom not found');
    });
    testApp.get('/conflict', () => {
      throw new ConflictError('Custom conflict');
    });
    testApp.get('/rate-limit', () => {
      throw new RateLimitError('Too many attempts');
    });
    testApp.use(errorHandler);

    const r1 = await request(testApp).get('/unauthorized');
    expect(r1.status).toBe(401);
    expect(r1.body).toEqual({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Custom unauthorized' },
    });

    const r2 = await request(testApp).get('/not-found');
    expect(r2.status).toBe(404);
    expect(r2.body).toEqual({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Custom not found' },
    });

    const r3 = await request(testApp).get('/conflict');
    expect(r3.status).toBe(409);
    expect(r3.body).toEqual({
      success: false,
      error: { code: 'CONFLICT', message: 'Custom conflict' },
    });

    const r4 = await request(testApp).get('/rate-limit');
    expect(r4.status).toBe(429);
    expect(r4.body).toEqual({
      success: false,
      error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many attempts' },
    });
  });

  it('maps Prisma P2002 and P2025 errors to CONFLICT and NOT_FOUND', async () => {
    const testApp = express();
    testApp.get('/prisma-p2002', () => {
      const pError = new Error('Unique constraint failed') as any;
      pError.code = 'P2002';
      pError.name = 'PrismaClientKnownRequestError';
      throw pError;
    });
    testApp.get('/prisma-p2025', () => {
      const pError = new Error('Record not found') as any;
      pError.code = 'P2025';
      pError.name = 'PrismaClientKnownRequestError';
      throw pError;
    });
    testApp.use(errorHandler);

    const p2002Res = await request(testApp).get('/prisma-p2002');
    expect(p2002Res.status).toBe(409);
    expect(p2002Res.body).toEqual({
      success: false,
      error: { code: 'CONFLICT', message: 'Resource already exists' },
    });

    const p2025Res = await request(testApp).get('/prisma-p2025');
    expect(p2025Res.status).toBe(404);
    expect(p2025Res.body).toEqual({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Resource not found' },
    });
  });

  it('handles malformed JSON syntax errors with 400 BAD_REQUEST', async () => {
    const testApp = express();
    testApp.use(express.json());
    testApp.post('/json-test', (_req, res) => res.json({ ok: true }));
    testApp.use(errorHandler);

    const res = await request(testApp)
      .post('/json-test')
      .set('Content-Type', 'application/json')
      .send('{"badJson": ');

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      success: false,
      error: {
        code: 'BAD_REQUEST',
        message: 'Invalid JSON payload format',
      },
    });
  });

  it('masks unexpected 500 errors and does not leak stack traces', async () => {
    const testApp = express();
    testApp.get('/crash', () => {
      throw new Error('Secret database password leaked!');
    });
    testApp.use(errorHandler);

    const res = await request(testApp).get('/crash');
    expect(res.status).toBe(500);
    expect(res.body).toEqual({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      },
    });
    expect(JSON.stringify(res.body)).not.toContain('Secret database password');
  });
});
