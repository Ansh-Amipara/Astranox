import { useState } from 'react';
import { useSearchListings, useMyListings, useMyOffers, useCancelOffer } from '../../../features/marketplace/api/queries';
import { TradeListingCard } from '../../../features/marketplace/ui/TradeListingCard';
import { Loader2, Plus, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
      if (isLoadingSearch) return <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mt-20" />;
      const listings = searchData || [];
      if (listings.length === 0) return <div className="text-center text-slate-500 mt-20">No active listings found.</div>;

      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
          {listings.map((listing: any) => (
            <TradeListingCard key={listing.id} listing={listing} onClick={() => navigate(`/marketplace/${listing.id}`)} />
          ))}
        </div>
      );
    }

    if (activeTab === 'my-listings') {
      if (isLoadingMyListings) return <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mt-20" />;
      const listings = myListingsData || [];
      if (listings.length === 0) return <div className="text-center text-slate-500 mt-20">You have no listings.</div>;

      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
          {listings.map((listing: any) => (
            <TradeListingCard key={listing.id} listing={listing} onClick={() => navigate(`/marketplace/${listing.id}`)} />
          ))}
        </div>
      );
    }

    if (activeTab === 'my-offers') {
      if (isLoadingMyOffers) return <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mt-20" />;
      const offers = myOffersData || [];
      if (offers.length === 0) return <div className="text-center text-slate-500 mt-20">You have no pending offers.</div>;

      return (
        <div className="space-y-4 mt-6">
          {offers.map((offer: any) => (
            <div key={offer.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex justify-between items-center cursor-pointer hover:border-blue-500 transition-colors" onClick={() => navigate(`/marketplace/${offer.listingId}`)}>
              <div>
                <p className="font-bold text-slate-800 dark:text-white">Offer on {offer.listing.pokemon.species.name}</p>
                <p className="text-sm text-slate-500">Status: <span className="font-bold uppercase">{offer.status}</span></p>
                <p className="text-sm text-slate-500">You offered {offer.offeredPokemon.length} Pokémon</p>
              </div>
              {offer.status === 'PENDING' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    cancelOfferMutation.mutate(offer.id);
                  }}
                  disabled={cancelOfferMutation.isPending}
                  className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-600 font-bold rounded-lg transition-colors disabled:opacity-50"
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
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 p-4 md:p-6 min-h-[calc(100vh-64px)]">
      <div className="w-full mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              Trade Exchange
            </h1>
          </div>

          <button
            onClick={() => navigate('/marketplace/create')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" /> Create Listing
          </button>
        </div>

        <div className="flex space-x-1 bg-slate-200 dark:bg-slate-800 p-1 rounded-xl w-max mb-6">
          {(['browse', 'my-listings', 'my-offers'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg text-sm font-bold capitalize transition-all ${activeTab === tab
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
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
