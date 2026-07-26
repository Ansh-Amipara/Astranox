import { MarketplaceRepository } from './marketplace.repository';
import { logger } from '../../config/logger';

const REPO = new MarketplaceRepository();

export function startMarketplaceWorker() {
  // Run every 10 minutes (600,000 ms)
  const INTERVAL_MS = 10 * 60 * 1000;

  setInterval(async () => {
    try {
      const processed = await REPO.processExpiredListings();
      if (processed > 0) {
        logger.info(`[Marketplace Worker] Processed ${processed} expired listings.`);
      }
    } catch (error) {
      logger.error('[Marketplace Worker] Error processing expired listings', error);
    }
  }, INTERVAL_MS);

  logger.info('[Marketplace Worker] Started cron for expired listings.');
}
