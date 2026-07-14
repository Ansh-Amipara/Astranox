import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, getSpriteUrl } from '../../../shared/api/api';

type Slot = { isParty: boolean; boxNumber: number | null; position: number };

export function PokemonManagement() {
  const queryClient = useQueryClient();

  const [currentBox, setCurrentBox] = useState<number>(0);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  const { data: save, isLoading: isSaveLoading } = useQuery({
    queryKey: ['trainerSave'],
    queryFn: async () => {
      const { data } = await api.get('/trainers/me');
      return data.data;
    },
  });

  const { data: boxPokemon, isLoading: isBoxLoading } = useQuery({
    queryKey: ['pcBox', currentBox],
    queryFn: async () => {
      const { data } = await api.get(`/trainers/box/${currentBox}`);
      return data.data; // array of OwnedPokemon
    },
  });

  const swapMutation = useMutation({
    mutationFn: async (payload: { from: Slot; to: Slot }) => {
      await api.post('/trainers/swap', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainerSave'] });
      queryClient.invalidateQueries({ queryKey: ['pcBox', currentBox] });
      setSelectedSlot(null);
    },
  });

  const releaseMutation = useMutation({
    mutationFn: async (pokemonId: string) => {
      await api.delete(`/trainers/${pokemonId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainerSave'] });
      queryClient.invalidateQueries({ queryKey: ['pcBox', currentBox] });
      setSelectedSlot(null);
    }
  });

  const toggleTradeMutation = useMutation({
    mutationFn: async (pokemonId: string) => {
      await api.post(`/trades/pokemon/${pokemonId}/toggle-trade`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainerSave'] });
      queryClient.invalidateQueries({ queryKey: ['pcBox', currentBox] });
    }
  });

  const handleSlotClick = (slot: Slot) => {
    if (swapMutation.isPending) return;

    if (!selectedSlot) {
      setSelectedSlot(slot);
    } else {
      if (
        selectedSlot.isParty === slot.isParty &&
        selectedSlot.boxNumber === slot.boxNumber &&
        selectedSlot.position === slot.position
      ) {
        setSelectedSlot(null); // deselect
      } else {
        swapMutation.mutate({ from: selectedSlot, to: slot });
      }
    }
  };

  if (isSaveLoading) {
    return <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-900 dark:text-white transition-colors duration-200">Loading Trainer Data...</div>;
  }

  // Create lookup maps for easy rendering
  const partyMap = new Map(save?.party?.map((p: any) => [p.position, p]) || []);
  const boxMap = new Map((boxPokemon || []).map((p: any) => [p.position, p]));

  const renderSlot = (isParty: boolean, position: number, pkm: any) => {
    const boxNum = isParty ? null : currentBox;
    const isSelected =
      selectedSlot?.isParty === isParty &&
      selectedSlot?.boxNumber === boxNum &&
      selectedSlot?.position === position;

    return (
      <div
        key={`${isParty ? 'party' : 'box'}-${position}`}
        onClick={() => handleSlotClick({ isParty, boxNumber: boxNum, position })}
        className={`relative flex items-center justify-center cursor-pointer transition-all duration-200 border rounded-xl overflow-hidden
          ${isParty ? 'h-24 p-4' : 'h-16 w-16 p-2 mx-auto'} 
          ${
            isSelected
              ? 'border-blue-400 bg-blue-100 dark:bg-blue-900/40 shadow-md dark:shadow-[0_0_15px_rgba(96,165,250,0.5)] scale-105 z-10'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
          }
        `}
      >
        {pkm ? (
          <div className={`flex items-center w-full ${isParty ? 'gap-4' : 'justify-center'}`}>
            <img
              src={getSpriteUrl(pkm.speciesId)}
              alt={pkm.species.name}
              className={`${isParty ? 'h-16 w-16' : 'h-12 w-12'} object-contain`}
              style={{ imageRendering: 'pixelated' }}
            />
            {isParty && (
              <div className="flex-1 min-w-0">
                <div className="mt-2 text-center w-full">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 capitalize truncate">
                    {pkm.nickname || pkm.species.name}
                  </h3>
                  <div className="flex items-center justify-center gap-1 mt-1 flex-wrap">
                    <span className="text-xs font-bold text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded">Lv. {pkm.level}</span>
                  </div>
                </div>
              </div>
            )}
            
            {pkm.isForTrade && (
              <div className="absolute top-1 right-1">
                <span title="For Trade" className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-slate-400 dark:text-slate-700 font-medium text-xs uppercase tracking-wider">Empty</div>
        )}
        
        {/* Selection overlay border for pending swaps */}
        {selectedSlot && !isSelected && (
          <div className="absolute inset-0 border border-transparent hover:border-blue-500/50 rounded-xl transition-colors pointer-events-none"></div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex-1 transition-colors duration-200">
      <main className="p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Team Management</h1>
          </div>
          {swapMutation.isPending && (
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20 px-4 py-2 rounded-full border border-blue-200 dark:border-blue-900/50">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
              </span>
              Swapping...
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Party Section */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Active Party</h2>
              <span className="text-xs font-bold text-slate-500">{save?.party?.length || 0} / 6</span>
            </div>
            <div className="flex flex-col gap-3">
              {Array.from({ length: 6 }).map((_, i) => renderSlot(true, i, partyMap.get(i)))}
            </div>
          </div>

          {/* PC Box Section */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">PC Storage System</h2>
              
              <div className="flex items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-1">
                <button 
                  disabled={currentBox === 0}
                  onClick={() => setCurrentBox(c => c - 1)}
                  className="px-3 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 transition-colors"
                >
                  ◀
                </button>
                <span className="font-bold text-sm min-w-[80px] text-center">BOX {currentBox + 1}</span>
                <button 
                  disabled={currentBox === 31}
                  onClick={() => setCurrentBox(c => c + 1)}
                  className="px-3 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 transition-colors"
                >
                  ▶
                </button>
              </div>
            </div>

            <div className="bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 min-h-[400px]">
              {isBoxLoading ? (
                <div className="h-full flex items-center justify-center text-slate-500">Accessing Box Data...</div>
              ) : (
                <div className="grid grid-cols-6 gap-3">
                  {Array.from({ length: 30 }).map((_, i) => renderSlot(false, i, boxMap.get(i)))}
                </div>
              )}
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="flex-1 rounded-xl border border-blue-200 dark:border-blue-900/30 bg-blue-50 dark:bg-blue-900/10 p-4 text-sm text-blue-700 dark:text-blue-400/80">
                <span className="font-bold">Tip:</span> Click any Pokémon in your Party or Box to select it, then click an empty slot or another Pokémon to swap their positions.
              </div>
              
              {(() => {
                if (!selectedSlot) return null;
                const pkm = (selectedSlot.isParty ? partyMap.get(selectedSlot.position) : boxMap.get(selectedSlot.position)) as any;
                if (!pkm) return null;
                return (
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleTradeMutation.mutate(pkm.id)}
                      disabled={toggleTradeMutation.isPending}
                      className={`px-6 py-4 rounded-xl font-bold transition-colors shadow-sm ${
                        pkm.isForTrade
                          ? 'bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/40 dark:text-purple-400 dark:hover:bg-purple-800/60'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                      }`}
                    >
                      {toggleTradeMutation.isPending ? 'Toggling...' : (pkm.isForTrade ? '🔒 Remove from Trade' : '🔄 Mark for Trade')}
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to release ${pkm.nickname || pkm.species?.name}? This cannot be undone.`)) {
                          releaseMutation.mutate(pkm.id);
                        }
                      }}
                      disabled={releaseMutation.isPending || (selectedSlot.isParty && save?.party?.length <= 1)}
                      className="px-6 py-4 rounded-xl font-bold bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/40 dark:text-red-400 dark:hover:bg-red-800/60 transition-colors disabled:opacity-50"
                    >
                      {releaseMutation.isPending ? 'Releasing...' : '🗑️ Release Selected'}
                    </button>
                  </div>
                );
              })()}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
