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
  X,
  Zap,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { notify } from '@/lib/toast';

const RIFT_DIFFICULTIES = ['NORMAL', 'HARD', 'NIGHTMARE', 'ABYSS'] as const;

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
  const [createEnemyPoolStr, setCreateEnemyPoolStr] = useState('[\n  { "speciesId": 25, "name": "pikachu", "level": 50 }\n]');
  const [createScalingFactor, setCreateScalingFactor] = useState('1.0');
  const [createRewardCoins, setCreateRewardCoins] = useState('1000');
  const [createRewardInfCoins, setCreateRewardInfCoins] = useState('10');
  const [createRewardItemsStr, setCreateRewardItemsStr] = useState('[]');
  const [createRuleModifiersStr, setCreateRuleModifiersStr] = useState('{}');
  const [createIsBoss, setCreateIsBoss] = useState(false);
  const [createEnabled, setCreateEnabled] = useState(true);
  const [createReason, setCreateReason] = useState('');

  // Edit form
  const [editTitle, setEditTitle] = useState('');
  const [editEnemyPoolStr, setEditEnemyPoolStr] = useState('[]');
  const [editScalingFactor, setEditScalingFactor] = useState('1.0');
  const [editRewardCoins, setEditRewardCoins] = useState('0');
  const [editRewardInfCoins, setEditRewardInfCoins] = useState('0');
  const [editRewardItemsStr, setEditRewardItemsStr] = useState('[]');
  const [editRuleModifiersStr, setEditRuleModifiersStr] = useState('{}');
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
    setCreateEnemyPoolStr('[\n  { "speciesId": 25, "name": "pikachu", "level": 50 }\n]');
    setCreateScalingFactor('1.0');
    setCreateRewardCoins('1000');
    setCreateRewardInfCoins('10');
    setCreateRewardItemsStr('[]');
    setCreateRuleModifiersStr('{}');
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

    let parsedPool: any;
    try {
      parsedPool = JSON.parse(createEnemyPoolStr);
    } catch {
      notify.error('Invalid JSON for enemy pool');
      return;
    }

    let parsedRewardItems: any = null;
    if (createRewardItemsStr.trim()) {
      try {
        parsedRewardItems = JSON.parse(createRewardItemsStr);
      } catch {
        notify.error('Invalid JSON for reward items');
        return;
      }
    }

    let parsedModifiers: any = null;
    if (createRuleModifiersStr.trim()) {
      try {
        parsedModifiers = JSON.parse(createRuleModifiersStr);
      } catch {
        notify.error('Invalid JSON for rule modifiers');
        return;
      }
    }

    const payload: CreateDungeonFloorRuleInput = {
      dungeonType: activeTab,
      floorNumber: parseInt(createFloorNum, 10) || 1,
      difficulty: activeTab === 'VOID_RIFT' ? createDifficulty : null,
      title: createTitle.trim() || null,
      enemyPool: parsedPool,
      scalingFactor: parseFloat(createScalingFactor) || 1.0,
      rewardCoins: parseInt(createRewardCoins, 10) || 0,
      rewardInfinityCoins: parseInt(createRewardInfCoins, 10) || 0,
      rewardItems: parsedRewardItems,
      ruleModifiers: parsedModifiers,
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
    setEditEnemyPoolStr(JSON.stringify(floor.enemyPool, null, 2));
    setEditScalingFactor(String(floor.scalingFactor));
    setEditRewardCoins(String(floor.rewardCoins));
    setEditRewardInfCoins(String(floor.rewardInfinityCoins));
    setEditRewardItemsStr(floor.rewardItems ? JSON.stringify(floor.rewardItems, null, 2) : '[]');
    setEditRuleModifiersStr(floor.ruleModifiers ? JSON.stringify(floor.ruleModifiers, null, 2) : '{}');
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

    let parsedPool: any;
    try {
      parsedPool = JSON.parse(editEnemyPoolStr);
    } catch {
      notify.error('Invalid JSON for enemy pool');
      return;
    }

    let parsedRewardItems: any = null;
    if (editRewardItemsStr.trim()) {
      try {
        parsedRewardItems = JSON.parse(editRewardItemsStr);
      } catch {
        notify.error('Invalid JSON for reward items');
        return;
      }
    }

    let parsedModifiers: any = null;
    if (editRuleModifiersStr.trim()) {
      try {
        parsedModifiers = JSON.parse(editRuleModifiersStr);
      } catch {
        notify.error('Invalid JSON for rule modifiers');
        return;
      }
    }

    const payload: UpdateDungeonFloorRuleInput = {
      title: editTitle.trim() || null,
      enemyPool: parsedPool,
      scalingFactor: parseFloat(editScalingFactor) || 1.0,
      rewardCoins: parseInt(editRewardCoins, 10) || 0,
      rewardInfinityCoins: parseInt(editRewardInfCoins, 10) || 0,
      rewardItems: parsedRewardItems,
      ruleModifiers: parsedModifiers,
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

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Enemy Pool / Team (JSON array of species and levels)
                </label>
                <textarea
                  value={createEnemyPoolStr}
                  onChange={(e) => setCreateEnemyPoolStr(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs font-mono text-foreground focus:outline-hidden resize-none"
                />
              </div>

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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Reward Items (JSON)</label>
                  <textarea
                    value={createRewardItemsStr}
                    onChange={(e) => setCreateRewardItemsStr(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs font-mono text-foreground focus:outline-hidden resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Rule Modifiers (JSON)</label>
                  <textarea
                    value={createRuleModifiersStr}
                    onChange={(e) => setCreateRuleModifiersStr(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs font-mono text-foreground focus:outline-hidden resize-none"
                  />
                </div>
              </div>

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

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Enemy Pool / Team (JSON)
                </label>
                <textarea
                  value={editEnemyPoolStr}
                  onChange={(e) => setEditEnemyPoolStr(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs font-mono text-foreground focus:outline-hidden resize-none"
                />
              </div>

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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Reward Items (JSON)</label>
                  <textarea
                    value={editRewardItemsStr}
                    onChange={(e) => setEditRewardItemsStr(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs font-mono text-foreground focus:outline-hidden resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Rule Modifiers (JSON)</label>
                  <textarea
                    value={editRuleModifiersStr}
                    onChange={(e) => setEditRuleModifiersStr(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs font-mono text-foreground focus:outline-hidden resize-none"
                  />
                </div>
              </div>

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
