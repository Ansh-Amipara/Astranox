import { PrismaClient, Prisma, TradeListingStatus, TradeOfferStatus } from '@prisma/client';

const prisma = new PrismaClient();

export class MarketplaceRepository {
  async createListing(sellerId: string, pokemonId: string, description: string | undefined, expiresAt: Date) {
    return prisma.$transaction(async (tx) => {
      // 1. Lock the pokemon by setting isEscrowed = true
      const pokemon = await tx.ownedPokemon.update({
        where: { id: pokemonId, trainerId: sellerId, isEscrowed: false, isParty: false },
        data: { isEscrowed: true },
      });

      // 2. Create the TradeListing
      const listing = await tx.tradeListing.create({
        data: {
          sellerId,
          pokemonId,
          description,
          status: 'OPEN',
          expiresAt,
        },
        include: {
          pokemon: {
            include: { species: true }
          },
          seller: {
            include: { user: { select: { username: true } } }
          }
        }
      });

      return listing;
    });
  }

  async getListingById(listingId: string) {
    return prisma.tradeListing.findUnique({
      where: { id: listingId },
      include: {
        pokemon: {
          include: { species: true, moves: { include: { move: true } } }
        },
        seller: {
          include: { user: { select: { username: true } } }
        },
        offers: {
          where: { status: 'PENDING' },
          include: {
            bidder: { include: { user: { select: { username: true } } } },
            offeredPokemon: {
              include: { pokemon: { include: { species: true, moves: { include: { move: true } } } } }
            }
          }
        }
      }
    });
  }

  async createOffer(bidderId: string, listingId: string, pokemonIds: string[]) {
    return prisma.$transaction(async (tx) => {
      // Lock all offered pokemon
      const updateResult = await tx.ownedPokemon.updateMany({
        where: {
          id: { in: pokemonIds },
          trainerId: bidderId,
          isEscrowed: false,
          isParty: false
        },
        data: { isEscrowed: true }
      });

      if (updateResult.count !== pokemonIds.length) {
        throw new Error('One or more selected Pokemon are already locked or not owned by you.');
      }

      // Create Offer
      const offer = await tx.tradeOffer.create({
        data: {
          bidderId,
          listingId,
          status: 'PENDING',
          offeredPokemon: {
            create: pokemonIds.map(pid => ({ pokemonId: pid }))
          }
        },
        include: {
          offeredPokemon: {
            include: { pokemon: { include: { species: true } } }
          }
        }
      });

      return offer;
    });
  }

  async cancelListing(listingId: string, sellerId: string) {
    return prisma.$transaction(async (tx) => {
      const listing = await tx.tradeListing.findUnique({
        where: { id: listingId },
        include: { offers: { include: { offeredPokemon: true } } }
      });

      if (!listing || listing.sellerId !== sellerId) throw new Error('Listing not found or unauthorized');
      if (listing.status !== 'OPEN') throw new Error('Listing is not OPEN');

      // 1. Mark listing as CANCELLED
      await tx.tradeListing.update({
        where: { id: listingId },
        data: { status: 'CANCELLED' }
      });

      // 2. Unlock seller's pokemon
      await tx.ownedPokemon.update({
        where: { id: listing.pokemonId },
        data: { isEscrowed: false }
      });

      // 3. Mark all pending offers as RETURNED and unlock bidders' pokemon
      for (const offer of listing.offers) {
        if (offer.status === 'PENDING') {
          await tx.tradeOffer.update({
            where: { id: offer.id },
            data: { status: 'RETURNED' }
          });
          const pids = offer.offeredPokemon.map(op => op.pokemonId);
          await tx.ownedPokemon.updateMany({
            where: { id: { in: pids } },
            data: { isEscrowed: false }
          });
        }
      }

      return true;
    });
  }

  async rejectOffer(offerId: string, sellerId: string) {
    return prisma.$transaction(async (tx) => {
      const offer = await tx.tradeOffer.findUnique({
        where: { id: offerId },
        include: { listing: true, offeredPokemon: true }
      });

      if (!offer || offer.listing.sellerId !== sellerId) throw new Error('Offer not found or unauthorized');
      if (offer.status !== 'PENDING') throw new Error('Offer is not PENDING');

      // 1. Mark offer as REJECTED
      await tx.tradeOffer.update({
        where: { id: offerId },
        data: { status: 'REJECTED' }
      });

      // 2. Unlock bidder's pokemon
      const pids = offer.offeredPokemon.map(op => op.pokemonId);
      await tx.ownedPokemon.updateMany({
        where: { id: { in: pids } },
        data: { isEscrowed: false }
      });

      return true;
    });
  }

  async cancelOffer(offerId: string, bidderId: string) {
    return prisma.$transaction(async (tx) => {
      const offer = await tx.tradeOffer.findUnique({
        where: { id: offerId },
        include: { offeredPokemon: true }
      });

      if (!offer || offer.bidderId !== bidderId) throw new Error('Offer not found or unauthorized');
      if (offer.status !== 'PENDING') throw new Error('Offer is not PENDING');

      // 1. Mark offer as CANCELLED
      await tx.tradeOffer.update({
        where: { id: offerId },
        data: { status: 'CANCELLED' }
      });

      // 2. Unlock bidder's pokemon
      const pids = offer.offeredPokemon.map(op => op.pokemonId);
      await tx.ownedPokemon.updateMany({
        where: { id: { in: pids } },
        data: { isEscrowed: false }
      });

      return true;
    });
  }

