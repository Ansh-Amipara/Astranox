import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api, getSpriteUrl } from '../../../shared/api/api';
import { useCreateOffer } from '../api/queries';
import { Loader2, X, AlertCircle, Check } from 'lucide-react';

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
  const tradablePokemon = pokemonList.filter((p: any) => !p.isParty && !p.isEscrowed);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Build Your Offer</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900/50 flex gap-3 text-blue-700 dark:text-blue-400 text-sm font-medium">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>Select Pokémon from your PC to offer. These Pokémon will be moved to Escrow and cannot be used until the offer is resolved.</p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>
          ) : tradablePokemon.length === 0 ? (
            <div className="text-center py-12 text-slate-500">You have no tradable Pokémon in your PC.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {tradablePokemon.map((p: any) => {
                const isSelected = selectedIds.includes(p.id);
                return (
                  <div 
                    key={p.id}
                    onClick={() => toggleSelection(p.id)}
                    className={`relative p-4 rounded-2xl cursor-pointer border-2 transition-all flex flex-col items-center gap-2 ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-sm' 
                        : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800'
                    }`}
                  >
                    <img src={getSpriteUrl(p.species.id)} alt={p.species.name} className="w-16 h-16 pixelated" />
                    <div className="text-center">
                      <p className="font-bold text-slate-800 dark:text-white text-sm capitalize">{p.species.name}</p>
                      <p className="text-xs text-slate-500">Lv. {p.level}</p>
                    </div>
                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
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
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 rounded-b-3xl">
          <p className="text-slate-600 dark:text-slate-400 font-bold">
            {selectedIds.length} Pokémon selected
          </p>
          <button
            onClick={handleSubmit}
            disabled={selectedIds.length === 0 || createOfferMutation.isPending}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-blue-500/30"
          >
            {createOfferMutation.isPending && <Loader2 className="w-5 h-5 animate-spin" />}
            Submit Offer
          </button>
        </div>
      </div>
    </div>
  );
}
