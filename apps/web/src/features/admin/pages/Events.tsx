import { useState, useMemo } from 'react';
import {
  useAdminEvents,
  useCreateEvent,
  useUpdateEvent,
  useArchiveEvent,
  useUnarchiveEvent,
} from '../hooks/useAdminEvents';
import { DataTable, ColumnDef } from '../components/DataTable';
import { ReasonField } from '../components/ReasonField';
import { DateRangeField } from '../components/DateRangeField';
import { ConfirmDialog } from '../components/ConfirmDialog';
import {
  EventChallengeDto,
  CreateEventInput,
  UpdateEventInput,
} from '@astranox/types';
import {
  CalendarDays,
  Plus,
  Pencil,
  Archive,
  ArchiveRestore,
  Search,
  Filter,
  X,
  Gift,
  Target,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { notify } from '@/lib/toast';

const TASK_TYPES = [
  { value: 'DEFEAT_WILD_POKEMON', label: 'Defeat Wild Pokémon' },
  { value: 'CAPTURE_POKEMON', label: 'Capture Wild Pokémon' },
  { value: 'CLEAR_TOWER', label: 'Clear Infinity Tower Floors' },
  { value: 'CLEAR_RIFT', label: 'Clear Void Rift Floors' },
] as const;

export function Events() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('all');

  const { data: events = [], isLoading, isError, refetch } = useAdminEvents('all');
  const createMutation = useCreateEvent();
  const updateMutation = useUpdateEvent();
  const archiveMutation = useArchiveEvent();
  const unarchiveMutation = useUnarchiveEvent();

  // Modals & form state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventChallengeDto | null>(null);
  const [archiveTargetEvent, setArchiveTargetEvent] = useState<EventChallengeDto | null>(null);
  const [restoreTargetEvent, setRestoreTargetEvent] = useState<EventChallengeDto | null>(null);

  // Create form
  const [createName, setCreateName] = useState('');
  const [createDescription, setCreateDescription] = useState('');
  const [createStartDate, setCreateStartDate] = useState(new Date().toISOString());
  const [createEndDate, setCreateEndDate] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString()
  );
  const [createIsActive, setCreateIsActive] = useState(true);
  const [createTaskType, setCreateTaskType] = useState<
    'DEFEAT_WILD_POKEMON' | 'CAPTURE_POKEMON' | 'CLEAR_TOWER' | 'CLEAR_RIFT'
  >('DEFEAT_WILD_POKEMON');
  const [createTaskConfigStr, setCreateTaskConfigStr] = useState('{\n  "requiredCount": 10,\n  "pokemonType": "Fire"\n}');
  const [createRewardConfigStr, setCreateRewardConfigStr] = useState('{\n  "speciesId": 6,\n  "level": 30,\n  "potential": "S",\n  "coins": 5000\n}');
  const [createPokemonPoolStr, setCreatePokemonPoolStr] = useState('[\n  { "speciesId": 4, "name": "charmander", "minLevel": 5, "maxLevel": 15, "weight": 50 },\n  { "speciesId": 5, "name": "charmeleon", "minLevel": 16, "maxLevel": 25, "weight": 20 }\n]');
  const [createReason, setCreateReason] = useState('');

  // Edit form
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [editIsActive, setEditIsActive] = useState(false);
  const [editTaskType, setEditTaskType] = useState<any>('DEFEAT_WILD_POKEMON');
  const [editTaskConfigStr, setEditTaskConfigStr] = useState('{}');
  const [editRewardConfigStr, setEditRewardConfigStr] = useState('{}');
  const [editPokemonPoolStr, setEditPokemonPoolStr] = useState('[]');
  const [editReason, setEditReason] = useState('');

  // Filtered events
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      if (statusFilter === 'active' && (!e.isActive || e.isArchived)) return false;
      if (statusFilter === 'archived' && !e.isArchived) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return e.name.toLowerCase().includes(q) || e.description.toLowerCase().includes(q) || e.taskType.toLowerCase().includes(q);
      }
      return true;
    });
  }, [events, statusFilter, searchQuery]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setCreateName('');
    setCreateDescription('');
    setCreateStartDate(new Date().toISOString());
    setCreateEndDate(new Date(Date.now() + 7 * 86400000).toISOString());
    setCreateIsActive(true);
    setCreateTaskType('DEFEAT_WILD_POKEMON');
    setCreateTaskConfigStr('{\n  "requiredCount": 10,\n  "pokemonType": "Fire"\n}');
    setCreateRewardConfigStr('{\n  "speciesId": 6,\n  "level": 30,\n  "potential": "S",\n  "coins": 5000\n}');
    setCreatePokemonPoolStr('[\n  { "speciesId": 4, "name": "charmander", "minLevel": 5, "maxLevel": 15, "weight": 50 },\n  { "speciesId": 5, "name": "charmeleon", "minLevel": 16, "maxLevel": 25, "weight": 20 }\n]');
    setCreateReason('');
    setIsCreateOpen(true);
  };

  const handleSaveCreate = async () => {
    if (!createName.trim()) {
      notify.error('Event name is required');
      return;
    }
    if (createReason.trim().length < 5) {
      notify.error('Audit reason must be at least 5 characters');
      return;
    }

    let parsedTaskConfig = {};
    try {
      parsedTaskConfig = JSON.parse(createTaskConfigStr);
    } catch {
      notify.error('Invalid JSON in task configuration');
      return;
    }

    let parsedRewardConfig = {};
    try {
      parsedRewardConfig = JSON.parse(createRewardConfigStr);
    } catch {
      notify.error('Invalid JSON in reward configuration');
      return;
    }

    let parsedPool: any = null;
    if (createPokemonPoolStr.trim()) {
      try {
        parsedPool = JSON.parse(createPokemonPoolStr);
      } catch {
        notify.error('Invalid JSON in Pokémon pool');
        return;
      }
    }

    const payload: CreateEventInput = {
      name: createName.trim(),
      description: createDescription.trim(),
      startDate: createStartDate,
      endDate: createEndDate,
      isActive: createIsActive,
      taskType: createTaskType,
      taskConfig: parsedTaskConfig,
      rewardConfig: parsedRewardConfig,
      pokemonPool: parsedPool,
      reason: createReason.trim(),
    };

    try {
      await createMutation.mutateAsync(payload);
      setIsCreateOpen(false);
    } catch {
      // Handled in mutation onError
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (event: EventChallengeDto) => {
    setEditingEvent(event);
    setEditName(event.name);
    setEditDescription(event.description);
    setEditStartDate(event.startDate);
    setEditEndDate(event.endDate);
    setEditIsActive(event.isActive);
    setEditTaskType(event.taskType);
    setEditTaskConfigStr(JSON.stringify(event.taskConfig || {}, null, 2));
    setEditRewardConfigStr(JSON.stringify(event.rewardConfig || {}, null, 2));
    setEditPokemonPoolStr(event.pokemonPool ? JSON.stringify(event.pokemonPool, null, 2) : '[]');
    setEditReason('');
  };

  const handleSaveEdit = async () => {
    if (!editingEvent) return;
    if (editReason.trim().length < 5) {
      notify.error('Audit reason must be at least 5 characters');
      return;
    }

    let parsedTaskConfig = {};
    try {
      parsedTaskConfig = JSON.parse(editTaskConfigStr);
    } catch {
      notify.error('Invalid JSON in task configuration');
      return;
    }

    let parsedRewardConfig = {};
    try {
      parsedRewardConfig = JSON.parse(editRewardConfigStr);
    } catch {
      notify.error('Invalid JSON in reward configuration');
      return;
    }

    let parsedPool: any = null;
    if (editPokemonPoolStr.trim()) {
      try {
        parsedPool = JSON.parse(editPokemonPoolStr);
      } catch {
        notify.error('Invalid JSON in Pokémon pool');
        return;
      }
    }

    const payload: UpdateEventInput = {
      name: editName.trim(),
      description: editDescription.trim(),
      startDate: editStartDate,
      endDate: editEndDate,
      isActive: editIsActive,
      taskType: editTaskType,
      taskConfig: parsedTaskConfig,
      rewardConfig: parsedRewardConfig,
      pokemonPool: parsedPool,
      reason: editReason.trim(),
    };

    try {
      await updateMutation.mutateAsync({ id: editingEvent.id, data: payload });
      setEditingEvent(null);
    } catch {
      // Handled in mutation onError
    }
  };

  // Table Columns
  const columns: ColumnDef<EventChallengeDto>[] = [
    {
      header: 'Event',
      accessorKey: 'name',
      sortable: true,
      cell: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-surface-raised border border-border flex items-center justify-center shrink-0">
            <CalendarDays className="w-5 h-5 text-muted" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-foreground block">{item.name}</span>
              {item.isActive && (
                <Badge variant="success" className="text-[8px] py-0 px-1 font-bold">
                  LIVE
                </Badge>
              )}
              {item.isArchived && (
                <Badge variant="default" className="text-[8px] py-0 px-1 font-bold">
                  Archived
                </Badge>
              )}
            </div>
            <span className="text-[10px] text-muted line-clamp-1">{item.description}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Task Objective',
      accessorKey: 'taskType',
      cell: (item) => (
        <div className="text-xs">
          <Badge variant="ink" className="text-[9px] font-mono py-0.5 px-1.5 bg-surface-raised border-border">
            <Target className="w-2.5 h-2.5 mr-1" />
            {item.taskType}
          </Badge>
          <span className="text-[10px] text-muted block mt-0.5 font-mono">
            {JSON.stringify(item.taskConfig || {})}
          </span>
        </div>
      ),
    },
    {
      header: 'Rewards & Pool',
      accessorKey: 'rewardConfig',
      cell: (item) => (
        <div className="text-xs">
          <span className="text-foreground font-bold block text-[10px] flex items-center gap-1">
            <Gift className="w-2.5 h-2.5 text-muted" />
            Reward: {item.rewardConfig?.speciesId ? `Species #${item.rewardConfig.speciesId}` : 'Configured'}
          </span>
          {item.pokemonPool && item.pokemonPool.length > 0 ? (
            <span className="text-[10px] text-muted font-mono block">
              Pool: {item.pokemonPool.length} species ranges
            </span>
          ) : (
            <span className="text-[10px] text-subtle font-mono block">No custom encounter pool</span>
          )}
        </div>
      ),
    },
    {
      header: 'Schedule Window',
      accessorKey: 'startDate',
      cell: (item) => {
        const start = new Date(item.startDate).toLocaleDateString();
        const end = new Date(item.endDate).toLocaleDateString();
        return (
          <div className="text-xs">
            <span className="text-muted block text-[10px]">{start} &rarr; {end}</span>
          </div>
        );
      },
    },
    {
      header: 'Status',
      accessorKey: 'isActive',
      cell: (item) => {
        if (item.isArchived) {
          return (
            <Badge variant="default" className="text-[10px] font-bold py-0.5">
              Archived
            </Badge>
          );
        }
        return (
          <Badge
            variant={item.isActive ? 'success' : 'default'}
            className="text-[10px] font-bold py-0.5"
          >
            {item.isActive ? 'Active' : 'Inactive'}
          </Badge>
        );
      },
    },
    {
      header: 'Actions',
      accessorKey: 'id',
      className: 'text-right',
      cell: (item) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => handleOpenEdit(item)}
            title="Edit Event"
            className="p-1.5 rounded-lg bg-surface-raised border border-border text-foreground hover:bg-surface transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          {item.isArchived ? (
            <button
              onClick={() => setRestoreTargetEvent(item)}
              title="Restore Event"
              className="p-1.5 rounded-lg bg-surface-raised border border-border text-foreground hover:bg-surface transition-colors"
            >
              <ArchiveRestore className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => setArchiveTargetEvent(item)}
              title="Archive Event"
              className="p-1.5 rounded-lg bg-surface-raised border border-border text-muted hover:text-danger transition-colors"
            >
              <Archive className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-4 sm:p-6 bg-surface border border-border rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">Events & Challenges</h1>
            <Badge variant="ink" className="text-[10px] font-black uppercase">
              Zero-Deploy Events
            </Badge>
          </div>
          <p className="text-xs text-muted">
            Launch promotional in-game events, configure objectives, define encounter pools with level ranges, and set prize distributions.
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-1.5 text-xs min-h-[44px] w-full sm:w-auto touch-manipulation"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create Event</span>
        </Button>
      </div>

      {/* Filters */}
      <div className="p-3 sm:p-4 bg-surface border border-border rounded-2xl flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search events by name, objective, or description..."
            className="w-full pl-9 pr-4 py-2.5 min-h-[44px] bg-background border border-border rounded-xl text-base sm:text-xs text-foreground placeholder:text-muted focus:outline-hidden touch-manipulation"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-muted shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2.5 min-h-[44px] bg-background border border-border rounded-xl text-base sm:text-xs text-foreground focus:outline-hidden touch-manipulation"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="archived">Archived Only</option>
          </select>
        </div>
      </div>

      {/* Events Data Table */}
      <DataTable
        data={filteredEvents}
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        emptyMessage="No event challenges found."
      />

      {/* Create Event Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-background/80 backdrop-blur-xs">
          <div className="bg-surface border border-border rounded-t-3xl sm:rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90dvh] pb-safe animate-in fade-in slide-in-from-bottom sm:zoom-in duration-200">
            <div className="sm:hidden mx-auto mt-3 -mb-1 h-1.5 w-12 rounded-full bg-border shrink-0" aria-hidden="true" />
            <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-foreground">Create Event Challenge</h3>
                <p className="text-xs text-muted">Configure a new player challenge with prizes and encounter pools.</p>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-muted hover:text-foreground touch-manipulation"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Event Name</label>
                  <input
                    type="text"
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    placeholder="e.g. Fire Fest: Charizard Awakening"
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Task Type</label>
                  <select
                    value={createTaskType}
                    onChange={(e) => setCreateTaskType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden"
                  >
                    {TASK_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Description</label>
                <textarea
                  value={createDescription}
                  onChange={(e) => setCreateDescription(e.target.value)}
                  rows={2}
                  placeholder="Describes the event theme and instructions for players..."
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden resize-none"
                />
              </div>

              <DateRangeField
                label="Event Schedule Window"
                startDate={createStartDate}
                endDate={createEndDate}
                onChange={(start, end) => {
                  if (start) setCreateStartDate(start);
                  if (end) setCreateEndDate(end);
                }}
                helperText="Event objective tracking is active strictly during this period."
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Task Config (JSON)</label>
                  <textarea
                    value={createTaskConfigStr}
                    onChange={(e) => setCreateTaskConfigStr(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs font-mono text-foreground focus:outline-hidden resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Reward Config (JSON)</label>
                  <textarea
                    value={createRewardConfigStr}
                    onChange={(e) => setCreateRewardConfigStr(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs font-mono text-foreground focus:outline-hidden resize-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Pokémon Encounter Pool (JSON array of species, ranges & weights)
                </label>
                <textarea
                  value={createPokemonPoolStr}
                  onChange={(e) => setCreatePokemonPoolStr(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs font-mono text-foreground focus:outline-hidden resize-none"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-surface-raised border border-border rounded-xl">
                <div>
                  <span className="text-xs font-bold text-foreground block">Active Event</span>
                  <span className="text-[10px] text-muted">Set as the primary live active event</span>
                </div>
                <input
                  type="checkbox"
                  checked={createIsActive}
                  onChange={(e) => setCreateIsActive(e.target.checked)}
                  className="w-4 h-4 rounded border-border bg-surface text-foreground focus:ring-0 cursor-pointer"
                />
              </div>

              <ReasonField
                value={createReason}
                onChange={setCreateReason}
                label="Audit Reason (Mandatory)"
                helperText="Required log entry for launching this event challenge."
              />
            </div>

            <div className="p-3 sm:p-4 border-t border-border flex items-center justify-end gap-2 bg-surface">
              <Button
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                className="text-xs min-h-[44px] flex-1 sm:flex-initial touch-manipulation"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveCreate}
                disabled={createMutation.isPending || createReason.trim().length < 5}
                className="text-xs min-h-[44px] flex-1 sm:flex-initial touch-manipulation"
              >
                {createMutation.isPending ? 'Creating...' : 'Create Event'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Event Modal */}
      {editingEvent && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-background/80 backdrop-blur-xs">
          <div className="bg-surface border border-border rounded-t-3xl sm:rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90dvh] pb-safe animate-in fade-in slide-in-from-bottom sm:zoom-in duration-200">
            <div className="sm:hidden mx-auto mt-3 -mb-1 h-1.5 w-12 rounded-full bg-border shrink-0" aria-hidden="true" />
            <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-foreground">Edit Event: {editingEvent.name}</h3>
                <span className="text-[10px] text-muted font-mono">{editingEvent.id}</span>
              </div>
              <button
                onClick={() => setEditingEvent(null)}
                className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-muted hover:text-foreground touch-manipulation"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Event Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Task Type</label>
                  <select
                    value={editTaskType}
                    onChange={(e) => setEditTaskType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden"
                  >
                    {TASK_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Description</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden resize-none"
                />
              </div>

              <DateRangeField
                label="Event Schedule Window"
                startDate={editStartDate}
                endDate={editEndDate}
                onChange={(start, end) => {
                  if (start) setEditStartDate(start);
                  if (end) setEditEndDate(end);
                }}
                helperText="Event objective tracking is active strictly during this period."
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Task Config (JSON)</label>
                  <textarea
                    value={editTaskConfigStr}
                    onChange={(e) => setEditTaskConfigStr(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs font-mono text-foreground focus:outline-hidden resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Reward Config (JSON)</label>
                  <textarea
                    value={editRewardConfigStr}
                    onChange={(e) => setEditRewardConfigStr(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs font-mono text-foreground focus:outline-hidden resize-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Pokémon Encounter Pool (JSON array)
                </label>
                <textarea
                  value={editPokemonPoolStr}
                  onChange={(e) => setEditPokemonPoolStr(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs font-mono text-foreground focus:outline-hidden resize-none"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-surface-raised border border-border rounded-xl">
                <div>
                  <span className="text-xs font-bold text-foreground block">Active Event</span>
                  <span className="text-[10px] text-muted">Is currently live in game</span>
                </div>
                <input
                  type="checkbox"
                  checked={editIsActive}
                  onChange={(e) => setEditIsActive(e.target.checked)}
                  className="w-4 h-4 rounded border-border bg-surface text-foreground focus:ring-0 cursor-pointer"
                />
              </div>

              <ReasonField
                value={editReason}
                onChange={setEditReason}
                label="Audit Reason (Mandatory)"
                helperText="Required log entry explaining changes to this event."
              />
            </div>

            <div className="p-3 sm:p-4 border-t border-border flex items-center justify-end gap-2 bg-surface">
              <Button
                variant="outline"
                onClick={() => setEditingEvent(null)}
                className="text-xs min-h-[44px] flex-1 sm:flex-initial touch-manipulation"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveEdit}
                disabled={updateMutation.isPending || editReason.trim().length < 5}
                className="text-xs min-h-[44px] flex-1 sm:flex-initial touch-manipulation"
              >
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Archive Event Confirm Dialog */}
      <ConfirmDialog
        isOpen={Boolean(archiveTargetEvent)}
        onClose={() => setArchiveTargetEvent(null)}
        onConfirm={async (reason) => {
          if (!archiveTargetEvent) return;
          await archiveMutation.mutateAsync({ id: archiveTargetEvent.id, data: { reason } });
          setArchiveTargetEvent(null);
        }}
        title={`Archive "${archiveTargetEvent?.name}"?`}
        description="This event challenge will be archived and deactivated from the live game."
        confirmLabel="Archive Event"
        isDestructive={true}
        isLoading={archiveMutation.isPending}
      />

      {/* Restore Event Confirm Dialog */}
      <ConfirmDialog
        isOpen={Boolean(restoreTargetEvent)}
        onClose={() => setRestoreTargetEvent(null)}
        onConfirm={async (reason) => {
          if (!restoreTargetEvent) return;
          await unarchiveMutation.mutateAsync({ id: restoreTargetEvent.id, data: { reason } });
          setRestoreTargetEvent(null);
        }}
        title={`Restore "${restoreTargetEvent?.name}"?`}
        description="This event will be restored to the events catalog."
        confirmLabel="Restore Event"
        isLoading={unarchiveMutation.isPending}
      />
    </div>
  );
}
