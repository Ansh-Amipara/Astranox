import { useState, useMemo } from 'react';
import {
  useAdminShopItems,
  useUpdateShopItem,
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
  UpdateShopItemInput,
} from '@astranox/types';
import { SHOP_CATEGORIES } from '@astranox/constants';
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
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { notify } from '@/lib/toast';

export function Shop() {
  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [enabledFilter, setEnabledFilter] = useState<'all' | 'true' | 'false'>('all');

  // Queries & Mutations
  const { data: items = [], isLoading, isError, refetch } = useAdminShopItems();
  const updateMutation = useUpdateShopItem();
  const bulkMutation = useBulkPriceUpdate();
  const resetMutation = useResetShopItem();

  // Selection state for bulk operations
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  // Modals & Drawers state
  const [editingItem, setEditingItem] = useState<ShopItemDto | null>(null);
  const [historyItemKey, setHistoryItemKey] = useState<string | null>(null);
  const [resetTargetItem, setResetTargetItem] = useState<ShopItemDto | null>(null);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  // Edit item form state
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editSalePrice, setEditSalePrice] = useState<number | null>(null);
  const [editSaleStartsAt, setEditSaleStartsAt] = useState<string | null>(null);
  const [editSaleEndsAt, setEditSaleEndsAt] = useState<string | null>(null);
  const [editDailyLimit, setEditDailyLimit] = useState<string>('');
  const [editStock, setEditStock] = useState<string>('');
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
    return items.filter((item) => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      if (enabledFilter === 'true' && !item.enabled) return false;
      if (enabledFilter === 'false' && item.enabled) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          item.key.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [items, selectedCategory, enabledFilter, searchQuery]);

  // Open Edit Modal
  const handleOpenEdit = (item: ShopItemDto) => {
    setEditingItem(item);
    setEditPrice(item.price);
    setEditSalePrice(item.salePrice);
    setEditSaleStartsAt(item.saleStartsAt);
    setEditSaleEndsAt(item.saleEndsAt);
    setEditDailyLimit(item.dailyLimitPerUser != null ? String(item.dailyLimitPerUser) : '');
    setEditStock(item.totalStock != null ? String(item.totalStock) : '');
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

    const payload: UpdateShopItemInput = {
      price: editPrice,
      salePrice: editSalePrice,
      saleStartsAt: editSaleStartsAt,
      saleEndsAt: editSaleEndsAt,
      enabled: editEnabled,
      dailyLimitPerUser: editDailyLimit ? parseInt(editDailyLimit, 10) : null,
      totalStock: editStock ? parseInt(editStock, 10) : null,
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
            <span className="text-xs font-black text-foreground block">{item.name}</span>
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
        <div className="flex flex-col gap-1">
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
      header: 'Limits & Stock',
      accessorKey: 'dailyLimitPerUser',
      cell: (item: ShopItemDto) => (
        <div className="text-xs">
          <span className="text-muted block text-[10px]">
            Daily Limit:{' '}
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
      cell: (item: ShopItemDto) => (
        <Badge
          variant={item.enabled ? 'success' : 'default'}
          className="text-[10px] font-bold py-0.5"
        >
          {item.enabled ? 'Active' : 'Disabled'}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      accessorKey: 'id',
      className: 'text-right',
      cell: (item) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => handleOpenEdit(item)}
            title="Edit Item Pricing & Limits"
            className="p-1.5 rounded-lg bg-surface-raised border border-border text-foreground hover:bg-surface transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
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
      <div className="p-6 bg-surface border border-border rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-black text-foreground tracking-tight">Pokémart Management</h1>
            <Badge variant="ink" className="text-[10px] font-black uppercase">
              Live Economy
            </Badge>
          </div>
          <p className="text-xs text-muted">
            Configure live catalog prices, schedule promotional sales, enforce daily player limits, and inspect audit histories.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsBulkModalOpen(true)}
            disabled={selectedKeys.length === 0}
            className="flex items-center gap-1.5 text-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Bulk Price Update ({selectedKeys.length})</span>
          </Button>
        </div>
      </div>

      {/* Category Pills & Filters */}
      <div className="p-4 bg-surface border border-border rounded-2xl space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {SHOP_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
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
              placeholder="Search items by name or key..."
              className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-xl text-xs text-foreground placeholder:text-muted focus:outline-hidden focus:border-foreground"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-muted shrink-0" />
            <select
              value={enabledFilter}
              onChange={(e) => setEnabledFilter(e.target.value as any)}
              className="px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden"
            >
              <option value="all">All Statuses</option>
              <option value="true">Active Only</option>
              <option value="false">Disabled Only</option>
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

      {/* Edit Item Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs">
          <div className="bg-surface border border-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-foreground">Edit Item: {editingItem.name}</h3>
                <span className="text-[10px] text-muted font-mono">{editingItem.key}</span>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1 rounded-lg text-muted hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto">
              {/* Base Price */}
              <PriceInput
                label="Base Price (Coins)"
                value={editPrice}
                onChange={setEditPrice}
                referencePrice={editingItem.price}
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
              <div className="pt-2 border-t border-border/60 space-y-3">
                <span className="block text-xs font-black text-foreground uppercase tracking-wider">
                  Promotional Sale Window
                </span>
                <PriceInput
                  label="Sale Price (Optional)"
                  value={editSalePrice ?? 0}
                  onChange={(val) => setEditSalePrice(val > 0 ? val : null)}
                  referencePrice={editPrice}
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

              {/* Limits and Stock */}
              <div className="pt-2 border-t border-border/60 grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    Daily Limit / User
                  </label>
                  <input
                    type="text"
                    value={editDailyLimit}
                    onChange={(e) => setEditDailyLimit(e.target.value.replace(/\D/g, ''))}
                    placeholder="Empty = Unlimited"
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    Total Global Stock
                  </label>
                  <input
                    type="text"
                    value={editStock}
                    onChange={(e) => setEditStock(e.target.value.replace(/\D/g, ''))}
                    placeholder="Empty = Infinite"
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

            <div className="p-4 border-t border-border flex items-center justify-end gap-2 bg-surface">
              <Button
                variant="outline"
                onClick={() => setEditingItem(null)}
                className="text-xs"
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
                className="text-xs"
              >
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Price Update Modal */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs">
          <div className="bg-surface border border-border rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-foreground">
                  Bulk Price Update ({selectedKeys.length} items)
                </h3>
                <p className="text-xs text-muted">Batch modify catalog prices across selected items.</p>
              </div>
              <button
                onClick={() => setIsBulkModalOpen(false)}
                className="p-1 rounded-lg text-muted hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setBulkMode('percent_inc')}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-colors ${
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
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-colors ${
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
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-colors ${
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

            <div className="p-4 border-t border-border flex items-center justify-end gap-2 bg-surface">
              <Button
                variant="outline"
                onClick={() => setIsBulkModalOpen(false)}
                className="text-xs"
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
                className="text-xs"
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
          <div className="bg-surface border-l border-border h-full w-full max-w-md shadow-2xl flex flex-col">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-foreground">Price Audit History</h3>
                <span className="text-[10px] text-muted font-mono">{historyItemKey}</span>
              </div>
              <button
                onClick={() => setHistoryItemKey(null)}
                className="p-1 rounded-lg text-muted hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto space-y-3">
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

            <div className="p-4 border-t border-border bg-surface">
              <Button
                variant="outline"
                onClick={() => setHistoryItemKey(null)}
                className="w-full text-xs"
              >
                Close History
              </Button>
            </div>
          </div>
        </div>
      )}

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
