import { useState } from 'react';
import { useSearchListings, useMyListings, useMyOffers, useCancelOffer } from '../hooks/queries';
import { TradeListingCard } from './TradeListingCard';
import { Loader2, Plus, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TradeListingDto, TradeOfferDto } from '@astranox/types';;

export function MarketplacePage() {
  const [activeTab, setActiveTab] = useState<'browse' | 'my-listings' | 'my-offers'>('browse');
  const navigate = useNavigate();

  // Basic filters for now
  const [filters, setFilters] = useState({});

  const { data: searchData, isLoading: isLoadingSearch } = useSearchListings(filters);
  const { data: myListingsData, isLoading: isLoadingMyListings } = useMyListings();
  const { data: myOffersData, isLoading: isLoadingMyOffers } = useMyOffers();
  const cancelOfferMutation = useCancelOffer();

  const renderContent = () => {
    if (activeTab === 'browse') {
      if (isLoadingSearch) return <Loader2 className="w-8 h-8 animate-spin text-foreground mx-auto mt-20" />;
      const listings = searchData || [];
      if (listings.length === 0) return <div className="text-center text-subtle mt-20">No active listings found.</div>;

      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
          {listings.map((listing: TradeListingDto & { _count?: { offers: number } }) => (
            <TradeListingCard key={listing.id} listing={listing} onClick={() => navigate(`/marketplace/${listing.id}`)} />
          ))}
        </div>
      );
    }

    if (activeTab === 'my-listings') {
      if (isLoadingMyListings) return <Loader2 className="w-8 h-8 animate-spin text-foreground mx-auto mt-20" />;
      const listings = myListingsData || [];
      if (listings.length === 0) return <div className="text-center text-subtle mt-20">You have no listings.</div>;

      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
          {listings.map((listing: TradeListingDto & { _count?: { offers: number } }) => (
            <TradeListingCard key={listing.id} listing={listing} onClick={() => navigate(`/marketplace/${listing.id}`)} />
          ))}
        </div>
      );
    }

    if (activeTab === 'my-offers') {
      if (isLoadingMyOffers) return <Loader2 className="w-8 h-8 animate-spin text-foreground mx-auto mt-20" />;
      const offers = myOffersData || [];
      if (offers.length === 0) return <div className="text-center text-subtle mt-20">You have no pending offers.</div>;

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
                  className="px-4 py-2 bg-surface-raised hover:bg-surface-raised text-foreground font-bold rounded-lg transition-colors disabled:opacity-50"
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
    <div className="flex-1 bg-background p-4 md:p-6 min-h-[calc(100vh-64px)]">
      <div className="w-full mx-auto">
        <div className="flex flex-row justify-between items-center mb-8 gap-2 md:gap-4">
          <div className="min-w-0">
            <h1 className="text-3xl font-black text-foreground flex items-center gap-2 truncate">
              Trade Exchange
            </h1>
          </div>

          <button
            onClick={() => navigate('/marketplace/create')}
            className="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 bg-surface-raised hover:bg-surface-raised text-foreground font-bold rounded-lg transition-colors shrink-0 text-sm md:text-base"
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
              className={`flex-1 px-2 md:px-6 py-2 rounded-lg text-xs sm:text-sm font-bold capitalize transition-all ${activeTab === tab ? 'bg-surface text-foreground shadow-sm' : 'text-subtle hover:text-subtle ' }`}
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

