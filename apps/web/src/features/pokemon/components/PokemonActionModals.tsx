import React, { forwardRef, useImperativeHandle } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api, getSpriteUrl } from '@/shared/api/api';
import { OwnedPokemonDto, MoveDto, TrainerSaveDto } from '@astranox/types';
import { Dialog as Modal } from '@/components/ui/Dialog';
import { useNavigate } from 'react-router-dom';
import { useSmeltPokemon } from '../hooks/useSmeltPokemon';
import { usePokemonDetails } from '../hooks/usePokemonDetails';
import { useEvolutionPokemon } from '../hooks/useEvolutionPokemon';
import { useGiveXpPokemon } from '../hooks/useGiveXpPokemon';
import { useBoostPotentialPokemon } from '../hooks/useBoostPotentialPokemon';
import { useEnhanceIvsPokemon } from '../hooks/useEnhanceIvsPokemon';
import { getMaxLevelForPotential } from '../pokemonUtils';

export type PokemonModalsRef = {
  openDetails: (pkm: OwnedPokemonDto) => void;
  openMoves: (pkm: OwnedPokemonDto) => void;
  openEvolve: (pkm: OwnedPokemonDto) => void;
  openBoost: (pkm: OwnedPokemonDto) => void;
  openIVs: (pkm: OwnedPokemonDto) => void;
  openGiveXp: (pkm: OwnedPokemonDto) => void;
};

export type PokemonActionModalsProps = {
  activeMenuPkm: OwnedPokemonDto | null;
  setActiveMenuPkm: (pkm: OwnedPokemonDto | null) => void;
  save: TrainerSaveDto;
  allMoves: MoveDto[];
  customActions?: (pkm: OwnedPokemonDto) => React.ReactNode;
};

