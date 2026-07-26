import { api } from '../../../shared/api/api';

export const marketplaceApi = {
  createListing: async (pokemonId: string, description?: string) => {
    const { data } = await api.post('/marketplace/create', { pokemonId, description });
    return data.data;
  },

  searchListings: async (filters: any) => {
    const { data } = await api.get('/marketplace/search', { params: filters });
    return data.data;
  },

  getMyListings: async () => {
    const { data } = await api.get('/marketplace/me/listings');
    return data.data;
  },

  getMyOffers: async () => {
    const { data } = await api.get('/marketplace/me/offers');
    return data.data;
  },

  getListingDetails: async (listingId: string) => {
    const { data } = await api.get(`/marketplace/${listingId}`);
    return data.data;
  },

  cancelListing: async (listingId: string) => {
    const { data } = await api.post(`/marketplace/${listingId}/cancel`);
    return data.data;
  },

  createOffer: async (listingId: string, pokemonIds: string[]) => {
    const { data } = await api.post(`/marketplace/${listingId}/offer`, { pokemonIds });
    return data.data;
  },

  acceptOffer: async (offerId: string) => {
    const { data } = await api.post(`/marketplace/offer/${offerId}/accept`);
    return data.data;
  },

  rejectOffer: async (offerId: string) => {
    const { data } = await api.post(`/marketplace/offer/${offerId}/reject`);
    return data.data;
  },

  cancelOffer: async (offerId: string) => {
    const { data } = await api.post(`/marketplace/offer/${offerId}/cancel`);
    return data.data;
  }
};
