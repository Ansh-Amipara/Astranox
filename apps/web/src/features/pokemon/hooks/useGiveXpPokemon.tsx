import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { OwnedPokemonDto, TrainerSaveDto } from '@astranox/types';;
import { api, getSpriteUrl } from '@/shared/api/api';
import { Modal } from '@/shared/ui/Modal';
import { getMaxLevelForPotential, getXpForLevel, getLevelFromXp } from '@/features/pokemon/pokemonUtils';

export function useGiveXpPokemon(save: TrainerSaveDto | null, onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();
  const [giveXpPkm, setGiveXpPkm] = useState<OwnedPokemonDto | null>(null);
  const [xpAmountInput, setXpAmountInput] = useState<string>('1000');

  const promptGiveXp = (pokemon: OwnedPokemonDto) => {
    setGiveXpPkm(pokemon);
    setXpAmountInput('1000');
  };

  const distributeXpMutation = useMutation({
    mutationFn: async ({ pokemonId, amount }: { pokemonId: string; amount: number }) => {
      const res = await api.post('/trainers/distribute-xp', { pokemonId, amount });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainerSave'] });
      queryClient.invalidateQueries({ queryKey: ['allPokemon'] });
      setGiveXpPkm(null);
      if (onSuccessCallback) onSuccessCallback();
    }
  });

  const GiveXpUI = giveXpPkm ? (() => {
    const maxLvl = getMaxLevelForPotential(giveXpPkm.potential as string);
    const maxTotalXp = getXpForLevel(maxLvl + 1) - 1;
    const neededXp = Math.max(0, maxTotalXp - (giveXpPkm.currentXp || 0));
    const storedXp = save?.storedXp || 0;
    const maxAllowed = Math.min(storedXp, neededXp);

    const addedAmount = parseInt(xpAmountInput || '0', 10);
    const newTotalXp = (giveXpPkm.currentXp || 0) + (isNaN(addedAmount) ? 0 : addedAmount);
    const previewLvl = getLevelFromXp(newTotalXp);

    const handleAddXp = (addAmount: number) => {
      const currentVal = parseInt(xpAmountInput || '0', 10);
      const nextVal = isNaN(currentVal) ? addAmount : currentVal + addAmount;
      const cappedVal = Math.min(maxAllowed, nextVal);
      setXpAmountInput(cappedVal.toString());
    };

    const handleMaxXp = () => {
      setXpAmountInput(maxAllowed.toString());
    };

    return (
      <Modal isOpen={true} onClose={() => setGiveXpPkm(null)} className="max-w-md" hideHeader>
        <div className="p-4 sm:p-6 flex flex-col max-h-[90vh] overflow-y-auto">
          <div className="flex items-center gap-4 mb-4 border-b border-border pb-4">
            <img
              src={getSpriteUrl(giveXpPkm.speciesId)}
              className="w-14 h-14 bg-surface-raised rounded-xl object-contain pixelated border border-border"
            />
            <div>
              <h3 className="font-extrabold text-lg capitalize text-foreground">{giveXpPkm.nickname || giveXpPkm.species?.name}</h3>
              <p className="text-xs font-bold text-subtle">
                Lv. {giveXpPkm.level} {addedAmount > 0 && <span className="text-foreground font-extrabold">→ Lv. {previewLvl}</span>} • {newTotalXp.toLocaleString()} XP (Cap: Lv. {maxLvl})
              </p>
            </div>
          </div>

          <div className="bg-surface p-3 rounded-xl mb-4 border border-border flex justify-between items-center text-sm">
            <span className="font-semibold text-muted">Your Stored XP:</span>
            <span className="font-black text-foreground flex items-center gap-1.5">
              <img src="/xp.webp" alt="XP" className="w-4 h-4 object-contain" />
              {save?.storedXp?.toLocaleString() || 0} XP
            </span>
          </div>

          <label className="block text-xs font-bold text-subtle uppercase tracking-wider mb-2">
            Amount of XP to Give:
          </label>
          <input
            type="text"
            value={xpAmountInput}
            onChange={(e) => {
              const val = parseInt(e.target.value.replace(/\D/g, '') || '0', 10);
              const capped = Math.min(maxAllowed, val);
              setXpAmountInput(capped > 0 ? capped.toString() : '');
            }}
            placeholder="Enter XP amount"
            className="w-full px-4 py-3 bg-surface-raised border border-border rounded-xl font-bold text-lg mb-3 text-foreground focus:outline-none focus:ring-2 focus:ring-border"
          />

          {/* Quick Amount Buttons */}
          <div className="grid grid-cols-5 gap-1.5 mb-6">
            {[1000, 5000, 25000, 100000].map((amt) => (
              <button
                key={amt}
                onClick={() => handleAddXp(amt)}
                className="py-1.5 px-2 bg-surface-raised hover:bg-surface-raised border border-border rounded-lg text-xs font-bold text-muted transition-colors"
              >
                +{amt >= 1000 ? `${amt / 1000}k` : amt}
              </button>
            ))}
            <button
              onClick={handleMaxXp}
              className="py-1.5 px-2 bg-surface-raised hover:bg-surface-raised border border-border/60 rounded-lg text-xs font-black text-foreground transition-colors uppercase tracking-wider"
            >
              Max
            </button>
          </div>

          {distributeXpMutation.isError && (
            <p className="text-sm font-bold text-foreground mb-4 text-center">
              {(distributeXpMutation.error as any)?.response?.data?.error?.message || 'Failed to distribute XP'}
            </p>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setGiveXpPkm(null)}
              className="flex-1 py-3 bg-surface-raised hover:bg-surface-raised text-foreground rounded-xl font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                const amt = parseInt(xpAmountInput, 10);
                if (amt > 0) {
                  distributeXpMutation.mutate({ pokemonId: giveXpPkm.id, amount: amt });
                }
              }}
              disabled={!xpAmountInput || parseInt(xpAmountInput, 10) <= 0 || distributeXpMutation.isPending}
              className="flex-1 py-3 bg-surface-raised hover:bg-surface-raised text-foreground rounded-xl font-bold transition-colors shadow-lg shadow-glow disabled:opacity-50"
            >
              {distributeXpMutation.isPending ? 'Giving XP...' : 'Give XP'}
            </button>
          </div>
        </div>
      </Modal>
    );
  })() : null;

  return { promptGiveXp, GiveXpUI, giveXpPkm };
}