  async acceptOffer(offerId: string, sellerId: string) {
    return prisma.$transaction(async (tx) => {
      const acceptedOffer = await tx.tradeOffer.findUnique({
        where: { id: offerId },
        include: { 
          listing: { include: { offers: { include: { offeredPokemon: true } } } },
          offeredPokemon: true 
        }
      });

      if (!acceptedOffer || acceptedOffer.listing.sellerId !== sellerId) throw new Error('Offer not found or unauthorized');
      if (acceptedOffer.listing.status !== 'OPEN') throw new Error('Listing is no longer OPEN');
      if (acceptedOffer.status !== 'PENDING') throw new Error('Offer is not PENDING');

      const listing = acceptedOffer.listing;
      const bidderId = acceptedOffer.bidderId;

      // 1. Mark listing as COMPLETED
      await tx.tradeListing.update({
        where: { id: listing.id },
        data: { status: 'COMPLETED' }
      });

      // 2. Mark accepted offer as ACCEPTED
      await tx.tradeOffer.update({
        where: { id: acceptedOffer.id },
        data: { status: 'ACCEPTED' }
      });

      // 3. Swap owners!
      // 3a. Seller receives bidder's pokemon
      const bidderPids = acceptedOffer.offeredPokemon.map(op => op.pokemonId);
      await tx.ownedPokemon.updateMany({
        where: { id: { in: bidderPids } },
        data: { trainerId: sellerId, isEscrowed: false }
      });

      // 3b. Bidder receives seller's pokemon
      await tx.ownedPokemon.update({
        where: { id: listing.pokemonId },
        data: { trainerId: bidderId, isEscrowed: false }
      });

      // 4. Return all other pending offers
      for (const offer of listing.offers) {
        if (offer.id !== acceptedOffer.id && offer.status === 'PENDING') {
          await tx.tradeOffer.update({
            where: { id: offer.id },
            data: { status: 'RETURNED' }
          });
          const otherPids = offer.offeredPokemon.map(op => op.pokemonId);
          await tx.ownedPokemon.updateMany({
            where: { id: { in: otherPids } },
            data: { isEscrowed: false }
          });
        }
      }

      return true;
    });
  }

  async searchListings(filters: any) {
    const whereClause: Prisma.TradeListingWhereInput = {
      status: 'OPEN',
      expiresAt: { gt: new Date() } // Ensure not expired
    };

    // Construct filters based on user request (Species, Tier, etc.)
    const pokemonFilters: Prisma.OwnedPokemonWhereInput = {};
    if (filters.speciesId) pokemonFilters.speciesId = filters.speciesId;
    if (filters.potential) pokemonFilters.potential = filters.potential;
    if (filters.minLevel) pokemonFilters.level = { gte: filters.minLevel };
    if (filters.maxLevel) pokemonFilters.level = { ...(pokemonFilters.level as Prisma.IntFilter), lte: filters.maxLevel };
    
    if (Object.keys(pokemonFilters).length > 0) {
      whereClause.pokemon = pokemonFilters;
    }

    let orderBy: Prisma.TradeListingOrderByWithRelationInput = { createdAt: 'desc' };
    if (filters.sortBy === 'oldest') orderBy = { createdAt: 'asc' };
    if (filters.sortBy === 'expiringSoon') orderBy = { expiresAt: 'asc' };
    
    return prisma.tradeListing.findMany({
      where: whereClause,
      orderBy,
      take: 50, // Pagination can be added later
      include: {
        pokemon: { include: { species: true } },
        seller: { include: { user: { select: { username: true } } } },
        _count: { select: { offers: { where: { status: 'PENDING' } } } }
      }
    });
  }

  async getMyListings(trainerId: string) {
    return prisma.tradeListing.findMany({
      where: { sellerId: trainerId },
      orderBy: { createdAt: 'desc' },
      include: {
        pokemon: { include: { species: true } },
        _count: { select: { offers: { where: { status: 'PENDING' } } } }
      }
    });
  }

  async getMyOffers(trainerId: string) {
    return prisma.tradeOffer.findMany({
      where: { bidderId: trainerId },
      orderBy: { createdAt: 'desc' },
      include: {
        listing: {
          include: {
            pokemon: { include: { species: true } },
            seller: { include: { user: { select: { username: true } } } }
          }
        },
        offeredPokemon: {
          include: { pokemon: { include: { species: true } } }
        }
      }
    });
  }

  async processExpiredListings() {
    return prisma.$transaction(async (tx) => {
      const expiredListings = await tx.tradeListing.findMany({
        where: { status: 'OPEN', expiresAt: { lte: new Date() } },
        include: { offers: { include: { offeredPokemon: true } } }
      });

      let processed = 0;
      for (const listing of expiredListings) {
        // Mark as EXPIRED
        await tx.tradeListing.update({
          where: { id: listing.id },
          data: { status: 'EXPIRED' }
        });

        // Unlock seller's pokemon
        await tx.ownedPokemon.update({
          where: { id: listing.pokemonId },
          data: { isEscrowed: false }
        });

        // Mark pending offers as RETURNED and unlock
        for (const offer of listing.offers) {
          if (offer.status === 'PENDING') {
            await tx.tradeOffer.update({
              where: { id: offer.id },
              data: { status: 'RETURNED' }
            });
            const pids = offer.offeredPokemon.map(op => op.pokemonId);
            await tx.ownedPokemon.updateMany({
              where: { id: { in: pids } },
              data: { isEscrowed: false }
            });
          }
        }
        processed++;
      }
      return processed;
    });
  }
}