export const PokemonActionModals = forwardRef<PokemonModalsRef, PokemonActionModalsProps>(({
  activeMenuPkm, setActiveMenuPkm, save, allMoves: _allMoves, customActions
}, ref) => {
  const navigate = useNavigate();

  const { data: speciesInfo } = useQuery({
    queryKey: ['species', activeMenuPkm?.speciesId],
    queryFn: async () => {
      if (!activeMenuPkm?.speciesId) return null;
      const { data } = await api.get(`/pokedex/species/${activeMenuPkm.speciesId}`);
      return data.data;
    },
    enabled: !!activeMenuPkm
  });

  const { promptSmelt, isSmelting, SmeltResultUI } = useSmeltPokemon(() => setActiveMenuPkm(null));
  const { promptDetails, PokemonDetailsUI } = usePokemonDetails();
  const { promptEvolve, EvolutionUI, devolveMutation } = useEvolutionPokemon(save, () => setActiveMenuPkm(null));
  const { promptGiveXp, GiveXpUI } = useGiveXpPokemon(save, () => setActiveMenuPkm(null));
  const { promptBoostPotential, BoostPotentialUI } = useBoostPotentialPokemon(save, () => setActiveMenuPkm(null));
  const { promptEnhanceIvs, EnhanceIvsUI } = useEnhanceIvsPokemon(save, () => setActiveMenuPkm(null));

  useImperativeHandle(ref, () => ({
    openDetails: (pkm) => {
      promptDetails(pkm);
      setActiveMenuPkm(null);
    },
    openMoves: (pkm) => {
      navigate(`/pokemon/${pkm.id}/moves`, { state: { pokemon: pkm } });
      setActiveMenuPkm(null);
    },
    openEvolve: (pkm) => {
      promptEvolve(pkm);
      setActiveMenuPkm(null);
    },
    openBoost: (pkm) => {
      promptBoostPotential(pkm);
      setActiveMenuPkm(null);
    },
    openIVs: (pkm) => {
      promptEnhanceIvs(pkm);
      setActiveMenuPkm(null);
    },
    openGiveXp: (pkm) => {
      promptGiveXp(pkm);
      setActiveMenuPkm(null);
    }
  }));

  const hasEvolutions = (activeMenuPkm?.species?.evolvesTo?.length || 0) > 0;
  const hasMegaForms = speciesInfo?.megas?.length > 0;
  const hasGmaxForms = speciesInfo?.gmaxes?.length > 0;
  const canEvolve = hasEvolutions || hasMegaForms || hasGmaxForms;

  return (
    <>
      {/* --- 1. Options Menu Modal --- */}
      {activeMenuPkm && (
        <Modal isOpen={true} onClose={() => setActiveMenuPkm(null)} className="max-w-xs" hideHeader>
          <div className="p-4 flex flex-col">
            <div className="flex items-center gap-4 mb-4 border-b border-border pb-4">
              <img
                src={getSpriteUrl(activeMenuPkm.speciesId)}
                className="w-12 h-12 bg-surface-raised rounded-lg object-contain pixelated border border-border"
              />
              <div>
                <h3 className="font-bold capitalize text-foreground">{activeMenuPkm.nickname || activeMenuPkm.species?.name}</h3>
                <p className="text-xs font-bold text-subtle">
                  Lv. {activeMenuPkm.level}
                  {activeMenuPkm.potential && activeMenuPkm.level >= getMaxLevelForPotential(activeMenuPkm.potential as string) ? (
                    <span className="font-bold text-foreground ml-1 uppercase text-[10px]">Capped</span>
                  ) : (
                    <span className="font-medium text-muted opacity-80 ml-1">• {activeMenuPkm.currentXp.toLocaleString()} XP</span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => { promptDetails(activeMenuPkm); setActiveMenuPkm(null); }}
                className="w-full text-left px-4 py-2.5 bg-surface-raised hover:bg-surface-raised/80 rounded-xl font-bold transition-all active:scale-[0.98] text-foreground border border-border/60 text-xs sm:text-sm touch-manipulation select-none"
              >
                View Details
              </button>

              {customActions && customActions(activeMenuPkm)}

              <button
                onClick={() => {
                  navigate(`/pokemon/${activeMenuPkm.id}/moves`, { state: { pokemon: activeMenuPkm } });
                  setActiveMenuPkm(null);
                }}
                className="w-full text-left px-4 py-2.5 bg-surface-raised hover:bg-surface-raised/80 rounded-xl font-bold transition-all active:scale-[0.98] text-foreground border border-border/60 text-xs sm:text-sm touch-manipulation select-none"
              >
                Change Moves
              </button>

              {(() => {
                const isMegaOrGmax = activeMenuPkm.species?.isMega || activeMenuPkm.species?.isGmax;
                
                if (isMegaOrGmax) {
                  return (
                    <button
                      onClick={() => {
                        devolveMutation.mutate(activeMenuPkm.id);
                        setActiveMenuPkm(null);
                      }}
                      disabled={devolveMutation.isPending}
                      className="w-full text-left px-4 py-2.5 rounded-xl font-bold transition-all active:scale-[0.98] bg-surface-raised hover:bg-surface-raised/80 text-foreground border border-border/60 text-xs sm:text-sm touch-manipulation select-none"
                    >
                      {devolveMutation.isPending ? 'Reverting...' : 'Revert Form (Devolve)'}
                    </button>
                  );
                }

                return (
                  <button
                    onClick={() => {
                      if (!canEvolve) return;
                      promptEvolve(activeMenuPkm);
                      setActiveMenuPkm(null);
                    }}
                    disabled={!canEvolve}
                    className={`w-full text-left px-4 py-2.5 rounded-xl font-bold transition-all active:scale-[0.98] text-xs sm:text-sm touch-manipulation select-none ${
                      canEvolve
                        ? 'bg-surface-raised hover:bg-surface-raised/80 text-foreground border border-border/60'
                        : 'bg-surface-raised/40 text-muted border border-border/30 cursor-not-allowed'
                    }`}
                  >
                    {canEvolve ? 'Evolution' : 'Fully Evolved'}
                  </button>
                );
              })()}

              {activeMenuPkm.potential !== 'EX' && (
                <button
                  onClick={() => {
                    promptBoostPotential(activeMenuPkm);
                    setActiveMenuPkm(null);
                  }}
                  className="w-full text-left px-4 py-2.5 bg-surface-raised hover:bg-surface-raised/80 rounded-xl font-bold transition-all active:scale-[0.98] text-foreground border border-border/60 text-xs sm:text-sm touch-manipulation select-none"
                >
                  Boost Potential
                </button>
              )}

              <button
                onClick={() => {
                  promptEnhanceIvs(activeMenuPkm);
                  setActiveMenuPkm(null);
                }}
                className="w-full text-left px-4 py-2.5 bg-surface-raised hover:bg-surface-raised/80 rounded-xl font-bold transition-all active:scale-[0.98] text-foreground border border-border/60 text-xs sm:text-sm touch-manipulation select-none"
              >
                Enhance IVs
              </button>

              <button
                onClick={() => promptSmelt(activeMenuPkm.id)}
                disabled={isSmelting || activeMenuPkm.isParty}
                title={activeMenuPkm.isParty ? "Cannot smelt a Pokémon that is currently in your party" : undefined}
                className="w-full text-left px-4 py-2.5 bg-surface-raised hover:bg-surface-raised/80 rounded-xl font-bold transition-all active:scale-[0.98] text-foreground border border-border/60 disabled:opacity-50 disabled:cursor-not-allowed text-center text-xs sm:text-sm touch-manipulation select-none"
              >
                {isSmelting ? 'Smelting...' : 'Smelt Pokemon'}
              </button>
            </div>

            <button
              onClick={() => setActiveMenuPkm(null)}
              className="mt-3 pt-3 border-t border-border text-xs font-bold text-muted hover:text-foreground w-full transition-colors min-h-[44px] flex items-center justify-center touch-manipulation select-none"
            >
              Cancel
            </button>
          </div>
        </Modal>
      )}

      {PokemonDetailsUI}
      {EvolutionUI}
      {BoostPotentialUI}
      {EnhanceIvsUI}
      {GiveXpUI}
      {SmeltResultUI}
    </>
  );
});
