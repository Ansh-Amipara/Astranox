import { injectable } from 'tsyringe';
import { MarketplaceRepository } from './marketplace.repository';
import { AppError } from '../../core/errors/AppError';
import { prisma } from '../../core/db/prisma';
import { RedisLockService } from '../../core/services/redis-lock.service';
import { logger } from '../../config/logger';

@injectable()
export class MarketplaceService {
  constructor(
    private repository: MarketplaceRepository,
    private lockService: RedisLockService
  ) {}

  async createListing(sellerId: string, pokemonId: string, description?: string) {
    const pokemon = await prisma.ownedPokemon.findUnique({ where: { id: pokemonId } });
    if (!pokemon) throw new AppError('Pokemon not found', 404);
    if (pokemon.isBound) throw new AppError('Bound Pokemon cannot be listed on the marketplace.', 400);

    // 7 days expiration
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    try {
      return await this.repository.createListing(sellerId, pokemonId, description, expiresAt);
    } catch (error: any) {
      if (error.code === 'P2025' || error.message.includes('Record to update not found')) {
        throw new AppError('Pokemon not found, not owned by you, is in party, or already in escrow', 400);
      }
      throw error;
    }
  }

  async getListingDetails(listingId: string) {
    const listing = await this.repository.getListingById(listingId);
    if (!listing) {
      throw new AppError('Listing not found', 404);
    }
    return listing;
  }

  async createOffer(bidderId: string, listingId: string, pokemonIds: string[]) {
    if (!pokemonIds || pokemonIds.length === 0) {
      throw new AppError('Must offer at least one Pokemon', 400);
    }

    let lock;
    try {
      lock = await this.lockService.acquireLock(`locks:marketplace:listing_v2:${listingId}`, 5000);

      const listing = await this.repository.getListingById(listingId);
      if (!listing) {
        throw new AppError('Listing not found', 404);
      }
      
      const offeredPokemon = await prisma.ownedPokemon.findMany({ where: { id: { in: pokemonIds } } });
      if (offeredPokemon.some(p => p.isBound)) {
        throw new AppError('You cannot offer a Bound Pokemon.', 400);
      }

      if (listing.status !== 'OPEN') {
        throw new AppError('Listing is not OPEN', 400);
      }
      if (listing.sellerId === bidderId) {
        throw new AppError('Cannot bid on your own listing', 400);
      }

      return await this.repository.createOffer(bidderId, listingId, pokemonIds);
    } catch (error: any) {
      throw new AppError(error.message || 'Failed to create offer', error.statusCode || 400);
    } finally {
      if (lock) await this.lockService.releaseLock(lock);
    }
  }

  async cancelListing(listingId: string, sellerId: string) {
    let lock;
    try {
      try {
        lock = await this.lockService.acquireLock(`locks:marketplace:listing_v2:${listingId}`, 5000);
      } catch (lockError: any) {
        logger.warn({ err: lockError, listingId }, `[MarketplaceService] Could not acquire lock for ${listingId}, proceeding anyway...`);
      }
      await this.repository.cancelListing(listingId, sellerId);
      return { success: true, message: 'Listing cancelled successfully' };
    } catch (error: any) {
      throw new AppError(error.message || 'Failed to cancel listing', error.statusCode || 400);
    } finally {
      if (lock) {
        try {
          await this.lockService.releaseLock(lock);
        } catch (releaseErr: any) {
          logger.warn({ err: releaseErr, listingId }, '[MarketplaceService] Failed to release lock');
        }
      }
    }
  }

  async cancelOffer(offerId: string, bidderId: string) {
    try {
      // Locking the offer instead of listing since we don't have listingId upfront
      // The repository could handle checking if it's still PENDING
      await this.repository.cancelOffer(offerId, bidderId);
      return { success: true, message: 'Offer cancelled successfully' };
    } catch (error: any) {
      throw new AppError(error.message || 'Failed to cancel offer', 400);
    }
  }

  async rejectOffer(offerId: string, sellerId: string) {
    try {
      await this.repository.rejectOffer(offerId, sellerId);
      return { success: true, message: 'Offer rejected successfully' };
    } catch (error: any) {
      throw new AppError(error.message || 'Failed to reject offer', 400);
    }
  }

  async acceptOffer(offerId: string, sellerId: string) {
    // To properly lock this, we need the listingId first
    const offer = await prisma.tradeOffer.findUnique({ where: { id: offerId } });
    if (!offer) throw new AppError('Offer not found', 404);

    let lock;
    try {
      lock = await this.lockService.acquireLock(`locks:marketplace:listing_v2:${offer.listingId}`, 5000);
      await this.repository.acceptOffer(offerId, sellerId);
      return { success: true, message: 'Offer accepted successfully. Trade complete!' };
    } catch (error: any) {
      throw new AppError(error.message || 'Failed to accept offer', error.statusCode || 400);
    } finally {
      if (lock) await this.lockService.releaseLock(lock);
    }
  }

  async searchListings(filters: any) {
    return this.repository.searchListings(filters);
  }

  async getMyListings(trainerId: string) {
    return this.repository.getMyListings(trainerId);
  }

  async getMyOffers(trainerId: string) {
    return this.repository.getMyOffers(trainerId);
  }
}
