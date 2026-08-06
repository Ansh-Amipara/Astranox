import { injectable } from 'tsyringe';
import { Request, Response, NextFunction } from 'express';
import { MarketplaceService } from './marketplace.service';
import { prisma } from '../../core/db/prisma';



const getTrainerId = async (userId: string) => {
  const trainer = await prisma.trainerSave.findUnique({ where: { userId } });
  if (!trainer) throw new Error('Trainer not found');
  return trainer.id;
};

@injectable()
export class MarketplaceController {
  constructor(private service: MarketplaceService) {}

  createListing = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { pokemonId, description } = req.body;
      const trainerId = await getTrainerId(req.user!.id);
      const listing = await this.service.createListing(trainerId, pokemonId, description);
      res.json({ success: true, data: listing });
    } catch (error) {
      next(error);
    }
  };

  createOffer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { listingId } = req.params;
      const { pokemonIds } = req.body;
      const trainerId = await getTrainerId(req.user!.id);
      const offer = await this.service.createOffer(trainerId, listingId, pokemonIds);
      res.json({ success: true, data: offer });
    } catch (error) {
      next(error);
    }
  };

  getListingDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { listingId } = req.params;
      const listing = await this.service.getListingDetails(listingId);
      res.json({ success: true, data: listing });
    } catch (error) {
      next(error);
    }
  };

  cancelListing = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { listingId } = req.params;
      const trainerId = await getTrainerId(req.user!.id);
      const result = await this.service.cancelListing(listingId, trainerId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  cancelOffer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { offerId } = req.params;
      const trainerId = await getTrainerId(req.user!.id);
      const result = await this.service.cancelOffer(offerId, trainerId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  acceptOffer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { offerId } = req.params;
      const trainerId = await getTrainerId(req.user!.id);
      const result = await this.service.acceptOffer(offerId, trainerId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  rejectOffer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { offerId } = req.params;
      const trainerId = await getTrainerId(req.user!.id);
      const result = await this.service.rejectOffer(offerId, trainerId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  searchListings = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters: any = { ...req.query };
      // Convert query string params to proper types if needed
      if (filters.speciesId) filters.speciesId = parseInt(filters.speciesId as string, 10);
      if (filters.minLevel) filters.minLevel = parseInt(filters.minLevel as string, 10);
      if (filters.maxLevel) filters.maxLevel = parseInt(filters.maxLevel as string, 10);
      
      const listings = await this.service.searchListings(filters);
      res.json({ success: true, data: listings });
    } catch (error) {
      next(error);
    }
  };

  getMyListings = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const trainerId = await getTrainerId(req.user!.id);
      const listings = await this.service.getMyListings(trainerId);
      res.json({ success: true, data: listings });
    } catch (error) {
      next(error);
    }
  };

  getMyOffers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const trainerId = await getTrainerId(req.user!.id);
      const offers = await this.service.getMyOffers(trainerId);
      res.json({ success: true, data: offers });
    } catch (error) {
      next(error);
    }
  };
}
