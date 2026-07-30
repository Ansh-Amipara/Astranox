import Redis from 'ioredis';
import { singleton } from 'tsyringe';
import { env } from '../../config/env';
import { logger } from '../../config/logger';

@singleton()
export class CacheService {
  private redis: Redis | null = null;
  private isConnected: boolean = false;
  private memoryCache: Map<string, { value: any; expiresAt: number | null }> = new Map();

  constructor() {
    this.initRedis();
  }

  private cleanMemoryCache() {
    const now = Date.now();
    for (const [k, v] of this.memoryCache.entries()) {
      if (v.expiresAt && v.expiresAt < now) {
        this.memoryCache.delete(k);
      }
    }
  }

  public getClient(): Redis | null {
    return this.redis;
  }

  private initRedis() {
    try {
      this.redis = new Redis(env.REDIS_URL, {
        maxRetriesPerRequest: 3,
        showFriendlyErrorStack: process.env.NODE_ENV !== 'production',
        retryStrategy(times) {
          if (times > 3) {
            logger.warn('Redis connection failed after 3 retries, falling back to DB.');
            return null;
          }
          return Math.min(times * 50, 2000);
        }
      });

      this.redis.on('connect', () => {
        this.isConnected = true;
        logger.info('Connected to Redis');
      });

      this.redis.on('error', (err) => {
        this.isConnected = false;
        logger.error(`Redis Error: ${err.message}`);
      });
    } catch (error) {
      this.isConnected = false;
      logger.error('Failed to initialize Redis client');
    }
  }

  public async get<T>(key: string): Promise<T | null> {
    if (!this.isConnected || !this.redis) {
      this.cleanMemoryCache();
      const item = this.memoryCache.get(key);
      if (!item) return null;
      if (item.expiresAt && item.expiresAt < Date.now()) {
        this.memoryCache.delete(key);
        return null;
      }
      return item.value as T;
    }
    try {
      const data = await this.redis.get(key);
      return data ? JSON.parse(data) as T : null;
    } catch (e) {
      logger.error(`Cache get error for key ${key}:`, e);
      return null;
    }
  }

  public async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    if (!this.isConnected || !this.redis) {
      this.memoryCache.set(key, {
        value,
        expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : null
      });
      return;
    }
    try {
      const data = JSON.stringify(value);
      if (ttlSeconds) {
        await this.redis.setex(key, ttlSeconds, data);
      } else {
        await this.redis.set(key, data);
      }
    } catch (e) {
      logger.error(`Cache set error for key ${key}:`, e);
    }
  }

  public async delete(key: string): Promise<void> {
    if (!this.isConnected || !this.redis) {
      this.memoryCache.delete(key);
      return;
    }
    try {
      await this.redis.del(key);
    } catch (e) {
      logger.error(`Cache delete error for key ${key}:`, e);
    }
  }

  public async getOrSet<T>(key: string, fetcher: () => Promise<T>, ttlSeconds: number = 3600): Promise<T> {
    if (!this.isConnected || !this.redis) {
      const cached = await this.get<T>(key);
      if (cached) return cached;
      const freshData = await fetcher();
      if (freshData) {
        await this.set(key, freshData, ttlSeconds);
      }
      return freshData;
    }

    try {
      const cached = await this.redis.get(key);
      if (cached) {
        return JSON.parse(cached) as T;
      }

      const freshData = await fetcher();
      if (freshData) {
        await this.redis.setex(key, ttlSeconds, JSON.stringify(freshData));
      }
      
      return freshData;
    } catch (error) {
      logger.error(`Cache error for key ${key}:`, error);
      return fetcher();
    }
  }

  public async clearPattern(pattern: string): Promise<void> {
    if (!this.isConnected || !this.redis) {
      // In-memory pattern matching (simple regex conversion)
      const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
      for (const key of this.memoryCache.keys()) {
        if (regex.test(key)) {
          this.memoryCache.delete(key);
        }
      }
      return;
    }
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      logger.error(`Cache clear error for pattern ${pattern}:`, error);
    }
  }
}
