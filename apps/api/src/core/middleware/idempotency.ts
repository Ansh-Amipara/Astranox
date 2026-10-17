import { Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';
import { CacheService } from '../services/cache.service';
import { BadRequestError } from '../errors/AppError';

export const requireIdempotency = (ttlSeconds: number = 86400) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const key = (req.headers['idempotency-key'] || req.headers['x-idempotency-key']) as string | undefined;

    if (!key || typeof key !== 'string' || key.trim().length === 0) {
      return next(new BadRequestError('Idempotency-Key header is required for this mutation.'));
    }

    const userId = req.user?.id || 'anonymous';
    const cacheKey = `idemp:${userId}:${key.trim()}`;
    const cacheService = container.resolve(CacheService);

    try {
      const cached = await cacheService.get<{ status: number; body: any }>(cacheKey);
      if (cached) {
        res.setHeader('X-Idempotent-Replay', 'true');
        return res.status(cached.status).json(cached.body);
      }

      // Intercept res.json to cache response upon success
      const originalJson = res.json.bind(res);
      res.json = (body: any) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          cacheService.set(cacheKey, { status: res.statusCode, body }, ttlSeconds).catch(() => {});
        }
        return originalJson(body);
      };

      next();
    } catch (err) {
      next(err);
    }
  };
};
