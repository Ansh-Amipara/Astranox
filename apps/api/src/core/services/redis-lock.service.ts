import { injectable, singleton } from 'tsyringe';
import Redlock from 'redlock';
import { CacheService } from './cache.service';
import { logger } from '../../config/logger';
import { AppError } from '../errors/AppError';

@singleton()
@injectable()
export class RedisLockService {
  private redlock: Redlock | null = null;

  constructor(private cacheService: CacheService) {
    this.initRedlock();
  }

  private initRedlock() {
    const client = this.cacheService.getClient();
    if (client) {
      this.redlock = new Redlock([client], {
        driftFactor: 0.01,
        retryCount: 3,
        retryDelay: 200,
        retryJitter: 200,
        automaticExtensionThreshold: 500,
      });

      this.redlock.on('error', (error: any) => {
        logger.error('[RedisLockService] Redlock error:', error);
      });
      logger.info('Initialized Redlock with single Redis instance.');
    } else {
      logger.warn('Could not initialize Redlock. Redis client is null.');
    }
  }

  private memoryLocks: Set<string> = new Set();

  public async acquireLock(resource: string, durationMs: number = 5000): Promise<{ release: () => Promise<void> }> {
    if (this.cacheService.isRedisConnected()) {
      if (!this.redlock) {
        this.initRedlock();
      }

      if (this.redlock) {
        try {
          const lock = await this.redlock.acquire([resource], durationMs);
          return lock;
        } catch (error: any) {
          if (error?.name === 'ExecutionError') {
            throw new AppError('Could not acquire lock (resource busy)', 409, 'RESOURCE_LOCKED');
          }
          logger.warn(`Redis lock acquire failed for ${resource}, falling back to memory lock: ${error?.message}`);
        }
      }
    }

    // In-memory fallback
    const start = Date.now();
    while (this.memoryLocks.has(resource)) {
      if (Date.now() - start > durationMs) {
        throw new AppError('Could not acquire lock (resource busy)', 409);
      }
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    this.memoryLocks.add(resource);
    return {
      release: async () => {
        this.memoryLocks.delete(resource);
      },
    };
  }

  public async releaseLock(lock: { release: () => Promise<void> }): Promise<void> {
    try {
      await lock.release();
    } catch (error: any) {
      logger.warn(`Failed to release lock:`, error?.message);
    }
  }

  public async withLock<T>(resource: string, durationMs: number = 5000, fn: () => Promise<T>): Promise<T> {
    const lock = await this.acquireLock(resource, durationMs);
    try {
      return await fn();
    } finally {
      await this.releaseLock(lock);
    }
  }
}

