import { useState, useMemo } from 'react';
import {
  useAdminArenaTrainers,
  useCreateArenaTrainer,
  useUpdateArenaTrainer,
  useArchiveArenaTrainer,
  useUnarchiveArenaTrainer,
  useAdminRanks,
  useUpdateRankDefinition,
} from '../hooks/useAdminArena';
import { DataTable, ColumnDef } from '../components/DataTable';
import { ReasonField } from '../components/ReasonField';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { PokemonTierSelect } from '../components/PokemonTierSelect';
import {
  ArenaTrainerDto,
  CreateArenaTrainerInput,
  UpdateArenaTrainerInput,
  RankDefinitionDto,
  UpdateRankDefinitionInput,
} from '@astranox/types';
import {
  Swords,
  Search,
  Filter,
  Pencil,
  Plus,
  Archive,
  ArchiveRestore,
  X,
  Award,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { notify } from '@/lib/toast';

const RANK_OPTIONS = [
  'F',
  'E',
  'D',
  'C',
  'B',
  'A',
  'S_MINUS',
  'S',
  'S_PLUS',
  'SS_MINUS',
  'SS',
  'SS_PLUS',
  'SSS_MINUS',
  'SSS',
  'SSS_PLUS',
  'EX',
];

export function Arena() {
  const [activeTab, setActiveTab] = useState<'trainers' | 'ranks'>('trainers');

  // Trainers state & filters
  const [selectedRank, setSelectedRank] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'disabled' | 'archived'>('all');

  const { data: trainers = [], isLoading: isTrainersLoading, isError: isTrainersError, refetch: refetchTrainers } =
    useAdminArenaTrainers({ isArchived: 'all' });
  const createTrainerMutation = useCreateArenaTrainer();
  const updateTrainerMutation = useUpdateArenaTrainer();
  const archiveTrainerMutation = useArchiveArenaTrainer();
  const unarchiveTrainerMutation = useUnarchiveArenaTrainer();

  // Ranks state
  const { data: ranks = [], isLoading: isRanksLoading, isError: isRanksError, refetch: refetchRanks } =
    useAdminRanks();
  const updateRankMutation = useUpdateRankDefinition();

  // Modals state
  const [isCreateTrainerOpen, setIsCreateTrainerOpen] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState<ArenaTrainerDto | null>(null);
  const [archiveTargetTrainer, setArchiveTargetTrainer] = useState<ArenaTrainerDto | null>(null);
  const [restoreTargetTrainer, setRestoreTargetTrainer] = useState<ArenaTrainerDto | null>(null);
  const [editingRank, setEditingRank] = useState<RankDefinitionDto | null>(null);

  // Create Trainer form
  const [createKey, setCreateKey] = useState('');
  const [createName, setCreateName] = useState('');
  const [createTargetRank, setCreateTargetRank] = useState('F');
  const [createLevel, setCreateLevel] = useState('20');
  const [createTeamStr, setCreateTeamStr] = useState('caterpie, scyther');
  const [createCoins, setCreateCoins] = useState('300');
  const [createXp, setCreateXp] = useState('500');
  const [createTheme, setCreateTheme] = useState('Bug');
  const [createRatingDelta, setCreateRatingDelta] = useState('25');
  const [createCooldown, setCreateCooldown] = useState('0');
  const [createEnabled, setCreateEnabled] = useState(true);
  const [createReason, setCreateReason] = useState('');

  // Edit Trainer form
  const [editName, setEditName] = useState('');
  const [editTargetRank, setEditTargetRank] = useState('F');
  const [editLevel, setEditLevel] = useState('20');
  const [editTeamStr, setEditTeamStr] = useState('');
  const [editCoins, setEditCoins] = useState('0');
  const [editXp, setEditXp] = useState('0');
  const [editTheme, setEditTheme] = useState('');
  const [editRatingDelta, setEditRatingDelta] = useState('25');
  const [editCooldown, setEditCooldown] = useState('0');
  const [editEnabled, setEditEnabled] = useState(true);
  const [editReason, setEditReason] = useState('');

  // Edit Rank form
  const [editRankName, setEditRankName] = useState('');
  const [editMinLevel, setEditMinLevel] = useState('1');
  const [editMaxLevel, setEditMaxLevel] = useState('25');
  const [editRequiredWins, setEditRequiredWins] = useState('0');
  const [editExaminerName, setEditExaminerName] = useState('');
  const [editExaminerLevel, setEditExaminerLevel] = useState('25');
  const [editExaminerAce, setEditExaminerAce] = useState('');
  const [editExaminerTeamStr, setEditExaminerTeamStr] = useState('');
  const [editRewardCoins, setEditRewardCoins] = useState('1000');
  const [editRewardXp, setEditRewardXp] = useState('2000');
  const [editRewardItemsStr, setEditRewardItemsStr] = useState('');
  const [editRankEnabled, setEditRankEnabled] = useState(true);
  const [editRankReason, setEditRankReason] = useState('');

  // Filtered trainers
  const filteredTrainers = useMemo(() => {
    return trainers.filter((t) => {
      if (selectedRank !== 'all' && t.targetRank !== selectedRank) return false;
      if (statusFilter === 'active' && (t.isArchived || !t.enabled)) return false;
      if (statusFilter === 'disabled' && (t.isArchived || t.enabled)) return false;
      if (statusFilter === 'archived' && !t.isArchived) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          t.name.toLowerCase().includes(q) ||
          t.key.toLowerCase().includes(q) ||
          t.theme.toLowerCase().includes(q) ||
          t.team.some((mon) => mon.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [trainers, selectedRank, statusFilter, searchQuery]);

  // Open Create Trainer
  const handleOpenCreateTrainer = () => {
    setCreateKey('');
    setCreateName('');
    setCreateTargetRank('F');
    setCreateLevel('20');
    setCreateTeamStr('caterpie, scyther');
    setCreateCoins('300');
    setCreateXp('500');
    setCreateTheme('Normal');
    setCreateRatingDelta('25');
    setCreateCooldown('0');
    setCreateEnabled(true);
    setCreateReason('');
    setIsCreateTrainerOpen(true);
  };

  const handleSaveCreateTrainer = async () => {
    if (!createKey.trim()) {
      notify.error('Key is required');
      return;
    }
    if (!createName.trim()) {
      notify.error('Name is required');
      return;
    }
    if (createReason.trim().length < 5) {
      notify.error('Audit reason must be at least 5 characters');
      return;
    }

    const team = createTeamStr
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    if (team.length === 0) {
      notify.error('Trainer team must include at least 1 Pokémon species');
      return;
    }

    const payload: CreateArenaTrainerInput = {
      key: createKey.trim().toLowerCase(),
      name: createName.trim(),
      targetRank: createTargetRank,
      level: parseInt(createLevel, 10) || 1,
      team,
      coins: parseInt(createCoins, 10) || 0,
      xp: parseInt(createXp, 10) || 0,
      theme: createTheme.trim(),
      ratingDelta: parseInt(createRatingDelta, 10) || 25,
      cooldownMinutes: parseInt(createCooldown, 10) || 0,
      enabled: createEnabled,
      sortOrder: 0,
      reason: createReason.trim(),
    };

    try {
      await createTrainerMutation.mutateAsync(payload);
      setIsCreateTrainerOpen(false);
    } catch {
      // Handled in mutation onError
    }
  };

  // Open Edit Trainer
  const handleOpenEditTrainer = (trainer: ArenaTrainerDto) => {
    setEditingTrainer(trainer);
    setEditName(trainer.name);
    setEditTargetRank(trainer.targetRank);
    setEditLevel(String(trainer.level));
    setEditTeamStr(trainer.team.join(', '));
    setEditCoins(String(trainer.coins));
    setEditXp(String(trainer.xp));
    setEditTheme(trainer.theme);
    setEditRatingDelta(String(trainer.ratingDelta));
    setEditCooldown(String(trainer.cooldownMinutes));
    setEditEnabled(trainer.enabled);
    setEditReason('');
  };

  const handleSaveEditTrainer = async () => {
    if (!editingTrainer) return;
    if (editReason.trim().length < 5) {
      notify.error('Audit reason must be at least 5 characters');
      return;
    }

    const team = editTeamStr
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    if (team.length === 0) {
      notify.error('Trainer team must include at least 1 Pokémon species');
      return;
    }

    const payload: UpdateArenaTrainerInput = {
      name: editName.trim(),
      targetRank: editTargetRank,
      level: parseInt(editLevel, 10) || 1,
      team,
      coins: parseInt(editCoins, 10) || 0,
      xp: parseInt(editXp, 10) || 0,
      theme: editTheme.trim(),
      ratingDelta: parseInt(editRatingDelta, 10) || 25,
      cooldownMinutes: parseInt(editCooldown, 10) || 0,
      enabled: editEnabled,
      reason: editReason.trim(),
    };

    try {
      await updateTrainerMutation.mutateAsync({ key: editingTrainer.key, data: payload });
      setEditingTrainer(null);
    } catch {
      // Handled in mutation onError
    }
  };

  // Open Edit Rank
  const handleOpenEditRank = (rankDef: RankDefinitionDto) => {
    setEditingRank(rankDef);
    setEditRankName(rankDef.name);
    setEditMinLevel(String(rankDef.minLevel));
    setEditMaxLevel(String(rankDef.maxLevel));
    setEditRequiredWins(String(rankDef.requiredWins));
    setEditExaminerName(rankDef.examinerName);
    setEditExaminerLevel(String(rankDef.examinerLevel));
    setEditExaminerAce(rankDef.examinerAce);
    setEditExaminerTeamStr(rankDef.examinerTeam.join(', '));
    setEditRewardCoins(String(rankDef.rewardCoins));
    setEditRewardXp(String(rankDef.rewardXp));
    setEditRewardItemsStr(rankDef.rewardItems.join(', '));
    setEditRankEnabled(rankDef.enabled);
    setEditRankReason('');
  };

  const handleSaveEditRank = async () => {
    if (!editingRank) return;
    if (editRankReason.trim().length < 5) {
      notify.error('Audit reason must be at least 5 characters');
      return;
    }

    const examinerTeam = editExaminerTeamStr
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    if (examinerTeam.length === 0) {
      notify.error('Examiner team must include at least 1 Pokémon species');
      return;
    }

    const rewardItems = editRewardItemsStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload: UpdateRankDefinitionInput = {
      name: editRankName.trim(),
      minLevel: parseInt(editMinLevel, 10) || 1,
      maxLevel: parseInt(editMaxLevel, 10) || 100,
      requiredWins: parseInt(editRequiredWins, 10) || 0,
      examinerName: editExaminerName.trim(),
      examinerLevel: parseInt(editExaminerLevel, 10) || 50,
      examinerAce: editExaminerAce.trim().toLowerCase(),
      examinerTeam,
      rewardCoins: parseInt(editRewardCoins, 10) || 0,
      rewardXp: parseInt(editRewardXp, 10) || 0,
      rewardItems,
      enabled: editRankEnabled,
      reason: editRankReason.trim(),
    };

    try {
      await updateRankMutation.mutateAsync({ rank: editingRank.rank, data: payload });
      setEditingRank(null);
    } catch {
      // Handled in mutation onError
    }
  };

  // Trainer Columns
  const trainerColumns: ColumnDef<ArenaTrainerDto>[] = [
    {
      header: 'Trainer',
      accessorKey: 'name',
      sortable: true,
      cell: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-surface-raised border border-border flex items-center justify-center shrink-0">
            <Swords className="w-5 h-5 text-muted" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-foreground block">{item.name}</span>
              {item.isArchived && (
                <Badge variant="warning" className="text-[8px] py-0 px-1 font-bold">
                  Archived
                </Badge>
              )}
            </div>
            <span className="text-[10px] text-muted font-mono">{item.key}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Rank & Level',
      accessorKey: 'targetRank',
      sortable: true,
      cell: (item) => (
        <div className="flex flex-col gap-0.5">
          <Badge variant="ink" className="text-[9px] font-black w-fit bg-surface-raised border-border">
            Rank {item.targetRank.replace('_MINUS', '-').replace('_PLUS', '+')}
          </Badge>
          <span className="text-[10px] text-muted">Level {item.level}</span>
        </div>
      ),
    },
    {
      header: 'Team & Theme',
      accessorKey: 'theme',
      cell: (item) => (
        <div>
          <span className="text-xs font-bold text-foreground block">{item.theme}</span>
          <span className="text-[10px] text-muted capitalize truncate max-w-xs block font-mono">
            {item.team.join(', ')}
          </span>
        </div>
      ),
    },
    {
      header: 'Payouts',
      accessorKey: 'coins',
      cell: (item) => (
        <div className="text-xs">
          <span className="text-muted block text-[10px]">
            Coins: <strong className="text-foreground">{item.coins.toLocaleString()}</strong>
          </span>
          <span className="text-muted block text-[10px]">
            XP: <strong className="text-foreground">{item.xp.toLocaleString()}</strong>
          </span>
        </div>
      ),
    },
    {
      header: 'Delta / CD',
      accessorKey: 'ratingDelta',
      cell: (item) => (
        <div className="text-xs">
          <span className="text-muted block text-[10px]">
            +{item.ratingDelta} rating
          </span>
          <span className="text-muted block text-[10px]">
            {item.cooldownMinutes > 0 ? `${item.cooldownMinutes}m cooldown` : 'No cooldown'}
          </span>
        </div>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'enabled',
      cell: (item) => {
        if (item.isArchived) {
          return (
            <Badge variant="warning" className="text-[10px] font-bold py-0.5">
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
            onClick={() => handleOpenEditTrainer(item)}
            title="Edit Trainer"
            className="p-1.5 rounded-lg bg-surface-raised border border-border text-foreground hover:bg-surface transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          {item.isArchived ? (
            <button
              onClick={() => setRestoreTargetTrainer(item)}
              title="Restore Trainer"
              className="p-1.5 rounded-lg bg-surface-raised border border-border text-foreground hover:bg-surface transition-colors"
            >
              <ArchiveRestore className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => setArchiveTargetTrainer(item)}
              title="Archive Trainer"
              className="p-1.5 rounded-lg bg-surface-raised border border-border text-muted hover:text-danger transition-colors"
            >
              <Archive className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ),
    },
  ];

  // Rank Columns
  const rankColumns: ColumnDef<RankDefinitionDto>[] = [
    {
      header: 'Rank',
      accessorKey: 'rank',
      cell: (r) => (
        <Badge variant="ink" className="text-xs font-black bg-surface-raised border-border">
          {r.name}
        </Badge>
      ),
    },
    {
      header: 'Level Requirements',
      accessorKey: 'minLevel',
      cell: (r) => (
        <div className="text-xs">
          <span className="font-bold text-foreground block">
            Lv. {r.minLevel} - {r.maxLevel}
          </span>
          <span className="text-[10px] text-muted">{r.requiredWins} wins needed</span>
        </div>
      ),
    },
    {
      header: 'Examiner & Ace',
      accessorKey: 'examinerName',
      cell: (r) => (
        <div>
          <span className="text-xs font-bold text-foreground block">
            {r.examinerName} (Lv. {r.examinerLevel})
          </span>
          <span className="text-[10px] text-muted font-mono capitalize">
            Ace: {r.examinerAce} | Team: {r.examinerTeam.join(', ')}
          </span>
        </div>
      ),
    },
    {
      header: 'Promotion Rewards',
      accessorKey: 'rewardCoins',
      cell: (r) => (
        <div className="text-xs">
          <span className="text-muted block text-[10px]">
            Coins: <strong className="text-foreground">{r.rewardCoins.toLocaleString()}</strong> | XP:{' '}
            <strong className="text-foreground">{r.rewardXp.toLocaleString()}</strong>
          </span>
          {r.rewardItems.length > 0 ? (
            <span className="text-[10px] text-muted font-mono block">
              Items: {r.rewardItems.join(', ')}
            </span>
          ) : (
            <span className="text-[10px] text-subtle font-mono block">No items</span>
          )}
        </div>
      ),
    },
    {
      header: 'Actions',
      accessorKey: 'id',
      className: 'text-right',
      cell: (r) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => handleOpenEditRank(r)}
            title="Edit Rank Definition"
            className="p-1.5 rounded-lg bg-surface-raised border border-border text-foreground hover:bg-surface transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
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
            <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">Arena & Rank Up</h1>
            <Badge variant="ink" className="text-[10px] font-black uppercase">
              Zero-Deploy Battles
            </Badge>
          </div>
          <p className="text-xs text-muted">
            Configure arena combatants, rank progression examiners, level gates, and promotion rewards.
          </p>
        </div>
        {activeTab === 'trainers' && (
          <Button
            onClick={handleOpenCreateTrainer}
            className="flex items-center justify-center gap-1.5 text-xs min-h-[44px] w-full sm:w-auto touch-manipulation"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Trainer</span>
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <button
          onClick={() => setActiveTab('trainers')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors touch-manipulation ${
            activeTab === 'trainers'
              ? 'bg-primary text-primary-foreground'
              : 'bg-surface border border-border text-muted hover:text-foreground'
          }`}
        >
          <Swords className="w-3.5 h-3.5" />
          <span>Arena Trainers</span>
        </button>
        <button
          onClick={() => setActiveTab('ranks')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors touch-manipulation ${
            activeTab === 'ranks'
              ? 'bg-primary text-primary-foreground'
              : 'bg-surface border border-border text-muted hover:text-foreground'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Rank Definitions & Examiners</span>
        </button>
      </div>

      {activeTab === 'trainers' ? (
        <div className="space-y-4">
          {/* Trainer Filters */}
          <div className="p-3 sm:p-4 bg-surface border border-border rounded-2xl space-y-3">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search trainers by name, key, theme, or pokemon species..."
                  className="w-full pl-9 pr-4 py-2.5 min-h-[44px] bg-background border border-border rounded-xl text-base sm:text-xs text-foreground placeholder:text-muted focus:outline-hidden touch-manipulation"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="w-4 h-4 text-muted shrink-0" />
                <select
                  value={selectedRank}
                  onChange={(e) => setSelectedRank(e.target.value)}
                  className="px-3 py-2.5 min-h-[44px] bg-background border border-border rounded-xl text-base sm:text-xs text-foreground focus:outline-hidden touch-manipulation"
                >
                  <option value="all">All Ranks</option>
                  {RANK_OPTIONS.map((r) => (
                    <option key={r} value={r}>
                      Rank {r.replace('_MINUS', '-').replace('_PLUS', '+')}
                    </option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-3 py-2.5 min-h-[44px] bg-background border border-border rounded-xl text-base sm:text-xs text-foreground focus:outline-hidden touch-manipulation"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active Only</option>
                  <option value="disabled">Disabled Only</option>
                  <option value="archived">Archived Only</option>
                </select>
              </div>
            </div>
          </div>

          {/* Trainers Data Table */}
          <DataTable
            data={filteredTrainers}
            columns={trainerColumns}
            isLoading={isTrainersLoading}
            isError={isTrainersError}
            onRetry={refetchTrainers}
            emptyMessage="No Arena Trainers found matching your filters."
          />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Ranks Data Table */}
          <DataTable
            data={ranks}
            columns={rankColumns}
            isLoading={isRanksLoading}
            isError={isRanksError}
            onRetry={refetchRanks}
            emptyMessage="No rank definitions loaded."
          />
        </div>
      )}

      {/* Create Trainer Modal */}
      {isCreateTrainerOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-background/80 backdrop-blur-xs">
          <div className="bg-surface border border-border rounded-t-3xl sm:rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90dvh] pb-safe animate-in fade-in slide-in-from-bottom sm:zoom-in duration-200">
            <div className="sm:hidden mx-auto mt-3 -mb-1 h-1.5 w-12 rounded-full bg-border shrink-0" aria-hidden="true" />
            <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-foreground">Add Arena Trainer</h3>
                <p className="text-xs text-muted">Create a new arena challenger for players.</p>
              </div>
              <button
                onClick={() => setIsCreateTrainerOpen(false)}
                className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-muted hover:text-foreground touch-manipulation"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Trainer Key (Slug)</label>
                  <input
                    type="text"
                    value={createKey}
                    onChange={(e) => setCreateKey(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '_'))}
                    placeholder="e.g. f_minus_2"
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground font-mono focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Display Name</label>
                  <input
                    type="text"
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    placeholder="e.g. Ace Trainer Maya"
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Target Rank</label>
                  <select
                    value={createTargetRank}
                    onChange={(e) => setCreateTargetRank(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden"
                  >
                    {RANK_OPTIONS.map((r) => (
                      <option key={r} value={r}>
                        Rank {r.replace('_MINUS', '-').replace('_PLUS', '+')}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Level</label>
                  <input
                    type="text"
                    value={createLevel}
                    onChange={(e) => setCreateLevel(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Theme</label>
                  <input
                    type="text"
                    value={createTheme}
                    onChange={(e) => setCreateTheme(e.target.value)}
                    placeholder="e.g. Electric"
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-foreground">
                  Team Pokémon (Up to 6)
                </label>
                <PokemonTierSelect
                  compact
                  placeholder="Select Pokémon from Database (Tier-wise) to add to team..."
                  onSelect={(s) => {
                    const current = createTeamStr ? createTeamStr.split(',').map((x) => x.trim()).filter(Boolean) : [];
                    if (current.length >= 6) {
                      notify.error('Maximum of 6 Pokémon allowed per team');
                      return;
                    }
                    if (!current.includes(s.name.toLowerCase())) {
                      current.push(s.name.toLowerCase());
                      setCreateTeamStr(current.join(', '));
                    }
                  }}
                />
                <input
                  type="text"
                  value={createTeamStr}
                  onChange={(e) => setCreateTeamStr(e.target.value)}
                  placeholder="e.g. pikachu, raichu, electabuzz"
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden font-mono"
                />
                <span className="text-[10px] text-muted">Pick from tier-wise dropdown above or edit comma-separated names.</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Coin Payout</label>
                  <input
                    type="text"
                    value={createCoins}
                    onChange={(e) => setCreateCoins(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">XP Payout</label>
                  <input
                    type="text"
                    value={createXp}
                    onChange={(e) => setCreateXp(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Rating Delta</label>
                  <input
                    type="text"
                    value={createRatingDelta}
                    onChange={(e) => setCreateRatingDelta(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Cooldown (Mins)</label>
                  <input
                    type="text"
                    value={createCooldown}
                    onChange={(e) => setCreateCooldown(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-surface-raised border border-border rounded-xl">
                <div>
                  <span className="text-xs font-bold text-foreground block">Enabled in Arena</span>
                  <span className="text-[10px] text-muted">Make available for players to challenge</span>
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
                helperText="Required log entry for creating this arena challenger."
              />
            </div>

            <div className="p-3 sm:p-4 border-t border-border flex items-center justify-end gap-2 bg-surface">
              <Button
                variant="outline"
                onClick={() => setIsCreateTrainerOpen(false)}
                className="text-xs min-h-[44px] flex-1 sm:flex-initial touch-manipulation"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveCreateTrainer}
                disabled={
                  createTrainerMutation.isPending ||
                  !createKey.trim() ||
                  !createName.trim() ||
                  createReason.trim().length < 5
                }
                className="text-xs min-h-[44px] flex-1 sm:flex-initial touch-manipulation"
              >
                {createTrainerMutation.isPending ? 'Creating...' : 'Create Trainer'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Trainer Modal */}
      {editingTrainer && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-background/80 backdrop-blur-xs">
          <div className="bg-surface border border-border rounded-t-3xl sm:rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90dvh] pb-safe animate-in fade-in slide-in-from-bottom sm:zoom-in duration-200">
            <div className="sm:hidden mx-auto mt-3 -mb-1 h-1.5 w-12 rounded-full bg-border shrink-0" aria-hidden="true" />
            <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-foreground">Edit Trainer: {editingTrainer.name}</h3>
                <span className="text-[10px] text-muted font-mono">{editingTrainer.key}</span>
              </div>
              <button
                onClick={() => setEditingTrainer(null)}
                className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-muted hover:text-foreground touch-manipulation"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Display Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Target Rank</label>
                  <select
                    value={editTargetRank}
                    onChange={(e) => setEditTargetRank(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden"
                  >
                    {RANK_OPTIONS.map((r) => (
                      <option key={r} value={r}>
                        Rank {r.replace('_MINUS', '-').replace('_PLUS', '+')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Level</label>
                  <input
                    type="text"
                    value={editLevel}
                    onChange={(e) => setEditLevel(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Theme</label>
                  <input
                    type="text"
                    value={editTheme}
                    onChange={(e) => setEditTheme(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-foreground">
                  Team Pokémon (Up to 6)
                </label>
                <PokemonTierSelect
                  compact
                  placeholder="Select Pokémon from Database (Tier-wise) to add to team..."
                  onSelect={(s) => {
                    const current = editTeamStr ? editTeamStr.split(',').map((x) => x.trim()).filter(Boolean) : [];
                    if (current.length >= 6) {
                      notify.error('Maximum of 6 Pokémon allowed per team');
                      return;
                    }
                    if (!current.includes(s.name.toLowerCase())) {
                      current.push(s.name.toLowerCase());
                      setEditTeamStr(current.join(', '));
                    }
                  }}
                />
                <input
                  type="text"
                  value={editTeamStr}
                  onChange={(e) => setEditTeamStr(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden font-mono"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Coins</label>
                  <input
                    type="text"
                    value={editCoins}
                    onChange={(e) => setEditCoins(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">XP</label>
                  <input
                    type="text"
                    value={editXp}
                    onChange={(e) => setEditXp(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Rating Delta</label>
                  <input
                    type="text"
                    value={editRatingDelta}
                    onChange={(e) => setEditRatingDelta(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Cooldown (Mins)</label>
                  <input
                    type="text"
                    value={editCooldown}
                    onChange={(e) => setEditCooldown(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-surface-raised border border-border rounded-xl">
                <div>
                  <span className="text-xs font-bold text-foreground block">Enabled in Arena</span>
                  <span className="text-[10px] text-muted">Player can battle this trainer</span>
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
                helperText="Required log entry explaining changes to this arena trainer."
              />
            </div>

            <div className="p-3 sm:p-4 border-t border-border flex items-center justify-end gap-2 bg-surface">
              <Button
                variant="outline"
                onClick={() => setEditingTrainer(null)}
                className="text-xs min-h-[44px] flex-1 sm:flex-initial touch-manipulation"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveEditTrainer}
                disabled={updateTrainerMutation.isPending || editReason.trim().length < 5}
                className="text-xs min-h-[44px] flex-1 sm:flex-initial touch-manipulation"
              >
                {updateTrainerMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Rank Modal */}
      {editingRank && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-background/80 backdrop-blur-xs">
          <div className="bg-surface border border-border rounded-t-3xl sm:rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90dvh] pb-safe animate-in fade-in slide-in-from-bottom sm:zoom-in duration-200">
            <div className="sm:hidden mx-auto mt-3 -mb-1 h-1.5 w-12 rounded-full bg-border shrink-0" aria-hidden="true" />
            <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-foreground">Edit Rank: {editingRank.name}</h3>
                <span className="text-[10px] text-muted font-mono">{editingRank.rank}</span>
              </div>
              <button
                onClick={() => setEditingRank(null)}
                className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-muted hover:text-foreground touch-manipulation"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Rank Title</label>
                  <input
                    type="text"
                    value={editRankName}
                    onChange={(e) => setEditRankName(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Min Level</label>
                  <input
                    type="text"
                    value={editMinLevel}
                    onChange={(e) => setEditMinLevel(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Max Level</label>
                  <input
                    type="text"
                    value={editMaxLevel}
                    onChange={(e) => setEditMaxLevel(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Required Arena Wins</label>
                <input
                  type="text"
                  value={editRequiredWins}
                  onChange={(e) => setEditRequiredWins(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden"
                />
              </div>

              <div className="pt-2 border-t border-border/60 space-y-3">
                <span className="block text-xs font-black text-foreground uppercase tracking-wider">
                  Promotion Examiner Configuration
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">Examiner Name</label>
                    <input
                      type="text"
                      value={editExaminerName}
                      onChange={(e) => setEditExaminerName(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">Examiner Level</label>
                    <input
                      type="text"
                      value={editExaminerLevel}
                      onChange={(e) => setEditExaminerLevel(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">Ace Pokémon</label>
                    <input
                      type="text"
                      value={editExaminerAce}
                      onChange={(e) => setEditExaminerAce(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-foreground">Examiner Team (Comma-separated)</label>
                  <PokemonTierSelect
                    compact
                    placeholder="Select Pokémon from Database (Tier-wise) to add..."
                    onSelect={(s) => {
                      const current = editExaminerTeamStr ? editExaminerTeamStr.split(',').map((x) => x.trim()).filter(Boolean) : [];
                      if (current.length >= 6) {
                        notify.error('Maximum of 6 Pokémon allowed per team');
                        return;
                      }
                      if (!current.includes(s.name.toLowerCase())) {
                        current.push(s.name.toLowerCase());
                        setEditExaminerTeamStr(current.join(', '));
                      }
                    }}
                  />
                  <input
                    type="text"
                    value={editExaminerTeamStr}
                    onChange={(e) => setEditExaminerTeamStr(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-border/60 space-y-3">
                <span className="block text-xs font-black text-foreground uppercase tracking-wider">
                  Promotion Rewards
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    <label className="block text-xs font-bold text-foreground mb-1">Reward XP</label>
                    <input
                      type="text"
                      value={editRewardXp}
                      onChange={(e) => setEditRewardXp(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Reward Items (Comma-separated keys)</label>
                  <input
                    type="text"
                    value={editRewardItemsStr}
                    onChange={(e) => setEditRewardItemsStr(e.target.value)}
                    placeholder="e.g. Bronze Pearl, Silver Pearl"
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <ReasonField
                value={editRankReason}
                onChange={setEditRankReason}
                label="Audit Reason (Mandatory)"
                helperText="Required log entry explaining changes to this rank definition."
              />
            </div>

            <div className="p-3 sm:p-4 border-t border-border flex items-center justify-end gap-2 bg-surface">
              <Button
                variant="outline"
                onClick={() => setEditingRank(null)}
                className="text-xs min-h-[44px] flex-1 sm:flex-initial touch-manipulation"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveEditRank}
                disabled={updateRankMutation.isPending || editRankReason.trim().length < 5}
                className="text-xs min-h-[44px] flex-1 sm:flex-initial touch-manipulation"
              >
                {updateRankMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Archive Trainer Confirm Dialog */}
      <ConfirmDialog
        isOpen={Boolean(archiveTargetTrainer)}
        onClose={() => setArchiveTargetTrainer(null)}
        onConfirm={async (reason) => {
          if (!archiveTargetTrainer) return;
          await archiveTrainerMutation.mutateAsync({ key: archiveTargetTrainer.key, data: { reason } });
          setArchiveTargetTrainer(null);
        }}
        title={`Archive "${archiveTargetTrainer?.name}"?`}
        description="This trainer will be removed from the active arena challenge pool."
        confirmLabel="Archive Trainer"
        isDestructive={true}
        isLoading={archiveTrainerMutation.isPending}
      />

      {/* Restore Trainer Confirm Dialog */}
      <ConfirmDialog
        isOpen={Boolean(restoreTargetTrainer)}
        onClose={() => setRestoreTargetTrainer(null)}
        onConfirm={async (reason) => {
          if (!restoreTargetTrainer) return;
          await unarchiveTrainerMutation.mutateAsync({ key: restoreTargetTrainer.key, data: { reason } });
          setRestoreTargetTrainer(null);
        }}
        title={`Restore "${restoreTargetTrainer?.name}"?`}
        description="This trainer will be restored and made available in the arena challenge pool again."
        confirmLabel="Restore Trainer"
        isLoading={unarchiveTrainerMutation.isPending}
      />
    </div>
  );
}
