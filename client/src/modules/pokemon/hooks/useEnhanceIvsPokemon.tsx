import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { OwnedPokemonDto, TrainerSaveDto } from '@astranox/shared';
import { api } from '@/shared/api/api';
import { Modal } from '@/shared/ui/Modal';
import { ArrowRight } from 'lucide-react';

export function useEnhanceIvsPokemon(save: TrainerSaveDto | null, onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();
  const [boostIvPkm, setBoostIvPkm] = useState<OwnedPokemonDto | null>(null);
  const [selectedIvItem, setSelectedIvItem] = useState<'bottle-cap' | 'gold-bottle-cap'>('bottle-cap');
  const [selectedIvStat, setSelectedIvStat] = useState<string>('ivHp');

  const promptEnhanceIvs = (pokemon: OwnedPokemonDto) => {
    setBoostIvPkm(pokemon);
    setSelectedIvItem('bottle-cap');
    setSelectedIvStat('ivHp');
  };

  const boostIvMutation = useMutation({
    mutationFn: async ({ pokemonId, itemId, stat }: { pokemonId: string, itemId: string, stat: string }) => {
      await api.post(`/trainers/party/${pokemonId}/boost-ivs`, { itemId, stat });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainerSave'] });
      queryClient.invalidateQueries({ queryKey: ['allPokemon'] });
      setBoostIvPkm(null);
      if (onSuccessCallback) onSuccessCallback();
    }
  });

  const EnhanceIvsUI = boostIvPkm ? (() => {
    const isGold = selectedIvItem === 'gold-bottle-cap';
    const requiredItemId = isGold ? 'gold-bottle-cap' : 'bottle-cap';
    const requiredItemName = isGold ? 'Gold Bottle Cap' : 'Bottle Cap';

    const statOptions = [
      { key: 'ivHp', label: 'HP' },
      { key: 'ivAttack', label: 'Attack' },
      { key: 'ivDefense', label: 'Defense' },
      { key: 'ivSpAtk', label: 'Sp. Atk' },
      { key: 'ivSpDef', label: 'Sp. Def' },
      { key: 'ivSpeed', label: 'Speed' }
    ];

    const ownedCrystal = save?.inventory?.find((i: { itemId: string, quantity: number }) => i.itemId === requiredItemId);
    const hasCrystal = ownedCrystal && ownedCrystal.quantity > 0;

    const isMaxed = isGold
      ? statOptions.every(opt => ((boostIvPkm as unknown as Record<string, number>)[opt.key]) >= 31)
      : ((boostIvPkm as unknown as Record<string, number>)[selectedIvStat]) >= 31;

    const statValue = (boostIvPkm as unknown as Record<string, number>)[selectedIvStat];

    return (
      <Modal isOpen={true} onClose={() => { if (!boostIvMutation.isPending) setBoostIvPkm(null); }} className="max-w-lg" hideHeader>
        <div className="p-8 flex flex-col relative overflow-hidden text-center">
          <div className="absolute inset-0 bg-linear-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-900/10 dark:to-indigo-900/10 pointer-events-none" />

          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-6 relative z-10 tracking-widest uppercase">
            Enhance IVs
          </h2>

          <div className="relative z-10 mb-6 flex justify-center gap-4 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-inner">
            <button
              onClick={() => setSelectedIvItem('bottle-cap')}
              className={`flex-1 py-2 rounded-lg font-bold transition-all ${!isGold ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200 dark:border-slate-600' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 border border-transparent'}`}
            >
              Bottle Cap
            </button>
            <button
              onClick={() => setSelectedIvItem('gold-bottle-cap')}
              className={`flex-1 py-2 rounded-lg font-bold transition-all ${isGold ? 'bg-white dark:bg-slate-700 text-yellow-600 dark:text-yellow-400 shadow-sm border border-slate-200 dark:border-slate-600' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 border border-transparent'}`}
            >
              Gold Bottle Cap
            </button>
          </div>

          {!isGold && (
            <div className="relative z-10 mb-6 flex justify-center flex-wrap gap-2">
              {statOptions.map(opt => (
                <button
                  key={opt.key}
                  onClick={() => setSelectedIvStat(opt.key)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-bold border transition-colors ${selectedIvStat === opt.key ? 'bg-blue-600 text-white border-blue-500 shadow-md' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                >
                  {opt.label}: {(boostIvPkm as unknown as Record<string, number>)[opt.key]}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center justify-center gap-8 mb-8 relative z-10">
            <div className="flex flex-col items-center">
              <span className="font-bold text-slate-700 dark:text-slate-300 text-sm">
                {isGold ? 'All IVs' : 'Current IV'}
              </span>
              <span className="font-black text-slate-900 dark:text-white text-3xl">{isGold ? 'VARIES' : statValue}</span>
            </div>

            {!isMaxed && (
              <div className="flex flex-col items-center justify-center text-blue-500 animate-pulse">
                <ArrowRight className="w-8 h-8" strokeWidth={2.5} />
              </div>
            )}

            {!isMaxed && (
              <div className="flex flex-col items-center">
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  {isGold ? 'All IVs' : 'Next IV'}
                </span>
                <span className="font-black text-blue-500 text-3xl">31</span>
              </div>
            )}
            {isMaxed && (
              <div className="flex flex-col items-center justify-center ml-8">
                <span className="text-3xl font-black text-yellow-500 uppercase tracking-widest drop-shadow-md">MAXED!</span>
              </div>
            )}
          </div>

          {!isMaxed && (
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 mb-8 relative z-10 border border-slate-200 dark:border-slate-700">
              <h4 className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider mb-3">Required Item</h4>
              <div className="flex flex-col items-center">
                <span className="text-xl font-black text-slate-800 dark:text-white">{requiredItemName}</span>
                <span className={`text-sm mt-2 px-3 py-1 rounded-full font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 ${hasCrystal ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                  In Bag: {ownedCrystal?.quantity || 0}
                </span>
              </div>
            </div>
          )}

          <div className="flex justify-center gap-4 relative z-10">
            <button
              onClick={() => setBoostIvPkm(null)}
              disabled={boostIvMutation.isPending}
              className="px-6 py-3 font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors disabled:opacity-50"
            >
              Cancel
            </button>

            {!isMaxed && hasCrystal && (
              <button
                onClick={() => boostIvMutation.mutate({ pokemonId: boostIvPkm.id, itemId: requiredItemId, stat: selectedIvStat })}
                disabled={boostIvMutation.isPending}
                className="px-8 py-3 font-black tracking-widest text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed"
              >
                {boostIvMutation.isPending ? 'ENHANCING...' : 'ENHANCE IV!'}
              </button>
            )}
          </div>
        </div>
      </Modal>
    );
  })() : null;

  return { promptEnhanceIvs, EnhanceIvsUI, boostIvPkm };
}
