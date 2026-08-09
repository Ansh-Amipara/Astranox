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
      'G': { next: 'F', item: 'f-pearl', itemName: 'F Pearl' },
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
      'SSS_PLUS': { next: 'EX_MINUS', item: 'ex-minus-pearl', itemName: 'EX- Pearl' },
      'EX_MINUS': { next: 'EX', item: 'ex-pearl', itemName: 'EX Pearl' },
      'EX': { next: 'EX_PLUS', item: 'ex-plus-pearl', itemName: 'EX+ Pearl' },
    };
    const mapping = potentialMap[boostPkm.potential || 'G'];
    const ownedCrystal = save?.inventory?.find((i: { itemId: string; quantity: number }) => i.itemId === mapping?.item);
    const hasCrystal = ownedCrystal && ownedCrystal.quantity > 0;

    const themeMap: Record<string, { border: string, shadow: string, bgGradient: string, textGradient: string, textBase: string, arrow: string, buttonBg: string, buttonHover: string }> = {
      'F': { border: 'border-slate-400 dark:border-slate-500', shadow: 'shadow-slate-400/20', bgGradient: 'from-slate-50/50 to-gray-50/50 dark:from-slate-700/20 dark:to-slate-900/20', textGradient: 'from-slate-500 to-slate-400 dark:from-slate-300 dark:to-slate-400', textBase: 'text-slate-600 dark:text-slate-400', arrow: 'text-slate-400', buttonBg: 'bg-slate-500', buttonHover: 'hover:bg-slate-400' },
      'E': { border: 'border-slate-400 dark:border-slate-500', shadow: 'shadow-slate-400/20', bgGradient: 'from-slate-50/50 to-gray-50/50 dark:from-slate-700/20 dark:to-slate-900/20', textGradient: 'from-slate-500 to-slate-400 dark:from-slate-300 dark:to-slate-400', textBase: 'text-slate-600 dark:text-slate-400', arrow: 'text-slate-400', buttonBg: 'bg-slate-500', buttonHover: 'hover:bg-slate-400' },
      'D': { border: 'border-green-400 dark:border-green-500', shadow: 'shadow-green-400/20', bgGradient: 'from-green-50/50 to-emerald-50/50 dark:from-green-900/20 dark:to-emerald-900/20', textGradient: 'from-green-500 to-emerald-500 dark:from-green-400 dark:to-emerald-400', textBase: 'text-green-600 dark:text-green-400', arrow: 'text-green-500', buttonBg: 'bg-green-500', buttonHover: 'hover:bg-green-400' },
      'C': { border: 'border-sky-400 dark:border-sky-500', shadow: 'shadow-sky-400/20', bgGradient: 'from-sky-50/50 to-blue-50/50 dark:from-sky-900/20 dark:to-blue-900/20', textGradient: 'from-sky-500 to-blue-500 dark:from-sky-400 dark:to-blue-400', textBase: 'text-sky-600 dark:text-sky-400', arrow: 'text-sky-500', buttonBg: 'bg-sky-500', buttonHover: 'hover:bg-sky-400' },
      'B': { border: 'border-indigo-400 dark:border-indigo-500', shadow: 'shadow-indigo-400/20', bgGradient: 'from-indigo-50/50 to-blue-50/50 dark:from-indigo-900/20 dark:to-blue-900/20', textGradient: 'from-indigo-500 to-blue-500 dark:from-indigo-400 dark:to-blue-400', textBase: 'text-indigo-600 dark:text-indigo-400', arrow: 'text-indigo-500', buttonBg: 'bg-indigo-500', buttonHover: 'hover:bg-indigo-400' },
      'A': { border: 'border-fuchsia-400 dark:border-fuchsia-500', shadow: 'shadow-fuchsia-400/20', bgGradient: 'from-fuchsia-50/50 to-purple-50/50 dark:from-fuchsia-900/20 dark:to-purple-900/20', textGradient: 'from-fuchsia-500 to-purple-500 dark:from-fuchsia-400 dark:to-purple-400', textBase: 'text-fuchsia-600 dark:text-fuchsia-400', arrow: 'text-fuchsia-500', buttonBg: 'bg-fuchsia-500', buttonHover: 'hover:bg-fuchsia-400' },
      'S': { border: 'border-rose-400 dark:border-rose-500', shadow: 'shadow-rose-400/20', bgGradient: 'from-rose-50/50 to-pink-50/50 dark:from-rose-900/20 dark:to-pink-900/20', textGradient: 'from-rose-500 to-pink-500 dark:from-rose-400 dark:to-pink-400', textBase: 'text-rose-600 dark:text-rose-400', arrow: 'text-rose-500', buttonBg: 'bg-rose-500', buttonHover: 'hover:bg-rose-400' },
      'SS': { border: 'border-orange-500 dark:border-orange-600', shadow: 'shadow-orange-500/20', bgGradient: 'from-orange-50/50 to-amber-50/50 dark:from-orange-900/20 dark:to-amber-900/20', textGradient: 'from-orange-500 to-amber-500 dark:from-orange-400 dark:to-amber-400', textBase: 'text-orange-600 dark:text-orange-500', arrow: 'text-orange-500', buttonBg: 'bg-orange-500', buttonHover: 'hover:bg-orange-400' },
      'SSS': { border: 'border-red-500 dark:border-red-600', shadow: 'shadow-red-500/20', bgGradient: 'from-red-50/50 to-rose-50/50 dark:from-red-900/20 dark:to-rose-900/20', textGradient: 'from-red-500 to-rose-500 dark:from-red-400 dark:to-rose-400', textBase: 'text-red-600 dark:text-red-500', arrow: 'text-red-500', buttonBg: 'bg-red-500', buttonHover: 'hover:bg-red-400' },
      'EX': { border: 'border-yellow-400 dark:border-yellow-500', shadow: 'shadow-yellow-400/20', bgGradient: 'from-yellow-50/50 to-amber-50/50 dark:from-yellow-900/20 dark:to-amber-900/20', textGradient: 'from-yellow-500 to-amber-500 dark:from-yellow-400 dark:to-amber-400', textBase: 'text-yellow-600 dark:text-yellow-400', arrow: 'text-yellow-500', buttonBg: 'bg-yellow-500', buttonHover: 'hover:bg-yellow-400' },
    };
    const baseRank = mapping?.next.split('_')[0] || 'D';
    const theme = themeMap[baseRank] || themeMap['D'];

    return (
      <Modal isOpen={true} onClose={() => { if (!boostMutation.isPending) setBoostPkm(null); }} className="max-w-md" hideHeader>
        <div className={`p-4 sm:p-8 flex flex-col relative overflow-y-auto text-center max-h-[90vh]`}>
          <div className={`absolute inset-0 bg-linear-to-br ${theme.bgGradient} pointer-events-none`} />

          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-6 relative z-10 tracking-widest uppercase">
            Boost Potential
          </h2>

          <div className="flex items-center justify-center gap-8 mb-8 relative z-10">
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-inner">
                <img src={getSpriteUrl(boostPkm.speciesId)} className="w-20 h-20 pixelated object-contain opacity-80" />
              </div>
              <span className="mt-3 font-bold text-slate-700 dark:text-slate-300 capitalize text-sm">{boostPkm.potential?.replace('_', ' ')}</span>
            </div>

            <div className={`flex flex-col items-center justify-center ${theme.arrow} animate-pulse`}>
              <ArrowRight className="w-10 h-10 mb-2" strokeWidth={2.5} />
              <span className="text-[10px] uppercase font-bold tracking-widest opacity-80">Upgrades To</span>
            </div>

            <div className="flex flex-col items-center">
              <div className={`w-28 h-28 bg-white dark:bg-slate-800/80 rounded-full flex items-center justify-center border-2 ${theme.border} shadow-lg`}>
                <img src={getSpriteUrl(boostPkm.speciesId)} className="w-24 h-24 pixelated object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]" />
              </div>
              <span className={`mt-3 font-bold capitalize text-lg tracking-wide text-transparent bg-clip-text bg-linear-to-r ${theme.textGradient}`}>{mapping?.next.replace('_', ' ')}</span>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 mb-8 relative z-10 border border-slate-200 dark:border-slate-700">
            <h4 className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider mb-3">Required Item</h4>
            <div className="flex flex-col items-center">
              <span className="text-xl font-black text-slate-800 dark:text-white">{mapping?.itemName}</span>
              <span className={`text-sm mt-2 px-3 py-1 rounded-full font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 ${hasCrystal ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                In Bag: {ownedCrystal?.quantity || 0}
              </span>
            </div>
          </div>

          <div className="flex justify-center gap-4 relative z-10">
            <button
              onClick={() => setBoostPkm(null)}
              disabled={boostMutation.isPending}
              className="px-6 py-3 font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors disabled:opacity-50"
            >
              Cancel
            </button>

            {hasCrystal && (
              <button
                onClick={() => boostMutation.mutate({ pokemonId: boostPkm.id, itemId: mapping.item })}
                disabled={boostMutation.isPending}
                className={`px-8 py-3 font-black tracking-widest text-white ${theme.buttonBg} ${theme.buttonHover} rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed`}
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
