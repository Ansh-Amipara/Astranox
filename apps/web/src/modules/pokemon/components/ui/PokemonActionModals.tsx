import React, { forwardRef, useImperativeHandle } from 'react';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { api, getSpriteUrl } from '@/shared/api/api';
import { OwnedPokemonDto, MoveDto, TrainerSaveDto } from '@astranox/types';;
import { Modal } from '@/shared/ui/Modal';
import { useNavigate } from 'react-router-dom';
import { useSmeltPokemon } from '@/modules/pokemon/hooks/useSmeltPokemon';
import { usePokemonDetails } from '@/modules/pokemon/hooks/usePokemonDetails';
import { useEvolutionPokemon } from '@/modules/pokemon/hooks/useEvolutionPokemon';
import { useGiveXpPokemon } from '@/modules/pokemon/hooks/useGiveXpPokemon';
import { useBoostPotentialPokemon } from '@/modules/pokemon/hooks/useBoostPotentialPokemon';
import { useEnhanceIvsPokemon } from '@/modules/pokemon/hooks/useEnhanceIvsPokemon';
import { getMaxLevelForPotential } from '@/shared/utils/pokemonUtils';

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
  activeMenuPkm, setActiveMenuPkm, save, allMoves, customActions
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
            <div className="flex items-center gap-4 mb-4 border-b border-slate-200 dark:border-slate-800 pb-4">
              <img
                src={getSpriteUrl(activeMenuPkm.speciesId)}
                className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-lg object-contain pixelated border border-slate-200 dark:border-slate-700"
              />
              <div>
                <h3 className="font-bold capitalize text-slate-900 dark:text-white">{activeMenuPkm.nickname || activeMenuPkm.species?.name}</h3>
                <p className="text-xs font-bold text-slate-500">
                  Lv. {activeMenuPkm.level}
                  {activeMenuPkm.potential && activeMenuPkm.level >= getMaxLevelForPotential(activeMenuPkm.potential as string) ? (
                    <span className="font-bold text-red-500 ml-1 uppercase text-[10px]">Capped</span>
                  ) : (
                    <span className="font-medium text-slate-400 opacity-80 ml-1">• {activeMenuPkm.currentXp.toLocaleString()} XP</span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => { promptDetails(activeMenuPkm); setActiveMenuPkm(null); }}
                className="w-full text-left px-4 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl font-bold transition-colors text-slate-900 dark:text-white"
              >
                View Details
              </button>

              {customActions && customActions(activeMenuPkm)}

              <button
                onClick={() => {
                  navigate(`/pokemon/${activeMenuPkm.id}/moves`, { state: { pokemon: activeMenuPkm } });
                  setActiveMenuPkm(null);
                }}
                className="w-full text-left px-4 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl font-bold transition-colors text-slate-900 dark:text-white"
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
                      className="w-full text-left px-4 py-3 rounded-xl font-bold transition-colors bg-fuchsia-100 hover:bg-fuchsia-200 dark:bg-fuchsia-900/50 dark:hover:bg-fuchsia-800 text-fuchsia-900 dark:text-fuchsia-100"
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
                    className={`w-full text-left px-4 py-3 rounded-xl font-bold transition-colors ${canEvolve ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white' : 'bg-slate-50 dark:bg-slate-800/50 text-slate-400 cursor-not-allowed'}`}
                  >
                    {canEvolve ? 'Evolution' : 'Fully Evolved'}
                  </button>
                );
              })()}

              {activeMenuPkm.potential !== 'EX_PLUS' && (
                <button
                  onClick={() => {
                    promptBoostPotential(activeMenuPkm);
                    setActiveMenuPkm(null);
                  }}
                  className="w-full text-left px-4 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl font-bold transition-colors text-slate-900 dark:text-white"
                >
                  Boost Potential
                </button>
              )}

              <button
                onClick={() => {
                  promptEnhanceIvs(activeMenuPkm);
                  setActiveMenuPkm(null);
                }}
                className="w-full text-left px-4 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl font-bold transition-colors text-slate-900 dark:text-white"
              >
                Enhance IVs
              </button>

              <button
                onClick={() => promptSmelt(activeMenuPkm.id)}
                disabled={isSmelting || activeMenuPkm.isParty}
                title={activeMenuPkm.isParty ? "Cannot smelt a Pokémon that is currently in your party" : undefined}
                className="w-full text-left px-4 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl font-bold transition-colors text-slate-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed text-center"
              >
                {isSmelting ? 'Smelting...' : 'Smelt Pokemon'}
              </button>
            </div>

            <button
              onClick={() => setActiveMenuPkm(null)}
              className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 w-full"
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
