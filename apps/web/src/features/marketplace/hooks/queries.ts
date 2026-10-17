import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { marketplaceApi } from '../api';
import { toast } from 'sonner';

export const useSearchListings = (filters: Record<string, unknown>) => {
  return useQuery({
    queryKey: ['marketplace', 'search', filters],
    queryFn: () => marketplaceApi.searchListings(filters)
  });
};

export const useMyListings = () => {
  return useQuery({
    queryKey: ['marketplace', 'my-listings'],
    queryFn: () => marketplaceApi.getMyListings()
  });
};

export const useMyOffers = () => {
  return useQuery({
    queryKey: ['marketplace', 'my-offers'],
    queryFn: () => marketplaceApi.getMyOffers()
  });
};

export const useListingDetails = (listingId: string) => {
  return useQuery({
    queryKey: ['marketplace', 'listing', listingId],
    queryFn: () => marketplaceApi.getListingDetails(listingId),
    enabled: !!listingId
  });
};

export const useCreateListing = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { pokemonId: string; description?: string }) => 
      marketplaceApi.createListing(data.pokemonId, data.description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace'] });
      queryClient.invalidateQueries({ queryKey: ['pokemon'] });
    }
  });
};

export const useCancelListing = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (listingId: string) => marketplaceApi.cancelListing(listingId),
    onSuccess: (_, listingId) => {
      queryClient.invalidateQueries({ queryKey: ['marketplace'] });
      queryClient.invalidateQueries({ queryKey: ['marketplace', 'listing', listingId] });
      queryClient.invalidateQueries({ queryKey: ['pokemon'] });
      toast.success('Listing cancelled successfully!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error?.message || 'Failed to cancel listing');
    }
  });
};

export const useCreateOffer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { listingId: string; pokemonIds: string[] }) => 
      marketplaceApi.createOffer(data.listingId, data.pokemonIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['marketplace'] });
      queryClient.invalidateQueries({ queryKey: ['marketplace', 'listing', variables.listingId] });
      queryClient.invalidateQueries({ queryKey: ['pokemon'] });
    }
  });
};

export const useAcceptOffer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (offerId: string) => marketplaceApi.acceptOffer(offerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace'] });
      queryClient.invalidateQueries({ queryKey: ['pokemon'] });
    }
  });
};

export const useRejectOffer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (offerId: string) => marketplaceApi.rejectOffer(offerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace'] });
      queryClient.invalidateQueries({ queryKey: ['pokemon'] });
    }
  });
};

export const useCancelOffer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (offerId: string) => marketplaceApi.cancelOffer(offerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace'] });
      queryClient.invalidateQueries({ queryKey: ['pokemon'] });
    }
  });
};
