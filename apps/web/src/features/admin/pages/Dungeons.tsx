import { useState, useMemo } from 'react';
import {
  useAdminDungeonFloors,
  useCreateDungeonFloor,
  useUpdateDungeonFloor,
  useArchiveDungeonFloor,
  useUnarchiveDungeonFloor,
} from '../hooks/useAdminDungeons';
import { DataTable, ColumnDef } from '../components/DataTable';
import { ReasonField } from '../components/ReasonField';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { PokemonTierSelect } from '../components/PokemonTierSelect';
import { ItemSelect } from '../components/ItemSelect';
import {
  DungeonFloorRuleDto,
  CreateDungeonFloorRuleInput,
  UpdateDungeonFloorRuleInput,
} from '@astranox/types';
import {
  Castle,
  Flame,
  Filter,
  Pencil,
  Plus,
  Archive,
  ArchiveRestore,
  Skull,
  Trash2,
  X,
  Zap,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { notify } from '@/lib/toast';

const RIFT_DIFFICULTIES = ['NORMAL', 'HARD', 'NIGHTMARE', 'ABYSS'] as const;

export interface DungeonEnemyEntry {
  speciesId: string;
  name: string;
  level: string;
  weight: string;
}

export interface DungeonRewardItemEntry {
  itemKey: string;
  quantity: string;
  chance?: string;
}

export interface DungeonRuleModifiersState {
  weather: string;
  statBuffMultiplier: string;
  typeAdvantageMultiplier: string;
}

function DungeonEnemyPoolEditor({
  pool,
  onChange,
}: {
  pool: DungeonEnemyEntry[];
  onChange: (pool: DungeonEnemyEntry[]) => void;
}) {
  const handleAdd = (speciesId = '1', name = 'Bulbasaur', level = '50') => {
    onChange([
      ...pool,
      { speciesId, name, level, weight: '1' },
    ]);
  };

  const handleRemove = (index: number) => {
    onChange(pool.filter((_, i) => i !== index));
  };

  const handleUpdate = (index: number, field: keyof DungeonEnemyEntry, value: string) => {
    const updated = [...pool];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div className="p-3 bg-surface-raised border border-border rounded-xl space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-xs font-bold text-foreground">
            Enemy Pool ({pool.length} Pokémon)
          </label>
          <span className="text-[10px] text-muted">Species and levels spawned on this dungeon floor (Tier-wise)</span>
        </div>
        <button
          type="button"
          onClick={() => handleAdd()}
          className="flex items-center gap-1 px-2.5 py-1 bg-surface border border-border text-foreground hover:bg-surface-raised rounded-lg text-xs font-bold transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Enemy
        </button>
      </div>

      {pool.length === 0 ? (
        <p className="text-xs text-muted italic py-1">No enemies configured. Click above to add enemy Pokémon.</p>
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
              <div className="w-28">
                <span className="block text-[10px] text-muted font-bold">Level</span>
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={entry.level}
                    onChange={(e) => handleUpdate(idx, 'level', e.target.value.replace(/\D/g, ''))}
                    placeholder="50"
                    className="w-full px-2 py-1 bg-background border border-border rounded text-xs font-mono text-foreground focus:outline-hidden"
                  />
                  <div className="flex flex-col gap-0.5">
                    <button
                      type="button"
                      onClick={() => handleUpdate(idx, 'level', String(Math.min(100, (parseInt(entry.level, 10) || 50) + 5)))}
                      className="px-1 text-[8px] bg-background border border-border rounded text-muted hover:text-foreground cursor-pointer"
                    >
                      +5
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdate(idx, 'level', String(Math.max(1, (parseInt(entry.level, 10) || 50) - 5)))}
                      className="px-1 text-[8px] bg-background border border-border rounded text-muted hover:text-foreground cursor-pointer"
                    >
                      -5
                    </button>
                  </div>
                </div>
              </div>
              <div className="w-16">
                <span className="block text-[10px] text-muted font-bold">Weight</span>
                <input
                  type="text"
                  value={entry.weight}
                  onChange={(e) => handleUpdate(idx, 'weight', e.target.value.replace(/\D/g, ''))}
                  placeholder="1"
                  className="w-full px-2 py-1 bg-background border border-border rounded text-xs font-mono text-foreground focus:outline-hidden"
                />
              </div>
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="p-1.5 text-muted hover:text-danger rounded-lg transition-colors cursor-pointer self-end sm:self-center mt-2 sm:mt-0"
                title="Remove enemy"
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

function DungeonRewardItemsEditor({
  items,
  onChange,
}: {
  items: DungeonRewardItemEntry[];
  onChange: (items: DungeonRewardItemEntry[]) => void;
}) {
  const handleAdd = () => {
    onChange([
      ...items,
      { itemKey: 'rare-candy', quantity: '1', chance: '100' },
    ]);
  };

  const handleRemove = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const handleUpdate = (index: number, field: keyof DungeonRewardItemEntry, value: string) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div className="p-3 bg-surface-raised border border-border rounded-xl space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-xs font-bold text-foreground">
            Bonus Reward Items ({items.length})
          </label>
          <span className="text-[10px] text-muted">Items awarded upon clearing this floor (from Database)</span>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center gap-1 px-2.5 py-1 bg-surface border border-border text-foreground hover:bg-surface-raised rounded-lg text-xs font-bold transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Item
        </button>
      </div>

      {items.length === 0 ? (
        <p className="text-xs text-muted italic py-1">No bonus items configured (floor only grants coins/infinity coins).</p>
      ) : (
        <div className="space-y-2">
          {items.map((entry, idx) => (
            <div
              key={idx}
              className="flex flex-wrap sm:flex-nowrap items-center gap-2 p-2 bg-surface border border-border rounded-lg"
            >
              <div className="flex-1 min-w-[160px]">
                <ItemSelect
                  label="Database Item"
                  value={entry.itemKey}
                  onChange={(key) => handleUpdate(idx, 'itemKey', key)}
                />
              </div>

              <div className="w-20">
                <span className="block text-[10px] text-muted font-bold">Quantity</span>
                <input
                  type="text"
                  value={entry.quantity}
                  onChange={(e) => handleUpdate(idx, 'quantity', e.target.value.replace(/\D/g, ''))}
                  placeholder="1"
                  className="w-full px-2 py-1 bg-background border border-border rounded text-xs font-mono text-foreground focus:outline-hidden"
                />
              </div>

              <div className="w-20">
                <span className="block text-[10px] text-muted font-bold">Chance %</span>
                <input
                  type="text"
                  value={entry.chance || '100'}
                  onChange={(e) => handleUpdate(idx, 'chance', e.target.value.replace(/\D/g, ''))}
                  placeholder="100"
                  className="w-full px-2 py-1 bg-background border border-border rounded text-xs font-mono text-foreground focus:outline-hidden"
                />
              </div>

              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="p-1.5 text-muted hover:text-danger rounded-lg transition-colors cursor-pointer self-end sm:self-center mt-2 sm:mt-0"
                title="Remove item"
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

const WEATHER_OPTIONS = [
  { value: 'NONE', label: 'None' },
  { value: 'SUNNY', label: '☀️ Harsh Sun' },
  { value: 'RAIN', label: '🌧️ Heavy Rain' },
  { value: 'SANDSTORM', label: '🌪️ Sandstorm' },
  { value: 'HAIL', label: '❄️ Snow / Hail' },
];

const STAT_BUFF_OPTIONS = [
  { value: '1.0', label: '1.0x (Standard)' },
  { value: '1.25', label: '1.25x (+25%)' },
  { value: '1.5', label: '1.5x (+50%)' },
  { value: '2.0', label: '2.0x (+100%)' },
  { value: '3.0', label: '3.0x (+200%)' },
];

const TYPE_ADVANTAGE_OPTIONS = [
  { value: '2.0', label: '2.0x (Standard)' },
  { value: '1.5', label: '1.5x (Reduced)' },
  { value: '1.0', label: '1.0x (Neutralized)' },
  { value: '3.0', label: '3.0x (Hyper)' },
];

function DungeonRuleModifiersEditor({
  modifiers,
  onChange,
}: {
  modifiers: DungeonRuleModifiersState;
  onChange: (mods: DungeonRuleModifiersState) => void;
}) {
  const hasActiveModifiers =
    modifiers.weather !== 'NONE' ||
    modifiers.statBuffMultiplier !== '1.0' ||
    modifiers.typeAdvantageMultiplier !== '2.0';

  return (
    <div className="p-3 bg-surface-raised border border-border rounded-xl space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-xs font-bold text-foreground">Rule Modifiers & Floor Effects</label>
          <span className="text-[10px] text-muted">Special battle conditions active for this floor</span>
        </div>
        {hasActiveModifiers && (
          <button
            type="button"
            onClick={() =>
              onChange({
                weather: 'NONE',
                statBuffMultiplier: '1.0',
                typeAdvantageMultiplier: '2.0',
              })
            }
            className="text-[10px] font-bold text-muted hover:text-foreground px-2 py-0.5 rounded border border-border bg-surface transition-colors cursor-pointer"
          >
            Reset to Standard
          </button>
        )}
      </div>

      <div className="space-y-1">
        <label className="block text-[11px] font-bold text-foreground">Field Weather</label>
        <div className="flex flex-wrap gap-1.5">
          {WEATHER_OPTIONS.map((w) => (
            <button
              key={w.value}
              type="button"
              onClick={() => onChange({ ...modifiers, weather: w.value })}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                modifiers.weather === w.value
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-surface border-border text-muted hover:text-foreground'
              }`}
            >
              {w.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1">
        <label className="block text-[11px] font-bold text-foreground">Enemy Stat Buff</label>
        <div className="flex flex-wrap gap-1.5">
          {STAT_BUFF_OPTIONS.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => onChange({ ...modifiers, statBuffMultiplier: s.value })}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                modifiers.statBuffMultiplier === s.value
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-surface border-border text-muted hover:text-foreground'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1">
        <label className="block text-[11px] font-bold text-foreground">Type Advantage Multiplier</label>
        <div className="flex flex-wrap gap-1.5">
          {TYPE_ADVANTAGE_OPTIONS.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => onChange({ ...modifiers, typeAdvantageMultiplier: t.value })}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                modifiers.typeAdvantageMultiplier === t.value
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-surface border-border text-muted hover:text-foreground'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Dungeons() {
  const [activeTab, setActiveTab] = useState<'INFINITY_TOWER' | 'VOID_RIFT'>('INFINITY_TOWER');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('all');

  const { data: floors = [], isLoading, isError, refetch } = useAdminDungeonFloors({
    dungeonType: activeTab,
    isArchived: 'all',
  });

  const createFloorMutation = useCreateDungeonFloor();
  const updateFloorMutation = useUpdateDungeonFloor();
  const archiveFloorMutation = useArchiveDungeonFloor();
  const unarchiveFloorMutation = useUnarchiveDungeonFloor();

  // Modals & form state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingFloor, setEditingFloor] = useState<DungeonFloorRuleDto | null>(null);
  const [archiveTargetFloor, setArchiveTargetFloor] = useState<DungeonFloorRuleDto | null>(null);
  const [restoreTargetFloor, setRestoreTargetFloor] = useState<DungeonFloorRuleDto | null>(null);

  // Create form
  const [createFloorNum, setCreateFloorNum] = useState('1');
  const [createDifficulty, setCreateDifficulty] = useState<'NORMAL' | 'HARD' | 'NIGHTMARE' | 'ABYSS'>('NORMAL');
  const [createTitle, setCreateTitle] = useState('');
  const [createEnemyPool, setCreateEnemyPool] = useState<DungeonEnemyEntry[]>([
    { speciesId: '25', name: 'Pikachu', level: '50', weight: '1' },
  ]);
  const [createScalingFactor, setCreateScalingFactor] = useState('1.0');
  const [createRewardCoins, setCreateRewardCoins] = useState('1000');
  const [createRewardInfCoins, setCreateRewardInfCoins] = useState('10');
  const [createRewardItems, setCreateRewardItems] = useState<DungeonRewardItemEntry[]>([]);
  const [createRuleModifiers, setCreateRuleModifiers] = useState<DungeonRuleModifiersState>({
    weather: 'NONE',
    statBuffMultiplier: '1.0',
    typeAdvantageMultiplier: '2.0',
  });
  const [createIsBoss, setCreateIsBoss] = useState(false);
  const [createEnabled, setCreateEnabled] = useState(true);
  const [createReason, setCreateReason] = useState('');

  // Edit form
  const [editTitle, setEditTitle] = useState('');
  const [editEnemyPool, setEditEnemyPool] = useState<DungeonEnemyEntry[]>([]);
  const [editScalingFactor, setEditScalingFactor] = useState('1.0');
  const [editRewardCoins, setEditRewardCoins] = useState('0');
  const [editRewardInfCoins, setEditRewardInfCoins] = useState('0');
  const [editRewardItems, setEditRewardItems] = useState<DungeonRewardItemEntry[]>([]);
  const [editRuleModifiers, setEditRuleModifiers] = useState<DungeonRuleModifiersState>({
    weather: 'NONE',
    statBuffMultiplier: '1.0',
    typeAdvantageMultiplier: '2.0',
  });
  const [editIsBoss, setEditIsBoss] = useState(false);
  const [editEnabled, setEditEnabled] = useState(true);
  const [editReason, setEditReason] = useState('');

  // Filtered floors
  const filteredFloors = useMemo(() => {
    return floors.filter((f) => {
      if (activeTab === 'VOID_RIFT' && selectedDifficulty !== 'all' && f.difficulty !== selectedDifficulty) {
        return false;
      }
      if (statusFilter === 'active' && f.isArchived) return false;
      if (statusFilter === 'archived' && !f.isArchived) return false;
      return true;
    });
  }, [floors, activeTab, selectedDifficulty, statusFilter]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setCreateFloorNum(String(floors.length + 1));
    setCreateDifficulty('NORMAL');
    setCreateTitle('');
    setCreateEnemyPool([
      { speciesId: '25', name: 'Pikachu', level: '50', weight: '1' },
    ]);
    setCreateScalingFactor('1.0');
    setCreateRewardCoins('1000');
    setCreateRewardInfCoins('10');
    setCreateRewardItems([]);
    setCreateRuleModifiers({
      weather: 'NONE',
      statBuffMultiplier: '1.0',
      typeAdvantageMultiplier: '2.0',
    });
    setCreateIsBoss(false);
    setCreateEnabled(true);
    setCreateReason('');
    setIsCreateOpen(true);
  };

  const handleSaveCreate = async () => {
    if (createReason.trim().length < 5) {
      notify.error('Audit reason must be at least 5 characters');
      return;
    }

    if (createEnemyPool.length === 0) {
      notify.error('At least one enemy Pokémon must be added to the enemy pool');
      return;
    }

    const enemyPoolPayload = createEnemyPool.map((e) => ({
      speciesId: parseInt(e.speciesId, 10) || 1,
      name: e.name.trim() || undefined,
      level: parseInt(e.level, 10) || 50,
      weight: parseInt(e.weight, 10) || 1,
    }));

    const rewardItemsPayload = createRewardItems.length > 0
      ? createRewardItems.map((r) => ({
          itemKey: r.itemKey.trim(),
          quantity: parseInt(r.quantity, 10) || 1,
          ...(r.chance && parseFloat(r.chance) < 100 ? { chance: parseFloat(r.chance) } : {}),
        }))
      : null;

    const ruleModifiersPayload: Record<string, any> = {};
    if (createRuleModifiers.weather && createRuleModifiers.weather !== 'NONE') {
      ruleModifiersPayload.weather = createRuleModifiers.weather;
    }
    if (createRuleModifiers.statBuffMultiplier && parseFloat(createRuleModifiers.statBuffMultiplier) !== 1.0) {
      ruleModifiersPayload.statBuffMultiplier = parseFloat(createRuleModifiers.statBuffMultiplier);
    }
    if (createRuleModifiers.typeAdvantageMultiplier && parseFloat(createRuleModifiers.typeAdvantageMultiplier) !== 2.0) {
      ruleModifiersPayload.typeAdvantageMultiplier = parseFloat(createRuleModifiers.typeAdvantageMultiplier);
    }
    const finalRuleModifiers = Object.keys(ruleModifiersPayload).length > 0 ? ruleModifiersPayload : null;

    const payload: CreateDungeonFloorRuleInput = {
      dungeonType: activeTab,
      floorNumber: parseInt(createFloorNum, 10) || 1,
      difficulty: activeTab === 'VOID_RIFT' ? createDifficulty : null,
      title: createTitle.trim() || null,
      enemyPool: enemyPoolPayload,
      scalingFactor: parseFloat(createScalingFactor) || 1.0,
      rewardCoins: parseInt(createRewardCoins, 10) || 0,
      rewardInfinityCoins: parseInt(createRewardInfCoins, 10) || 0,
      rewardItems: rewardItemsPayload,
      ruleModifiers: finalRuleModifiers,
      isBossFloor: createIsBoss,
      enabled: createEnabled,
      sortOrder: 0,
      reason: createReason.trim(),
    };

    try {
      await createFloorMutation.mutateAsync(payload);
      setIsCreateOpen(false);
    } catch {
      // Handled in mutation onError
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (floor: DungeonFloorRuleDto) => {
    setEditingFloor(floor);
    setEditTitle(floor.title || '');

    const pool: DungeonEnemyEntry[] = Array.isArray(floor.enemyPool)
      ? floor.enemyPool.map((e: any) => ({
          speciesId: String(e.speciesId ?? 25),
          name: String(e.name ?? ''),
          level: String(e.level ?? 50),
          weight: String(e.weight ?? 1),
        }))
      : [{ speciesId: '25', name: 'Pikachu', level: '50', weight: '1' }];
    setEditEnemyPool(pool);

    setEditScalingFactor(String(floor.scalingFactor));
    setEditRewardCoins(String(floor.rewardCoins));
    setEditRewardInfCoins(String(floor.rewardInfinityCoins));

    const items: DungeonRewardItemEntry[] = Array.isArray(floor.rewardItems)
      ? floor.rewardItems.map((r: any) => ({
          itemKey: String(r.itemKey || r.itemId || 'rare-candy'),
          quantity: String(r.quantity ?? 1),
          chance: r.chance !== undefined ? String(r.chance) : '100',
        }))
      : [];
    setEditRewardItems(items);

    const mods = floor.ruleModifiers || {};
    setEditRuleModifiers({
      weather: mods.weather || 'NONE',
      statBuffMultiplier: mods.statBuffMultiplier ? String(mods.statBuffMultiplier) : '1.0',
      typeAdvantageMultiplier: mods.typeAdvantageMultiplier ? String(mods.typeAdvantageMultiplier) : '2.0',
    });

    setEditIsBoss(floor.isBossFloor);
    setEditEnabled(floor.enabled);
    setEditReason('');
  };

  const handleSaveEdit = async () => {
    if (!editingFloor) return;
    if (editReason.trim().length < 5) {
      notify.error('Audit reason must be at least 5 characters');
      return;
    }

    if (editEnemyPool.length === 0) {
      notify.error('At least one enemy Pokémon must be added to the enemy pool');
      return;
    }

    const enemyPoolPayload = editEnemyPool.map((e) => ({
      speciesId: parseInt(e.speciesId, 10) || 1,
      name: e.name.trim() || undefined,
      level: parseInt(e.level, 10) || 50,
      weight: parseInt(e.weight, 10) || 1,
    }));

    const rewardItemsPayload = editRewardItems.length > 0
      ? editRewardItems.map((r) => ({
          itemKey: r.itemKey.trim(),
          quantity: parseInt(r.quantity, 10) || 1,
          ...(r.chance && parseFloat(r.chance) < 100 ? { chance: parseFloat(r.chance) } : {}),
        }))
      : null;

    const ruleModifiersPayload: Record<string, any> = {};
    if (editRuleModifiers.weather && editRuleModifiers.weather !== 'NONE') {
      ruleModifiersPayload.weather = editRuleModifiers.weather;
    }
    if (editRuleModifiers.statBuffMultiplier && parseFloat(editRuleModifiers.statBuffMultiplier) !== 1.0) {
      ruleModifiersPayload.statBuffMultiplier = parseFloat(editRuleModifiers.statBuffMultiplier);
    }
    if (editRuleModifiers.typeAdvantageMultiplier && parseFloat(editRuleModifiers.typeAdvantageMultiplier) !== 2.0) {
      ruleModifiersPayload.typeAdvantageMultiplier = parseFloat(editRuleModifiers.typeAdvantageMultiplier);
    }
    const finalRuleModifiers = Object.keys(ruleModifiersPayload).length > 0 ? ruleModifiersPayload : null;

    const payload: UpdateDungeonFloorRuleInput = {
      title: editTitle.trim() || null,
      enemyPool: enemyPoolPayload,
      scalingFactor: parseFloat(editScalingFactor) || 1.0,
      rewardCoins: parseInt(editRewardCoins, 10) || 0,
      rewardInfinityCoins: parseInt(editRewardInfCoins, 10) || 0,
      rewardItems: rewardItemsPayload,
      ruleModifiers: finalRuleModifiers,
      isBossFloor: editIsBoss,
      enabled: editEnabled,
      reason: editReason.trim(),
    };

    try {
      await updateFloorMutation.mutateAsync({ id: editingFloor.id, data: payload });
      setEditingFloor(null);
    } catch {
      // Handled in mutation onError
    }
  };

  // Table Columns
  const columns: ColumnDef<DungeonFloorRuleDto>[] = [
    {
      header: 'Floor',
      accessorKey: 'floorNumber',
      sortable: true,
      cell: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-surface-raised border border-border flex items-center justify-center shrink-0">
            {item.isBossFloor ? (
              <Skull className="w-5 h-5 text-warning" />
            ) : (
              <Castle className="w-5 h-5 text-muted" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-foreground block">
                Floor {item.floorNumber} {item.title && `— ${item.title}`}
              </span>
              {item.isBossFloor && (
                <Badge variant="warning" className="text-[8px] py-0 px-1 font-bold">
                  BOSS
                </Badge>
              )}
              {item.isArchived && (
                <Badge variant="default" className="text-[8px] py-0 px-1 font-bold">
                  Archived
                </Badge>
              )}
            </div>
            {item.difficulty && (
              <span className="text-[10px] text-muted font-mono">{item.difficulty}</span>
            )}
          </div>
        </div>
      ),
    },
    {
      header: 'Scaling',
      accessorKey: 'scalingFactor',
      cell: (item) => (
        <span className="text-xs font-bold text-foreground font-mono">
          {item.scalingFactor}x
        </span>
      ),
    },
    {
      header: 'Rewards',
      accessorKey: 'rewardCoins',
      cell: (item) => (
        <div className="text-xs">
          <span className="text-muted block text-[10px]">
            Coins: <strong className="text-foreground">{item.rewardCoins.toLocaleString()}</strong>
          </span>
          <span className="text-muted block text-[10px]">
            Infinity Coins: <strong className="text-foreground">{item.rewardInfinityCoins.toLocaleString()}</strong>
          </span>
        </div>
      ),
    },
    {
      header: 'Modifiers',
      accessorKey: 'ruleModifiers',
      cell: (item) => {
        if (!item.ruleModifiers || Object.keys(item.ruleModifiers).length === 0) {
          return <span className="text-[10px] text-subtle font-mono">None</span>;
        }
        return (
          <Badge variant="ink" className="text-[9px] font-mono py-0.5 px-1.5 bg-surface-raised border-border">
            <Zap className="w-2.5 h-2.5 mr-1" />
            Custom
          </Badge>
        );
      },
    },
    {
      header: 'Status',
      accessorKey: 'enabled',
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
            variant={item.enabled ? 'success' : 'default'}
            className="text-[10px] font-bold py-0.5"
          >
            {item.enabled ? 'Active' : 'Disabled'}
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
            title="Edit Floor Rule"
            className="p-1.5 rounded-lg bg-surface-raised border border-border text-foreground hover:bg-surface transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          {item.isArchived ? (
            <button
              onClick={() => setRestoreTargetFloor(item)}
              title="Restore Floor"
              className="p-1.5 rounded-lg bg-surface-raised border border-border text-foreground hover:bg-surface transition-colors"
            >
              <ArchiveRestore className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => setArchiveTargetFloor(item)}
              title="Archive Floor"
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
            <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">Tower & Void Rifts</h1>
            <Badge variant="ink" className="text-[10px] font-black uppercase">
              Dungeon Content
            </Badge>
          </div>
          <p className="text-xs text-muted">
            Configure floor definitions, boss encounters, difficulty scaling, rule modifiers, and reward payouts.
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-1.5 text-xs min-h-[44px] w-full sm:w-auto touch-manipulation"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Floor Rule</span>
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <button
          onClick={() => setActiveTab('INFINITY_TOWER')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors touch-manipulation ${
            activeTab === 'INFINITY_TOWER'
              ? 'bg-primary text-primary-foreground'
              : 'bg-surface border border-border text-muted hover:text-foreground'
          }`}
        >
          <Castle className="w-3.5 h-3.5" />
          <span>Infinity Tower</span>
        </button>
        <button
          onClick={() => setActiveTab('VOID_RIFT')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors touch-manipulation ${
            activeTab === 'VOID_RIFT'
              ? 'bg-primary text-primary-foreground'
              : 'bg-surface border border-border text-muted hover:text-foreground'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Void Rifts</span>
        </button>
      </div>

      {/* Filters */}
      <div className="p-3 sm:p-4 bg-surface border border-border rounded-2xl flex items-center justify-between gap-3">
        {activeTab === 'VOID_RIFT' ? (
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted shrink-0" />
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden touch-manipulation"
            >
              <option value="all">All Difficulties</option>
              {RIFT_DIFFICULTIES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <span className="text-xs text-muted">Showing all floors in sequential climb order.</span>
        )}

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden touch-manipulation"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active Only</option>
          <option value="archived">Archived Only</option>
        </select>
      </div>

      {/* Floors Data Table */}
      <DataTable
        data={filteredFloors}
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        emptyMessage={`No custom floor rules found for ${activeTab === 'INFINITY_TOWER' ? 'Infinity Tower' : 'Void Rifts'}. Procedural generation will be used.`}
      />

      {/* Create Floor Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-background/80 backdrop-blur-xs">
          <div className="bg-surface border border-border rounded-t-3xl sm:rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90dvh] pb-safe animate-in fade-in slide-in-from-bottom sm:zoom-in duration-200">
            <div className="sm:hidden mx-auto mt-3 -mb-1 h-1.5 w-12 rounded-full bg-border shrink-0" aria-hidden="true" />
            <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-foreground">
                  Add Floor Rule: {activeTab === 'INFINITY_TOWER' ? 'Infinity Tower' : 'Void Rift'}
                </h3>
                <p className="text-xs text-muted">Define specific enemy teams, boss encounters, and floor payouts.</p>
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Floor Number</label>
                  <input
                    type="text"
                    value={createFloorNum}
                    onChange={(e) => setCreateFloorNum(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden"
                  />
                </div>
                {activeTab === 'VOID_RIFT' && (
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">Difficulty</label>
                    <select
                      value={createDifficulty}
                      onChange={(e) => setCreateDifficulty(e.target.value as any)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden"
                    >
                      {RIFT_DIFFICULTIES.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Floor Title (Optional)</label>
                  <input
                    type="text"
                    value={createTitle}
                    onChange={(e) => setCreateTitle(e.target.value)}
                    placeholder="e.g. Apex Chamber"
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden"
                  />
                </div>
              </div>

              <DungeonEnemyPoolEditor
                pool={createEnemyPool}
                onChange={setCreateEnemyPool}
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Scaling Factor</label>
                  <input
                    type="text"
                    value={createScalingFactor}
                    onChange={(e) => setCreateScalingFactor(e.target.value.replace(/[^\d.]/g, ''))}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Reward Coins</label>
                  <input
                    type="text"
                    value={createRewardCoins}
                    onChange={(e) => setCreateRewardCoins(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Infinity Coins</label>
                  <input
                    type="text"
                    value={createRewardInfCoins}
                    onChange={(e) => setCreateRewardInfCoins(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden"
                  />
                </div>
              </div>

              <DungeonRewardItemsEditor
                items={createRewardItems}
                onChange={setCreateRewardItems}
              />

              <DungeonRuleModifiersEditor
                modifiers={createRuleModifiers}
                onChange={setCreateRuleModifiers}
              />

              <div className="flex items-center justify-between p-3 bg-surface-raised border border-border rounded-xl">
                <div>
                  <span className="text-xs font-bold text-foreground block">Boss Encounter</span>
                  <span className="text-[10px] text-muted">Designates this floor as a climatic boss battle</span>
                </div>
                <input
                  type="checkbox"
                  checked={createIsBoss}
                  onChange={(e) => setCreateIsBoss(e.target.checked)}
                  className="w-4 h-4 rounded border-border bg-surface text-foreground focus:ring-0 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-surface-raised border border-border rounded-xl">
                <div>
                  <span className="text-xs font-bold text-foreground block">Enabled</span>
                  <span className="text-[10px] text-muted">Active in dungeon progression</span>
                </div>
                <input
                  type="checkbox"
                  checked={createEnabled}
                  onChange={(e) => setCreateEnabled(e.target.checked)}
                  className="w-4 h-4 rounded border-border bg-surface text-foreground focus:ring-0 cursor-pointer"
                />
              </div>

              <ReasonField
                value={createReason}
                onChange={setCreateReason}
                label="Audit Reason (Mandatory)"
                helperText="Required log entry for configuring this dungeon floor rule."
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
                disabled={createFloorMutation.isPending || createReason.trim().length < 5}
                className="text-xs min-h-[44px] flex-1 sm:flex-initial touch-manipulation"
              >
                {createFloorMutation.isPending ? 'Saving...' : 'Create Floor'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Floor Modal */}
      {editingFloor && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-background/80 backdrop-blur-xs">
          <div className="bg-surface border border-border rounded-t-3xl sm:rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90dvh] pb-safe animate-in fade-in slide-in-from-bottom sm:zoom-in duration-200">
            <div className="sm:hidden mx-auto mt-3 -mb-1 h-1.5 w-12 rounded-full bg-border shrink-0" aria-hidden="true" />
            <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-foreground">
                  Edit {editingFloor.dungeonType} Floor {editingFloor.floorNumber}
                </h3>
              </div>
              <button
                onClick={() => setEditingFloor(null)}
                className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-muted hover:text-foreground touch-manipulation"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden"
                />
              </div>

              <DungeonEnemyPoolEditor
                pool={editEnemyPool}
                onChange={setEditEnemyPool}
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Scaling Factor</label>
                  <input
                    type="text"
                    value={editScalingFactor}
                    onChange={(e) => setEditScalingFactor(e.target.value.replace(/[^\d.]/g, ''))}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Reward Coins</label>
                  <input
                    type="text"
                    value={editRewardCoins}
                    onChange={(e) => setEditRewardCoins(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Infinity Coins</label>
                  <input
                    type="text"
                    value={editRewardInfCoins}
                    onChange={(e) => setEditRewardInfCoins(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden"
                  />
                </div>
              </div>

              <DungeonRewardItemsEditor
                items={editRewardItems}
                onChange={setEditRewardItems}
              />

              <DungeonRuleModifiersEditor
                modifiers={editRuleModifiers}
                onChange={setEditRuleModifiers}
              />

              <div className="flex items-center justify-between p-3 bg-surface-raised border border-border rounded-xl">
                <div>
                  <span className="text-xs font-bold text-foreground block">Boss Encounter</span>
                  <span className="text-[10px] text-muted">Designates this floor as a climatic boss battle</span>
                </div>
                <input
                  type="checkbox"
                  checked={editIsBoss}
                  onChange={(e) => setEditIsBoss(e.target.checked)}
                  className="w-4 h-4 rounded border-border bg-surface text-foreground focus:ring-0 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-surface-raised border border-border rounded-xl">
                <div>
                  <span className="text-xs font-bold text-foreground block">Enabled</span>
                  <span className="text-[10px] text-muted">Active in dungeon progression</span>
                </div>
                <input
                  type="checkbox"
                  checked={editEnabled}
                  onChange={(e) => setEditEnabled(e.target.checked)}
                  className="w-4 h-4 rounded border-border bg-surface text-foreground focus:ring-0 cursor-pointer"
                />
              </div>

              <ReasonField
                value={editReason}
                onChange={setEditReason}
                label="Audit Reason (Mandatory)"
                helperText="Required log entry explaining changes to this floor rule."
              />
            </div>

            <div className="p-3 sm:p-4 border-t border-border flex items-center justify-end gap-2 bg-surface">
              <Button
                variant="outline"
                onClick={() => setEditingFloor(null)}
                className="text-xs min-h-[44px] flex-1 sm:flex-initial touch-manipulation"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveEdit}
                disabled={updateFloorMutation.isPending || editReason.trim().length < 5}
                className="text-xs min-h-[44px] flex-1 sm:flex-initial touch-manipulation"
              >
                {updateFloorMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Archive Confirm Dialog */}
      <ConfirmDialog
        isOpen={Boolean(archiveTargetFloor)}
        onClose={() => setArchiveTargetFloor(null)}
        onConfirm={async (reason) => {
          if (!archiveTargetFloor) return;
          await archiveFloorMutation.mutateAsync({ id: archiveTargetFloor.id, data: { reason } });
          setArchiveTargetFloor(null);
        }}
        title={`Archive Floor ${archiveTargetFloor?.floorNumber}?`}
        description="This custom floor rule will be archived. The system will fall back to procedural scaling for this floor."
        confirmLabel="Archive Floor"
        isDestructive={true}
        isLoading={archiveFloorMutation.isPending}
      />

      {/* Restore Confirm Dialog */}
      <ConfirmDialog
        isOpen={Boolean(restoreTargetFloor)}
        onClose={() => setRestoreTargetFloor(null)}
        onConfirm={async (reason) => {
          if (!restoreTargetFloor) return;
          await unarchiveFloorMutation.mutateAsync({ id: restoreTargetFloor.id, data: { reason } });
          setRestoreTargetFloor(null);
        }}
        title={`Restore Floor ${restoreTargetFloor?.floorNumber}?`}
        description="This custom floor rule will be restored and take priority over procedural generation."
        confirmLabel="Restore Floor"
        isLoading={unarchiveFloorMutation.isPending}
      />
    </div>
  );
}
