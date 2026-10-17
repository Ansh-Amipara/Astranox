import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notify } from '@/lib/toast';
import { parseApiError } from '@/lib/apiError';
import { SpeciesDto, OwnedPokemonDto } from '@astranox/types';
// @ts-ignore
type UserPayload = any;
import { Banknote, Gift, Pencil, X } from 'lucide-react';
import { Dropdown } from '@/shared/ui/Dropdown';
import { api } from '@/shared/api/api';
import { getMaxLevelForPotential, getXpForLevel } from '@/features/pokemon/pokemonUtils';

export function AdminDashboard() {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [modalMode, setModalMode] = useState<'currency' | 'sendPokemon' | 'editPokemon' | null>(null);
  
  const POTENTIALS = ['F', 'E', 'D', 'C', 'B', 'A', 'S_MINUS', 'S', 'S_PLUS', 'SS_MINUS', 'SS', 'SS_PLUS', 'SSS_MINUS', 'SSS', 'SSS_PLUS', 'EX'];
  const [pokemonPotential, setPokemonPotential] = useState<string>('F');
  const [editPotential, setEditPotential] = useState<string>('');
  
  const [moneyAmount, setMoneyAmount] = useState<number>(1000);
  const [currencyType, setCurrencyType] = useState<'astralCoins' | 'infinityCoins'>('astralCoins');
  const [speciesId, setSpeciesId] = useState<number>(1);
  const [pokemonLevel, setPokemonLevel] = useState<number>(5);
  const [speciesSearch, setSpeciesSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [showSpeciesDropdown, setShowSpeciesDropdown] = useState(false);
  const [useCustomIvs, setUseCustomIvs] = useState(false);
  const [customIvs, setCustomIvs] = useState({ ivHp: 31, ivAttack: 31, ivDefense: 31, ivSpAtk: 31, ivSpDef: 31, ivSpeed: 31 });

  const [selectedPokemonToEdit, setSelectedPokemonToEdit] = useState<any>(null);
  const [editXp, setEditXp] = useState<number>(0);
  const [editIvs, setEditIvs] = useState({ ivHp: 31, ivAttack: 31, ivDefense: 31, ivSpAtk: 31, ivSpDef: 31, ivSpeed: 31 });
  const [useEditIvs, setUseEditIvs] = useState(false);

  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      const { data } = await api.get('/admin/users');
      return data.data;
    }
  });

  const { data: speciesList } = useQuery({
    queryKey: ['adminSpecies'],
    queryFn: async () => {
      const { data } = await api.get('/admin/species');
      return data.data;
    }
  });

  const addMoneyMutation = useMutation({
    mutationFn: async ({ userId, amount, currencyType }: { userId: string, amount: number, currencyType: string }) => {
      await api.post(`/admin/users/${userId}/money`, { amount, currencyType });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      notify.success('Currency added successfully!');
    },
    onError: (err: unknown) => {
      notify.error(parseApiError(err).message || 'Failed to add currency');
    }
  });

  const addPokemonMutation = useMutation({
    mutationFn: async ({ userId, speciesId, level, potential, customIvs }: { userId: string, speciesId: number, level: number, potential: string, customIvs?: unknown }) => {
      await api.post(`/admin/users/${userId}/pokemon`, { speciesId, level, potential, ivs: customIvs });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      notify.success('Pokémon added successfully!');
    },
    onError: (err: unknown) => {
      notify.error(parseApiError(err).message || 'Failed to add Pokémon');
    }
  });

  const { data: userPokemon } = useQuery({
    queryKey: ['adminUserPokemon', selectedUser?.id],
    queryFn: async () => {
      if (!selectedUser) return [];
      const { data } = await api.get(`/admin/users/${selectedUser.id}/pokemon`);
      return data.data;
    },
    enabled: !!selectedUser
  });

  const editPokemonMutation = useMutation({
    mutationFn: async ({ userId, pokemonId, potential, addXp, ivs }: { userId: string, pokemonId: string, potential?: string, addXp?: number, ivs?: unknown }) => {
      await api.put(`/admin/users/${userId}/pokemon/${pokemonId}`, { potential, addXp, ivs });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUserPokemon', selectedUser?.id] });
      notify.success('Pokémon edited successfully!');
      setSelectedPokemonToEdit(null);
      setEditXp(0);
      setUseEditIvs(false);
    },
    onError: (err: unknown) => {
      notify.error(parseApiError(err).message || 'Failed to edit Pokémon');
    }
  });

  if (isLoading) {
    return <div className="min-h-screen bg-background text-foreground flex items-center justify-center font-bold text-2xl">Loading Admin Dashboard...</div>;
  }

  return (
    <div className="flex-1 bg-background text-foreground p-4 md:p-6 min-h-[calc(100vh-64px)] transition-colors duration-200 flex flex-col justify-start">
      <div className="w-full mx-auto space-y-4 md:space-y-6">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight text-foreground mb-2">User Management</h1>
        </div>

        <div className="w-full">

          {/* User List */}
          <div className="w-full bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-border bg-surface-raised">
              <h2 className="text-xl font-bold text-foreground">Registered Users</h2>
            </div>
            <div className="md:overflow-x-auto">
              <table className="w-full text-left border-collapse block md:table md:min-w-[800px]">
                <thead className="hidden md:table-header-group">
                  <tr className="bg-background border-b border-border text-muted text-sm">
                    <th className="p-4 font-bold whitespace-nowrap">Username</th>
                    <th className="p-4 font-bold whitespace-nowrap">Email</th>
                    <th className="p-4 font-bold whitespace-nowrap">Astral Coins</th>
                    <th className="p-4 font-bold whitespace-nowrap">Infinity Coins</th>
                    <th className="p-4 font-bold whitespace-nowrap">Party Size</th>
                    <th className="p-4 font-bold text-right whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="block md:table-row-group space-y-4 md:space-y-0 p-4 md:p-0 divide-y-0 md:divide-y divide-border bg-surface-raised md:bg-transparent md:">
                  {users?.map((user: UserPayload) => (
                    <tr
                      key={user.id}
                      className={`block md:table-row bg-surface border border-border md:border-none rounded-xl md:rounded-none overflow-hidden shadow-sm md:shadow-none hover:bg-surface-raised transition-colors cursor-pointer ${selectedUser?.id === user.id ? 'ring-2 ring-border md:ring-0 md:bg-surface-raised ' : ''}`}
                      onClick={() => setSelectedUser(user)}
                    >
                      <td className="block md:table-cell p-3 md:p-4 border-b border-border md:border-none">
                        <div className="flex justify-between items-center md:block">
                          <span className="md:hidden font-bold text-muted text-xs uppercase tracking-wider">Username</span>
                          <span className="font-bold text-foreground">{user.username} {user.role === 'ADMIN' && <span className="ml-2 bg-surface-raised text-foreground text-[10px] px-2 py-0.5 rounded-full font-black uppercase">Admin</span>}</span>
                        </div>
                      </td>
                      <td className="block md:table-cell p-3 md:p-4 border-b border-border md:border-none">
                        <div className="flex justify-between items-center md:block">
                          <span className="md:hidden font-bold text-muted text-xs uppercase tracking-wider">Email</span>
                          <span className="text-muted font-medium">{user.email}</span>
                        </div>
                      </td>
                      <td className="block md:table-cell p-3 md:p-4 border-b border-border md:border-none">
                        <div className="flex justify-between items-center md:block">
                          <span className="md:hidden font-bold text-muted text-xs uppercase tracking-wider">Astral Coins</span>
                          <span className="text-foreground font-bold">{user.trainerSave?.astralCoins ?? 0}</span>
                        </div>
                      </td>
                      <td className="block md:table-cell p-3 md:p-4 border-b border-border md:border-none">
                        <div className="flex justify-between items-center md:block">
                          <span className="md:hidden font-bold text-muted text-xs uppercase tracking-wider">Infinity Coins</span>
                          <span className="text-foreground font-bold">{user.trainerSave?.infinityCoins ?? 0}</span>
                        </div>
                      </td>
                      <td className="block md:table-cell p-3 md:p-4 border-b border-border md:border-none">
                        <div className="flex justify-between items-center md:block">
                          <span className="md:hidden font-bold text-muted text-xs uppercase tracking-wider">Party Size</span>
                          <span className="text-muted font-medium">{user.trainerSave?.party?.length ?? 0} / 6</span>
                        </div>
                      </td>
                      <td className="block md:table-cell p-3 md:p-4 bg-surface-raised/30 md:bg-transparent">
                        <div className="flex justify-between md:justify-end items-center gap-2">
                          <span className="md:hidden font-bold text-muted text-xs uppercase tracking-wider">Actions</span>
                          <div className="flex gap-2">
                            <button
                              aria-label="Inject Currency"
                              className="text-muted hover:text-foreground transition-colors p-2 rounded-lg hover:bg-surface-raised bg-surface md:bg-transparent border border-border md:border-none"
                              onClick={(e) => { e.stopPropagation(); setSelectedUser(user); setModalMode('currency'); }}
                              title="Inject Currency"
                            >
                              <Banknote className="w-5 h-5" />
                            </button>
                            <button
                              aria-label="Send Pokémon"
                              className="text-muted hover:text-foreground transition-colors p-2 rounded-lg hover:bg-surface-raised bg-surface md:bg-transparent border border-border md:border-none"
                              onClick={(e) => { e.stopPropagation(); setSelectedUser(user); setModalMode('sendPokemon'); }}
                              title="Send Pokémon"
                            >
                              <Gift className="w-5 h-5" />
                            </button>
                            <button
                              aria-label="Edit Pokémon"
                              className="text-muted hover:text-foreground transition-colors p-2 rounded-lg hover:bg-surface-raised bg-surface md:bg-transparent border border-border md:border-none"
                              onClick={(e) => { e.stopPropagation(); setSelectedUser(user); setModalMode('editPokemon'); }}
                              title="Edit Pokémon"
                            >
                              <Pencil className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Management Modal */}
          {selectedUser && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface/50 backdrop-blur-sm" onClick={() => { setSelectedUser(null); setModalMode(null); }}>
              <div className="bg-surface border border-border rounded-2xl p-6 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] scrollbar-none" onClick={(e) => e.stopPropagation()}>
                <button
                  aria-label="Close"
                  onClick={() => { setSelectedUser(null); setModalMode(null); }}
                  className="absolute top-4 right-4 text-muted hover:text-subtle bg-surface-raised rounded-full p-1"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="mb-6 pb-6 border-b border-border pr-8">
                  <h2 className="text-xl font-black text-foreground mb-1">
                    {modalMode === 'currency' && `Inject Currency to ${selectedUser.username}`}
                    {modalMode === 'sendPokemon' && `Send Pokémon to ${selectedUser.username}`}
                    {modalMode === 'editPokemon' && `Edit ${selectedUser.username}'s Pokémon`}
                  </h2>
                  <p className="text-muted text-sm font-medium">Fill out the details below.</p>
                </div>

                <div className="space-y-4">
                  {modalMode === "currency" && (<>
                  <div className="bg-background p-5 rounded-xl border border-border">
                    <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                      Inject Currency
                    </h3>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={moneyAmount || ''}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          setMoneyAmount(val ? Number(val) : 0);
                        }}
                        className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-foreground font-bold focus:outline-none focus:border-border transition-colors"
                      />
                      <select 
                        value={currencyType} 
                        onChange={(e) => setCurrencyType(e.target.value as any)}
                        className="bg-surface border border-border rounded-lg px-4 py-2 text-foreground font-bold"
                      >
                        <option value="astralCoins">Astral</option>
                        <option value="infinityCoins">Infinity</option>
                      </select>
                      <button
                        onClick={() => addMoneyMutation.mutate({ userId: selectedUser.id, amount: moneyAmount, currencyType })}
                        disabled={addMoneyMutation.isPending || !selectedUser.trainerSave}
                        className="bg-surface-raised hover:bg-surface-raised text-foreground font-bold px-4 py-2 rounded-lg transition-colors shadow-lg shadow-glow disabled:opacity-50"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  </>)}{modalMode === "sendPokemon" && (<>
                  <div className="bg-background p-5 rounded-xl border border-border">
                    <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                      Give Pokémon
                    </h3>
                    <div className="space-y-4">
                      <div className="relative">
                        <div className="flex justify-between items-end mb-1">
                          <label className="block text-xs font-bold text-muted uppercase tracking-wider">Pokémon Species</label>
                        </div>
                        <div className="flex gap-2">
                          <Dropdown
                            value={categoryFilter}
                            onChange={(val) => {
                              setCategoryFilter(val);
                              setShowSpeciesDropdown(true);
                            }}
                            options={[
                              { value: 'All', label: 'All Categories' },
                              { value: 'Normal', label: 'Normal' },
                              { value: 'Legendary', label: 'Legendary' },
                              { value: 'Mythical', label: 'Mythical' },
                              { value: 'Pseudo Legendary', label: 'Pseudo Legendary' },
                              { value: 'Ultra Beast', label: 'Ultra Beast' },
                              { value: 'Paradox', label: 'Paradox' }
                            ]}
                            className="w-1/3"
                          />
                          <input
                            type="text"
                            value={speciesSearch}
                            onFocus={() => setShowSpeciesDropdown(true)}
                            onChange={(e) => {
                              setSpeciesSearch(e.target.value);
                              setShowSpeciesDropdown(true);
                            }}
                            placeholder="Search Pokémon..."
                            className="w-2/3 bg-surface border border-border rounded-lg px-3 py-2 text-foreground font-bold focus:outline-none focus:border-border transition-colors"
                          />
                        </div>
                        {showSpeciesDropdown && (
                          <div className="absolute z-10 w-full mt-1 bg-surface border border-border rounded-lg max-h-48 overflow-y-auto shadow-xl">
                            {speciesList
                              ?.filter((s: SpeciesDto) => categoryFilter === 'All' || s.category === categoryFilter)
                              .filter((s: SpeciesDto) => s.name.toLowerCase().includes(speciesSearch.toLowerCase()) || s.id.toString() === speciesSearch)
                              .map((s: SpeciesDto) => (
                                <div
                                  key={s.id}
                                  className="px-3 py-2 hover:bg-surface-raised cursor-pointer text-foreground capitalize text-sm font-medium flex justify-between"
                                  onClick={() => {
                                    setSpeciesId(s.id);
                                    setSpeciesSearch(s.name);
                                    setShowSpeciesDropdown(false);
                                  }}
                                >
                                  <span>{s.name}</span>
                                  <span className="text-muted text-xs">#{s.id}</span>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-muted mb-1 uppercase tracking-wider">Potential</label>
                        <Dropdown
                          value={pokemonPotential}
                          onChange={(val) => {
                            setPokemonPotential(val);
                            setPokemonLevel(Math.min(pokemonLevel, getMaxLevelForPotential(val)));
                          }}
                          options={POTENTIALS.map(p => ({ value: p, label: p.replace('_', ' ') }))}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-muted mb-1 uppercase tracking-wider">Level (1-{getMaxLevelForPotential(pokemonPotential)})</label>
                        <input
                          type="text"
                          value={pokemonLevel || ''}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '');
                            setPokemonLevel(val ? Math.min(getMaxLevelForPotential(pokemonPotential), Number(val)) : 0);
                          }}
                          className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-foreground font-bold focus:outline-none focus:border-border transition-colors"
                        />
                      </div>

                      <div className="mt-4 border-t border-border pt-4">
                        <label className="flex items-center gap-2 cursor-pointer mb-3 text-sm font-bold text-muted">
                          <input 
                            type="checkbox" 
                            checked={useCustomIvs} 
                            onChange={(e) => setUseCustomIvs(e.target.checked)}
                            className="w-4 h-4 rounded text-foreground focus:ring-border"
                          />
                          Set Custom IVs (0-31)
                        </label>
                        
                        {useCustomIvs && (
                          <div className="grid grid-cols-3 gap-3">
                            {['ivHp', 'ivAttack', 'ivDefense', 'ivSpAtk', 'ivSpDef', 'ivSpeed'].map(stat => (
                              <div key={stat}>
                                <label className="block text-[10px] font-bold text-muted mb-1 uppercase tracking-wider">
                                  {stat.replace('iv', '')}
                                </label>
                                <input
                                  type="text"
                                  value={(customIvs as any)[stat] ?? ''}
                                  onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '');
                                    setCustomIvs(prev => ({ ...prev, [stat]: val ? Math.min(31, Number(val)) : 0 }));
                                  }}
                                  className="w-full bg-surface border border-border rounded-lg px-2 py-1 text-sm text-foreground font-bold focus:outline-none focus:border-border transition-colors text-center"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          addPokemonMutation.mutate({ 
                            userId: selectedUser.id, 
                            speciesId, 
                            level: pokemonLevel,
                            potential: pokemonPotential,
                            customIvs: useCustomIvs ? customIvs : undefined 
                          });
                        }}
                        disabled={addPokemonMutation.isPending || !selectedUser.trainerSave}
                        className="w-full bg-surface-raised hover:bg-surface-raised text-foreground font-bold px-4 py-3 rounded-lg transition-colors shadow-lg shadow-glow disabled:opacity-50 mt-2"
                      >
                        Generate & Give
                      </button>
                    </div>
                  </div>

                  </>)}{modalMode === "editPokemon" && (<>
                  <div className="bg-background p-5 rounded-xl border border-border">
                    <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                      Edit Existing Pokémon
                    </h3>
                    {!selectedPokemonToEdit ? (
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                        {userPokemon?.map((p: OwnedPokemonDto) => (
                          <div 
                            key={p.id} 
                            onClick={() => {
                              setSelectedPokemonToEdit(p);
                              setEditPotential(p.potential || '');
                              setEditIvs({ ivHp: p.ivHp, ivAttack: p.ivAttack, ivDefense: p.ivDefense, ivSpAtk: p.ivSpAtk, ivSpDef: p.ivSpDef, ivSpeed: p.ivSpeed });
                            }}
                            className="bg-surface border border-border p-3 rounded-lg flex justify-between items-center cursor-pointer hover:bg-surface-raised transition-colors"
                          >
                            <div>
                              <p className="font-bold text-foreground capitalize">{p.speciesName} <span className="text-xs text-subtle ml-1">Lv. {p.level}</span></p>
                              <p className="text-xs text-subtle">XP: {p.currentXp} | {p.isParty ? 'In Party' : `Box ${p.boxNumber ?? 0}`}</p>
                            </div>
                            <span className="text-foreground font-bold text-sm">Edit</span>
                          </div>
                        ))}
                        {userPokemon?.length === 0 && <p className="text-subtle text-sm italic">User has no Pokémon.</p>}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center bg-surface border border-border p-3 rounded-lg mb-2">
                          <p className="font-bold text-foreground capitalize">{selectedPokemonToEdit.speciesName} <span className="text-xs text-subtle ml-1">Lv. {selectedPokemonToEdit.level}</span></p>
                          <button onClick={() => setSelectedPokemonToEdit(null)} className="text-xs font-bold text-subtle hover:text-foreground">Cancel</button>
                        </div>
                        
                        <div>
                          <label className="block text-xs font-bold text-muted mb-1 uppercase tracking-wider">Potential</label>
                          <Dropdown
                            value={editPotential}
                            onChange={(val) => setEditPotential(val)}
                            options={POTENTIALS.map(p => ({ value: p, label: p.replace('_', ' ') }))}
                            className="!w-full mb-3"
                            dropdownClassName="!w-full max-h-60"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between items-end mb-1">
                            <label className="block text-xs font-bold text-muted uppercase tracking-wider">Add XP</label>
                            <button
                              onClick={() => {
                                const maxLevel = getMaxLevelForPotential(editPotential);
                                const maxTotalXp = getXpForLevel(maxLevel + 1) - 1;
                                const requiredXp = maxTotalXp - (selectedPokemonToEdit.currentXp || 0);
                                setEditXp(Math.max(0, requiredXp));
                              }}
                              className="text-[10px] font-bold text-foreground hover:text-foreground uppercase px-2 py-0.5 bg-surface-raised rounded"
                            >
                              Max
                            </button>
                          </div>
                          <input
                            type="text"
                            value={editXp || ''}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, '');
                              setEditXp(val ? Number(val) : 0);
                            }}
                            className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-foreground font-bold focus:outline-none focus:border-border transition-colors"
                          />
                        </div>

                        <div className="mt-4 border-t border-border pt-4">
                          <label className="flex items-center gap-2 cursor-pointer mb-3 text-sm font-bold text-muted">
                            <input 
                              type="checkbox" 
                              checked={useEditIvs} 
                              onChange={(e) => setUseEditIvs(e.target.checked)}
                              className="w-4 h-4 rounded text-foreground focus:ring-border"
                            />
                            Modify IVs (0-31)
                          </label>
                          
                          {useEditIvs && (
                            <div className="grid grid-cols-3 gap-3">
                              {['ivHp', 'ivAttack', 'ivDefense', 'ivSpAtk', 'ivSpDef', 'ivSpeed'].map(stat => (
                                <div key={stat}>
                                  <label className="block text-[10px] font-bold text-muted mb-1 uppercase tracking-wider">
                                    {stat.replace('iv', '')}
                                  </label>
                                  <input
                                    type="text"
                                    value={(editIvs as any)[stat] ?? ''}
                                    onChange={(e) => {
                                      const val = e.target.value.replace(/\D/g, '');
                                      setEditIvs(prev => ({ ...prev, [stat]: val ? Math.min(31, Number(val)) : 0 }));
                                    }}
                                    className="w-full bg-surface border border-border rounded-lg px-2 py-1 text-sm text-foreground font-bold focus:outline-none focus:border-border transition-colors text-center"
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => {
                            editPokemonMutation.mutate({ 
                              userId: selectedUser.id, 
                              pokemonId: selectedPokemonToEdit.id,
                              potential: editPotential !== selectedPokemonToEdit.potential ? editPotential : undefined,
                              addXp: editXp > 0 ? editXp : undefined,
                              ivs: useEditIvs ? editIvs : undefined 
                            });
                          }}
                          disabled={editPokemonMutation.isPending || (!editXp && !useEditIvs && editPotential === selectedPokemonToEdit.potential)}
                          className="w-full bg-surface-raised hover:bg-surface-raised text-foreground font-bold px-4 py-3 rounded-lg transition-colors shadow-lg shadow-glow disabled:opacity-50 mt-2"
                        >
                          Save Changes
                        </button>
                      </div>
                    )}
                  </div>
                  </>)}
                  </div>
                </div>
              </div>
          )}
        </div>
      </div>
    </div>
  );
}

