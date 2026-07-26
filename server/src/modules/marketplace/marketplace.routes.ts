import { Router } from 'express';
import { MarketplaceController } from './marketplace.controller';
import { requireAuth } from '../../common/middleware/require-auth';
import { gameplayLimiter } from '../../common/middleware/rate-limiter';

export const marketplaceRoutes = Router();
const controller = new MarketplaceController();

marketplaceRoutes.use(requireAuth);

marketplaceRoutes.get('/search', controller.searchListings);
marketplaceRoutes.get('/me/listings', controller.getMyListings);
marketplaceRoutes.get('/me/offers', controller.getMyOffers);
marketplaceRoutes.get('/:listingId', controller.getListingDetails);

marketplaceRoutes.post('/create', gameplayLimiter, controller.createListing);
marketplaceRoutes.post('/:listingId/cancel', gameplayLimiter, controller.cancelListing);

marketplaceRoutes.post('/:listingId/offer', gameplayLimiter, controller.createOffer);
marketplaceRoutes.post('/offer/:offerId/accept', gameplayLimiter, controller.acceptOffer);
marketplaceRoutes.post('/offer/:offerId/reject', gameplayLimiter, controller.rejectOffer);
marketplaceRoutes.post('/offer/:offerId/cancel', gameplayLimiter, controller.cancelOffer);
