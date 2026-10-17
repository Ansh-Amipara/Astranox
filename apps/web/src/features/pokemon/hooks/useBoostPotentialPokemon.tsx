import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { OwnedPokemonDto, TrainerSaveDto } from '@astranox/types';;
import { api, getSpriteUrl } from '@/shared/api/api';
import { Modal } from '@/shared/ui/Modal';
import { ArrowRight } from 'lucide-react';

export function useBoostPotentialPokemon(save: TrainerSaveDto | null, onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();
  const [boostPkm, setBoostPkm] = useState<OwnedPokemonDto | null>(null);

  const promptBoostPotential = (pokemon: OwnedPokemonDto) => {
    setBoostPkm(pokemon);
  };

  const boostMutation = useMutation({
    mutationFn: async ({ pokemonId, itemId }: { pokemonId: string, itemId: string }) => {
      await api.post(`/trainers/party/${pokemonId}/boost-potential`, { itemId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainerSave'] });
      queryClient.invalidateQueries({ queryKey: ['allPokemon'] });
      setBoostPkm(null);
      if (onSuccessCallback) onSuccessCallback();
    }
  });

  const BoostPotentialUI = boostPkm ? (() => {
    const potentialMap: Record<string, { next: string, item: string, itemName: string }> = {
      'F': { next: 'E', item: 'e-pearl', itemName: 'E Pearl' },
      'E': { next: 'D', item: 'd-pearl', itemName: 'D Pearl' },
      'D': { next: 'C', item: 'c-pearl', itemName: 'C Pearl' },
      'C': { next: 'B', item: 'b-pearl', itemName: 'B Pearl' },
      'B': { next: 'A', item: 'a-pearl', itemName: 'A Pearl' },
      'A': { next: 'S_MINUS', item: 's-minus-pearl', itemName: 'S- Pearl' },
      'S_MINUS': { next: 'S', item: 's-pearl', itemName: 'S Pearl' },
      'S': { next: 'S_PLUS', item: 's-plus-pearl', itemName: 'S+ Pearl' },
      'S_PLUS': { next: 'SS_MINUS', item: 'ss-minus-pearl', itemName: 'SS- Pearl' },
      'SS_MINUS': { next: 'SS', item: 'ss-pearl', itemName: 'SS Pearl' },
      'SS': { next: 'SS_PLUS', item: 'ss-plus-pearl', itemName: 'SS+ Pearl' },
      'SS_PLUS': { next: 'SSS_MINUS', item: 'sss-minus-pearl', itemName: 'SSS- Pearl' },
      'SSS_MINUS': { next: 'SSS', item: 'sss-pearl', itemName: 'SSS Pearl' },
      'SSS': { next: 'SSS_PLUS', item: 'sss-plus-pearl', itemName: 'SSS+ Pearl' },
      'SSS_PLUS': { next: 'EX', item: 'ex-pearl', itemName: 'EX Pearl' },
    };
    const mapping = potentialMap[boostPkm.potential || 'F'];
    const ownedCrystal = save?.inventory?.find((i: { itemId: string; quantity: number }) => i.itemId === mapping?.item);
    const hasCrystal = ownedCrystal && ownedCrystal.quantity > 0;

    const themeMap: Record<string, { border: string, shadow: string, bgGradient: string, textGradient: string, textBase: string, arrow: string, buttonBg: string, buttonHover: string }> = {
      'F': { border: 'border-border', shadow: 'shadow-glow', bgGradient: 'from-surface to-surface-raised  ', textGradient: 'from-surface to-surface-raised  ', textBase: 'text-muted', arrow: 'text-muted', buttonBg: 'bg-surface-raised', buttonHover: 'hover:bg-surface-raised' },
      'E': { border: 'border-border', shadow: 'shadow-glow', bgGradient: 'from-surface to-surface-raised  ', textGradient: 'from-surface to-surface-raised  ', textBase: 'text-muted', arrow: 'text-muted', buttonBg: 'bg-surface-raised', buttonHover: 'hover:bg-surface-raised' },
      'D': { border: 'border-border', shadow: 'shadow-glow', bgGradient: 'from-surface to-surface-raised  ', textGradient: 'from-surface to-surface-raised  ', textBase: 'text-foreground', arrow: 'text-foreground', buttonBg: 'bg-surface-raised', buttonHover: 'hover:bg-surface-raised' },
      'C': { border: 'border-border', shadow: 'shadow-glow', bgGradient: 'from-surface to-surface-raised  ', textGradient: 'from-surface to-surface-raised  ', textBase: 'text-foreground', arrow: 'text-foreground', buttonBg: 'bg-surface-raised', buttonHover: 'hover:bg-surface-raised' },
      'B': { border: 'border-border', shadow: 'shadow-glow', bgGradient: 'from-surface to-surface-raised  ', textGradient: 'from-surface to-surface-raised  ', textBase: 'text-foreground', arrow: 'text-foreground', buttonBg: 'bg-surface-raised', buttonHover: 'hover:bg-surface-raised' },
      'A': { border: 'border-border', shadow: 'shadow-glow', bgGradient: 'from-surface to-surface-raised  ', textGradient: 'from-surface to-surface-raised  ', textBase: 'text-foreground', arrow: 'text-foreground', buttonBg: 'bg-surface-raised', buttonHover: 'hover:bg-surface-raised' },
      'S': { border: 'border-border', shadow: 'shadow-glow', bgGradient: 'from-surface to-surface-raised  ', textGradient: 'from-surface to-surface-raised  ', textBase: 'text-foreground', arrow: 'text-foreground', buttonBg: 'bg-surface-raised', buttonHover: 'hover:bg-surface-raised' },
      'SS': { border: 'border-border', shadow: 'shadow-glow', bgGradient: 'from-surface to-surface-raised  ', textGradient: 'from-surface to-surface-raised  ', textBase: 'text-foreground', arrow: 'text-foreground', buttonBg: 'bg-surface-raised', buttonHover: 'hover:bg-surface-raised' },
      'SSS': { border: 'border-border', shadow: 'shadow-glow', bgGradient: 'from-surface to-surface-raised  ', textGradient: 'from-surface to-surface-raised  ', textBase: 'text-foreground', arrow: 'text-foreground', buttonBg: 'bg-surface-raised', buttonHover: 'hover:bg-surface-raised' },
      'EX': { border: 'border-border', shadow: 'shadow-glow', bgGradient: 'from-surface to-surface-raised  ', textGradient: 'from-surface to-surface-raised  ', textBase: 'text-foreground', arrow: 'text-foreground', buttonBg: 'bg-surface-raised', buttonHover: 'hover:bg-surface-raised' },
    };
    const baseRank = mapping?.next.split('_')[0] || 'D';
    const theme = themeMap[baseRank] || themeMap['D'];

    return (
      <Modal isOpen={true} onClose={() => { if (!boostMutation.isPending) setBoostPkm(null); }} className="max-w-md" hideHeader>
        <div className={`p-4 sm:p-8 flex flex-col relative overflow-y-auto text-center max-h-[90vh]`}>
          <div className={`absolute inset-0 bg-linear-to-br ${theme.bgGradient} pointer-events-none`} />

          <h2 className="text-3xl font-black text-foreground mb-6 relative z-10 tracking-widest uppercase">
            Boost Potential
          </h2>

          <div className="flex items-center justify-center gap-8 mb-8 relative z-10">
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 bg-surface-raised rounded-full flex items-center justify-center border border-border shadow-inner">
                <img src={getSpriteUrl(boostPkm.speciesId)} className="w-20 h-20 pixelated object-contain opacity-80" />
              </div>
              <span className="mt-3 font-bold text-muted capitalize text-sm">{boostPkm.potential?.replace('_', ' ')}</span>
            </div>

            <div className={`flex flex-col items-center justify-center ${theme.arrow} animate-pulse`}>
              <ArrowRight className="w-10 h-10 mb-2" strokeWidth={2.5} />
              <span className="text-[10px] uppercase font-bold tracking-widest opacity-80">Upgrades To</span>
            </div>

            <div className="flex flex-col items-center">
              <div className={`w-28 h-28 bg-surface/80 rounded-full flex items-center justify-center border-2 ${theme.border} shadow-lg`}>
                <img src={getSpriteUrl(boostPkm.speciesId)} className="w-24 h-24 pixelated object-contain drop-shadow-glow" />
              </div>
              <span className={`mt-3 font-bold capitalize text-lg tracking-wide text-transparent bg-clip-text bg-linear-to-r ${theme.textGradient}`}>{mapping?.next.replace('_', ' ')}</span>
            </div>
          </div>

          <div className="bg-surface-raised/50 rounded-2xl p-5 mb-8 relative z-10 border border-border">
            <h4 className="text-xs uppercase font-bold text-muted tracking-wider mb-3">Required Item</h4>
            <div className="flex flex-col items-center">
              <span className="text-xl font-black text-foreground">{mapping?.itemName}</span>
              <span className={`text-sm mt-2 px-3 py-1 rounded-full font-bold bg-surface border border-border ${hasCrystal ? 'text-foreground' : 'text-foreground'}`}>
                In Bag: {ownedCrystal?.quantity || 0}
              </span>
            </div>
          </div>

          <div className="flex justify-center gap-4 relative z-10">
            <button
              onClick={() => setBoostPkm(null)}
              disabled={boostMutation.isPending}
              className="px-6 py-3 font-bold text-muted hover:bg-surface-raised rounded-xl transition-colors disabled:opacity-50"
            >
              Cancel
            </button>

            {hasCrystal && (
              <button
                onClick={() => boostMutation.mutate({ pokemonId: boostPkm.id, itemId: mapping.item })}
                disabled={boostMutation.isPending}
                className={`px-8 py-3 font-black tracking-widest text-foreground ${theme.buttonBg} ${theme.buttonHover} rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed`}
              >
                {boostMutation.isPending ? 'BOOSTING...' : 'BOOST POTENTIAL!'}
              </button>
            )}
          </div>
        </div>
      </Modal>
    );
  })() : null;

  return { promptBoostPotential, BoostPotentialUI, boostPkm };
}
