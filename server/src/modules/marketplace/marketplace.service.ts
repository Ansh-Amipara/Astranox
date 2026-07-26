import { MarketplaceRepository } from './marketplace.repository';
import { AppError } from '../../common/errors/AppError';

export class MarketplaceService {
  private repository: MarketplaceRepository;

  constructor() {
    this.repository = new MarketplaceRepository();
  }

  async createListing(sellerId: string, pokemonId: string, description?: string) {
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

    const listing = await this.repository.getListingById(listingId);
    if (!listing) {
      throw new AppError('Listing not found', 404);
    }
    if (listing.status !== 'OPEN') {
      throw new AppError('Listing is not OPEN', 400);
    }
    if (listing.sellerId === bidderId) {
      throw new AppError('Cannot bid on your own listing', 400);
    }

    try {
      return await this.repository.createOffer(bidderId, listingId, pokemonIds);
    } catch (error: any) {
      throw new AppError(error.message || 'Failed to create offer', 400);
    }
  }

  async cancelListing(listingId: string, sellerId: string) {
    try {
      await this.repository.cancelListing(listingId, sellerId);
      return { success: true, message: 'Listing cancelled successfully' };
    } catch (error: any) {
      throw new AppError(error.message || 'Failed to cancel listing', 400);
    }
  }

  async cancelOffer(offerId: string, bidderId: string) {
    try {
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
    try {
      await this.repository.acceptOffer(offerId, sellerId);
      return { success: true, message: 'Offer accepted successfully. Trade complete!' };
    } catch (error: any) {
      throw new AppError(error.message || 'Failed to accept offer', 400);
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
