import { container } from 'tsyringe';
import { Router } from 'express';
import { createListingSchema, createOfferSchema } from '@astranox/types';
import { MarketplaceController } from './marketplace.controller';
import { requireAuth } from '../../core/middleware/require-auth';
import { requireFlag } from '../../core/middleware/require-feature-flag';
import { gameplayLimiter } from '../../core/middleware/rate-limiter';
import { validate } from '../../core/middleware/validate';

export const marketplaceRoutes = Router();
const controller = container.resolve(MarketplaceController);

marketplaceRoutes.use(requireFlag('trading'));
marketplaceRoutes.use(requireAuth);

marketplaceRoutes.get('/search', controller.searchListings);
marketplaceRoutes.get('/me/listings', controller.getMyListings);
marketplaceRoutes.get('/me/offers', controller.getMyOffers);
marketplaceRoutes.get('/:listingId', controller.getListingDetails);

marketplaceRoutes.post('/create', gameplayLimiter, validate(createListingSchema), controller.createListing);
marketplaceRoutes.post('/:listingId/cancel', gameplayLimiter, controller.cancelListing);

marketplaceRoutes.post('/:listingId/offer', gameplayLimiter, validate(createOfferSchema), controller.createOffer);
marketplaceRoutes.post('/offer/:offerId/accept', gameplayLimiter, controller.acceptOffer);
marketplaceRoutes.post('/offer/:offerId/reject', gameplayLimiter, controller.rejectOffer);
marketplaceRoutes.post('/offer/:offerId/cancel', gameplayLimiter, controller.cancelOffer);

