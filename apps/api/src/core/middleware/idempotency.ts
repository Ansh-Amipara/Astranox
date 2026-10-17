import { Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';
import crypto from 'crypto';
import { prisma } from '../db/prisma';
import { RedisLockService } from '../services/redis-lock.service';
import { BadRequestError, UnauthorizedError } from '../errors/AppError';
import { logger } from '../../config/logger';

/**
 * Computes a deterministic SHA-256 hash for a given route and payload.
 */
export function hashRequest(route: string, body: unknown): string {
  const normalizedRoute = route.split('?')[0].toLowerCase();
  const serializedBody = body ? JSON.stringify(body) : '';
  return crypto.createHash('sha256').update(`${normalizedRoute}:${serializedBody}`).digest('hex');
}

/**
 * Enforces idempotency on state-mutating requests.
 * 1. Requires `Idempotency-Key` or `x-idempotency-key` header.
 * 2. Locks resource via Redlock (`RedisLockService`) to prevent concurrent execution.
 * 3. Returns 409 Conflict if a request with the same key is already in-flight.
 * 4. Returns 422 Unprocessable Entity if the key was previously used with a different payload.
 * 5. Returns cached response with `X-Idempotent-Replay: true` if matching completed request is replayed.
 */
export const requireIdempotency = (_ttlSeconds: number = 86400) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const rawKey = (req.headers['idempotency-key'] || req.headers['x-idempotency-key']) as string | undefined;

    if (!rawKey || typeof rawKey !== 'string' || rawKey.trim().length === 0) {
      return next(new BadRequestError('Idempotency-Key header is required for this mutation.'));
    }

    const key = rawKey.trim();
    const userId = req.user?.id;

    if (!userId) {
      return next(new UnauthorizedError('Authentication required for idempotent mutations.'));
    }

    const route = req.originalUrl || req.baseUrl || req.path;
    const requestHash = hashRequest(route, req.body);
    const lockService = container.resolve(RedisLockService);
    const lockResource = `lock:idemp:${userId}:${key}`;

    let lock: { release: () => Promise<void> } | null = null;

    try {
      try {
        lock = await lockService.acquireLock(lockResource, 4000);
      } catch (lockErr: any) {
        if (lockErr?.name === 'ExecutionError' || lockErr?.code === 'RESOURCE_LOCKED' || lockErr?.statusCode === 409) {
          res.status(409).json({
            success: false,
            error: {
              code: 'CONCURRENT_REQUEST',
              message: 'A request with this idempotency key is currently processing.',
            },
          });
          return;
        }
        throw lockErr;
      }

      // Check existing record in MongoDB
      const existing = await prisma.idempotencyKey.findUnique({
        where: {
          userId_key: {
            userId,
            key,
          },
        },
      });

      if (existing) {
        if (existing.status === 'processing') {
          await lockService.releaseLock(lock);
          res.status(409).json({
            success: false,
            error: {
              code: 'CONCURRENT_REQUEST',
              message: 'A request with this idempotency key is currently processing.',
            },
          });
          return;
        }

        if (existing.status === 'completed') {
          await lockService.releaseLock(lock);

          if (existing.requestHash !== requestHash) {
            res.status(422).json({
              success: false,
              error: {
                code: 'IDEMPOTENCY_KEY_MISMATCH',
                message: 'Idempotency key was previously used with a different request payload.',
              },
            });
            return;
          }

          res.setHeader('X-Idempotent-Replay', 'true');
          const status = existing.responseStatus || 200;
          res.status(status).json(existing.responseBody);
          return;
        }
      }

      // Record in-flight processing state
      await prisma.idempotencyKey.upsert({
        where: {
          userId_key: { userId, key },
        },
        create: {
          key,
          userId,
          route,
          requestHash,
          status: 'processing',
        },
        update: {
          requestHash,
          status: 'processing',
          responseStatus: null,
          responseBody: undefined,
        },
      });

      // Release lock so request processing can proceed
      await lockService.releaseLock(lock);
      lock = null;

      // Intercept res.json to capture response on completion and persist before sending response
      const originalJson = res.json.bind(res);
      res.json = (body: any) => {
        res.json = originalJson;

        if (res.statusCode >= 200 && res.statusCode < 300) {
          prisma.idempotencyKey
            .update({
              where: {
                userId_key: { userId, key },
              },
              data: {
                status: 'completed',
                responseStatus: res.statusCode,
                responseBody: body,
              },
            })
            .catch((err) => {
              logger.error({ err, key, userId }, '[Idempotency] Failed to record completed response');
            })
            .finally(() => {
              originalJson(body);
            });
          return res;
        }

        // Clean up pending idempotency key on failure so it can be retried
        prisma.idempotencyKey
          .delete({
            where: {
              userId_key: { userId, key },
            },
          })
          .catch(() => {})
          .finally(() => {
            originalJson(body);
          });

        return res;
      };

      next();
    } catch (err) {
      if (lock) {
        await lockService.releaseLock(lock).catch(() => {});
      }
      next(err);
    }
  };
};
