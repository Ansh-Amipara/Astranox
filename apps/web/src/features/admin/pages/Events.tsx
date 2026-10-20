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
import { PokemonTierSelect } from '../components/PokemonTierSelect';
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
  Trash2,
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

interface EventTaskConfigState {
  requiredCount: string;
  pokemonType: string;
}

interface EventRewardConfigState {
  speciesId: string;
  level: string;
  potential: string;
  coins: string;
  form: string;
  ivs: string;
}

interface PoolEntry {
  speciesId: string;
  name: string;
  minLevel: string;
  maxLevel: string;
  weight: string;
}

const DEFAULT_TASK_CONFIG: EventTaskConfigState = {
  requiredCount: '5',
  pokemonType: '',
};

const DEFAULT_REWARD_CONFIG: EventRewardConfigState = {
  speciesId: '',
  level: '10',
  potential: 'EX',
  coins: '0',
  form: 'Normal',
  ivs: 'max',
};

const DEFAULT_POKEMON_POOL: PoolEntry[] = [];

function serializeTaskConfig(cfg: EventTaskConfigState) {
  return {
    requiredCount: parseInt(cfg.requiredCount, 10) || 5,
    ...(cfg.pokemonType ? { pokemonType: cfg.pokemonType } : {}),
  };
}

function serializeRewardConfig(cfg: EventRewardConfigState) {
  return {
    ...(cfg.speciesId ? { speciesId: parseInt(cfg.speciesId, 10) } : {}),
    level: parseInt(cfg.level, 10) || 50,
    potential: cfg.potential || 'EX',
    form: cfg.form || 'Normal',
    ivs: cfg.ivs || 'max',
    ...(cfg.coins && parseInt(cfg.coins, 10) > 0 ? { coins: parseInt(cfg.coins, 10) } : {}),
  };
}

function serializePool(pool: PoolEntry[]) {
  if (pool.length === 0) return null;
  return pool.map((p) => ({
    speciesId: parseInt(p.speciesId, 10) || 1,
    name: p.name.trim() || undefined,
    minLevel: parseInt(p.minLevel, 10) || 5,
    maxLevel: parseInt(p.maxLevel, 10) || 15,
    weight: parseInt(p.weight, 10) || 50,
  }));
}

function deserializeTaskConfig(cfg: any): EventTaskConfigState {
  return {
    requiredCount: String(cfg?.requiredCount ?? 5),
    pokemonType: String(cfg?.pokemonType ?? ''),
  };
}

function deserializeRewardConfig(cfg: any): EventRewardConfigState {
  return {
    speciesId: String(cfg?.speciesId ?? '6'),
    level: String(cfg?.level ?? '30'),
    potential: String(cfg?.potential ?? 'S'),
    coins: String(cfg?.coins ?? '5000'),
    form: String(cfg?.form ?? 'Normal'),
    ivs: String(cfg?.ivs ?? 'max'),
  };
}

function deserializePool(pool: any): PoolEntry[] {
  if (!Array.isArray(pool)) return [];
  return pool.map((p) => ({
    speciesId: String(p?.speciesId ?? 1),
    name: String(p?.name ?? ''),
    minLevel: String(p?.minLevel ?? 5),
    maxLevel: String(p?.maxLevel ?? 15),
    weight: String(p?.weight ?? 50),
  }));
}

