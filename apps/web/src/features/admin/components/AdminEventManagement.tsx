import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api/api';
import { notify } from '@/lib/toast';
import { parseApiError } from '@/lib/apiError';
import { FiPlus, FiCheckCircle, FiCircle } from 'react-icons/fi';
import { Dropdown } from '@/shared/ui/Dropdown';
import { Modal } from '@/shared/ui/Modal';
import { DatePicker } from '@/shared/ui/DatePicker';
import { getMaxLevelForPotential } from '@/features/pokemon/pokemonUtils';
import { PokemonTierSelect } from './PokemonTierSelect';

export function AdminEventManagement() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [formState, setFormState] = useState<any>({});

  const { data: eventsData, isLoading } = useQuery({
    queryKey: ['adminEvents'],
    queryFn: async () => {
      const res = await api.get('/admin/events');
      return res.data.data;
    }
  });

  const { data: speciesList = [] } = useQuery({
    queryKey: ['adminSpecies'],
    queryFn: async () => {
      const res = await api.get('/admin/species');
      return res.data.data;
    }
  });

  const uniqueCategories = Array.from(new Set(speciesList.map((s: any) => s.rank || s.category))).filter(Boolean).sort();

  const saveMutation = useMutation({
    mutationFn: async (data: unknown) => {
      if ((data as any).id) {
        return api.put(`/admin/events/${(data as any).id}`, data);
      }
      return api.post('/admin/events', data);
    },
    onSuccess: () => {
      notify.success('Event saved successfully');
      queryClient.invalidateQueries({ queryKey: ['adminEvents'] });
      setIsModalOpen(false);
      setEditingEvent(null);
    },
    onError: (err: unknown) => {
      notify.error(parseApiError(err).message || 'Failed to save event');
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
      rewardLevel: getMaxLevelForPotential('DIAMOND'),
      rewardIvs: 'max',
    });
    setIsModalOpen(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-black text-foreground leading-tight">
          Events
        </h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-surface-raised text-foreground rounded-lg font-bold hover:bg-surface-raised transition-colors whitespace-nowrap"
        >
          <FiPlus className="w-5 h-5" /> New
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-border"></div>
        </div>
      ) : (
        <div className="md:overflow-x-auto">
          <table className="w-full text-left border-collapse block md:table md:min-w-[800px]">
            <thead className="hidden md:table-header-group bg-surface-raised/50 border-b border-border text-subtle text-sm uppercase font-bold tracking-wider">
              <tr>
                <th className="p-4 whitespace-nowrap">Status</th>
                <th className="p-4 whitespace-nowrap">Name</th>
                <th className="p-4 whitespace-nowrap">Task Type</th>
                <th className="p-4 whitespace-nowrap">Dates</th>
                <th className="p-4 text-right whitespace-nowrap">Reward</th>
              </tr>
            </thead>
            <tbody className="block md:table-row-group space-y-4 md:space-y-0 p-4 md:p-0 divide-y-0 md:divide-y divide-border bg-surface-raised md:bg-transparent md:">
              {eventsData?.map((evt: { id: string, name: string, status: string, startDate: string, endDate: string, rules: any, description: string, isActive: boolean, taskType: string, rewardConfig?: any }) => (
                <tr key={evt.id} className="block md:table-row bg-surface border border-border md:border-none rounded-xl md:rounded-none overflow-hidden shadow-sm md:shadow-none hover:bg-surface-raised transition-colors">
                  <td className="block md:table-cell p-3 md:p-4 border-b border-border md:border-none">
                    <div className="flex justify-between items-center md:block">
                      <span className="md:hidden font-bold text-muted text-xs uppercase tracking-wider">Status</span>
                      {new Date() >= new Date(evt.startDate) && new Date() <= new Date(evt.endDate) ? (
                        <span className="flex items-center gap-1 text-foreground font-bold bg-surface-raised px-2 py-1 rounded w-fit text-xs">
                          <FiCheckCircle /> Active
                        </span>
                      ) : new Date() < new Date(evt.startDate) ? (
                        <span className="flex items-center gap-1 text-foreground font-bold bg-surface-raised px-2 py-1 rounded w-fit text-xs">
                          <FiCircle /> Future
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-subtle font-bold bg-surface-raised px-2 py-1 rounded w-fit text-xs">
                          <FiCircle /> Inactive
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="block md:table-cell p-3 md:p-4 border-b border-border md:border-none">
                    <div className="flex justify-between items-center md:block">
                      <span className="md:hidden font-bold text-muted text-xs uppercase tracking-wider mr-4">Name</span>
                      <div className="text-right md:text-left">
                        <div className="font-bold text-foreground">{evt.name}</div>
                        <div className="text-sm text-subtle truncate max-w-[150px] md:max-w-xs">{evt.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="block md:table-cell p-3 md:p-4 border-b border-border md:border-none">
                    <div className="flex justify-between items-center md:block">
                      <span className="md:hidden font-bold text-muted text-xs uppercase tracking-wider">Task Type</span>
                      <span className="font-mono text-sm text-foreground">{evt.taskType}</span>
                    </div>
                  </td>
                  <td className="block md:table-cell p-3 md:p-4 border-b border-border md:border-none">
                    <div className="flex justify-between items-center md:block">
                      <span className="md:hidden font-bold text-muted text-xs uppercase tracking-wider">Dates</span>
                      <div className="text-sm text-muted text-right md:text-left">
                        <div>Start: {new Date(evt.startDate).toLocaleDateString('en-GB')}</div>
                        <div>End: {new Date(evt.endDate).toLocaleDateString('en-GB')}</div>
                      </div>
                    </div>
                  </td>
                  <td className="block md:table-cell p-3 md:p-4 bg-surface-raised/30 md:bg-transparent">
                    <div className="flex justify-between md:justify-end items-center gap-2">
                      <span className="md:hidden font-bold text-muted text-xs uppercase tracking-wider">Reward</span>
                      <div className="text-right flex flex-col items-end">
                        <span className="font-bold text-foreground">
                          {evt.rewardConfig?.speciesId 
                            ? speciesList.find((s: any) => s.id === evt.rewardConfig.speciesId)?.name || `Species #${evt.rewardConfig.speciesId}`
                            : 'No Pokémon'}
                        </span>
                        <span className="text-xs font-bold text-foreground uppercase">
                          {evt.rewardConfig?.potential || 'NONE'}
                        </span>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
              {(!eventsData || eventsData.length === 0) && (
                <tr className="block md:table-row">
                  <td colSpan={5} className="block md:table-cell p-8 text-center text-subtle bg-surface rounded-xl md:rounded-none">No events found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingEvent?.id ? 'Edit Event' : 'Create Event'} className="max-w-3xl">
        <div className="flex flex-col max-h-[90vh] overflow-hidden">
          <div className="p-6 overflow-y-auto flex-1">
            <form id="event-form" onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              try {
                const data = {
                  id: editingEvent?.id,
                  name: formData.get('name'),
                  description: formData.get('description'),
                  startDate: new Date(`${formData.get('startDate')}T00:00:00.000Z`).toISOString(),
                  endDate: new Date(`${formData.get('endDate')}T23:59:59.999Z`).toISOString(),
                  isActive: new Date(`${formData.get('startDate')}T00:00:00.000Z`) <= new Date() && new Date(`${formData.get('endDate')}T23:59:59.999Z`) >= new Date(),
                  taskType: formData.get('taskType'),
                  taskConfig: {
                    requiredCount: Number(formData.get('task_requiredCount')),
                    ...(formData.get('task_pokemonType') ? { pokemonType: formData.get('task_pokemonType') } : {})
                  },
                  rewardConfig: {
                    speciesId: Number(formData.get('reward_speciesId')),
                    level: Number(formData.get('reward_level')),
                    potential: formData.get('reward_potential'),
                    ivs: formData.get('reward_ivs')
                  },
                };
                saveMutation.mutate(data);
              } catch {
                notify.error("Failed to parse form data");
              }
            }} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-3 md:col-span-1">
                  <label className="block text-sm font-bold text-muted mb-1">Name</label>
                  <input name="name" required defaultValue={editingEvent?.name} className="w-full bg-surface-raised border border-border rounded-lg px-4 py-2 text-foreground" />
                </div>
                <div className="col-span-3 md:col-span-1">
                  <label className="block text-sm font-bold text-muted mb-1">Start Date</label>
                  <DatePicker name="startDate" required value={editingEvent?.startDate ? new Date(editingEvent.startDate).toISOString().slice(0, 10) : ''} className="w-full" />
                </div>
                <div className="col-span-3 md:col-span-1">
                  <label className="block text-sm font-bold text-muted mb-1">End Date</label>
                  <DatePicker name="endDate" required value={editingEvent?.endDate ? new Date(editingEvent.endDate).toISOString().slice(0, 10) : ''} className="w-full" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-muted mb-1">Description</label>
                <textarea name="description" rows={2} required defaultValue={editingEvent?.description} className="w-full bg-surface-raised border border-border rounded-lg px-4 py-2 text-foreground" />
              </div>

              <div className="bg-surface-raised/50 p-4 rounded-xl border border-border space-y-4">
                <h3 className="font-black text-foreground">Task Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-muted mb-1">Task Type</label>
                    <Dropdown
                      value={formState.taskType}
                      onChange={v => setFormState({ ...formState, taskType: v })}
                      options={[
                        { value: 'DEFEAT_WILD_POKEMON', label: 'Defeat Wild Pokemon' },
                        { value: 'CAPTURE_POKEMON', label: 'Capture Pokemon' },
                        { value: 'CLEAR_TOWER', label: 'Clear Tower Floor' },
                        { value: 'CLEAR_RIFT', label: 'Clear Rift Floor' }
                      ]}
                      className="!w-full"
                      dropdownClassName="!w-full"
                    />
                    <input type="hidden" name="taskType" value={formState.taskType} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-muted mb-1">
                      {['CLEAR_TOWER', 'CLEAR_RIFT'].includes(formState.taskType) ? 'Floors to Clear (Max 100)' : 'Required Count (Max 100)'}
                    </label>
                    <input type="text" name="task_requiredCount" required defaultValue={editingEvent?.taskConfig?.requiredCount || 5} onChange={(e) => {
                      let val = e.target.value.replace(/\D/g, '');
                      if (Number(val) > 100) val = '100';
                      e.target.value = val;
                    }} className="w-full bg-surface border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-border" />
                  </div>
                  {['DEFEAT_WILD_POKEMON', 'CAPTURE_POKEMON'].includes(formState.taskType) && (
                    <div>
                      <label className="block text-sm font-bold text-muted mb-1">Target Type (Optional)</label>
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
                        className="!w-full"
                        dropdownClassName="!w-full max-h-64"
                      />
                      <input type="hidden" name="task_pokemonType" value={formState.taskPokemonType} />
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-surface-raised/50 p-4 rounded-xl border border-border space-y-4">
                <h3 className="font-black text-foreground">Reward Configuration</h3>

                <div className="flex flex-col gap-4">
                  <div className="w-full">
                    <PokemonTierSelect
                      label="Reward Pokémon Species (Tier-wise)"
                      selectedSpeciesId={formState.rewardSpeciesId}
                      onSelect={(s) => setFormState({ ...formState, rewardSpeciesId: String(s.id) })}
                    />
                    <input type="hidden" name="reward_speciesId" value={formState.rewardSpeciesId || ''} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-muted mb-1">Category</label>
                      <Dropdown
                        value={formState.speciesFilterCategory}
                        onChange={v => setFormState({ ...formState, speciesFilterCategory: v })}
                        options={[
                          { value: '', label: 'All Categories' },
                          ...(uniqueCategories as string[]).map(c => ({ value: c, label: c }))
                        ]}
                        className="!w-full text-sm"
                        dropdownClassName="!w-full max-h-64"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-muted mb-1">Potential</label>
                      <Dropdown
                        value={formState.rewardPotential}
                        onChange={v => setFormState({ ...formState, rewardPotential: v, rewardLevel: getMaxLevelForPotential(v) })}
                        options={
                          ['F', 'E', 'D', 'C', 'B', 'A', 'S_MINUS', 'S', 'S_PLUS', 'SS_MINUS', 'SS', 'SS_PLUS', 'SSS_MINUS', 'SSS', 'SSS_PLUS', 'EX'].map(p => ({
                            value: p,
                            label: p
                          }))
                        }
                        className="!w-full"
                        dropdownClassName="!w-full max-h-64"
                      />
                      <input type="hidden" name="reward_potential" value={formState.rewardPotential} />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-muted mb-1">Level (Max {getMaxLevelForPotential(formState.rewardPotential)})</label>
                      <input type="text" name="reward_level" required value={formState.rewardLevel} onChange={(e) => {
                        let val = e.target.value.replace(/\D/g, '');
                        if (Number(val) > getMaxLevelForPotential(formState.rewardPotential)) {
                          val = String(getMaxLevelForPotential(formState.rewardPotential));
                        }
                        setFormState({ ...formState, rewardLevel: val });
                      }} className="w-full bg-surface border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-border" />
                    </div>
                  </div>
                </div>
                <input type="hidden" name="reward_ivs" value="max" />
              </div>
            </form>
          </div>
          <div className="px-6 py-4 border-t border-border bg-surface-raised/50 flex justify-end gap-3">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-muted font-bold hover:bg-surface-raised rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="event-form"
              disabled={saveMutation.isPending}
              className="px-6 py-2 bg-surface-raised hover:bg-surface-raised text-foreground font-bold rounded-lg transition-colors"
            >
              {saveMutation.isPending ? 'Saving...' : 'Save Event'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
