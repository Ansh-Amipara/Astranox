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
      <div className="flex-1 bg-background flex items-center justify-center min-h-[calc(100dvh-64px)]">
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
    <div className="flex-1 bg-background p-3 sm:p-4 md:p-6 min-h-[calc(100dvh-64px)]">
      <div className="w-full max-w-5xl mx-auto space-y-6">
        <button
          onClick={() => navigate('/marketplace')}
          className="flex items-center gap-2 text-muted hover:text-foreground transition-colors font-bold min-h-[44px] touch-manipulation select-none"
        >
          <ArrowLeft className="w-5 h-5" /> Back to Marketplace
        </button>

        {/* Hero Card */}
        <div className="bg-surface rounded-2xl p-5 sm:p-6 md:p-8 shadow-xs border border-border flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="w-32 h-32 sm:w-44 sm:h-44 bg-surface-raised rounded-2xl flex items-center justify-center border border-border shrink-0 shadow-xs">
            <img src={getSpriteUrl(listing.pokemon.species.id)} alt={listing.pokemon.species.name} className="w-24 h-24 sm:w-36 sm:h-36 object-contain pixelated" />
          </div>

          <div className="flex-1 w-full space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-foreground capitalize flex items-center gap-2 flex-wrap">
                  {listing.pokemon.species.name}
                  {listing.pokemon.potential === 'LEGENDARY' && <Sparkles className="w-5 h-5 text-warning shrink-0" />}
                </h1>
                <p className="text-xs sm:text-sm font-bold text-muted mt-1 uppercase tracking-wider">
                  Lv. {listing.pokemon.level} • {formatPotential(listing.pokemon.potential)}
                </p>
                <p className="text-xs text-muted mt-2">
                  Listed by <span className="font-bold text-foreground">{listing.seller.user.username}</span>
                </p>
                {listing.description && (
                  <p className="mt-3 p-3 bg-surface-raised rounded-xl text-foreground text-xs sm:text-sm italic border border-border">
                    "{listing.description}"
                  </p>
                )}
              </div>

              <div className="flex flex-row md:flex-col justify-between md:justify-start items-center md:items-end w-full md:w-auto gap-3 border-t md:border-t-0 border-border pt-3 md:pt-0">
                <span className={`px-3 py-1.5 rounded-full text-xs font-black tracking-wider uppercase border shrink-0 ${
                  listing.status === 'OPEN' && !isExpired
                    ? 'bg-success/10 text-success border-success/20'
                    : 'bg-surface-raised text-muted border-border'
                }`}>
                  {isExpired && listing.status === 'OPEN' ? 'EXPIRED' : listing.status}
                </span>
                {canCancel && (
                  <button
                    onClick={() => setIsCancelModalOpen(true)}
                    disabled={cancelMutation.isPending}
                    className="text-xs font-bold text-danger hover:underline transition-colors min-h-[44px] flex items-center touch-manipulation select-none"
                  >
                    Cancel Listing
                  </button>
                )}
              </div>
            </div>

            {!isSeller && listing.status === 'OPEN' && !isExpired && (
              <button
                onClick={() => setIsOfferModalOpen(true)}
                className="w-full sm:w-auto px-8 py-3 min-h-[44px] bg-primary text-primary-foreground font-black rounded-xl transition-all shadow-xs hover:opacity-90 active:scale-[0.98] text-sm sm:text-base flex items-center justify-center touch-manipulation select-none"
              >
                Submit Trade Offer
              </button>
            )}
          </div>
        </div>

        {/* Offers Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-black text-foreground">
              Current Offers ({listing.offers?.length || 0})
            </h2>
          </div>

          {listing.offers?.length === 0 ? (
            <div className="text-center py-12 text-muted bg-surface rounded-2xl border border-border text-sm">
              No offers have been made yet.
            </div>
          ) : (
            <div className="space-y-3">
              {listing.offers?.map((offer: TradeOfferDto) => (
                <div
                  key={offer.id}
                  className="bg-surface rounded-2xl p-4 sm:p-5 border border-border shadow-xs hover:shadow-md transition-all duration-200 flex flex-col md:flex-row justify-between md:items-center gap-4"
                >
                  <div className="flex-1 space-y-3">
                    <p className="font-black text-foreground text-sm">
                      Offer by <span className="text-primary">{offer.bidder?.user?.username}</span>
                      <span className="text-muted text-xs font-normal ml-2">({offer.offeredPokemon.length} Pokémon)</span>
                    </p>
                    <div className="flex flex-wrap gap-2.5">
                      {offer.offeredPokemon.map((op) => (
                        <div key={op.pokemon.id} className="flex items-center gap-2.5 bg-surface-raised p-2.5 rounded-xl border border-border">
                          <img src={getSpriteUrl(op.pokemon.species.id)} alt={op.pokemon.species.name} className="w-10 h-10 pixelated object-contain" />
                          <div>
                            <p className="font-black text-foreground text-xs capitalize">{op.pokemon.species.name}</p>
                            <p className="text-[10px] text-muted font-bold">Lv. {op.pokemon.level} • {op.pokemon.potential}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {isSeller && listing.status === 'OPEN' && offer.status === 'PENDING' && (
                    <div className="flex gap-2 w-full md:w-auto shrink-0">
                      <button
                        onClick={() => acceptMutation.mutate(offer.id)}
                        disabled={acceptMutation.isPending || rejectMutation.isPending}
                        className="flex-1 md:flex-none px-4 py-2 min-h-[44px] bg-success/10 hover:bg-success/20 text-success border border-success/20 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] disabled:opacity-50 touch-manipulation select-none"
                      >
                        <Check className="w-4 h-4" /> Accept
                      </button>
                      <button
                        onClick={() => rejectMutation.mutate(offer.id)}
                        disabled={acceptMutation.isPending || rejectMutation.isPending}
                        className="flex-1 md:flex-none px-4 py-2 min-h-[44px] bg-danger/10 hover:bg-danger/20 text-danger border border-danger/20 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] disabled:opacity-50 touch-manipulation select-none"
                      >
                        <X className="w-4 h-4" /> Reject
                      </button>
                    </div>
                  )}

                  {!isSeller && user?.username === offer.bidder?.user?.username && listing.status === 'OPEN' && offer.status === 'PENDING' && (
                    <div className="flex gap-2 w-full md:w-auto shrink-0">
                      <button
                        onClick={() => cancelOfferMutation.mutate(offer.id)}
                        disabled={cancelOfferMutation.isPending}
                        className="flex-1 md:flex-none px-4 py-2 min-h-[44px] bg-surface-raised hover:bg-surface-raised/80 text-foreground border border-border font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] disabled:opacity-50 touch-manipulation select-none"
                      >
                        <X className="w-4 h-4" /> Cancel Offer
                      </button>
                    </div>
                  )}

                  {(!isSeller && user?.username !== offer.bidder?.user?.username || offer.status !== 'PENDING') && (
                    <div className="px-3 py-1.5 bg-surface-raised rounded-xl text-muted font-black uppercase tracking-wider text-xs border border-border">
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
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-background/80 backdrop-blur-xs animate-in fade-in duration-200" onClick={() => setIsCancelModalOpen(false)}>
          <div className="bg-surface border border-border rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 max-w-md w-full shadow-2xl flex flex-col items-center text-center pb-safe animate-in slide-in-from-bottom sm:zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="sm:hidden mx-auto -mt-2 mb-4 h-1.5 w-12 rounded-full bg-border shrink-0" aria-hidden="true" />
            <h2 className="text-xl font-black text-foreground mb-2">Cancel Listing?</h2>
            <p className="text-xs sm:text-sm text-muted font-medium mb-6">
              Are you sure you want to cancel this listing? Your Pokémon will be returned to your PC immediately.
            </p>

            <div className="flex w-full gap-2.5">
              <button
                onClick={() => setIsCancelModalOpen(false)}
                disabled={cancelMutation.isPending}
                className="flex-1 py-2.5 min-h-[44px] bg-surface-raised hover:bg-surface-raised/80 text-muted font-bold text-xs rounded-xl border border-border transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center touch-manipulation select-none"
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
                className="flex-1 py-2.5 min-h-[44px] bg-danger text-foreground font-black text-xs rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 touch-manipulation select-none"
              >
                {cancelMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  'Yes, Cancel'
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

