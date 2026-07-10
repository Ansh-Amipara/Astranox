import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';

export function AdminDashboard() {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [moneyAmount, setMoneyAmount] = useState<number>(1000);
  const [speciesId, setSpeciesId] = useState<number>(1);
  const [pokemonLevel, setPokemonLevel] = useState<number>(5);
  const [speciesSearch, setSpeciesSearch] = useState('');
  const [showSpeciesDropdown, setShowSpeciesDropdown] = useState(false);
  const [ivs, setIvs] = useState({ hp: 31, attack: 31, defense: 31, spAtk: 31, spDef: 31, speed: 31 });
  const [useCustomIvs, setUseCustomIvs] = useState(false);
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
    mutationFn: async ({ userId, amount }: { userId: string, amount: number }) => {
      await api.post(`/admin/users/${userId}/money`, { amount });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      alert('Money added successfully!');
    },
    onError: (err: any) => {
      alert(`Error: ${err.response?.data?.error?.message || err.message}`);
    }
  });

  const addPokemonMutation = useMutation({
    mutationFn: async ({ userId, speciesId, level, ivsData }: { userId: string, speciesId: number, level: number, ivsData?: any }) => {
      await api.post(`/admin/users/${userId}/pokemon`, { speciesId, level, ivs: ivsData });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      alert('Pokémon added successfully!');
    },
    onError: (err: any) => {
      alert(`Error: ${err.response?.data?.error?.message || err.message}`);
    }
  });

  if (isLoading) {
    return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center font-bold text-2xl">Loading Admin Dashboard...</div>;
  }

  return (
    <div className="flex-1 bg-slate-950 p-8 text-slate-100 font-sans">
      <div className="max-w-7xl mx-auto w-full">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight text-white mb-2">User Management</h1>
          <p className="text-slate-400 font-medium">Manage players, inject currency, and distribute Pokémon.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* User List */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-800 bg-slate-900/50">
              <h2 className="text-xl font-bold text-white">Registered Users</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 text-sm">
                    <th className="p-4 font-bold">Username</th>
                    <th className="p-4 font-bold">Email</th>
                    <th className="p-4 font-bold">Money</th>
                    <th className="p-4 font-bold">Party Size</th>
                    <th className="p-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {users?.map((user: any) => (
                    <tr 
                      key={user.id} 
                      className={`hover:bg-slate-800/50 transition-colors cursor-pointer ${selectedUser?.id === user.id ? 'bg-blue-900/20' : ''}`}
                      onClick={() => setSelectedUser(user)}
                    >
                      <td className="p-4 font-bold text-white">{user.username} {user.role === 'ADMIN' && <span className="ml-2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black uppercase">Admin</span>}</td>
                      <td className="p-4 text-slate-400 font-medium">{user.email}</td>
                      <td className="p-4 text-emerald-400 font-bold">₽ {user.trainerSave?.money ?? 0}</td>
                      <td className="p-4 text-slate-300 font-medium">{user.trainerSave?._count?.party ?? 0} / 6</td>
                      <td className="p-4 text-right">
                        <button 
                          className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors shadow-lg shadow-blue-500/20"
                          onClick={(e) => { e.stopPropagation(); setSelectedUser(user); }}
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Management Panel */}
          <div className="lg:col-span-1">
            {selectedUser ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl sticky top-8">
                <div className="mb-6 pb-6 border-b border-slate-800">
                  <h2 className="text-xl font-black text-white mb-1">Manage {selectedUser.username}</h2>
                  <p className="text-slate-400 text-sm font-medium">Select actions below to modify this account.</p>
                </div>

                <div className="space-y-8">
                  {/* Add Money Form */}
                  <div className="bg-slate-950 p-5 rounded-xl border border-slate-800">
                    <h3 className="font-bold text-emerald-400 mb-4 flex items-center gap-2">
                      <span className="text-xl">💰</span> Inject Currency
                    </h3>
                    <div className="flex gap-3">
                      <input 
                        type="number" 
                        value={moneyAmount}
                        onChange={(e) => setMoneyAmount(Number(e.target.value))}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold focus:outline-none focus:border-emerald-500 transition-colors"
                        min="1"
                      />
                      <button 
                        onClick={() => addMoneyMutation.mutate({ userId: selectedUser.id, amount: moneyAmount })}
                        disabled={addMoneyMutation.isPending || !selectedUser.trainerSave}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-lg transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Add Pokemon Form */}
                  <div className="bg-slate-950 p-5 rounded-xl border border-slate-800">
                    <h3 className="font-bold text-blue-400 mb-4 flex items-center gap-2">
                      <span className="text-xl">🐉</span> Give Pokémon
                    </h3>
                    <div className="space-y-4">
                      <div className="relative">
                        <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Pokémon Species</label>
                        <input 
                          type="text" 
                          value={speciesSearch}
                          onFocus={() => setShowSpeciesDropdown(true)}
                          onChange={(e) => {
                            setSpeciesSearch(e.target.value);
                            setShowSpeciesDropdown(true);
                          }}
                          placeholder="Search Pokémon..."
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold focus:outline-none focus:border-blue-500 transition-colors"
                        />
                        {showSpeciesDropdown && (
                          <div className="absolute z-10 w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg max-h-48 overflow-y-auto shadow-xl">
                            {speciesList
                              ?.filter((s: any) => s.name.toLowerCase().includes(speciesSearch.toLowerCase()) || s.id.toString() === speciesSearch)
                              .map((s: any) => (
                                <div 
                                  key={s.id} 
                                  className="px-3 py-2 hover:bg-blue-600 cursor-pointer text-white capitalize text-sm font-medium flex justify-between"
                                  onClick={() => {
                                    setSpeciesId(s.id);
                                    setSpeciesSearch(s.name);
                                    setShowSpeciesDropdown(false);
                                  }}
                                >
                                  <span>{s.name}</span>
                                  <span className="text-slate-400 text-xs">#{s.id}</span>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Level (1-100)</label>
                        <input 
                          type="number" 
                          value={pokemonLevel}
                          onChange={(e) => setPokemonLevel(Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold focus:outline-none focus:border-blue-500 transition-colors"
                          min="1"
                          max="100"
                        />
                      </div>

                      <div className="pt-2 border-t border-slate-800 mt-4">
                        <label className="flex items-center gap-2 cursor-pointer mb-3">
                          <input 
                            type="checkbox" 
                            checked={useCustomIvs}
                            onChange={(e) => setUseCustomIvs(e.target.checked)}
                            className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-950"
                          />
                          <span className="text-sm font-bold text-slate-300">Set Custom IVs (0-31)</span>
                        </label>

                        {useCustomIvs && (
                          <div className="grid grid-cols-3 gap-2">
                            {['hp', 'attack', 'defense', 'spAtk', 'spDef', 'speed'].map(stat => (
                              <div key={stat}>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase">{stat}</label>
                                <input 
                                  type="number"
                                  value={(ivs as any)[stat]}
                                  onChange={(e) => setIvs({ ...ivs, [stat]: Number(e.target.value) })}
                                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white text-sm font-bold focus:outline-none focus:border-blue-500"
                                  min="0" max="31"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <button 
                        onClick={() => {
                          const payload = useCustomIvs ? ivs : undefined;
                          addPokemonMutation.mutate({ userId: selectedUser.id, speciesId, level: pokemonLevel, ivsData: payload });
                        }}
                        disabled={addPokemonMutation.isPending || !selectedUser.trainerSave}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-3 rounded-lg transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50 mt-2"
                      >
                        Generate & Give
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl flex flex-col items-center justify-center text-center h-[500px] border-dashed">
                <div className="text-6xl mb-4 opacity-50">👥</div>
                <h3 className="text-xl font-bold text-white mb-2">No User Selected</h3>
                <p className="text-slate-400 font-medium max-w-[250px]">Select a user from the table to manage their account, money, and Pokémon.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
