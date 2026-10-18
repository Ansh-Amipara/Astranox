import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useListingDetails, useAcceptOffer, useRejectOffer, useCancelListing, useCancelOffer } from '../hooks/queries';
import { TradeOfferModal } from './TradeOfferModal';
import { getSpriteUrl } from '@/shared/api/api';
import { Loader2, ArrowLeft, Check, X, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/features/auth/store';
import { TradeOfferDto } from '@astranox/types';
import { formatPotential } from '@/features/pokemon/pokemonUtils';
export function ListingDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data: listing, isLoading } = useListingDetails(id!);

  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const acceptMutation = useAcceptOffer();
  const rejectMutation = useRejectOffer();
  const cancelMutation = useCancelListing();
  const cancelOfferMutation = useCancelOffer();

  if (isLoading) {
    return (
      <div className="flex-1 bg-background flex items-center justify-center min-h-[calc(100vh-64px)]">
        <Loader2 className="w-12 h-12 text-foreground animate-spin" />
      </div>
    );
  }

  if (!listing) {
    return <div className="text-center mt-20 text-subtle">Listing not found</div>;
  }

  const isSeller = user?.username === listing.seller.user.username;
  const isExpired = new Date(listing.expiresAt) < new Date();
  const canCancel = isSeller && listing.status === 'OPEN';

  return (
    <div className="flex-1 bg-background p-4 md:p-6 min-h-[calc(100vh-64px)]">
      <div className="w-full mx-auto">
        <button
          onClick={() => navigate('/marketplace')}
          className="flex items-center gap-2 text-subtle hover:text-subtle transition-colors mb-6 font-bold"
        >
          <ArrowLeft className="w-5 h-5" /> Back to Marketplace
        </button>

        <div className="bg-surface rounded-3xl p-6 shadow-sm border border-border mb-8 flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
          <div className="w-48 h-48 bg-surface-raised rounded-2xl flex items-center justify-center border border-border shrink-0">
            <img src={getSpriteUrl(listing.pokemon.species.id)} alt={listing.pokemon.species.name} className="w-40 h-40 object-contain pixelated" />
          </div>
          <div className="flex-1 w-full">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
              <div className="w-full md:w-auto">
                <h1 className="text-2xl md:text-3xl font-black text-foreground capitalize flex items-center gap-2 flex-wrap">
                  {listing.pokemon.species.name}
                  {listing.pokemon.potential === 'LEGENDARY' && <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-foreground shrink-0" />}
                </h1>
                <p className="text-base md:text-lg font-bold text-muted mt-1 uppercase tracking-widest flex-wrap">
                  Lv. {listing.pokemon.level} • {formatPotential(listing.pokemon.potential)}
                </p>
                <p className="text-sm text-muted mt-4">
                  Listed by <span className="font-bold text-muted">{listing.seller.user.username}</span>
                </p>
                {listing.description && (
                  <p className="mt-4 p-4 bg-surface-raised rounded-xl text-muted italic border border-border text-sm md:text-base">
                    "{listing.description}"
                  </p>
                )}
              </div>
              <div className="flex flex-row md:flex-col justify-between md:justify-start items-center md:items-end w-full md:w-auto mt-2 md:mt-0 gap-4 md:gap-0 border-t md:border-t-0 border-border pt-4 md:pt-0">
                <span className={`px-4 py-2 rounded-xl text-xs md:text-sm font-black tracking-wider uppercase shrink-0 ${listing.status === 'OPEN' && !isExpired ? 'bg-surface-raised text-foreground' : 'bg-surface-raised text-subtle' }`}>
                  {isExpired && listing.status === 'OPEN' ? 'EXPIRED' : listing.status}
                </span>
                {canCancel && (
                  <button
                    onClick={() => setIsCancelModalOpen(true)}
                    disabled={cancelMutation.isPending}
                    className="block mt-0 md:mt-4 text-sm font-bold text-foreground hover:text-foreground transition-colors shrink-0"
                  >
                    Cancel Listing
                  </button>
                )}
              </div>
            </div>

            {!isSeller && listing.status === 'OPEN' && !isExpired && (
              <button
                onClick={() => setIsOfferModalOpen(true)}
                className="mt-6 w-full px-8 py-3 md:py-4 bg-surface-raised hover:bg-surface-raised text-foreground font-black rounded-xl transition-colors shadow-lg shadow-glow text-lg"
              >
                Submit Offer
              </button>
            )}
          </div>
        </div>

        {/* Offers Section */}
        <div>
          <h2 className="text-2xl font-black text-foreground mb-6">Current Offers ({listing.offers?.length || 0})</h2>

          {listing.offers?.length === 0 ? (
            <div className="text-center py-12 text-subtle bg-surface rounded-2xl border border-border">
              No offers have been made yet.
            </div>
          ) : (
            <div className="space-y-4">
              {listing.offers?.map((offer: TradeOfferDto) => (
                <div key={offer.id} className="bg-surface rounded-2xl p-6 border border-border shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="flex-1">
                    <p className="font-bold text-muted mb-4">
                      Offer by {offer.bidder?.user?.username} <span className="text-muted text-sm ml-2">({offer.offeredPokemon.length} Pokémon)</span>
                    </p>
                    <div className="flex flex-wrap gap-4">
                      {offer.offeredPokemon.map((op) => (
                        <div key={op.pokemon.id} className="flex items-center gap-3 bg-surface-raised p-3 rounded-xl border border-border">
                          <img src={getSpriteUrl(op.pokemon.species.id)} alt={op.pokemon.species.name} className="w-12 h-12 pixelated" />
                          <div>
                            <p className="font-bold text-foreground text-sm capitalize">{op.pokemon.species.name}</p>
                            <p className="text-xs text-subtle font-semibold">Lv. {op.pokemon.level} • {op.pokemon.potential}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {isSeller && listing.status === 'OPEN' && offer.status === 'PENDING' && (
                    <div className="flex gap-2 w-full md:w-auto">
                      <button
                        onClick={() => acceptMutation.mutate(offer.id)}
                        disabled={acceptMutation.isPending || rejectMutation.isPending}
                        className="flex-1 md:flex-none px-6 py-3 bg-surface-raised hover:bg-surface-raised text-foreground font-bold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                      >
                        <Check className="w-5 h-5" /> Accept
                      </button>
                      <button
                        onClick={() => rejectMutation.mutate(offer.id)}
                        disabled={acceptMutation.isPending || rejectMutation.isPending}
                        className="flex-1 md:flex-none px-6 py-3 bg-surface-raised hover:bg-surface-raised text-foreground font-bold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                      >
                        <X className="w-5 h-5" /> Reject
                      </button>
                    </div>
                  )}

                  {!isSeller && user?.username === offer.bidder?.user?.username && listing.status === 'OPEN' && offer.status === 'PENDING' && (
                    <div className="flex gap-2 w-full md:w-auto">
                      <button
                        onClick={() => cancelOfferMutation.mutate(offer.id)}
                        disabled={cancelOfferMutation.isPending}
                        className="flex-1 md:flex-none px-6 py-3 bg-surface-raised hover:bg-surface-raised text-foreground font-bold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                      >
                        <X className="w-5 h-5" /> Cancel Offer
                      </button>
                    </div>
                  )}

                  {(!isSeller && user?.username !== offer.bidder?.user?.username || offer.status !== 'PENDING') && (
                    <div className="px-6 py-3 bg-surface-raised rounded-xl text-muted font-bold uppercase tracking-wider text-sm">
                      {offer.status}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {isOfferModalOpen && (
        <TradeOfferModal
          listingId={listing.id}
          onClose={() => setIsOfferModalOpen(false)}
        />
      )}

      {/* Cancel Confirmation Modal */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface border border-border rounded-3xl p-8 max-w-md w-full shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-black text-foreground mb-2">Cancel Listing?</h2>
            <p className="text-muted font-medium mb-8">
              Are you sure you want to cancel this listing? Your Pokémon will be returned to your PC immediately.
            </p>

            <div className="flex w-full gap-4">
              <button 
                onClick={() => setIsCancelModalOpen(false)}
                disabled={cancelMutation.isPending}
                className="flex-1 py-4 bg-surface-raised hover:bg-surface-raised text-muted font-bold rounded-xl transition-colors disabled:opacity-50"
              >
                No
              </button>
              <button 
                onClick={() => {
                  cancelMutation.mutate(listing.id, {
                    onSuccess: () => setIsCancelModalOpen(false)
                  });
                }}
                disabled={cancelMutation.isPending}
                className="flex-1 py-4 bg-surface-raised hover:bg-surface-raised text-foreground font-bold rounded-xl shadow-lg shadow-glow transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {cancelMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  'Yes'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export const ListingDetails = ListingDetailsPage;

