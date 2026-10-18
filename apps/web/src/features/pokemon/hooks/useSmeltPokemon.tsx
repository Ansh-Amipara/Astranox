import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api/api';
import { notify } from '@/lib/toast';

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
    notify.warning('Smelting permanently destroys this Pokémon. You will receive Stored XP and Potential Pearls.', {
      action: {
        label: 'Smelt',
        onClick: () => smeltMutation.mutate(pokemonId)
      },
      duration: 6000
    });
  };

  const SmeltResultUI = smeltResult ? (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/50 backdrop-blur-sm" onClick={() => setSmeltResult(null)}>
      <div className="bg-background border border-border rounded-2xl p-4 w-full max-w-lg max-h-[85vh] overflow-y-auto flex flex-col items-center text-center shadow-2xl" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-black text-foreground mb-1 uppercase tracking-widest">
          Smelt Complete
        </h2>
        <p className="text-muted mb-3 font-bold uppercase tracking-wider text-xs">You Got:</p>
        
        <div className="w-full grid grid-cols-3 gap-2 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          
          {/* XP Item */}
          <div className="flex flex-col items-center justify-center bg-surface py-2 px-2 rounded-xl border border-border">
            <img src="/xp.webp" alt="Stored XP" className="w-8 h-8 object-contain mb-1 drop-shadow-sm" />
            <span className="font-semibold text-lg text-foreground mb-0.5">+{smeltResult.storedXp.toLocaleString()}</span>
            <span className="text-muted text-[10px] font-bold uppercase tracking-widest">XP</span>
          </div>

          {/* Pearls */}
          {smeltResult.pearls.map((p, i) => (
            <div key={i} className="flex flex-col items-center justify-center bg-surface py-1.5 px-2 rounded-xl border border-border">
              <img src="https://res.cloudinary.com/d0baluu2/image/upload/v1/astranox/item/potential/epic-pearl.png" className="w-8 h-8 object-contain drop-shadow-sm mb-0.5" alt="Pearl" />
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-foreground text-[11px] leading-tight text-center">
                  {p.type.toUpperCase().replace('_MINUS', '-').replace('_PLUS', '+').replace('-PEARL', '')}
                </span>
                <span className="text-muted text-[10px] font-bold">x{p.quantity}</span>
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