function EventTaskConfigFields({
  taskType,
  config,
  onChange,
}: {
  taskType: string;
  config: EventTaskConfigState;
  onChange: (cfg: EventTaskConfigState) => void;
}) {
  const isTypeRelevant = ['DEFEAT_WILD_POKEMON', 'CAPTURE_POKEMON'].includes(taskType);
  const presets = ['5', '10', '25', '50', '100'];
  const types = [
    { value: '', label: 'Any Type' },
    ...['normal', 'fire', 'water', 'grass', 'electric', 'ice', 'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'].map((t) => ({
      value: t.charAt(0).toUpperCase() + t.slice(1),
      label: t.charAt(0).toUpperCase() + t.slice(1),
    })),
  ];

  return (
    <div className="p-3 bg-surface-raised border border-border rounded-xl space-y-3">
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-foreground">
          {['CLEAR_TOWER', 'CLEAR_RIFT'].includes(taskType) ? 'Floors to Clear' : 'Required Count'}
        </label>
        <div className="flex flex-wrap items-center gap-1.5">
          {presets.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onChange({ ...config, requiredCount: p })}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-colors ${
                config.requiredCount === p
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-surface border-border text-muted hover:text-foreground'
              }`}
            >
              {p}
            </button>
          ))}
          <input
            type="text"
            value={config.requiredCount}
            onChange={(e) => onChange({ ...config, requiredCount: e.target.value.replace(/\D/g, '') })}
            placeholder="Count"
            className="w-20 px-2.5 py-1 bg-surface border border-border rounded-lg text-xs font-mono text-foreground focus:outline-hidden"
          />
        </div>
      </div>

      {isTypeRelevant && (
        <div className="space-y-1">
          <label className="block text-xs font-bold text-foreground">Target Pokémon Type</label>
          <select
            value={config.pokemonType}
            onChange={(e) => onChange({ ...config, pokemonType: e.target.value })}
            className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-xs text-foreground focus:outline-hidden"
          >
            {types.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}

function EventRewardConfigFields({
  config,
  onChange,
}: {
  config: EventRewardConfigState;
  onChange: (cfg: EventRewardConfigState) => void;
}) {
  const levelPresets = ['5', '25', '50', '70', '100'];
  const potentialTiers = ['F', 'E', 'D', 'C', 'B', 'A', 'S_MINUS', 'S', 'S_PLUS', 'SS_MINUS', 'SS', 'SS_PLUS', 'SSS_MINUS', 'SSS', 'SSS_PLUS', 'EX'];

  return (
    <div className="p-3 bg-surface-raised border border-border rounded-xl space-y-3">
      {/* Dynamic Tier-wise Species Selector */}
      <PokemonTierSelect
        label="Reward Pokémon Species (Tier-wise)"
        selectedSpeciesId={config.speciesId}
        onSelect={(s) => onChange({ ...config, speciesId: String(s.id) })}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Level */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-foreground">Reward Level</label>
          <div className="flex flex-wrap items-center gap-1">
            {levelPresets.map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => onChange({ ...config, level: lvl })}
                className={`px-2 py-0.5 text-[11px] font-bold rounded-md border transition-colors ${
                  config.level === lvl
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-surface border-border text-muted hover:text-foreground'
                }`}
              >
                Lv.{lvl}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={config.level}
            onChange={(e) => onChange({ ...config, level: e.target.value.replace(/\D/g, '') })}
            placeholder="50"
            className="w-full px-2.5 py-1.5 bg-surface border border-border rounded-lg text-xs font-mono text-foreground focus:outline-hidden mt-1"
          />
        </div>

        {/* Potential */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-foreground">Potential Tier</label>
          <select
            value={config.potential}
            onChange={(e) => onChange({ ...config, potential: e.target.value })}
            className="w-full px-2.5 py-1.5 bg-surface border border-border rounded-lg text-xs text-foreground focus:outline-hidden"
          >
            {potentialTiers.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Coins */}
        <div>
          <label className="block text-xs font-bold text-foreground mb-1">Astral Coins</label>
          <input
            type="text"
            value={config.coins}
            onChange={(e) => onChange({ ...config, coins: e.target.value.replace(/\D/g, '') })}
            placeholder="0"
            className="w-full px-2.5 py-1.5 bg-surface border border-border rounded-lg text-xs font-mono text-foreground focus:outline-hidden"
          />
        </div>

        {/* Form */}
        <div>
          <label className="block text-xs font-bold text-foreground mb-1">Form</label>
          <select
            value={config.form}
            onChange={(e) => onChange({ ...config, form: e.target.value })}
            className="w-full px-2.5 py-1.5 bg-surface border border-border rounded-lg text-xs text-foreground focus:outline-hidden"
          >
            <option value="Normal">Normal</option>
            <option value="Mega">Mega</option>
            <option value="G-Max">Gigantamax</option>
          </select>
        </div>

        {/* IVs */}
        <div>
          <label className="block text-xs font-bold text-foreground mb-1">IV Guarantee</label>
          <select
            value={config.ivs}
            onChange={(e) => onChange({ ...config, ivs: e.target.value })}
            className="w-full px-2.5 py-1.5 bg-surface border border-border rounded-lg text-xs text-foreground focus:outline-hidden"
          >
            <option value="max">Max (31/31)</option>
            <option value="random">Random</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function EventPokemonPoolEditor({
  pool,
  onChange,
}: {
  pool: PoolEntry[];
  onChange: (pool: PoolEntry[]) => void;
}) {
  const handleAdd = () => {
    onChange([
      ...pool,
      { speciesId: '25', name: 'pikachu', minLevel: '10', maxLevel: '20', weight: '50' },
    ]);
  };

  const handleRemove = (index: number) => {
    onChange(pool.filter((_, i) => i !== index));
  };

  const handleUpdate = (index: number, field: keyof PoolEntry, value: string) => {
    const updated = [...pool];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div className="p-3 bg-surface-raised border border-border rounded-xl space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-foreground">
          Encounter Pool ({pool.length} Species)
        </label>
        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center gap-1 px-2.5 py-1 bg-surface border border-border text-foreground hover:bg-surface-raised rounded-lg text-xs font-bold transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Species
        </button>
      </div>

      {pool.length === 0 ? (
        <p className="text-xs text-muted italic py-1">No custom encounter pool configured (uses standard biome pool).</p>
      ) : (
        <div className="space-y-2">
          {pool.map((entry, idx) => (
            <div
              key={idx}
              className="flex flex-wrap sm:flex-nowrap items-center gap-2 p-2 bg-surface border border-border rounded-lg"
            >
              <div className="flex-1 min-w-[200px]">
                <PokemonTierSelect
                  compact
                  selectedSpeciesId={entry.speciesId}
                  onSelect={(s) => {
                    handleUpdate(idx, 'speciesId', String(s.id));
                    handleUpdate(idx, 'name', s.name);
                  }}
                />
              </div>
              <div className="w-16">
                <span className="block text-[10px] text-muted font-bold">Min Lv</span>
                <input
                  type="text"
                  value={entry.minLevel}
                  onChange={(e) => handleUpdate(idx, 'minLevel', e.target.value.replace(/\D/g, ''))}
                  placeholder="5"
                  className="w-full px-2 py-1 bg-background border border-border rounded text-xs font-mono text-foreground focus:outline-hidden"
                />
              </div>
              <div className="w-16">
                <span className="block text-[10px] text-muted font-bold">Max Lv</span>
                <input
                  type="text"
                  value={entry.maxLevel}
                  onChange={(e) => handleUpdate(idx, 'maxLevel', e.target.value.replace(/\D/g, ''))}
                  placeholder="15"
                  className="w-full px-2 py-1 bg-background border border-border rounded text-xs font-mono text-foreground focus:outline-hidden"
                />
              </div>
              <div className="w-16">
                <span className="block text-[10px] text-muted font-bold">Weight</span>
                <input
                  type="text"
                  value={entry.weight}
                  onChange={(e) => handleUpdate(idx, 'weight', e.target.value.replace(/\D/g, ''))}
                  placeholder="50"
                  className="w-full px-2 py-1 bg-background border border-border rounded text-xs font-mono text-foreground focus:outline-hidden"
                />
              </div>
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="p-1.5 text-muted hover:text-danger rounded transition-colors self-end sm:self-center mt-3 sm:mt-0"
                title="Remove species"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

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
  const [createTaskConfig, setCreateTaskConfig] = useState<EventTaskConfigState>(DEFAULT_TASK_CONFIG);
  const [createRewardConfig, setCreateRewardConfig] = useState<EventRewardConfigState>(DEFAULT_REWARD_CONFIG);
  const [createPokemonPool, setCreatePokemonPool] = useState<PoolEntry[]>(DEFAULT_POKEMON_POOL);
  const [createReason, setCreateReason] = useState('');

  // Edit form
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [editIsActive, setEditIsActive] = useState(false);
  const [editTaskType, setEditTaskType] = useState<any>('DEFEAT_WILD_POKEMON');
  const [editTaskConfig, setEditTaskConfig] = useState<EventTaskConfigState>(DEFAULT_TASK_CONFIG);
  const [editRewardConfig, setEditRewardConfig] = useState<EventRewardConfigState>(DEFAULT_REWARD_CONFIG);
  const [editPokemonPool, setEditPokemonPool] = useState<PoolEntry[]>([]);
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
    setCreateTaskConfig(DEFAULT_TASK_CONFIG);
    setCreateRewardConfig(DEFAULT_REWARD_CONFIG);
    setCreatePokemonPool(DEFAULT_POKEMON_POOL);
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

    const payload: CreateEventInput = {
      name: createName.trim(),
      description: createDescription.trim(),
      startDate: createStartDate,
      endDate: createEndDate,
      isActive: createIsActive,
      taskType: createTaskType,
      taskConfig: serializeTaskConfig(createTaskConfig),
      rewardConfig: serializeRewardConfig(createRewardConfig),
      pokemonPool: serializePool(createPokemonPool),
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
    setEditTaskConfig(deserializeTaskConfig(event.taskConfig));
    setEditRewardConfig(deserializeRewardConfig(event.rewardConfig));
    setEditPokemonPool(deserializePool(event.pokemonPool));
    setEditReason('');
  };

  const handleSaveEdit = async () => {
    if (!editingEvent) return;
    if (editReason.trim().length < 5) {
      notify.error('Audit reason must be at least 5 characters');
      return;
    }

    const payload: UpdateEventInput = {
      name: editName.trim(),
      description: editDescription.trim(),
      startDate: editStartDate,
      endDate: editEndDate,
      isActive: editIsActive,
      taskType: editTaskType,
      taskConfig: serializeTaskConfig(editTaskConfig),
      rewardConfig: serializeRewardConfig(editRewardConfig),
      pokemonPool: serializePool(editPokemonPool),
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

              <div className="space-y-4">
                <EventTaskConfigFields
                  taskType={createTaskType}
                  config={createTaskConfig}
                  onChange={setCreateTaskConfig}
                />
                <EventRewardConfigFields
                  config={createRewardConfig}
                  onChange={setCreateRewardConfig}
                />
                <EventPokemonPoolEditor
                  pool={createPokemonPool}
                  onChange={setCreatePokemonPool}
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

              <div className="space-y-4">
                <EventTaskConfigFields
                  taskType={editTaskType}
                  config={editTaskConfig}
                  onChange={setEditTaskConfig}
                />
                <EventRewardConfigFields
                  config={editRewardConfig}
                  onChange={setEditRewardConfig}
                />
                <EventPokemonPoolEditor
                  pool={editPokemonPool}
                  onChange={setEditPokemonPool}
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
