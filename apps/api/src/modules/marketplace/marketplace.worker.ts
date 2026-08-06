import { MarketplaceRepository } from './marketplace.repository';
import { logger } from '../../config/logger';
import { container } from 'tsyringe';
import { RedisLockService } from '../../core/services/redis-lock.service';

export function startMarketplaceWorker() {
  const repo = container.resolve(MarketplaceRepository);
  // Run every 30 minutes
  const INTERVAL_MS = 30 * 60 * 1000;

  setInterval(async () => {
    let lock;
    try {
      const lockService = container.resolve(RedisLockService);
      lock = await lockService.acquireLock('locks:marketplace:worker:process', 30000);
    } catch (error: any) {
      if (error?.message?.includes('resource busy')) {
        // Another instance is processing it, this is fine
        return;
      }
      logger.warn('[Marketplace Worker] Redis lock failed (likely no local Redis). Proceeding without lock...');
    }

    try {
      const processed = await repo.processExpiredListings();
      if (processed > 0) {
        logger.info(`[Marketplace Worker] Processed ${processed} expired listings.`);
      }
    } catch (error: any) {
      logger.error('[Marketplace Worker] Error processing expired listings', error);
    } finally {
      if (lock) {
        try {
          const lockService = container.resolve(RedisLockService);
          await lockService.releaseLock(lock);
        } catch (e) { /* ignore release errors */ }
      }
    }
  }, INTERVAL_MS);

  logger.info('[Marketplace Worker] Started cron for expired listings.');
}
