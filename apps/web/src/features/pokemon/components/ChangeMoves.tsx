import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api/api';
import { getTypeSpriteUrl } from '@/lib/axios';
import { Dropdown } from '@/shared/ui/Dropdown';
import { toast } from 'sonner';
import { MoveDto, OwnedPokemonDto, OwnedPokemonMoveDto } from '@astranox/types';;

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
  }, [save?.unlockedMoves, speciesInfo?.learnsets, changeMovePkm?.level]);

  // Mutation
  const changeMovesMutation = useMutation({
    mutationFn: async ({ pokemonId, moves }: { pokemonId: string; moves: number[] }) => {
      await api.patch(`/trainers/party/${pokemonId}/moves`, { moves });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainerSave'] });
      queryClient.invalidateQueries({ queryKey: ['allPokemon'] });
      toast.success('Moves updated successfully!');
      navigate(-1); // Go back to the previous page
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Failed to change moves');
    }
  });

  if (!changeMovePkm) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-4 md:p-8 w-full h-full min-h-0">
      <div className="flex justify-between items-center mb-6">
        <div>
          <button 
            onClick={() => navigate(-1)}
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-sm font-bold flex items-center gap-1 mb-2"
          >
            ← Back
          </button>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white capitalize tracking-tight">
            Change {changeMovePkm.nickname || changeMovePkm.species?.name}'s Moves
          </h2>
        </div>
      </div>

      <div className="flex flex-col gap-8 flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-2">
        {/* Current Moves */}
        <div className="flex flex-col gap-4 shrink-0">
          <h3 className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            Current Moves
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {changeMovePkm.currentMoves.map((m: string, idx: number) => {
              const moveObj = allMoves?.find((move: MoveDto) => move.name === m);
              return (
                <div key={idx} className={`bg-slate-100 dark:bg-slate-800 p-4 rounded-xl border-2 transition-colors flex flex-col justify-between gap-3 ${
                  changeMovePkm.editingSlot === idx 
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20' 
                    : 'border-slate-200 dark:border-slate-700'
                }`}>
                  <div className="flex items-center gap-2 w-full">
                    {moveObj && (
                      <img src={getTypeSpriteUrl(moveObj.type, true)} alt={moveObj.type} title={moveObj.type} className="h-5 w-auto object-contain drop-shadow-sm shrink-0" />
                    )}
                    <span className="capitalize font-bold text-slate-900 dark:text-slate-100 text-lg truncate flex-1">
                      {m ? m.replace('-', ' ') : '-'}
                    </span>
                    {moveObj && moveObj.damageClass && (
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded shrink-0" title={moveObj.damageClass}>
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
                    className={`text-sm font-bold px-4 py-2 w-full rounded-lg transition-colors ${
                      changeMovePkm.editingSlot === idx
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-300'
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
          <div className="flex flex-col gap-3 sticky top-0 bg-slate-50 dark:bg-[#0f172a] pb-4 z-10 border-b border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              {changeMovePkm.editingSlot !== undefined ? 'Select a move...' : 'Select "Swap" on a slot first'}
            </h3>
            <div className="flex flex-col sm:flex-row items-stretch gap-3 w-full">
              <input
                type="text"
                placeholder="Search moves by name or type..."
                value={moveSearch}
                onChange={(e) => setMoveSearch(e.target.value)}
                disabled={changeMovePkm.editingSlot === undefined}
                className="flex-1 min-h-[52px] w-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                      icon: <img src={getTypeSpriteUrl(t, true)} alt={t} className="h-5 w-auto object-contain drop-shadow-sm" />
                    }))
                  ]}
                  placeholder="All Types"
                  activeColor="blue"
                  className="!w-full h-full min-h-[52px] rounded-xl border-2 border-slate-200 dark:border-slate-700 shadow-none focus:border-blue-500 focus:ring-0"
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
                  className="!w-full h-full min-h-[52px] rounded-xl border-2 border-slate-200 dark:border-slate-700 shadow-none focus:border-blue-500 focus:ring-0"
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
                  className="flex items-center justify-between p-4 rounded-xl border-2 border-slate-200 hover:border-blue-500 dark:border-slate-700 dark:hover:border-blue-400 bg-white dark:bg-slate-800/50 text-left transition-colors group"
                >
                  <div className="flex items-center gap-3 w-1/2">
                    <img src={getTypeSpriteUrl(move.type, true)} alt={move.type} title={move.type} className="h-5 w-auto object-contain drop-shadow-sm shrink-0" />
                    <span className="font-bold capitalize text-slate-900 dark:text-white truncate text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {move.name.replace('-', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center justify-end gap-6 text-sm font-semibold text-slate-500 dark:text-slate-400 w-1/2">
                    <span className="flex items-center gap-1">PWR: <span className="text-slate-700 dark:text-slate-300 w-6 text-right">{move.power || '-'}</span></span>
                    <span className="capitalize w-16 text-right">{move.damageClass}</span>
                  </div>
                </button>
              ))}
              
            {changeMovePkm.editingSlot !== undefined && allMoves?.filter((move: MoveDto) => allowedMoveIds.has(move.id)).length === 0 && (
              <div className="text-center p-8 text-slate-500 dark:text-slate-400 font-medium bg-slate-100 dark:bg-slate-800/50 rounded-xl">
                No moves match your search or filters.
              </div>
            )}
          </div>
        </div>
        )}
      </div>

      <div className="mt-auto flex justify-end gap-3 pt-6 pb-2 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0f172a] sticky bottom-0 z-10">
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-3 font-bold text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800 rounded-xl transition-colors"
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
          className="px-8 py-3 font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors disabled:opacity-50 shadow-lg shadow-blue-500/20"
        >
          {changeMovesMutation.isPending ? 'Saving...' : 'Save Moves'}
        </button>
      </div>
    </div>
  );
}
