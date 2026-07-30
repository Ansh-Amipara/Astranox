import { injectable, singleton } from 'tsyringe';
import Redlock, { Lock } from 'redlock';
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

  public async acquireLock(resource: string, durationMs: number = 5000): Promise<Lock> {
    if (!this.redlock) {
      this.initRedlock();
      if (!this.redlock) {
        throw new AppError('Lock service is unavailable', 503);
      }
    }
    
    try {
      const lock = await this.redlock.acquire([resource], durationMs);
      return lock;
    } catch (error: any) {
      if (error?.name === 'ExecutionError') {
        throw new AppError('Could not acquire lock (resource busy)', 409);
      }
      throw error;
    }
  }

  public async releaseLock(lock: Lock): Promise<void> {
    try {
      await lock.release();
    } catch (error: any) {
      logger.warn(`Failed to release lock for ${lock.resources.join(', ')}:`, error?.message);
    }
  }
}
