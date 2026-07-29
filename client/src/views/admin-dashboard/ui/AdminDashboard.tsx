import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Banknote, Gift, Pencil, X } from 'lucide-react';
import { Dropdown } from '@/components/ui/Dropdown';
import { api } from '../../../shared/api/api';

export function AdminDashboard() {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [modalMode, setModalMode] = useState<'currency' | 'sendPokemon' | 'editPokemon' | null>(null);
  
  const POTENTIALS = ['BLACK_IRON', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'ADAMANTITE', 'DIAMOND', 'CRYSTAL', 'EPIC', 'HEROIC', 'SOVEREIGN', 'LEGENDARY', 'DIVINE', 'CELESTIAL', 'PRIMORDIAL', 'MYTHICAL', 'INFINITY', 'ETERNAL'];
  const [pokemonPotential, setPokemonPotential] = useState<string>('BLACK_IRON');
  const [editPotential, setEditPotential] = useState<string>('');
  
  function getMaxLevelForPotential(potential: string) {
    switch (potential) {
      case 'BLACK_IRON': return 30;
      case 'BRONZE': return 60;
      case 'SILVER': return 90;
      case 'GOLD': return 120;
      case 'PLATINUM': return 150;
      case 'ADAMANTITE': return 200;
      case 'DIAMOND': return 300;
      case 'CRYSTAL': return 400;
      case 'EPIC': return 500;
      case 'HEROIC': return 700;
      case 'SOVEREIGN': return 900;
      case 'LEGENDARY': return 1100;
      case 'DIVINE': return 1400;
      case 'CELESTIAL': return 1700;
      case 'PRIMORDIAL': return 2000;
      case 'MYTHICAL': return 3000;
      case 'INFINITY': return 4000;
      case 'ETERNAL': return 5000;
      default: return 5000;
    }
  }
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
      toast.success('Currency added successfully!');
    },
    onError: (err: any) => {
      toast.error(`Error: ${err.response?.data?.error?.message || err.message}`);
    }
  });

  const addPokemonMutation = useMutation({
    mutationFn: async ({ userId, speciesId, level, potential, customIvs }: { userId: string, speciesId: number, level: number, potential: string, customIvs?: any }) => {
      await api.post(`/admin/users/${userId}/pokemon`, { speciesId, level, potential, ivs: customIvs });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast.success('Pokémon added successfully!');
    },
    onError: (err: any) => {
      toast.error(`Error: ${err.response?.data?.error?.message || err.message}`);
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
    mutationFn: async ({ userId, pokemonId, potential, addXp, ivs }: { userId: string, pokemonId: string, potential?: string, addXp?: number, ivs?: any }) => {
      await api.put(`/admin/users/${userId}/pokemon/${pokemonId}`, { potential, addXp, ivs });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUserPokemon', selectedUser?.id] });
      toast.success('Pokémon edited successfully!');
      setSelectedPokemonToEdit(null);
      setEditXp(0);
      setUseEditIvs(false);
    },
    onError: (err: any) => {
      toast.error(`Error: ${err.response?.data?.error?.message || err.message}`);
    }
  });

  if (isLoading) {
    return <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex items-center justify-center font-bold text-2xl">Loading Admin Dashboard...</div>;
  }

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 md:p-6 min-h-[calc(100vh-64px)] transition-colors duration-200 flex flex-col justify-start">
      <div className="w-full mx-auto space-y-4 md:space-y-6">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-2">User Management</h1>
        </div>

        <div className="w-full">

          {/* User List */}
          <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-2xl">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Registered Users</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-sm">
                    <th className="p-4 font-bold">Username</th>
                    <th className="p-4 font-bold">Email</th>
                    <th className="p-4 font-bold">Astral Coins</th>
                    <th className="p-4 font-bold">Infinity Coins</th>
                    <th className="p-4 font-bold">Party Size</th>
                    <th className="p-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {users?.map((user: any) => (
                    <tr
                      key={user.id}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer ${selectedUser?.id === user.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                      onClick={() => setSelectedUser(user)}
                    >
                      <td className="p-4 font-bold text-slate-900 dark:text-white">{user.username} {user.role === 'ADMIN' && <span className="ml-2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black uppercase">Admin</span>}</td>
                      <td className="p-4 text-slate-500 dark:text-slate-400 font-medium">{user.email}</td>
                      <td className="p-4 text-amber-500 font-bold">{user.trainerSave?.astralCoins ?? 0}</td>
                      <td className="p-4 text-purple-500 font-bold">{user.trainerSave?.infinityCoins ?? 0}</td>
                      <td className="p-4 text-slate-600 dark:text-slate-300 font-medium">{user.trainerSave?.party?.length ?? 0} / 6</td>
                      <td className="p-4 text-right flex justify-end gap-2">
                        <button
                          className="text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors p-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                          onClick={(e) => { e.stopPropagation(); setSelectedUser(user); setModalMode('currency'); }}
                          title="Inject Currency"
                        >
                          <Banknote className="w-5 h-5" />
                        </button>
                        <button
                          className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          onClick={(e) => { e.stopPropagation(); setSelectedUser(user); setModalMode('sendPokemon'); }}
                          title="Send Pokémon"
                        >
                          <Gift className="w-5 h-5" />
                        </button>
                        <button
                          className="text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors p-2 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20"
                          onClick={(e) => { e.stopPropagation(); setSelectedUser(user); setModalMode('editPokemon'); }}
                          title="Edit Pokémon"
                        >
                          <Pencil className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Management Modal */}
          {selectedUser && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => { setSelectedUser(null); setModalMode(null); }}>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] scrollbar-none" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => { setSelectedUser(null); setModalMode(null); }}
                  className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-full p-1"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="mb-6 pb-6 border-b border-slate-200 dark:border-slate-800 pr-8">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white mb-1">
                    {modalMode === 'currency' && `Inject Currency to ${selectedUser.username}`}
                    {modalMode === 'sendPokemon' && `Send Pokémon to ${selectedUser.username}`}
                    {modalMode === 'editPokemon' && `Edit ${selectedUser.username}'s Pokémon`}
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Fill out the details below.</p>
                </div>

                <div className="space-y-4">
                  {modalMode === "currency" && (<>
                  <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
                    <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
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
                        className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-emerald-500 transition-colors"
                      />
                      <select 
                        value={currencyType} 
                        onChange={(e) => setCurrencyType(e.target.value as any)}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-800 dark:text-slate-200 font-bold"
                      >
                        <option value="astralCoins">Astral</option>
                        <option value="infinityCoins">Infinity</option>
                      </select>
                      <button
                        onClick={() => addMoneyMutation.mutate({ userId: selectedUser.id, amount: moneyAmount, currencyType })}
                        disabled={addMoneyMutation.isPending || !selectedUser.trainerSave}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-lg transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  </>)}{modalMode === "sendPokemon" && (<>
                  <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
                    <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                      Give Pokémon
                    </h3>
                    <div className="space-y-4">
                      <div className="relative">
                        <div className="flex justify-between items-end mb-1">
                          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pokémon Species</label>
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
                            className="w-2/3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-blue-500 transition-colors"
                          />
                        </div>
                        {showSpeciesDropdown && (
                          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg max-h-48 overflow-y-auto shadow-xl">
                            {speciesList
                              ?.filter((s: any) => categoryFilter === 'All' || s.category === categoryFilter)
                              .filter((s: any) => s.name.toLowerCase().includes(speciesSearch.toLowerCase()) || s.id.toString() === speciesSearch)
                              .map((s: any) => (
                                <div
                                  key={s.id}
                                  className="px-3 py-2 hover:bg-slate-100 dark:hover:bg-blue-600 cursor-pointer text-slate-900 dark:text-white capitalize text-sm font-medium flex justify-between"
                                  onClick={() => {
                                    setSpeciesId(s.id);
                                    setSpeciesSearch(s.name);
                                    setShowSpeciesDropdown(false);
                                  }}
                                >
                                  <span>{s.name}</span>
                                  <span className="text-slate-500 dark:text-slate-400 text-xs">#{s.id}</span>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Potential</label>
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
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Level (1-{getMaxLevelForPotential(pokemonPotential)})</label>
                        <input
                          type="text"
                          value={pokemonLevel || ''}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '');
                            setPokemonLevel(val ? Math.min(getMaxLevelForPotential(pokemonPotential), Number(val)) : 0);
                          }}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-blue-500 transition-colors"
                        />
                      </div>

                      <div className="mt-4 border-t border-slate-200 dark:border-slate-800 pt-4">
                        <label className="flex items-center gap-2 cursor-pointer mb-3 text-sm font-bold text-slate-700 dark:text-slate-300">
                          <input 
                            type="checkbox" 
                            checked={useCustomIvs} 
                            onChange={(e) => setUseCustomIvs(e.target.checked)}
                            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                          />
                          Set Custom IVs (0-31)
                        </label>
                        
                        {useCustomIvs && (
                          <div className="grid grid-cols-3 gap-3">
                            {['ivHp', 'ivAttack', 'ivDefense', 'ivSpAtk', 'ivSpDef', 'ivSpeed'].map(stat => (
                              <div key={stat}>
                                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
                                  {stat.replace('iv', '')}
                                </label>
                                <input
                                  type="text"
                                  value={(customIvs as any)[stat] ?? ''}
                                  onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '');
                                    setCustomIvs(prev => ({ ...prev, [stat]: val ? Math.min(31, Number(val)) : 0 }));
                                  }}
                                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-sm text-slate-900 dark:text-white font-bold focus:outline-none focus:border-blue-500 transition-colors text-center"
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
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-3 rounded-lg transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50 mt-2"
                      >
                        Generate & Give
                      </button>
                    </div>
                  </div>

                  </>)}{modalMode === "editPokemon" && (<>
                  <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
                    <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                      Edit Existing Pokémon
                    </h3>
                    {!selectedPokemonToEdit ? (
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                        {userPokemon?.map((p: any) => (
                          <div 
                            key={p.id} 
                            onClick={() => {
                              setSelectedPokemonToEdit(p);
                              setEditPotential(p.potential);
                              setEditIvs({ ivHp: p.ivHp, ivAttack: p.ivAttack, ivDefense: p.ivDefense, ivSpAtk: p.ivSpAtk, ivSpDef: p.ivSpDef, ivSpeed: p.ivSpeed });
                            }}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 rounded-lg flex justify-between items-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white capitalize">{p.speciesName} <span className="text-xs text-slate-500 ml-1">Lv. {p.level}</span></p>
                              <p className="text-xs text-slate-500">XP: {p.currentXp} | {p.isParty ? 'In Party' : `Box ${p.boxNumber ?? 0}`}</p>
                            </div>
                            <span className="text-blue-500 font-bold text-sm">Edit</span>
                          </div>
                        ))}
                        {userPokemon?.length === 0 && <p className="text-slate-500 text-sm italic">User has no Pokémon.</p>}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 rounded-lg mb-2">
                          <p className="font-bold text-slate-900 dark:text-white capitalize">{selectedPokemonToEdit.speciesName} <span className="text-xs text-slate-500 ml-1">Lv. {selectedPokemonToEdit.level}</span></p>
                          <button onClick={() => setSelectedPokemonToEdit(null)} className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white">Cancel</button>
                        </div>
                        
                        <div>
                          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Potential</label>
                          <select
                            value={editPotential}
                            onChange={(e) => setEditPotential(e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-blue-500 transition-colors mb-3"
                          >
                            {POTENTIALS.map(p => <option key={p} value={p}>{p.replace('_', ' ')}</option>)}
                          </select>
                        </div>
                        <div>
                          <div className="flex justify-between items-end mb-1">
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Add XP</label>
                            <button
                              onClick={() => {
                                const maxLevel = getMaxLevelForPotential(editPotential);
                                const maxTotalXp = 50 * (maxLevel + 1) * maxLevel - 1;
                                const requiredXp = maxTotalXp - (selectedPokemonToEdit.currentXp || 0);
                                setEditXp(Math.max(0, requiredXp));
                              }}
                              className="text-[10px] font-bold text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 uppercase px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 rounded"
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
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-blue-500 transition-colors"
                          />
                        </div>

                        <div className="mt-4 border-t border-slate-200 dark:border-slate-800 pt-4">
                          <label className="flex items-center gap-2 cursor-pointer mb-3 text-sm font-bold text-slate-700 dark:text-slate-300">
                            <input 
                              type="checkbox" 
                              checked={useEditIvs} 
                              onChange={(e) => setUseEditIvs(e.target.checked)}
                              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                            />
                            Modify IVs (0-31)
                          </label>
                          
                          {useEditIvs && (
                            <div className="grid grid-cols-3 gap-3">
                              {['ivHp', 'ivAttack', 'ivDefense', 'ivSpAtk', 'ivSpDef', 'ivSpeed'].map(stat => (
                                <div key={stat}>
                                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
                                    {stat.replace('iv', '')}
                                  </label>
                                  <input
                                    type="text"
                                    value={(editIvs as any)[stat] ?? ''}
                                    onChange={(e) => {
                                      const val = e.target.value.replace(/\D/g, '');
                                      setEditIvs(prev => ({ ...prev, [stat]: val ? Math.min(31, Number(val)) : 0 }));
                                    }}
                                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-sm text-slate-900 dark:text-white font-bold focus:outline-none focus:border-blue-500 transition-colors text-center"
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
                          disabled={editPokemonMutation.isPending || (!editXp && !useEditIvs)}
                          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-3 rounded-lg transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50 mt-2"
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

