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
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="mb-6 p-4 bg-surface-raised rounded-xl border border-border/50 flex gap-3 text-foreground text-sm font-medium">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>Select Pokémon from your PC to offer. These Pokémon will be moved to Escrow and cannot be used until the offer is resolved.</p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-foreground animate-spin" /></div>
          ) : tradablePokemon.length === 0 ? (
            <div className="text-center py-12 text-subtle">You have no tradable Pokémon in your PC.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {tradablePokemon.map((p: OwnedPokemonDto) => {
                const isSelected = selectedIds.includes(p.id);
                return (
                  <div 
                    key={p.id}
                    onClick={() => toggleSelection(p.id)}
                    className={`relative p-4 rounded-2xl cursor-pointer border-2 transition-all flex flex-col items-center gap-2 ${ isSelected ? 'border-border bg-surface-raised shadow-sm' : 'border-border hover:border-border bg-surface' }`}
                  >
                    <img src={getSpriteUrl(p.species.id)} alt={p.species.name} className="w-16 h-16 pixelated" />
                    <div className="text-center">
                      <p className="font-bold text-foreground text-sm capitalize">{p.species.name}</p>
                      <p className="text-xs text-subtle">Lv. {p.level}</p>
                    </div>
                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-surface-raised text-foreground rounded-full p-1">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border flex justify-between items-center bg-surface-raised">
          <p className="text-muted font-bold">
            {selectedIds.length} Pokémon selected
          </p>
          <button
            onClick={handleSubmit}
            disabled={selectedIds.length === 0 || createOfferMutation.isPending}
            className="px-8 py-3 bg-surface-raised hover:bg-surface-raised text-foreground font-black rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-glow"
          >
            {createOfferMutation.isPending && <Loader2 className="w-5 h-5 animate-spin" />}
            Submit Offer
          </button>
        </div>
      </div>
    </Modal>
  );
}
