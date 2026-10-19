import { useState, useMemo } from 'react';
import {
  useAdminShopItems,
  useCreateShopItem,
  useUpdateShopItem,
  useArchiveShopItem,
  useUnarchiveShopItem,
  useBulkPriceUpdate,
  useShopPriceHistory,
  useResetShopItem,
} from '../hooks/useAdminShop';
import { DataTable, ColumnDef } from '../components/DataTable';
import { PriceInput } from '../components/PriceInput';
import { ReasonField } from '../components/ReasonField';
import { DateRangeField } from '../components/DateRangeField';
import { ConfirmDialog } from '../components/ConfirmDialog';
import {
  ShopItemDto,
  BulkPricePreviewItem,
  CreateShopItemInput,
  UpdateShopItemInput,
} from '@astranox/types';
import { SHOP_CATEGORIES, ShopCategory } from '@astranox/constants';
import {
  Store,
  Search,
  Filter,
  History,
  RotateCcw,
  Pencil,
  Sparkles,
  AlertTriangle,
  X,
  Percent,
  Plus,
  Archive,
  ArchiveRestore,
  Zap,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { notify } from '@/lib/toast';

interface EffectConfigState {
  catchMultiplier: string;
  xpAmount: string;
  levels: string;
  ivStat: string;
  potentialTier: string;
}

const DEFAULT_EFFECT_CONFIG: EffectConfigState = {
  catchMultiplier: '2.0',
  xpAmount: '1000',
  levels: '1',
  ivStat: 'all',
  potentialTier: 'S',
};

const EFFECT_PRESETS: { type: string; label: string }[] = [
  { type: 'NONE', label: 'None (Standard Item)' },
  { type: 'POKEBALL', label: 'Poké Ball (Catch Rate)' },
  { type: 'GIVE_XP', label: 'Give Experience Points (XP)' },
  { type: 'LEVEL_UP', label: 'Level Up Pokémon' },
  { type: 'IV_MAX', label: 'Maximize Individual Values (IVs)' },
  { type: 'POTENTIAL_UP', label: 'Upgrade Potential Tier' },
];

function serializeEffectConfig(type: string, cfg: EffectConfigState): Record<string, unknown> | null {
  switch (type) {
    case 'POKEBALL':
      return { catchMultiplier: parseFloat(cfg.catchMultiplier) || 2.0 };
    case 'GIVE_XP':
      return { xpAmount: parseInt(cfg.xpAmount, 10) || 1000 };
    case 'LEVEL_UP':
      return { levels: parseInt(cfg.levels, 10) || 1 };
    case 'IV_MAX':
      return { stat: cfg.ivStat || 'all' };
    case 'POTENTIAL_UP':
      return { guaranteeTier: cfg.potentialTier || 'S' };
    default:
      return null;
  }
}

function deserializeEffectConfig(rawConfig: any): EffectConfigState {
  return {
    catchMultiplier: String(rawConfig?.catchMultiplier ?? '2.0'),
    xpAmount: String(rawConfig?.xpAmount ?? '1000'),
    levels: String(rawConfig?.levels ?? '1'),
    ivStat: String(rawConfig?.stat ?? 'all'),
    potentialTier: String(rawConfig?.guaranteeTier ?? 'S'),
  };
}

function EffectConfigFields({
  effectType,
  config,
  onChange,
}: {
  effectType: string;
  config: EffectConfigState;
  onChange: (cfg: EffectConfigState) => void;
}) {
  if (effectType === 'NONE') {
    return (
      <div className="p-3 bg-surface-raised border border-border rounded-xl text-xs text-muted">
        Standard catalog item with no active battle or instance script.
      </div>
    );
  }

  if (effectType === 'POKEBALL') {
    const multipliers = ['1.0', '1.5', '2.0', '2.5', '3.0', '5.0', '255.0'];
    return (
      <div className="p-3 bg-surface-raised border border-border rounded-xl space-y-2.5">
        <label className="block text-xs font-bold text-foreground">Catch Rate Multiplier</label>
        <div className="flex flex-wrap items-center gap-1.5">
          {multipliers.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => onChange({ ...config, catchMultiplier: m })}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-colors ${
                config.catchMultiplier === m
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-surface border-border text-muted hover:text-foreground'
              }`}
            >
              {m}x
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted">Custom:</span>
          <input
            type="text"
            value={config.catchMultiplier}
            onChange={(e) => onChange({ ...config, catchMultiplier: e.target.value.replace(/[^\d.]/g, '') })}
            placeholder="2.0"
            className="w-24 px-2.5 py-1 bg-surface border border-border rounded-lg text-xs font-mono text-foreground focus:outline-hidden"
          />
          <span className="text-xs text-muted font-bold">x multiplier</span>
        </div>
      </div>
    );
  }

  if (effectType === 'GIVE_XP') {
    const amounts = ['500', '1000', '5000', '10000', '50000'];
    return (
      <div className="p-3 bg-surface-raised border border-border rounded-xl space-y-2.5">
        <label className="block text-xs font-bold text-foreground">Experience Points (XP)</label>
        <div className="flex flex-wrap items-center gap-1.5">
          {amounts.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => onChange({ ...config, xpAmount: a })}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-colors ${
                config.xpAmount === a
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-surface border-border text-muted hover:text-foreground'
              }`}
            >
              +{Number(a).toLocaleString()} XP
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted">Custom:</span>
          <input
            type="text"
            value={config.xpAmount}
            onChange={(e) => onChange({ ...config, xpAmount: e.target.value.replace(/\D/g, '') })}
            placeholder="1000"
            className="w-32 px-2.5 py-1 bg-surface border border-border rounded-lg text-xs font-mono text-foreground focus:outline-hidden"
          />
          <span className="text-xs text-muted font-bold">XP points</span>
        </div>
      </div>
    );
  }

  if (effectType === 'LEVEL_UP') {
    const levelsList = ['1', '2', '3', '5', '10'];
    return (
      <div className="p-3 bg-surface-raised border border-border rounded-xl space-y-2.5">
        <label className="block text-xs font-bold text-foreground">Levels to Add</label>
        <div className="flex flex-wrap items-center gap-1.5">
          {levelsList.map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => onChange({ ...config, levels: lvl })}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-colors ${
                config.levels === lvl
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-surface border-border text-muted hover:text-foreground'
              }`}
            >
              +{lvl} {Number(lvl) === 1 ? 'Level' : 'Levels'}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted">Custom:</span>
          <input
            type="text"
            value={config.levels}
            onChange={(e) => onChange({ ...config, levels: e.target.value.replace(/\D/g, '') })}
            placeholder="1"
            className="w-20 px-2.5 py-1 bg-surface border border-border rounded-lg text-xs font-mono text-foreground focus:outline-hidden"
          />
          <span className="text-xs text-muted font-bold">levels</span>
        </div>
      </div>
    );
  }

  if (effectType === 'IV_MAX') {
    const stats = [
      { id: 'all', label: 'All Stats (Perfect 31)' },
      { id: 'hp', label: 'HP' },
      { id: 'attack', label: 'Attack' },
      { id: 'defense', label: 'Defense' },
      { id: 'special-attack', label: 'Sp. Atk' },
      { id: 'special-defense', label: 'Sp. Def' },
      { id: 'speed', label: 'Speed' },
    ];
    return (
      <div className="p-3 bg-surface-raised border border-border rounded-xl space-y-2.5">
        <label className="block text-xs font-bold text-foreground">Target IV Stat to Maximize</label>
        <div className="flex flex-wrap items-center gap-1.5">
          {stats.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onChange({ ...config, ivStat: s.id })}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-colors ${
                config.ivStat === s.id
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-surface border-border text-muted hover:text-foreground'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (effectType === 'POTENTIAL_UP') {
    const tiers = ['D', 'C', 'B', 'A', 'S-', 'S', 'S+', 'SS-', 'SS', 'SS+', 'SSS-', 'SSS', 'SSS+'];
    return (
      <div className="p-3 bg-surface-raised border border-border rounded-xl space-y-2.5">
        <label className="block text-xs font-bold text-foreground">Guaranteed Potential Tier</label>
        <div className="flex flex-wrap items-center gap-1.5">
          {tiers.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onChange({ ...config, potentialTier: t })}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-colors ${
                config.potentialTier === t
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-surface border-border text-muted hover:text-foreground'
              }`}
            >
              Tier {t}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return null;
}

export function Shop() {
  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'disabled' | 'archived'>('all');

  // Queries & Mutations
  const { data: items = [], isLoading, isError, refetch } = useAdminShopItems({ isArchived: 'all' });
  const createMutation = useCreateShopItem();
  const updateMutation = useUpdateShopItem();
  const archiveMutation = useArchiveShopItem();
  const unarchiveMutation = useUnarchiveShopItem();
  const bulkMutation = useBulkPriceUpdate();
  const resetMutation = useResetShopItem();

  // Selection state for bulk operations
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  // Modals & Drawers state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ShopItemDto | null>(null);
  const [archiveTargetItem, setArchiveTargetItem] = useState<ShopItemDto | null>(null);
  const [restoreTargetItem, setRestoreTargetItem] = useState<ShopItemDto | null>(null);
  const [historyItemKey, setHistoryItemKey] = useState<string | null>(null);
  const [resetTargetItem, setResetTargetItem] = useState<ShopItemDto | null>(null);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  // Create Form State
  const [createKey, setCreateKey] = useState('');
  const [createName, setCreateName] = useState('');
  const [createCategory, setCreateCategory] = useState<ShopCategory>('balls');
  const [createDescription, setCreateDescription] = useState('');
  const [createCurrency, setCreateCurrency] = useState<'astralCoins' | 'infinityCoins'>('astralCoins');
  const [createPrice, setCreatePrice] = useState<number>(1000);
  const [createSalePrice, setCreateSalePrice] = useState<number | null>(null);
  const [createSaleStartsAt, setCreateSaleStartsAt] = useState<string | null>(null);
  const [createSaleEndsAt, setCreateSaleEndsAt] = useState<string | null>(null);
  const [createSpriteUrl, setCreateSpriteUrl] = useState('');
  const [createEffectType, setCreateEffectType] = useState('NONE');
  const [createEffectConfig, setCreateEffectConfig] = useState<EffectConfigState>(DEFAULT_EFFECT_CONFIG);
  const [createMinLevel, setCreateMinLevel] = useState('');
  const [createDailyLimit, setCreateDailyLimit] = useState('');
  const [createStock, setCreateStock] = useState('');
  const [createSortOrder, setCreateSortOrder] = useState('0');
  const [createEnabled, setCreateEnabled] = useState(true);
  const [createReason, setCreateReason] = useState('');

  // Edit item form state
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState<string>('balls');
  const [editDescription, setEditDescription] = useState('');
  const [editCurrency, setEditCurrency] = useState<'astralCoins' | 'infinityCoins'>('astralCoins');
  const [editSpriteUrl, setEditSpriteUrl] = useState('');
  const [editEffectType, setEditEffectType] = useState('NONE');
  const [editEffectConfig, setEditEffectConfig] = useState<EffectConfigState>(DEFAULT_EFFECT_CONFIG);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editSalePrice, setEditSalePrice] = useState<number | null>(null);
  const [editSaleStartsAt, setEditSaleStartsAt] = useState<string | null>(null);
  const [editSaleEndsAt, setEditSaleEndsAt] = useState<string | null>(null);
  const [editMinLevel, setEditMinLevel] = useState<string>('');
  const [editDailyLimit, setEditDailyLimit] = useState<string>('');
  const [editStock, setEditStock] = useState<string>('');
  const [editSortOrder, setEditSortOrder] = useState<string>('0');
  const [editEnabled, setEditEnabled] = useState<boolean>(true);
  const [editReason, setEditReason] = useState<string>('');
  const [editConfirmExtreme, setEditConfirmExtreme] = useState<boolean>(false);

  // Bulk edit form state
  const [bulkMode, setBulkMode] = useState<'set' | 'percent_inc' | 'percent_dec'>('percent_inc');
  const [bulkValue, setBulkValue] = useState<number>(10);
  const [bulkReason, setBulkReason] = useState<string>('');
  const [bulkConfirmExtreme, setBulkConfirmExtreme] = useState<boolean>(false);
  const [bulkPreviewItems, setBulkPreviewItems] = useState<BulkPricePreviewItem[] | null>(null);
  const [hasExtremeBulkChange, setHasExtremeBulkChange] = useState<boolean>(false);

  // History query
  const { data: priceHistory = [], isLoading: isHistoryLoading } = useShopPriceHistory(
    historyItemKey || '',
    Boolean(historyItemKey)
  );

  // Filtered items
  const filteredItems = useMemo(() => {
    const validCategories = new Set<string>(SHOP_CATEGORIES.map((c) => c.id));
    return items.filter((item) => {
      if (!validCategories.has(item.category)) {
        return false;
      }
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      if (statusFilter === 'active' && (item.isArchived || !item.enabled)) return false;
      if (statusFilter === 'disabled' && (item.isArchived || item.enabled)) return false;
      if (statusFilter === 'archived' && !item.isArchived) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          item.key.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          (item.effectType && item.effectType.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [items, selectedCategory, statusFilter, searchQuery]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setCreateKey('');
    setCreateName('');
    setCreateCategory('balls');
    setCreateDescription('');
    setCreateCurrency('astralCoins');
    setCreatePrice(1000);
    setCreateSalePrice(null);
    setCreateSaleStartsAt(null);
    setCreateSaleEndsAt(null);
    setCreateSpriteUrl('');
    setCreateEffectType('NONE');
    setCreateEffectConfig(DEFAULT_EFFECT_CONFIG);
    setCreateMinLevel('');
    setCreateDailyLimit('');
    setCreateStock('');
    setCreateSortOrder('0');
    setCreateEnabled(true);
    setCreateReason('');
    setIsCreateModalOpen(true);
  };

  // Submit Create Item
  const handleSaveCreate = async () => {
    if (!createKey.trim()) {
      notify.error('Item key is required');
      return;
    }
    if (!createName.trim()) {
      notify.error('Item name is required');
      return;
    }
    if (createReason.trim().length < 5) {
      notify.error('Audit reason must be at least 5 characters');
      return;
    }

    const parsedConfig = serializeEffectConfig(createEffectType, createEffectConfig);

    const payload: CreateShopItemInput = {
      key: createKey.trim().toLowerCase(),
      name: createName.trim(),
      category: createCategory,
      description: createDescription.trim(),
      currency: createCurrency,
      price: createPrice,
      salePrice: createSalePrice,
      saleStartsAt: createSaleStartsAt,
      saleEndsAt: createSaleEndsAt,
      enabled: createEnabled,
      minLevel: createMinLevel ? parseInt(createMinLevel, 10) : null,
      dailyLimitPerUser: createDailyLimit ? parseInt(createDailyLimit, 10) : null,
      totalStock: createStock ? parseInt(createStock, 10) : null,
      sortOrder: parseInt(createSortOrder, 10) || 0,
      spriteUrl: createSpriteUrl.trim() || null,
      effectType: createEffectType === 'NONE' ? null : createEffectType,
      effectConfig: parsedConfig,
      reason: createReason.trim(),
    };

    try {
      await createMutation.mutateAsync(payload);
      setIsCreateModalOpen(false);
    } catch {
      // Handled by mutation onError
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (item: ShopItemDto) => {
    setEditingItem(item);
    setEditName(item.name);
    setEditCategory(item.category);
    setEditDescription(item.description);
    setEditCurrency(item.currency);
    setEditSpriteUrl(item.spriteUrl || '');
    setEditEffectType(item.effectType || 'NONE');
    setEditEffectConfig(deserializeEffectConfig(item.effectConfig));
    setEditPrice(item.price);
    setEditSalePrice(item.salePrice);
    setEditSaleStartsAt(item.saleStartsAt);
    setEditSaleEndsAt(item.saleEndsAt);
    setEditMinLevel(item.minLevel != null ? String(item.minLevel) : '');
    setEditDailyLimit(item.dailyLimitPerUser != null ? String(item.dailyLimitPerUser) : '');
    setEditStock(item.totalStock != null ? String(item.totalStock) : '');
    setEditSortOrder(String(item.sortOrder));
    setEditEnabled(item.enabled);
    setEditReason('');
    setEditConfirmExtreme(false);
  };

  // Submit Edit Form
  const handleSaveEdit = async () => {
    if (!editingItem) return;
    if (editReason.trim().length < 5) {
      notify.error('Audit reason must be at least 5 characters');
      return;
    }

    const parsedConfig = serializeEffectConfig(editEffectType, editEffectConfig);

    const payload: UpdateShopItemInput = {
      name: editName.trim(),
      category: editCategory,
      description: editDescription.trim(),
      currency: editCurrency,
      spriteUrl: editSpriteUrl.trim() || null,
      effectType: editEffectType === 'NONE' ? null : editEffectType,
      effectConfig: parsedConfig,
      price: editPrice,
      salePrice: editSalePrice,
      saleStartsAt: editSaleStartsAt,
      saleEndsAt: editSaleEndsAt,
      enabled: editEnabled,
      minLevel: editMinLevel ? parseInt(editMinLevel, 10) : null,
      dailyLimitPerUser: editDailyLimit ? parseInt(editDailyLimit, 10) : null,
      totalStock: editStock ? parseInt(editStock, 10) : null,
      sortOrder: parseInt(editSortOrder, 10) || 0,
      reason: editReason.trim(),
      confirmExtreme: editConfirmExtreme,
    };

    try {
      await updateMutation.mutateAsync({ key: editingItem.key, data: payload });
      setEditingItem(null);
    } catch {
      // Handled by mutation onError
    }
  };

  // Bulk Edit Preview
  const handleBulkPreview = async () => {
    if (selectedKeys.length === 0) {
      notify.error('Please select at least one item');
      return;
    }
    if (bulkReason.trim().length < 5) {
      notify.error('Audit reason must be at least 5 characters');
      return;
    }

    try {
      const res = await bulkMutation.mutateAsync({
        itemKeys: selectedKeys,
        mode: bulkMode,
        value: bulkValue,
        dryRun: true,
        reason: bulkReason.trim(),
      });

      setBulkPreviewItems(res.items);
      const hasExtreme = res.items.some((i) => i.isExtremeChange);
      setHasExtremeBulkChange(hasExtreme);
    } catch {
      // Handled in mutation
    }
  };

  // Bulk Edit Apply
  const handleBulkApply = async () => {
    if (hasExtremeBulkChange && !bulkConfirmExtreme) {
      notify.error('Please confirm extreme changes before applying');
      return;
    }

    try {
      await bulkMutation.mutateAsync({
        itemKeys: selectedKeys,
        mode: bulkMode,
        value: bulkValue,
        dryRun: false,
        reason: bulkReason.trim(),
        confirmExtreme: bulkConfirmExtreme,
      });

      setIsBulkModalOpen(false);
      setBulkPreviewItems(null);
      setSelectedKeys([]);
      setBulkReason('');
    } catch {
      // Handled in mutation
    }
  };

  // Reset Item
  const handleConfirmReset = async (reason: string) => {
    if (!resetTargetItem) return;
    await resetMutation.mutateAsync({
      key: resetTargetItem.key,
      data: { reason },
    });
    setResetTargetItem(null);
  };

  // Toggle selection
  const handleToggleSelect = (key: string) => {
    setSelectedKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleSelectAllFiltered = () => {
    if (selectedKeys.length === filteredItems.length) {
      setSelectedKeys([]);
    } else {
      setSelectedKeys(filteredItems.map((i) => i.key));
    }
  };

  // Check if edit is extreme (>50% change)
  const isEditExtreme = useMemo(() => {
    if (!editingItem) return false;
    const diff = Math.abs(editPrice - editingItem.price);
    return editingItem.price > 0 && diff / editingItem.price > 0.5;
  }, [editingItem, editPrice]);

  // Table Columns
  const columns: ColumnDef<ShopItemDto>[] = [
    {
      header: (
        <input
          type="checkbox"
          checked={filteredItems.length > 0 && selectedKeys.length === filteredItems.length}
          onChange={handleSelectAllFiltered}
          className="rounded border-border bg-surface text-foreground focus:ring-0 cursor-pointer"
        />
      ),
      accessorKey: 'select',
      className: 'w-10 text-center',
      cell: (item) => (
        <input
          type="checkbox"
          checked={selectedKeys.includes(item.key)}
          onChange={() => handleToggleSelect(item.key)}
          className="rounded border-border bg-surface text-foreground focus:ring-0 cursor-pointer"
        />
      ),
    },
    {
      header: 'Item',
      accessorKey: 'name',
      sortable: true,
      cell: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-surface-raised border border-border flex items-center justify-center shrink-0">
            {item.spriteUrl ? (
              <img src={item.spriteUrl} alt={item.name} className="w-7 h-7 object-contain" />
            ) : (
              <Store className="w-5 h-5 text-muted" />
            )}
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
      header: 'Category',
      accessorKey: 'category',
      sortable: true,
      cell: (item) => (
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-bold text-foreground capitalize">{item.category}</span>
          <span className="text-[10px] text-muted">
            {item.currency === 'astralCoins' ? 'Astral Coins' : 'Infinity Coins'}
          </span>
        </div>
      ),
    },
    {
      header: 'Effective Price',
      accessorKey: 'effectivePrice',
      sortable: true,
      cell: (item: ShopItemDto) => (
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-black text-foreground">
              {item.effectivePrice.toLocaleString()} coins
            </span>
            {item.isOnSale && (
              <Badge variant="ink" className="text-[9px] py-0 px-1 font-black bg-surface-raised border-border">
                SALE
              </Badge>
            )}
          </div>
          {item.isOnSale && (
            <span className="text-[10px] text-muted line-through block">
              Base: {item.price.toLocaleString()}
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Effect',
      accessorKey: 'effectType',
      cell: (item: ShopItemDto) => (
        item.effectType ? (
          <div className="flex items-center gap-1">
            <Badge variant="ink" className="text-[9px] font-mono py-0.5 px-1.5 bg-surface-raised border-border">
              <Zap className="w-2.5 h-2.5 mr-1" />
              {item.effectType}
            </Badge>
          </div>
        ) : (
          <span className="text-[10px] text-subtle font-mono">None</span>
        )
      ),
    },
    {
      header: 'Limits & Stock',
      accessorKey: 'dailyLimitPerUser',
      cell: (item: ShopItemDto) => (
        <div className="text-xs">
          <span className="text-muted block text-[10px]">
            Daily:{' '}
            <strong className="text-foreground">
              {item.dailyLimitPerUser != null ? item.dailyLimitPerUser : 'Unlimited'}
            </strong>
          </span>
          <span className="text-muted block text-[10px]">
            Stock:{' '}
            <strong className="text-foreground">
              {item.totalStock != null ? `${item.stockRemaining ?? 0} / ${item.totalStock}` : 'Infinite'}
            </strong>
          </span>
        </div>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'enabled',
      cell: (item: ShopItemDto) => {
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
            onClick={() => handleOpenEdit(item)}
            title="Edit Item Details & Pricing"
            className="p-1.5 rounded-lg bg-surface-raised border border-border text-foreground hover:bg-surface transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          {item.isArchived ? (
            <button
              onClick={() => setRestoreTargetItem(item)}
              title="Restore Item"
              className="p-1.5 rounded-lg bg-surface-raised border border-border text-foreground hover:bg-surface transition-colors"
            >
              <ArchiveRestore className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => setArchiveTargetItem(item)}
              title="Archive Item"
              className="p-1.5 rounded-lg bg-surface-raised border border-border text-muted hover:text-danger transition-colors"
            >
              <Archive className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={() => setHistoryItemKey(item.key)}
            title="View Price History"
            className="p-1.5 rounded-lg bg-surface-raised border border-border text-muted hover:text-foreground transition-colors"
          >
            <History className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setResetTargetItem(item)}
            title="Reset to Catalog Default"
            className="p-1.5 rounded-lg bg-surface-raised border border-border text-muted hover:text-foreground transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
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
            <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">Pokémart Management</h1>
            <Badge variant="ink" className="text-[10px] font-black uppercase">
              Zero-Deploy Catalog
            </Badge>
          </div>
          <p className="text-xs text-muted">
            Create items, configure functional effects, schedule promotional sales, enforce player limits, or archive catalog entries.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            onClick={handleOpenCreate}
            className="flex items-center justify-center gap-1.5 text-xs min-h-[44px] w-full sm:w-auto touch-manipulation"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Item</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsBulkModalOpen(true)}
            disabled={selectedKeys.length === 0}
            className="flex items-center justify-center gap-1.5 text-xs min-h-[44px] w-full sm:w-auto touch-manipulation"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Bulk Update ({selectedKeys.length})</span>
          </Button>
        </div>
      </div>

      {/* Category Pills & Filters */}
      <div className="p-3 sm:p-4 bg-surface border border-border rounded-2xl space-y-3 sm:space-y-4">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-2 min-h-[38px] rounded-xl text-xs font-bold transition-colors touch-manipulation ${
              selectedCategory === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-surface-raised border border-border text-muted hover:text-foreground'
            }`}
          >
            All Categories
          </button>
          {SHOP_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-2 min-h-[38px] rounded-xl text-xs font-bold transition-colors touch-manipulation ${
                selectedCategory === cat.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-surface-raised border border-border text-muted hover:text-foreground'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-border/60">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items by name, key, category, or effect..."
              className="w-full pl-9 pr-4 py-2.5 min-h-[44px] bg-background border border-border rounded-xl text-base sm:text-xs text-foreground placeholder:text-muted focus:outline-hidden focus:border-foreground touch-manipulation"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-muted shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="flex-1 sm:flex-initial px-3 py-2.5 min-h-[44px] bg-background border border-border rounded-xl text-base sm:text-xs text-foreground focus:outline-hidden touch-manipulation"
            >
              <option value="all">All Items</option>
              <option value="active">Active Only</option>
              <option value="disabled">Disabled Only</option>
              <option value="archived">Archived Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Virtualized Data Table */}
      <DataTable
        data={filteredItems}
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        emptyMessage="No Pokémart items found matching your filters."
      />

      {/* Create Item Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-background/80 backdrop-blur-xs">
          <div className="bg-surface border border-border rounded-t-3xl sm:rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90dvh] pb-safe animate-in fade-in slide-in-from-bottom sm:zoom-in duration-200">
            <div className="sm:hidden mx-auto mt-3 -mb-1 h-1.5 w-12 rounded-full bg-border shrink-0" aria-hidden="true" />
            <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-foreground">Create Pokémart Item</h3>
                <p className="text-xs text-muted">Add a new item to the live catalog with no deploy needed.</p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-muted hover:text-foreground touch-manipulation"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-4 overflow-y-auto">
              {/* Item Identity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    Item Key (Slug) <span className="text-muted font-normal">*</span>
                  </label>
                  <input
                    type="text"
                    value={createKey}
                    onChange={(e) => setCreateKey(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                    placeholder="e.g. ultra-ball"
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground font-mono focus:outline-hidden"
                  />
                  <span className="text-[10px] text-muted">Lowercase letters, numbers, hyphens only.</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    Display Name <span className="text-muted font-normal">*</span>
                  </label>
                  <input
                    type="text"
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    placeholder="e.g. Ultra Ball"
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Category & Currency */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Category</label>
                  <select
                    value={createCategory}
                    onChange={(e) => setCreateCategory(e.target.value as ShopCategory)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden"
                  >
                    {SHOP_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Currency</label>
                  <select
                    value={createCurrency}
                    onChange={(e) => setCreateCurrency(e.target.value as any)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden"
                  >
                    <option value="astralCoins">Astral Coins</option>
                    <option value="infinityCoins">Infinity Coins</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Description</label>
                <textarea
                  value={createDescription}
                  onChange={(e) => setCreateDescription(e.target.value)}
                  rows={2}
                  placeholder="Describes how the item functions in the Astranox world..."
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden resize-none"
                />
              </div>

              {/* Sprite URL & Preview */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Sprite Image URL (Optional)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={createSpriteUrl}
                    onChange={(e) => setCreateSpriteUrl(e.target.value)}
                    placeholder="https://.../sprite.webp"
                    className="flex-1 px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden"
                  />
                  <div className="w-10 h-10 rounded-xl bg-surface-raised border border-border flex items-center justify-center shrink-0 overflow-hidden">
                    {createSpriteUrl ? (
                      <img src={createSpriteUrl} alt="Preview" className="w-7 h-7 object-contain" />
                    ) : (
                      <Store className="w-5 h-5 text-muted" />
                    )}
                  </div>
                </div>
              </div>

              {/* Functional Effect */}
              <div className="pt-2 border-t border-border/60 space-y-3">
                <span className="block text-xs font-black text-foreground uppercase tracking-wider">
                  Functional Item Effect
                </span>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Effect Type</label>
                  <select
                    value={createEffectType}
                    onChange={(e) => setCreateEffectType(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden mb-3"
                  >
                    {EFFECT_PRESETS.map((p) => (
                      <option key={p.type} value={p.type}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
                <EffectConfigFields
                  effectType={createEffectType}
                  config={createEffectConfig}
                  onChange={setCreateEffectConfig}
                />
              </div>

              {/* Base Price & Sale */}
              <div className="pt-2 border-t border-border/60 space-y-3">
                <span className="block text-xs font-black text-foreground uppercase tracking-wider">
                  Pricing & Promotions
                </span>
                <PriceInput
                  label="Base Price (Coins)"
                  value={createPrice}
                  onChange={setCreatePrice}
                  currency={createCurrency}
                  helperText="Standard catalog price."
                />

                <PriceInput
                  label="Sale Price (Optional)"
                  value={createSalePrice ?? 0}
                  onChange={(val) => setCreateSalePrice(val > 0 ? val : null)}
                  referencePrice={createPrice}
                  currency={createCurrency}
                  helperText="Promotional price during sale window."
                />

                <DateRangeField
                  label="Sale Schedule Window (Optional)"
                  startDate={createSaleStartsAt}
                  endDate={createSaleEndsAt}
                  onChange={(start, end) => {
                    setCreateSaleStartsAt(start);
                    setCreateSaleEndsAt(end);
                  }}
                  helperText="Sale applies only while within this window."
                />
              </div>

              {/* Limits and Sort */}
              <div className="pt-2 border-t border-border/60 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Min Level</label>
                  <input
                    type="text"
                    value={createMinLevel}
                    onChange={(e) => setCreateMinLevel(e.target.value.replace(/\D/g, ''))}
                    placeholder="1"
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Daily Limit</label>
                  <input
                    type="text"
                    value={createDailyLimit}
                    onChange={(e) => setCreateDailyLimit(e.target.value.replace(/\D/g, ''))}
                    placeholder="Empty=None"
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Total Stock</label>
                  <input
                    type="text"
                    value={createStock}
                    onChange={(e) => setCreateStock(e.target.value.replace(/\D/g, ''))}
                    placeholder="Empty=Inf"
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Sort Order</label>
                  <input
                    type="text"
                    value={createSortOrder}
                    onChange={(e) => setCreateSortOrder(e.target.value.replace(/\D/g, ''))}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Enabled */}
              <div className="flex items-center justify-between p-3 bg-surface-raised border border-border rounded-xl">
                <div>
                  <span className="text-xs font-bold text-foreground block">Enabled in Pokémart</span>
                  <span className="text-[10px] text-muted">Make available immediately for players</span>
                </div>
                <input
                  type="checkbox"
                  checked={createEnabled}
                  onChange={(e) => setCreateEnabled(e.target.checked)}
                  className="w-4 h-4 rounded border-border bg-surface text-foreground focus:ring-0 cursor-pointer"
                />
              </div>

              {/* Audit Reason */}
              <ReasonField
                value={createReason}
                onChange={setCreateReason}
                label="Audit Reason (Mandatory)"
                helperText="Required log entry explaining the creation of this catalog item."
              />
            </div>

            <div className="p-3 sm:p-4 border-t border-border flex items-center justify-end gap-2 bg-surface">
              <Button
                variant="outline"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-xs min-h-[44px] flex-1 sm:flex-initial touch-manipulation"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveCreate}
                disabled={
                  createMutation.isPending ||
                  !createKey.trim() ||
                  !createName.trim() ||
                  createReason.trim().length < 5
                }
                className="text-xs min-h-[44px] flex-1 sm:flex-initial touch-manipulation"
              >
                {createMutation.isPending ? 'Creating...' : 'Create Item'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-background/80 backdrop-blur-xs">
          <div className="bg-surface border border-border rounded-t-3xl sm:rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90dvh] pb-safe animate-in fade-in slide-in-from-bottom sm:zoom-in duration-200">
            <div className="sm:hidden mx-auto mt-3 -mb-1 h-1.5 w-12 rounded-full bg-border shrink-0" aria-hidden="true" />
            <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-foreground">Edit Item: {editingItem.name}</h3>
                <span className="text-[10px] text-muted font-mono">{editingItem.key}</span>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-muted hover:text-foreground touch-manipulation"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-4 overflow-y-auto">
              {/* Basic Details */}
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
                  <label className="block text-xs font-bold text-foreground mb-1">Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden"
                  >
                    {SHOP_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Description</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden resize-none"
                />
              </div>

              {/* Sprite URL & Preview */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Sprite Image URL</label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={editSpriteUrl}
                    onChange={(e) => setEditSpriteUrl(e.target.value)}
                    placeholder="https://.../sprite.webp"
                    className="flex-1 px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden"
                  />
                  <div className="w-10 h-10 rounded-xl bg-surface-raised border border-border flex items-center justify-center shrink-0 overflow-hidden">
                    {editSpriteUrl ? (
                      <img src={editSpriteUrl} alt="Preview" className="w-7 h-7 object-contain" />
                    ) : (
                      <Store className="w-5 h-5 text-muted" />
                    )}
                  </div>
                </div>
              </div>

              {/* Functional Effect */}
              <div className="pt-2 border-t border-border/60 space-y-3">
                <span className="block text-xs font-black text-foreground uppercase tracking-wider">
                  Functional Item Effect
                </span>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Effect Type</label>
                  <select
                    value={editEffectType}
                    onChange={(e) => setEditEffectType(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden mb-3"
                  >
                    {EFFECT_PRESETS.map((p) => (
                      <option key={p.type} value={p.type}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
                <EffectConfigFields
                  effectType={editEffectType}
                  config={editEffectConfig}
                  onChange={setEditEffectConfig}
                />
              </div>

              {/* Base Price */}
              <div className="pt-2 border-t border-border/60 space-y-3">
                <span className="block text-xs font-black text-foreground uppercase tracking-wider">
                  Pricing & Sale
                </span>
                <PriceInput
                  label="Base Price (Coins)"
                  value={editPrice}
                  onChange={setEditPrice}
                  referencePrice={editingItem.price}
                  currency={editCurrency}
                  helperText="Standard non-sale catalog price."
                />

                {/* Extreme Change Alert */}
                {isEditExtreme && (
                  <div className="p-3 bg-surface-raised border border-warning/60 rounded-xl flex items-start gap-3">
                    <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <strong className="text-foreground block">Significant Price Shift</strong>
                      <span className="text-muted">
                        This change alters the item cost by more than 50%. Please confirm below.
                      </span>
                    </div>
                  </div>
                )}

                {/* Sale Configuration */}
                <PriceInput
                  label="Sale Price (Optional)"
                  value={editSalePrice ?? 0}
                  onChange={(val) => setEditSalePrice(val > 0 ? val : null)}
                  referencePrice={editPrice}
                  currency={editCurrency}
                  helperText="Leave 0 or empty for no active discount."
                />

                <DateRangeField
                  label="Sale Schedule Window"
                  startDate={editSaleStartsAt}
                  endDate={editSaleEndsAt}
                  onChange={(start: string | null, end: string | null) => {
                    setEditSaleStartsAt(start);
                    setEditSaleEndsAt(end);
                  }}
                  helperText="Sale applies only while within this window."
                />
              </div>

              {/* Limits, Sort & Stock */}
              <div className="pt-2 border-t border-border/60 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Min Level</label>
                  <input
                    type="text"
                    value={editMinLevel}
                    onChange={(e) => setEditMinLevel(e.target.value.replace(/\D/g, ''))}
                    placeholder="Empty=None"
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Daily Limit</label>
                  <input
                    type="text"
                    value={editDailyLimit}
                    onChange={(e) => setEditDailyLimit(e.target.value.replace(/\D/g, ''))}
                    placeholder="Empty=Unlimited"
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Total Stock</label>
                  <input
                    type="text"
                    value={editStock}
                    onChange={(e) => setEditStock(e.target.value.replace(/\D/g, ''))}
                    placeholder="Empty=Infinite"
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Sort Order</label>
                  <input
                    type="text"
                    value={editSortOrder}
                    onChange={(e) => setEditSortOrder(e.target.value.replace(/\D/g, ''))}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Enabled Switch */}
              <div className="flex items-center justify-between p-3 bg-surface-raised border border-border rounded-xl">
                <div>
                  <span className="text-xs font-bold text-foreground block">Available in Pokémart</span>
                  <span className="text-[10px] text-muted">Toggle whether players can purchase this item</span>
                </div>
                <input
                  type="checkbox"
                  checked={editEnabled}
                  onChange={(e) => setEditEnabled(e.target.checked)}
                  className="w-4 h-4 rounded border-border bg-surface text-foreground focus:ring-0 cursor-pointer"
                />
              </div>

              {/* Audit Reason */}
              <ReasonField
                value={editReason}
                onChange={setEditReason}
                label="Audit Reason (Mandatory)"
                helperText="Required log entry explaining this economic modification."
              />

              {/* Extreme confirmation checkbox */}
              {isEditExtreme && (
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-foreground">
                  <input
                    type="checkbox"
                    checked={editConfirmExtreme}
                    onChange={(e) => setEditConfirmExtreme(e.target.checked)}
                    className="rounded border-border bg-surface focus:ring-0"
                  />
                  <span>I confirm this major (&gt;50%) price adjustment</span>
                </label>
              )}
            </div>

            <div className="p-3 sm:p-4 border-t border-border flex items-center justify-end gap-2 bg-surface">
              <Button
                variant="outline"
                onClick={() => setEditingItem(null)}
                className="text-xs min-h-[44px] flex-1 sm:flex-initial touch-manipulation"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveEdit}
                disabled={
                  updateMutation.isPending ||
                  editReason.trim().length < 5 ||
                  (isEditExtreme && !editConfirmExtreme)
                }
                className="text-xs min-h-[44px] flex-1 sm:flex-initial touch-manipulation"
              >
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Price Update Modal */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-background/80 backdrop-blur-xs">
          <div className="bg-surface border border-border rounded-t-3xl sm:rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[85dvh] pb-safe animate-in fade-in slide-in-from-bottom sm:zoom-in duration-200">
            <div className="sm:hidden mx-auto mt-3 -mb-1 h-1.5 w-12 rounded-full bg-border shrink-0" aria-hidden="true" />
            <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-foreground">
                  Bulk Price Update ({selectedKeys.length} items)
                </h3>
                <p className="text-xs text-muted">Batch modify catalog prices across selected items.</p>
              </div>
              <button
                onClick={() => setIsBulkModalOpen(false)}
                className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-muted hover:text-foreground touch-manipulation"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setBulkMode('percent_inc')}
                  className={`p-2.5 min-h-[44px] rounded-xl border text-xs font-bold transition-colors touch-manipulation flex items-center justify-center ${
                    bulkMode === 'percent_inc'
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-surface-raised border-border text-muted hover:text-foreground'
                  }`}
                >
                  + Increase (%)
                </button>
                <button
                  type="button"
                  onClick={() => setBulkMode('percent_dec')}
                  className={`p-2.5 min-h-[44px] rounded-xl border text-xs font-bold transition-colors touch-manipulation flex items-center justify-center ${
                    bulkMode === 'percent_dec'
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-surface-raised border-border text-muted hover:text-foreground'
                  }`}
                >
                  - Decrease (%)
                </button>
                <button
                  type="button"
                  onClick={() => setBulkMode('set')}
                  className={`p-2.5 min-h-[44px] rounded-xl border text-xs font-bold transition-colors touch-manipulation flex items-center justify-center ${
                    bulkMode === 'set'
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-surface-raised border-border text-muted hover:text-foreground'
                  }`}
                >
                  Set Fixed Price
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  {bulkMode === 'set' ? 'Fixed Target Price (Coins)' : 'Percentage Value (%)'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={bulkValue}
                    onChange={(e) => setBulkValue(Number(e.target.value.replace(/\D/g, '')))}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden"
                  />
                  {bulkMode !== 'set' && (
                    <Percent className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
                  )}
                </div>
              </div>

              <ReasonField
                value={bulkReason}
                onChange={setBulkReason}
                label="Audit Reason (Mandatory)"
                helperText="Required log entry for this bulk modification."
              />

              {/* Preview Button */}
              <div className="flex justify-start">
                <Button
                  variant="outline"
                  onClick={handleBulkPreview}
                  disabled={bulkMutation.isPending || bulkReason.trim().length < 5}
                  className="text-xs"
                >
                  Preview Changes (Dry Run)
                </Button>
              </div>

              {/* Preview Table Result */}
              {bulkPreviewItems && (
                <div className="space-y-3 pt-3 border-t border-border">
                  <span className="text-xs font-black text-foreground uppercase tracking-wider block">
                    Dry Run Preview Results ({bulkPreviewItems.length} items)
                  </span>

                  {hasExtremeBulkChange && (
                    <div className="p-3 bg-surface-raised border border-warning/60 rounded-xl flex items-start gap-3">
                      <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <strong className="text-foreground block">Extreme Changes Detected</strong>
                        <span className="text-muted">
                          One or more items will have a price shift of over 50%. Confirmation required below.
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="max-h-48 overflow-y-auto border border-border rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-surface-raised text-[10px] text-muted uppercase font-black sticky top-0">
                        <tr>
                          <th className="p-2">Item</th>
                          <th className="p-2">Old Price</th>
                          <th className="p-2">New Price</th>
                          <th className="p-2 text-right">Change</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border font-mono">
                        {bulkPreviewItems.map((p) => (
                          <tr key={p.key} className="hover:bg-surface-raised">
                            <td className="p-2 text-foreground font-sans font-bold">{p.name}</td>
                            <td className="p-2 text-muted">{p.oldPrice.toLocaleString()}</td>
                            <td className="p-2 text-foreground font-black">{p.newPrice.toLocaleString()}</td>
                            <td className="p-2 text-right">
                              <span
                                className={`font-bold ${
                                  p.isExtremeChange ? 'text-warning font-black' : 'text-muted'
                                }`}
                              >
                                {p.percentChange > 0 ? `+${p.percentChange}%` : `${p.percentChange}%`}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {hasExtremeBulkChange && (
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-foreground">
                      <input
                        type="checkbox"
                        checked={bulkConfirmExtreme}
                        onChange={(e) => setBulkConfirmExtreme(e.target.checked)}
                        className="rounded border-border bg-surface focus:ring-0"
                      />
                      <span>I confirm applying these extreme (&gt;50%) price adjustments</span>
                    </label>
                  )}
                </div>
              )}
            </div>

            <div className="p-3 sm:p-4 border-t border-border flex items-center justify-end gap-2 bg-surface">
              <Button
                variant="outline"
                onClick={() => setIsBulkModalOpen(false)}
                className="text-xs min-h-[44px] flex-1 sm:flex-initial touch-manipulation"
              >
                Cancel
              </Button>
              <Button
                onClick={handleBulkApply}
                disabled={
                  bulkMutation.isPending ||
                  !bulkPreviewItems ||
                  (hasExtremeBulkChange && !bulkConfirmExtreme)
                }
                className="text-xs min-h-[44px] flex-1 sm:flex-initial touch-manipulation"
              >
                {bulkMutation.isPending ? 'Applying...' : 'Apply Bulk Update'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Price History Drawer */}
      {historyItemKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-background/80 backdrop-blur-xs">
          <div className="bg-surface border-l border-border h-full w-full max-w-md shadow-2xl flex flex-col pt-safe pb-safe">
            <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-foreground">Price Audit History</h3>
                <span className="text-[10px] text-muted font-mono">{historyItemKey}</span>
              </div>
              <button
                onClick={() => setHistoryItemKey(null)}
                className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-muted hover:text-foreground touch-manipulation"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-3">
              {isHistoryLoading ? (
                <div className="py-12 text-center text-xs text-muted">Loading history...</div>
              ) : priceHistory.length === 0 ? (
                <div className="py-12 text-center text-xs text-muted">
                  No historical price alterations recorded for this item.
                </div>
              ) : (
                priceHistory.map((h) => (
                  <div
                    key={h.id}
                    className="p-3 rounded-xl bg-surface-raised border border-border space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-foreground">
                        {h.oldPrice.toLocaleString()} coins &rarr;{' '}
                        <strong className="text-foreground">{h.newPrice.toLocaleString()} coins</strong>
                      </span>
                      <span className="text-[10px] text-muted font-mono">
                        {new Date(h.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {(h.oldSalePrice != null || h.newSalePrice != null) && (
                      <div className="text-[10px] text-muted">
                        Sale: {h.oldSalePrice ?? 'none'} &rarr; {h.newSalePrice ?? 'none'}
                      </div>
                    )}

                    <p className="text-xs text-muted">
                      Reason: <span className="text-foreground">{h.reason}</span>
                    </p>

                    <div className="text-[10px] text-subtle font-mono flex items-center justify-between pt-1 border-t border-border/40">
                      <span>by {h.changerUsername || 'Staff'}</span>
                      {h.requestId && <span>req: {h.requestId.slice(0, 8)}</span>}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 sm:p-4 border-t border-border bg-surface">
              <Button
                variant="outline"
                onClick={() => setHistoryItemKey(null)}
                className="w-full text-xs min-h-[44px] touch-manipulation"
              >
                Close History
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Archive Dialog */}
      <ConfirmDialog
        isOpen={Boolean(archiveTargetItem)}
        onClose={() => setArchiveTargetItem(null)}
        onConfirm={async (reason) => {
          if (!archiveTargetItem) return;
          await archiveMutation.mutateAsync({ key: archiveTargetItem.key, data: { reason } });
          setArchiveTargetItem(null);
        }}
        title={`Archive "${archiveTargetItem?.name}"?`}
        description="This item will be removed from the public Pokémart catalog and hidden from players. Existing player inventories remain unaffected."
        confirmLabel="Archive Item"
        isDestructive={true}
        isLoading={archiveMutation.isPending}
      />

      {/* Confirm Restore Dialog */}
      <ConfirmDialog
        isOpen={Boolean(restoreTargetItem)}
        onClose={() => setRestoreTargetItem(null)}
        onConfirm={async (reason) => {
          if (!restoreTargetItem) return;
          await unarchiveMutation.mutateAsync({ key: restoreTargetItem.key, data: { reason } });
          setRestoreTargetItem(null);
        }}
        title={`Restore "${restoreTargetItem?.name}"?`}
        description="This item will be restored and made available in the Pokémart catalog again."
        confirmLabel="Restore Item"
        isLoading={unarchiveMutation.isPending}
      />

      {/* Confirm Reset Dialog */}
      <ConfirmDialog
        isOpen={Boolean(resetTargetItem)}
        onClose={() => setResetTargetItem(null)}
        onConfirm={handleConfirmReset}
        title={`Reset "${resetTargetItem?.name}"?`}
        description="This will restore the item to its default Astranox catalog price, clear all sale windows, and reset limits."
        confirmLabel="Reset to Default"
        isLoading={resetMutation.isPending}
      />
    </div>
  );
}
