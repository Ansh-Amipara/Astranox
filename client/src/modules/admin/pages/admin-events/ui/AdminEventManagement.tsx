import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api/api';
import { toast } from 'sonner';
import { FiPlus, FiTrash2, FiEdit2, FiCheckCircle, FiCircle } from 'react-icons/fi';
import { Dropdown } from '@/components/ui/Dropdown';

export function AdminEventManagement() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [speciesSearch, setSpeciesSearch] = useState<string>('');
  const [formState, setFormState] = useState<any>({});

  const { data: eventsData, isLoading } = useQuery({
    queryKey: ['adminEvents'],
    queryFn: async () => {
      const res = await api.get('/admin/events');
      return res.data.data;
    }
  });

  const { data: speciesList = [], isLoading: speciesLoading } = useQuery({
    queryKey: ['adminSpecies'],
    queryFn: async () => {
      const res = await api.get('/admin/species');
      return res.data.data;
    }
  });

  const uniqueCategories = Array.from(new Set(speciesList.map((s: any) => s.category))).sort();
  const filteredSpecies = speciesList.filter((s: any) => {
    if (formState.speciesFilterCategory && s.category !== formState.speciesFilterCategory) return false;
    if (speciesSearch && !s.name.toLowerCase().includes(speciesSearch.toLowerCase())) return false;
    return true;
  });

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (data.id) {
        return api.put(`/admin/events/${data.id}`, data);
      }
      return api.post('/admin/events', data);
    },
    onSuccess: () => {
      toast.success('Event saved successfully');
      queryClient.invalidateQueries({ queryKey: ['adminEvents'] });
      setIsModalOpen(false);
      setEditingEvent(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error?.message || 'Failed to save event');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/admin/events/${id}`);
    },
    onSuccess: () => {
      toast.success('Event deleted');
      queryClient.invalidateQueries({ queryKey: ['adminEvents'] });
    }
  });

  const openCreate = () => {
    setEditingEvent(null);
    setFormState({
      isActive: 'false',
      taskType: 'DEFEAT_WILD_POKEMON',
      taskPokemonType: '',
      speciesFilterCategory: '',
      rewardSpeciesId: '',
      rewardPotential: 'DIAMOND',
      rewardIvs: 'max',
    });
    setIsModalOpen(true);
  };

  const openEdit = (evt: any) => {
    setEditingEvent({
      ...evt,
      startDate: new Date(evt.startDate).toISOString().slice(0, 16),
      endDate: new Date(evt.endDate).toISOString().slice(0, 16),
    });
    setFormState({
      isActive: evt.isActive ? 'true' : 'false',
      taskType: evt.taskType || 'DEFEAT_WILD_POKEMON',
      taskPokemonType: evt.taskConfig?.pokemonType || '',
      speciesFilterCategory: '',
      rewardSpeciesId: String(evt.rewardConfig?.speciesId || ''),
      rewardPotential: evt.rewardConfig?.potential || 'DIAMOND',
      rewardIvs: evt.rewardConfig?.ivs || 'max',
    });
    setIsModalOpen(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Event Management</h1>
          <p className="text-slate-500">Create and manage game-wide events and challenges.</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-colors"
        >
          <FiPlus /> New Event
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 text-sm uppercase font-bold tracking-wider">
              <tr>
                <th className="p-4">Status</th>
                <th className="p-4">Name</th>
                <th className="p-4">Task Type</th>
                <th className="p-4">Dates</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {eventsData?.map((evt: any) => (
                <tr key={evt.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-4">
                    {evt.isActive ? (
                      <span className="flex items-center gap-1 text-emerald-600 font-bold bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 rounded w-fit text-xs">
                        <FiCheckCircle /> Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-slate-500 font-bold bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded w-fit text-xs">
                        <FiCircle /> Inactive
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-slate-900 dark:text-white">{evt.name}</div>
                    <div className="text-sm text-slate-500 truncate max-w-xs">{evt.description}</div>
                  </td>
                  <td className="p-4 font-mono text-sm text-purple-600 dark:text-purple-400">
                    {evt.taskType}
                  </td>
                  <td className="p-4 text-sm text-slate-600 dark:text-slate-400">
                    <div>Start: {new Date(evt.startDate).toLocaleDateString()}</div>
                    <div>End: {new Date(evt.endDate).toLocaleDateString()}</div>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => openEdit(evt)} className="p-2 text-slate-400 hover:text-blue-500 transition-colors">
                      <FiEdit2 />
                    </button>
                    <button onClick={() => { if(window.confirm('Delete event?')) deleteMutation.mutate(evt.id) }} className="p-2 text-slate-400 hover:text-red-500 transition-colors ml-2">
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
              {(!eventsData || eventsData.length === 0) && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">No events found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                {editingEvent?.id ? 'Edit Event' : 'Create Event'}
              </h2>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <form id="event-form" onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                try {
                  const data = {
                    id: editingEvent?.id,
                    name: formData.get('name'),
                    description: formData.get('description'),
                    startDate: new Date(formData.get('startDate') as string).toISOString(),
                    endDate: new Date(formData.get('endDate') as string).toISOString(),
                    isActive: formData.get('isActive') === 'true',
                    taskType: formData.get('taskType'),
                    taskConfig: {
                      requiredCount: Number(formData.get('task_requiredCount')),
                      ...(formData.get('task_pokemonType') ? { pokemonType: formData.get('task_pokemonType') } : {})
                    },
                    rewardConfig: {
                      speciesId: Number(formData.get('reward_speciesId')),
                      level: Number(formData.get('reward_level')),
                      potential: formData.get('reward_potential'),
                      ivs: formData.get('reward_ivs'),
                      nature: formData.get('reward_nature') || undefined
                    },
                  };
                  saveMutation.mutate(data);
                } catch (err) {
                  toast.error("Failed to parse form data");
                }
              }} className="space-y-4">
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Name</label>
                  <input name="name" required defaultValue={editingEvent?.name} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                  <textarea name="description" required defaultValue={editingEvent?.description} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
                    <input type="datetime-local" name="startDate" required defaultValue={editingEvent?.startDate} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">End Date</label>
                    <input type="datetime-local" name="endDate" required defaultValue={editingEvent?.endDate} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Status</label>
                    <Dropdown
                      value={formState.isActive}
                      onChange={v => setFormState({ ...formState, isActive: v })}
                      options={[
                        { value: 'false', label: 'Inactive' },
                        { value: 'true', label: 'Active (Deactivates others)' }
                      ]}
                      className="w-full"
                      dropdownClassName="w-full"
                    />
                    <input type="hidden" name="isActive" value={formState.isActive} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Task Type</label>
                    <Dropdown
                      value={formState.taskType}
                      onChange={v => setFormState({ ...formState, taskType: v })}
                      options={[
                        { value: 'DEFEAT_WILD_POKEMON', label: 'Defeat Wild Pokemon' },
                        { value: 'CAPTURE_POKEMON', label: 'Capture Pokemon' },
                        { value: 'CLEAR_TOWER', label: 'Clear Tower Floor' },
                        { value: 'CLEAR_RIFT', label: 'Clear Rift Floor' }
                      ]}
                      className="w-full"
                      dropdownClassName="w-full"
                    />
                    <input type="hidden" name="taskType" value={formState.taskType} />
                  </div>
                </div>

                <div className="bg-slate-100 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
                  <h3 className="font-black text-slate-900 dark:text-white">Task Configuration</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {['CLEAR_TOWER', 'CLEAR_RIFT'].includes(formState.taskType) ? 'Floors to Clear' : 'Required Count'}
                      </label>
                      <input type="text" name="task_requiredCount" required defaultValue={editingEvent?.taskConfig?.requiredCount || 5} onChange={(e) => { e.target.value = e.target.value.replace(/\D/g, ''); }} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white" />
                    </div>
                    {['DEFEAT_WILD_POKEMON', 'CAPTURE_POKEMON'].includes(formState.taskType) && (
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Target Type (Optional)</label>
                        <Dropdown
                          value={formState.taskPokemonType}
                          onChange={v => setFormState({ ...formState, taskPokemonType: v })}
                          options={[
                            { value: '', label: 'Any Type' },
                            ...['normal', 'fire', 'water', 'grass', 'electric', 'ice', 'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'].map(t => ({
                              value: t,
                              label: t.charAt(0).toUpperCase() + t.slice(1)
                            }))
                          ]}
                          className="w-full"
                          dropdownClassName="w-full max-h-64"
                        />
                        <input type="hidden" name="task_pokemonType" value={formState.taskPokemonType} />
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-slate-100 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
                  <h3 className="font-black text-slate-900 dark:text-white">Reward Configuration</h3>
                  
                  <div className="mb-4 p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 shadow-sm">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Reward Species</label>
                    <div className="flex gap-2 mb-3">
                      <input 
                        type="text" 
                        placeholder="Search name..." 
                        value={speciesSearch}
                        onChange={e => setSpeciesSearch(e.target.value)}
                        className="w-1/2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <div className="w-1/2">
                        <Dropdown
                          value={formState.speciesFilterCategory}
                          onChange={v => setFormState({ ...formState, speciesFilterCategory: v })}
                          options={[
                            { value: '', label: 'All Categories' },
                            ...(uniqueCategories as string[]).map(c => ({ value: c, label: c }))
                          ]}
                          className="w-full text-sm py-2"
                          dropdownClassName="w-full max-h-64"
                        />
                      </div>
                    </div>
                    {speciesLoading ? (
                      <div className="text-slate-500 text-sm">Loading species...</div>
                    ) : (
                      <div className="w-full">
                        <Dropdown
                          value={formState.rewardSpeciesId}
                          onChange={v => setFormState({ ...formState, rewardSpeciesId: v })}
                          options={
                            filteredSpecies.length > 0 
                              ? filteredSpecies.map((s: any) => ({
                                  value: String(s.id),
                                  label: `#${s.id} ${s.name} (${s.category})`
                                }))
                              : [{ value: '', label: 'No species found' }]
                          }
                          placeholder="Select a Pokemon..."
                          className="w-full font-bold"
                          dropdownClassName="w-full max-h-64"
                        />
                        <input type="hidden" name="reward_speciesId" value={formState.rewardSpeciesId} />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Level</label>
                      <input type="text" name="reward_level" required defaultValue={editingEvent?.rewardConfig?.level || 50} onChange={(e) => { e.target.value = e.target.value.replace(/\D/g, ''); }} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Potential</label>
                      <Dropdown
                        value={formState.rewardPotential}
                        onChange={v => setFormState({ ...formState, rewardPotential: v })}
                        options={
                          ['BLACK_IRON', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'ADAMANTITE', 'DIAMOND', 'CRYSTAL', 'EPIC', 'HEROIC', 'SOVEREIGN', 'LEGENDARY', 'DIVINE', 'CELESTIAL', 'PRIMORDIAL', 'MYTHICAL', 'INFINITY', 'ETERNAL'].map(p => ({
                            value: p,
                            label: p
                          }))
                        }
                        className="w-full"
                        dropdownClassName="w-full max-h-64"
                      />
                      <input type="hidden" name="reward_potential" value={formState.rewardPotential} />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">IVs</label>
                      <Dropdown
                        value={formState.rewardIvs}
                        onChange={v => setFormState({ ...formState, rewardIvs: v })}
                        options={[
                          { value: 'max', label: 'Max (31 all)' },
                          { value: 'random', label: 'Random' }
                        ]}
                        className="w-full"
                        dropdownClassName="w-full"
                      />
                      <input type="hidden" name="reward_ivs" value={formState.rewardIvs} />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Nature (Optional)</label>
                      <input type="text" name="reward_nature" defaultValue={editingEvent?.rewardConfig?.nature || ''} placeholder="e.g. Timid" className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white" />
                    </div>
                  </div>
                </div>

              </form>
            </div>
            
            <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="event-form"
                disabled={saveMutation.isPending}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors"
              >
                {saveMutation.isPending ? 'Saving...' : 'Save Event'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
