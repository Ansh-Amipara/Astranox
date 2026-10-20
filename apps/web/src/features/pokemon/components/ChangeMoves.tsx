import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api/api';
import { getTypeSpriteUrl } from '@/lib/axios';
import { Dropdown } from '@/shared/ui/Dropdown';
import { notify } from '@/lib/toast';
import { parseApiError } from '@/lib/apiError';
import { MoveDto, OwnedPokemonDto, OwnedPokemonMoveDto } from '@astranox/types';

type PokemonWithMovesEditing = OwnedPokemonDto & {
  currentMoves: string[];
  editingSlot?: number;
};

export function ChangeMovesPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const [changeMovePkm, setChangeMovePkm] = useState<PokemonWithMovesEditing | null>(null);
  const [moveSearch, setMoveSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  // 1. Fetch data
  const { data: save } = useQuery({
    queryKey: ['trainerSave'],
    queryFn: async () => {
      const { data } = await api.get('/trainers/me');
      return data.data;
    },
  });

  const { data: allMoves } = useQuery({
    queryKey: ['allMoves'],
    queryFn: async () => {
      const { data } = await api.get('/trainers/moves');
      return data.data;
    }
  });

  const { data: pokemonData } = useQuery({
    queryKey: ['pokemon', id],
    queryFn: async () => {
      // Fallback to fetching if state.pokemon is not present
      const { data } = await api.get(`/trainers/pokemon/${id}`);
      return data.data as OwnedPokemonDto;
    },
    enabled: !!id && !location.state?.pokemon,
  });

  const pokemon = (location.state?.pokemon as OwnedPokemonDto) || pokemonData;

  const { data: speciesInfo } = useQuery({
    queryKey: ['species', pokemon?.speciesId],
    queryFn: async () => {
      if (!pokemon?.speciesId) return null;
      const { data } = await api.get(`/pokedex/species/${pokemon.speciesId}`);
      return data.data;
    },
    enabled: !!pokemon?.speciesId,
  });

  // Initialize editing state when pokemon is loaded
  useEffect(() => {
    if (pokemon && !changeMovePkm) {
      setChangeMovePkm({
        ...pokemon,
        currentMoves: [0, 1, 2, 3].map(i => pokemon.equippedMoves?.find((m: OwnedPokemonMoveDto) => m.slot === i)?.move?.name || ''),
      });
    }
  }, [pokemon, changeMovePkm]);

  // Compute allowed moves
  const allowedMoveIds = React.useMemo(() => {
    const allowed = new Set<number>();
    
    if (save?.unlockedMoves) {
      save.unlockedMoves.forEach((uid: number) => allowed.add(uid));
    }

    if (speciesInfo?.learnsets && changeMovePkm) {
      speciesInfo.learnsets.forEach((learn: any) => {
        if (learn.unlockLevel <= changeMovePkm.level) {
          allowed.add(learn.moveId);
        }
      });
    }

    return allowed;
  }, [save?.unlockedMoves, speciesInfo?.learnsets, changeMovePkm]);

  // Mutation
  const changeMovesMutation = useMutation({
    mutationFn: async ({ pokemonId, moves }: { pokemonId: string; moves: number[] }) => {
      await api.patch(`/trainers/party/${pokemonId}/moves`, { moves });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainerSave'] });
      queryClient.invalidateQueries({ queryKey: ['allPokemon'] });
      notify.success('Moves updated successfully!');
      navigate(-1); // Go back to the previous page
    },
    onError: (err: any) => {
      notify.error(parseApiError(err).message || 'Failed to change moves');
    }
  });

  if (!changeMovePkm) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-border"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-3 sm:p-4 md:p-8 w-full h-full min-h-0">
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <div>
          <button 
            onClick={() => navigate(-1)}
            className="text-subtle hover:text-muted text-sm font-bold inline-flex items-center gap-1 mb-2 min-h-[44px] min-w-[44px] -ml-2 px-2 rounded-lg touch-manipulation"
          >
            ← Back
          </button>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-foreground capitalize tracking-tight">
            Change {changeMovePkm.nickname || changeMovePkm.species?.name}'s Moves
          </h2>
        </div>
      </div>

      <div className="flex flex-col gap-6 sm:gap-8 flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-1 sm:pr-2">
        {/* Current Moves */}
        <div className="flex flex-col gap-3 sm:gap-4 shrink-0">
          <h3 className="font-bold text-muted flex items-center gap-2 text-sm sm:text-base">
            Current Moves
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {changeMovePkm.currentMoves.map((m: string, idx: number) => {
              const moveObj = allMoves?.find((move: MoveDto) => move.name === m);
              return (
                <div key={idx} className={`bg-surface-raised p-3 sm:p-4 rounded-xl border-2 transition-colors flex flex-col justify-between gap-3 ${ changeMovePkm.editingSlot === idx ? 'border-border bg-surface-raised' : 'border-border' }`}>
                  <div className="flex items-center gap-2 w-full min-w-0">
                    {moveObj && (
                      <img src={getTypeSpriteUrl(moveObj.type, true)} alt={moveObj.type} title={moveObj.type} className="h-5 w-auto object-contain drop-shadow-sm shrink-0" />
                    )}
                    <span className="capitalize font-bold text-foreground text-base sm:text-lg truncate flex-1 min-w-0">
                      {m ? m.replace('-', ' ') : '-'}
                    </span>
                    {moveObj && moveObj.damageClass && (
                      <span className="text-xs font-bold text-muted bg-surface-raised px-1.5 py-0.5 rounded shrink-0" title={moveObj.damageClass}>
                        {moveObj.damageClass === 'physical' ? 'P' : moveObj.damageClass === 'special' ? 'S' : 'St'}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      const newMoves = [...changeMovePkm.currentMoves];
                      newMoves[idx] = ''; // clear slot to indicate editing
                      setChangeMovePkm({ ...changeMovePkm, currentMoves: newMoves, editingSlot: idx });
                    }}
                    className={`text-xs font-black uppercase tracking-wider px-4 py-2 min-h-[40px] w-full rounded-xl transition-all active:scale-[0.98] touch-manipulation flex items-center justify-center ${
                      changeMovePkm.editingSlot === idx
                        ? 'bg-primary text-primary-foreground shadow-xs'
                        : 'bg-surface-raised hover:bg-surface-raised/80 text-foreground border border-border'
                    }`}
                  >
                    {changeMovePkm.editingSlot === idx ? 'Editing' : 'Swap'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Move Selection */}
        {changeMovePkm.editingSlot !== undefined && (
        <div className="flex flex-col gap-4 pb-6">
          <div className="flex flex-col gap-3 sticky top-0 bg-background/95 backdrop-blur-xs pb-4 z-10 border-b border-border">
            <h3 className="font-black text-foreground flex items-center gap-2 text-sm sm:text-base">
              {changeMovePkm.editingSlot !== undefined ? 'Select a move to learn...' : 'Select "Swap" on a slot first'}
            </h3>
            <div className="flex flex-col sm:flex-row items-stretch gap-3 w-full">
              <input
                type="text"
                placeholder="Search moves by name or type..."
                value={moveSearch}
                onChange={(e) => setMoveSearch(e.target.value)}
                disabled={changeMovePkm.editingSlot === undefined}
                className="flex-1 min-h-[44px] sm:min-h-[48px] w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-base sm:text-sm text-foreground font-bold shadow-xs focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
              />
              <div className="w-full sm:w-[25%] min-w-0">
                <Dropdown
                  value={typeFilter === 'all' ? '' : typeFilter}
                  onChange={(val) => setTypeFilter(val || 'all')}
                  options={[
                    { value: '', label: 'All Types', className: 'col-span-2 justify-center' },
                    ...(Array.from(new Set<string>(allMoves?.map((m: MoveDto) => m.type) || [])).filter((t: string) => t !== 'shadow' && t !== 'unknown').sort()).map(t => ({
                      value: t.toLowerCase(),
                      label: t,
                      icon: <img src={getTypeSpriteUrl(t, true)} alt={t} className="h-4 w-auto object-contain drop-shadow-xs" />
                    }))
                  ]}
                  placeholder="All Types"
                  activeColor="blue"
                  className="!w-full h-full min-h-[44px] sm:min-h-[48px] rounded-xl border border-border shadow-xs focus:border-border focus:ring-0"
                  dropdownClassName="!w-full max-h-80 min-w-[var(--radix-select-trigger-width)]"
                  optionsContainerClassName="grid grid-cols-2 gap-1 p-2"
                  disabled={changeMovePkm.editingSlot === undefined}
                />
              </div>
              <div className="w-full sm:w-[25%] min-w-0">
                <Dropdown
                  value={sortBy}
                  onChange={(val) => setSortBy(val as string)}
                  options={[
                    { value: 'name', label: 'Sort by Name' },
                    { value: 'power_desc', label: 'Power (High to Low)' },
                    { value: 'power_asc', label: 'Power (Low to High)' },
                  ]}
                  placeholder="Sort by Name"
                  activeColor="blue"
                  className="!w-full h-full min-h-[44px] sm:min-h-[48px] rounded-xl border border-border shadow-xs focus:border-border focus:ring-0"
                  dropdownClassName="!w-full max-h-80 min-w-[var(--radix-select-trigger-width)]"
                  disabled={changeMovePkm.editingSlot === undefined}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 pb-6">
            {changeMovePkm.editingSlot !== undefined && allMoves
              ?.filter((move: MoveDto) => allowedMoveIds.has(move.id))
              ?.filter((move: MoveDto) =>
                (typeFilter === 'all' || move.type === typeFilter) &&
                (move.name.toLowerCase().includes(moveSearch.toLowerCase()) ||
                  move.type.toLowerCase().includes(moveSearch.toLowerCase()) ||
                  move.damageClass.toLowerCase().includes(moveSearch.toLowerCase()))
              )
              .sort((a: MoveDto, b: MoveDto) => {
                if (sortBy === 'power_desc') {
                  return (b.power || 0) - (a.power || 0);
                }
                if (sortBy === 'power_asc') {
                  return (a.power || 0) - (b.power || 0);
                }
                return a.name.localeCompare(b.name);
              })
              .slice(0, 100)
              .map((move: MoveDto) => (
                <button
                  key={move.name}
                  onClick={() => {
                    const newMoves = [...changeMovePkm.currentMoves];
                    newMoves[changeMovePkm.editingSlot!] = move.name;
                    setChangeMovePkm({ ...changeMovePkm, currentMoves: newMoves, editingSlot: undefined });
                    setMoveSearch('');
                  }}
                  className="flex items-center justify-between p-3 sm:p-3.5 rounded-2xl border border-border hover:border-border hover:bg-surface-raised/70 bg-surface text-left shadow-xs hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 group min-h-[44px] touch-manipulation gap-2"
                >
                  <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
                    <img src={getTypeSpriteUrl(move.type, true)} alt={move.type} title={move.type} className="h-4.5 w-auto object-contain shrink-0" />
                    <span className="font-black capitalize text-foreground truncate text-xs sm:text-sm">
                      {move.name.replace('-', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center justify-end gap-3 sm:gap-6 text-xs font-semibold text-muted shrink-0">
                    <span className="flex items-center gap-1 font-mono">PWR: <strong className="text-foreground">{move.power || '—'}</strong></span>
                    <span className="capitalize w-14 sm:w-16 text-right font-medium">{move.damageClass}</span>
                  </div>
                </button>
              ))}

            {changeMovePkm.editingSlot !== undefined && allMoves?.filter((move: MoveDto) => allowedMoveIds.has(move.id)).length === 0 && (
              <div className="text-center p-8 text-muted font-medium bg-surface-raised rounded-2xl border border-border text-sm">
                No moves match your search or filters.
              </div>
            )}
          </div>
        </div>
        )}
      </div>

      <div className="mt-auto flex items-center justify-end gap-2.5 sm:gap-3 pt-4 pb-2 pb-safe border-t border-border bg-background sticky bottom-0 z-10">
        <button
          onClick={() => navigate(-1)}
          className="px-5 py-2.5 font-bold text-muted hover:text-foreground hover:bg-surface-raised rounded-xl transition-all min-h-[44px] flex-1 sm:flex-initial flex items-center justify-center touch-manipulation text-xs sm:text-sm select-none"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            const moveIds = changeMovePkm.currentMoves
              .filter(Boolean)
              .map((moveName: string) => allMoves?.find((m: MoveDto) => m.name === moveName)?.id)
              .filter(Boolean) as number[];
            changeMovesMutation.mutate({ pokemonId: changeMovePkm.id, moves: moveIds });
          }}
          disabled={changeMovesMutation.isPending || changeMovePkm.editingSlot !== undefined}
          className="px-7 py-2.5 font-black text-primary-foreground bg-primary rounded-xl transition-all disabled:opacity-50 active:scale-[0.98] shadow-xs hover:opacity-90 min-h-[44px] flex-1 sm:flex-initial flex items-center justify-center touch-manipulation text-xs sm:text-sm select-none"
        >
          {changeMovesMutation.isPending ? 'Saving...' : 'Save Moves'}
        </button>
      </div>
    </div>
  );
}
