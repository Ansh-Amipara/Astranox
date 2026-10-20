import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api, getSpriteUrl } from '@/shared/api/api';
import { useCreateOffer } from '../hooks/queries';
import { Loader2, AlertCircle, Check } from 'lucide-react';
import { OwnedPokemonDto } from '@astranox/types';;
import { Dialog as Modal } from '@/components/ui/Dialog';

interface TradeOfferModalProps {
  listingId: string;
  onClose: () => void;
}

export function TradeOfferModal({ listingId, onClose }: TradeOfferModalProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { data: myPokemonResponse, isLoading } = useQuery({
    queryKey: ['pokemon'],
    queryFn: () => api.get('/trainers/pokemon').then(res => res.data)
  });
  
  const createOfferMutation = useCreateOffer();

  const pokemonList = myPokemonResponse?.data || [];
  
  // Filter out pokemon that can't be traded (in party, already in escrow)
  const tradablePokemon = pokemonList.filter((p: OwnedPokemonDto) => !p.isParty && !p.isEscrowed);

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    if (selectedIds.length === 0) return;
    createOfferMutation.mutate({ listingId, pokemonIds: selectedIds }, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Build Your Offer" className="max-w-4xl">
      <div className="flex flex-col h-full overflow-hidden">
        {/* Content */}
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-4">
          <div className="p-3.5 bg-surface-raised rounded-2xl border border-border flex items-start gap-3 text-muted text-xs font-medium">
            <AlertCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p>Select Pokémon from your PC to offer. These Pokémon will be moved to Escrow and cannot be used until the offer is resolved.</p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-foreground animate-spin" /></div>
          ) : tradablePokemon.length === 0 ? (
            <div className="text-center py-12 text-muted bg-surface-raised rounded-2xl border border-border text-sm">
              You have no tradable Pokémon in your PC.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-1">
              {tradablePokemon.map((p: OwnedPokemonDto) => {
                const isSelected = selectedIds.includes(p.id);
                return (
                  <div
                    key={p.id}
                    onClick={() => toggleSelection(p.id)}
                    className={`group relative p-3 rounded-2xl cursor-pointer border transition-all duration-200 flex flex-col items-center gap-2 select-none touch-manipulation ${
                      isSelected
                        ? 'border-primary bg-surface-raised shadow-xs scale-[1.02]'
                        : 'border-border hover:border-border hover:bg-surface-raised/60 hover:-translate-y-0.5 bg-surface'
                    }`}
                  >
                    <div className="w-16 h-16 rounded-xl bg-surface-raised flex items-center justify-center border border-border/50 group-hover:scale-105 transition-transform">
                      <img src={getSpriteUrl(p.species.id)} alt={p.species.name} className="w-12 h-12 pixelated object-contain" />
                    </div>
                    <div className="text-center w-full">
                      <p className="font-black text-foreground text-xs capitalize truncate">{p.species.name}</p>
                      <p className="text-[10px] font-bold text-muted mt-0.5">Lv. {p.level}</p>
                    </div>
                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1 shadow-xs">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 pb-safe border-t border-border flex flex-col sm:flex-row justify-between items-center gap-3 bg-surface">
          <p className="text-muted font-bold text-xs sm:text-sm">
            <strong className="text-foreground">{selectedIds.length}</strong> Pokémon selected
          </p>
          <button
            onClick={handleSubmit}
            disabled={selectedIds.length === 0 || createOfferMutation.isPending}
            className="w-full sm:w-auto px-7 py-2.5 min-h-[44px] bg-primary text-primary-foreground font-black rounded-xl transition-all shadow-xs hover:opacity-90 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 text-xs sm:text-sm touch-manipulation select-none"
          >
            {createOfferMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Submit Offer
          </button>
        </div>
      </div>
    </Modal>
  );
}
