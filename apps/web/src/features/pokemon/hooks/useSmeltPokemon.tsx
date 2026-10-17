import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api/api';
import { toast } from 'sonner';
import { Modal } from '@/shared/ui/Modal';

export function useSmeltPokemon(onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();
  const [smeltResult, setSmeltResult] = useState<{ storedXp: number, pearls: { type: string; quantity: number; itemId: string }[] } | null>(null);

  const smeltMutation = useMutation({
    mutationFn: async (pokemonId: string) => {
      const { data } = await api.post(`/trainers/party/${pokemonId}/smelt`);
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['trainerSave'] });
      queryClient.invalidateQueries({ queryKey: ['allPokemon'] });
      setSmeltResult(data);
      if (onSuccessCallback) onSuccessCallback();
    }
  });

  const promptSmelt = (pokemonId: string) => {
    toast(`Smelting permanently destroys this Pokémon.\nYou will receive Stored XP and Potential Pearls.\nThis action cannot be undone.`, {
      action: {
        label: 'Smelt',
        onClick: () => smeltMutation.mutate(pokemonId)
      },
      cancel: {
        label: 'Cancel',
        onClick: () => {}
      },
      duration: 5000
    });
  };

  const SmeltResultUI = smeltResult ? (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSmeltResult(null)}>
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 w-full max-w-lg max-h-[85vh] overflow-y-auto flex flex-col items-center text-center shadow-2xl" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-black text-white mb-1 uppercase tracking-widest">
          Smelt Complete
        </h2>
        <p className="text-neutral-400 mb-3 font-bold uppercase tracking-wider text-xs">You Got:</p>
        
        <div className="w-full grid grid-cols-3 gap-2 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          
          {/* XP Item */}
          <div className="flex flex-col items-center justify-center bg-neutral-900 py-2 px-2 rounded-xl border border-neutral-800">
            <img src="/xp.webp" alt="Stored XP" className="w-8 h-8 object-contain mb-1 drop-shadow-sm" />
            <span className="font-semibold text-lg text-white mb-0.5">+{smeltResult.storedXp.toLocaleString()}</span>
            <span className="text-neutral-400 text-[10px] font-bold uppercase tracking-widest">XP</span>
          </div>

          {/* Pearls */}
          {smeltResult.pearls.map((p, i) => (
            <div key={i} className="flex flex-col items-center justify-center bg-neutral-900 py-1.5 px-2 rounded-xl border border-neutral-800">
              <img src="https://res.cloudinary.com/d0baluu2/image/upload/v1/astranox/item/potential/epic-pearl.png" className="w-8 h-8 object-contain drop-shadow-sm mb-0.5" alt="Pearl" />
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white text-[11px] leading-tight text-center">
                  {p.type.toUpperCase().replace('_MINUS', '-').replace('_PLUS', '+').replace('-PEARL', '')}
                </span>
                <span className="text-neutral-400 text-[10px] font-bold">x{p.quantity}</span>
              </div>
            </div>
          ))}

        </div>
      </div>
    </div>
  ) : null;

  return {
    promptSmelt,
    isSmelting: smeltMutation.isPending,
    SmeltResultUI
  };
}
