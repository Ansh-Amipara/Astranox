import React, { useState, useMemo, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { OwnedPokemonDto, TrainerSaveDto } from '@astranox/types';;
import { api, getSpriteUrl, battleApi } from '@/shared/api/api';
import { useNavigate } from 'react-router-dom';
import { Modal } from '@/shared/ui/Modal';
import { ArrowRight } from 'lucide-react';

interface TransformationOption {
  id: number;
  name: string;
  isStandard?: boolean;
  isMega?: boolean;
  isGmax?: boolean;
  baseSpeciesId?: number | null;
}

export function useEvolutionPokemon(save: TrainerSaveDto | null, onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [evolutionPkm, setEvolutionPkm] = useState<OwnedPokemonDto | null>(null);
  const [selectedTransformation, setSelectedTransformation] = useState<TransformationOption | null>(null);

  const { data: speciesInfo } = useQuery({
    queryKey: ['species', evolutionPkm?.speciesId],
    queryFn: async () => {
      const id = evolutionPkm?.speciesId;
      if (!id) return null;
      const { data } = await api.get(`/pokedex/species/${id}`);
      return data.data;
    },
    enabled: !!evolutionPkm
  });

  const derivedTransformations = useMemo(() => {
    if (!evolutionPkm) return [];
    const t: TransformationOption[] = [];
    if (evolutionPkm.species?.evolvesTo?.length) {
      evolutionPkm.species.evolvesTo.forEach((evolution) => {
        t.push({ 
          isStandard: true, 
          isMega: false, 
          isGmax: false, 
          id: evolution.id, 
          name: evolution.name || 'Evolution',
          baseSpeciesId: evolutionPkm.speciesId
        } as TransformationOption);
      });
    }
    if (speciesInfo?.megas) t.push(...speciesInfo.megas);
    if (speciesInfo?.gmaxes) t.push(...speciesInfo.gmaxes);
    return t;
  }, [evolutionPkm, speciesInfo]);

  useEffect(() => {
    if (!evolutionPkm) {
      setSelectedTransformation(null);
    } else if (derivedTransformations.length > 0) {
      if (!selectedTransformation || (selectedTransformation.baseSpeciesId !== evolutionPkm.speciesId && !selectedTransformation.isStandard)) {
        setSelectedTransformation(derivedTransformations[0]);
      }
    } else {
      setSelectedTransformation(null);
    }
  }, [evolutionPkm, derivedTransformations, selectedTransformation]);

  const promptEvolve = (pokemon: OwnedPokemonDto) => {
    setEvolutionPkm(pokemon);
    setSelectedTransformation(null);
  };

  const evolveMutation = useMutation({
    mutationFn: async (data: string | { pokemonId: string; targetSpeciesId: number }) => {
      if (typeof data === 'string') {
        await api.post(`/trainers/party/${data}/evolve`);
      } else {
        await api.post(`/trainers/party/${data.pokemonId}/evolve`, { targetSpeciesId: data.targetSpeciesId });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainerSave'] });
      queryClient.invalidateQueries({ queryKey: ['allPokemon'] });
      setEvolutionPkm(null);
      setSelectedTransformation(null);
      if (onSuccessCallback) onSuccessCallback();
    }
  });

  const devolveMutation = useMutation({
    mutationFn: async (pokemonId: string) => {
      await api.post(`/trainers/party/${pokemonId}/devolve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainerSave'] });
      queryClient.invalidateQueries({ queryKey: ['allPokemon'] });
      setEvolutionPkm(null);
      setSelectedTransformation(null);
      if (onSuccessCallback) onSuccessCallback();
    }
  });

  const engageMutation = useMutation({
    mutationFn: async (data: { speciesId: number; level: number; battleType?: string }) => {
      return await battleApi.engageCustomBattle(data);
    },
    onSuccess: () => {
      setEvolutionPkm(null);
      setSelectedTransformation(null);
      navigate(`/battle?returnUrl=${encodeURIComponent(window.location.pathname)}`);
    }
  });

  const EvolutionUI = evolutionPkm ? (() => {
    let canPerformEvolution = false;
    let isUnlocked = false;

    if (selectedTransformation?.isGmax || selectedTransformation?.isMega || (selectedTransformation?.isStandard && evolutionPkm.species.evolveByBattle)) {
      isUnlocked = ((save as any)?.unlockedForms || []).includes(selectedTransformation.id);
      canPerformEvolution = isUnlocked;
    } else if (selectedTransformation?.isStandard) {
      canPerformEvolution = !!(evolutionPkm.species.evolutionLevel && evolutionPkm.level >= evolutionPkm.species.evolutionLevel);
    }

    return (
      <Modal isOpen={true} onClose={() => { if (!evolveMutation.isPending && !devolveMutation.isPending) setEvolutionPkm(null); }} className="max-w-md" hideHeader>
        <div className="p-4 sm:p-8 flex flex-col relative overflow-y-auto text-center max-h-[90vh]">
          <div className="absolute inset-0 bg-linear-to-br from-surface to-surface-raised pointer-events-none" />

          <h2 className="text-3xl font-black text-foreground mb-6 relative z-10 tracking-widest uppercase">
            Evolution
          </h2>

          <div className="flex items-center justify-center gap-8 mb-8 relative z-10">
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 bg-surface-raised/50 rounded-full flex items-center justify-center border border-border shadow-inner">
                <img src={getSpriteUrl(evolutionPkm.speciesId)} className="w-20 h-20 pixelated object-contain opacity-80" />
              </div>
              <span className="mt-3 font-bold text-muted capitalize text-sm">{evolutionPkm.nickname || evolutionPkm.species.name}</span>
            </div>

            <div className="flex flex-col items-center justify-center text-foreground animate-pulse">
              <ArrowRight className="w-10 h-10 mb-2" strokeWidth={2.5} />
              <span className="text-[10px] uppercase font-bold tracking-widest opacity-80">Evolves To</span>
            </div>

            <div className="flex flex-col items-center">
              <div className={`w-28 h-28 ${selectedTransformation?.isGmax ? 'bg-surface-raised border-border' : 'bg-surface-raised/80 border-border'} rounded-full flex items-center justify-center border-2 shadow-lg relative mb-3`}>
                {selectedTransformation ? (
                  <img src={getSpriteUrl(selectedTransformation.id)} className={`w-24 h-24 pixelated object-contain ${selectedTransformation?.isGmax ? 'drop-shadow-glow' : ''}`} />
                ) : (
                  <div className="w-24 h-24 flex items-center justify-center text-muted font-bold">NONE</div>
                )}
              </div>

              {derivedTransformations.length > 1 && (
                <div className="flex gap-3 mb-2 flex-wrap justify-center">
                  {derivedTransformations.map((transform: TransformationOption) => (
                    <button
                      key={transform.id}
                      onClick={() => setSelectedTransformation(transform)}
                      className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all duration-200 ${selectedTransformation?.id === transform.id ? (transform.isGmax ? 'border-border bg-surface-raised shadow-md scale-110' : 'border-border bg-surface-raised shadow-md scale-110') : 'border-border bg-surface-raised opacity-50 hover:opacity-100'}`}
                      title={transform.name}
                    >
                      <img src={getSpriteUrl(transform.id)} className="w-8 h-8 pixelated object-contain drop-shadow-sm" />
                    </button>
                  ))}
                </div>
              )}

              <span className={`font-bold capitalize text-lg ${selectedTransformation?.isGmax ? 'text-transparent bg-clip-text bg-linear-to-r from-surface to-surface-raised tracking-wide' : 'text-foreground'}`}>
                {selectedTransformation ? selectedTransformation.name.replace('-', ' ') : 'Fully Evolved'}
              </span>
            </div>
          </div>

          <div className="bg-surface-raised/50 rounded-2xl p-5 mb-8 border border-border relative z-10">
            <h4 className="text-xs uppercase font-bold text-muted tracking-wider mb-3">Evolution Requirement</h4>
            {(() => {
              if (selectedTransformation?.isGmax || selectedTransformation?.isMega) {
                return (
                  <div className="flex flex-col items-center">
                    <span className="text-xl font-black text-foreground capitalize">Battle Unlock Requirement</span>
                    <span className={`text-sm mt-2 px-3 py-1 rounded-full font-bold bg-surface border border-border ${isUnlocked ? 'text-foreground' : 'text-foreground'}`}>
                      {isUnlocked ? 'Unlocked' : 'Challenge to Unlock'}
                    </span>
                  </div>
                );
              }

              if (evolutionPkm.species.evolutionLevel) {
                return (
                  <div className="flex flex-col items-center">
                    <span className="text-2xl font-black text-foreground">Level {evolutionPkm.species.evolutionLevel}</span>
                    <span className={`text-sm mt-1 font-bold ${evolutionPkm.level >= evolutionPkm.species.evolutionLevel ? 'text-foreground' : 'text-foreground'}`}>
                      (Current: {evolutionPkm.level})
                    </span>
                  </div>
                );
              }

              if (evolutionPkm.species.evolveByBattle) {
                return (
                  <div className="flex flex-col items-center">
                    <span className="text-xl font-black text-foreground capitalize">Battle Unlock Requirement</span>
                    <span className={`text-sm mt-2 px-3 py-1 rounded-full font-bold bg-surface border border-border text-foreground`}>
                      Challenge to Unlock
                    </span>
                  </div>
                );
              }

              return null;
            })()}
          </div>

          <div className="flex justify-center gap-4 relative z-10">
            <button
              onClick={() => { setEvolutionPkm(null); setSelectedTransformation(null); }}
              disabled={evolveMutation.isPending || devolveMutation.isPending}
              className="px-6 py-3 font-bold text-muted hover:bg-surface-raised rounded-xl transition-colors disabled:opacity-50"
            >
              Cancel
            </button>

            {!isUnlocked && (selectedTransformation?.isMega || selectedTransformation?.isGmax || (selectedTransformation?.isStandard && evolutionPkm.species.evolveByBattle)) ? (
              <button
                onClick={() => {
                  engageMutation.mutate({ speciesId: selectedTransformation.id, level: evolutionPkm.level, battleType: 'EVOLVE' });
                }}
                disabled={engageMutation.isPending}
                className="px-8 py-3 font-black tracking-widest text-foreground rounded-xl shadow-glow transition-all transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:transform-none bg-linear-to-r from-surface to-surface-raised hover:from-surface hover:to-surface-raised hover:shadow-glow"
              >
                {engageMutation.isPending ? 'ENGAGING...' : 'FIGHT'}
              </button>
            ) : (
              <button
                onClick={() => {
                  if (selectedTransformation) {
                    evolveMutation.mutate({ pokemonId: evolutionPkm.id, targetSpeciesId: selectedTransformation.id });
                  } else if (evolutionPkm.species.evolvesTo?.length > 0) {
                    evolveMutation.mutate({ pokemonId: evolutionPkm.id, targetSpeciesId: evolutionPkm.species.evolvesTo[0].id });
                  } else {
                    evolveMutation.mutate(evolutionPkm.id);
                  }
                }}
                disabled={!canPerformEvolution || evolveMutation.isPending}
                className={`px-8 py-3 font-black tracking-widest text-foreground rounded-xl shadow-glow transition-all transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:transform-none ${canPerformEvolution ? 'bg-linear-to-r from-surface to-surface-raised hover:from-surface hover:to-surface-raised hover:shadow-glow' : 'bg-surface-raised'}`}
              >
                {evolveMutation.isPending ? 'EVOLVING...' : canPerformEvolution ? (selectedTransformation?.isGmax ? 'GIGANTAMAX!' : 'EVOLVE!') : 'LOCKED'}
              </button>
            )}
          </div>
        </div>
      </Modal>
    );
  })() : null;

  return { promptEvolve, EvolutionUI, devolveMutation };
}
