import { useState } from 'react';
import { useSearchListings, useMyListings, useMyOffers, useCancelOffer } from '../hooks/queries';
import { TradeListingCard } from './TradeListingCard';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TradeListingDto, TradeOfferDto } from '@astranox/types';
import { Skeleton, EmptyState, ErrorState, Button } from '@/components/ui';

export function MarketplacePage() {
  const [activeTab, setActiveTab] = useState<'browse' | 'my-listings' | 'my-offers'>('browse');
  const navigate = useNavigate();

  // Basic filters for now
  const [filters] = useState({});

  const {
    data: searchData,
    isLoading: isLoadingSearch,
    isError: isErrorSearch,
    refetch: refetchSearch,
  } = useSearchListings(filters);

  const {
    data: myListingsData,
    isLoading: isLoadingMyListings,
    isError: isErrorMyListings,
    refetch: refetchMyListings,
  } = useMyListings();

  const {
    data: myOffersData,
    isLoading: isLoadingMyOffers,
    isError: isErrorMyOffers,
    refetch: refetchMyOffers,
  } = useMyOffers();

  const cancelOfferMutation = useCancelOffer();

  const renderContent = () => {
    if (activeTab === 'browse') {
      if (isLoadingSearch) {
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-surface border border-border rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-start">
                  <Skeleton width={120} height={20} />
                  <Skeleton width={50} height={20} />
                </div>
                <div className="flex justify-center py-4">
                  <Skeleton variant="circular" width={80} height={80} />
                </div>
                <div className="space-y-2">
                  <Skeleton width="100%" height={14} />
                  <Skeleton width="60%" height={14} />
                </div>
                <Skeleton height={36} className="rounded-xl" />
              </div>
            ))}
          </div>
        );
      }

      if (isErrorSearch) {
        return (
          <div className="mt-12 flex justify-center">
            <ErrorState
              title="Failed to Load Listings"
              message="Could not retrieve active trade listings from the marketplace."
              onRetry={() => refetchSearch()}
            />
          </div>
        );
      }

      const listings = searchData || [];
      if (listings.length === 0) {
        return (
          <div className="mt-12">
            <EmptyState
              title="No Active Listings"
              description="There are currently no trade listings open on the exchange. Be the first to create one!"
              action={
                <Button variant="outline" onClick={() => navigate('/marketplace/create')}>
                  Create First Listing
                </Button>
              }
            />
          </div>
        );
      }

      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
          {listings.map((listing: TradeListingDto & { _count?: { offers: number } }) => (
            <TradeListingCard key={listing.id} listing={listing} onClick={() => navigate(`/marketplace/${listing.id}`)} />
          ))}
        </div>
      );
    }

    if (activeTab === 'my-listings') {
      if (isLoadingMyListings) {
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-surface border border-border rounded-2xl p-5 space-y-4">
                <Skeleton width={100} height={20} />
                <div className="flex justify-center py-4">
                  <Skeleton variant="circular" width={80} height={80} />
                </div>
                <Skeleton height={36} className="rounded-xl" />
              </div>
            ))}
          </div>
        );
      }

      if (isErrorMyListings) {
        return (
          <div className="mt-12 flex justify-center">
            <ErrorState
              title="Failed to Load Your Listings"
              message="Could not fetch your active trade listings."
              onRetry={() => refetchMyListings()}
            />
          </div>
        );
      }

      const listings = myListingsData || [];
      if (listings.length === 0) {
        return (
          <div className="mt-12">
            <EmptyState
              title="You Have No Listings"
              description="You haven't listed any Pokémon for trade yet."
              action={
                <Button variant="outline" onClick={() => navigate('/marketplace/create')}>
                  List a Pokémon
                </Button>
              }
            />
          </div>
        );
      }

      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
          {listings.map((listing: TradeListingDto & { _count?: { offers: number } }) => (
            <TradeListingCard key={listing.id} listing={listing} onClick={() => navigate(`/marketplace/${listing.id}`)} />
          ))}
        </div>
      );
    }

    if (activeTab === 'my-offers') {
      if (isLoadingMyOffers) {
        return (
          <div className="space-y-4 mt-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-surface p-4 rounded-xl border border-border flex justify-between items-center">
                <div className="space-y-2">
                  <Skeleton width={160} height={18} />
                  <Skeleton width={100} height={14} />
                </div>
                <Skeleton width={100} height={36} className="rounded-lg" />
              </div>
            ))}
          </div>
        );
      }

      if (isErrorMyOffers) {
        return (
          <div className="mt-12 flex justify-center">
            <ErrorState
              title="Failed to Load Offers"
              message="Could not load your trade offers from the server."
              onRetry={() => refetchMyOffers()}
            />
          </div>
        );
      }

      const offers = myOffersData || [];
      if (offers.length === 0) {
        return (
          <div className="mt-12">
            <EmptyState
              title="No Offers Placed"
              description="You have not submitted trade offers on any listings yet."
              action={
                <Button variant="outline" onClick={() => setActiveTab('browse')}>
                  Browse Active Trades
                </Button>
              }
            />
          </div>
        );
      }

      return (
        <div className="space-y-4 mt-6">
          {offers.map((offer: TradeOfferDto & { listing: TradeListingDto }) => (
            <div key={offer.id} className="bg-surface p-4 rounded-xl shadow-sm border border-border flex justify-between items-center cursor-pointer hover:border-border transition-colors" onClick={() => navigate(`/marketplace/${offer.listingId}`)}>
              <div>
                <p className="font-bold text-foreground">Offer on {offer.listing.pokemon.species.name}</p>
                <p className="text-sm text-subtle">Status: <span className="font-bold uppercase">{offer.status}</span></p>
                <p className="text-sm text-subtle">You offered {offer.offeredPokemon.length} Pokémon</p>
              </div>
              {offer.status === 'PENDING' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    cancelOfferMutation.mutate(offer.id);
                  }}
                  disabled={cancelOfferMutation.isPending}
                  className="px-4 py-2 min-h-[44px] bg-surface-raised hover:bg-surface-raised text-foreground font-bold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center shrink-0"
                >
                  Cancel Offer
                </button>
              )}
            </div>
          ))}
        </div>
      );
    }
  };

  return (
    <div className="flex-1 bg-background p-3 sm:p-4 md:p-6 min-h-[calc(100dvh-64px)]">
      <div className="w-full mx-auto">
        <div className="flex flex-row justify-between items-center mb-6 sm:mb-8 gap-2 md:gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-black text-foreground flex items-center gap-2 truncate">
              Trade Exchange
            </h1>
          </div>

          <button
            onClick={() => navigate('/marketplace/create')}
            className="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 min-h-[44px] bg-surface-raised hover:bg-surface-raised text-foreground font-bold rounded-lg transition-colors shrink-0 text-sm md:text-base"
          >
            <Plus className="w-4 h-4 md:w-5 md:h-5" /> 
            <span className="hidden sm:inline">Create Listing</span>
            <span className="inline sm:hidden">Create</span>
          </button>
        </div>

        <div className="flex space-x-1 bg-surface-raised p-1 rounded-xl w-full mb-6">
          {(['browse', 'my-listings', 'my-offers'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-2 md:px-6 py-2.5 min-h-[44px] rounded-lg text-xs sm:text-sm font-bold capitalize transition-all flex items-center justify-center ${activeTab === tab ? 'bg-surface text-foreground shadow-sm' : 'text-subtle hover:text-subtle ' }`}
            >
              {tab.replace('-', ' ')}
            </button>
          ))}
        </div>

        {renderContent()}
      </div>
    </div>
  );
}

export const Marketplace = MarketplacePage;

