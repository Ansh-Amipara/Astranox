import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowUp, ArrowDown, AlertTriangle, Store } from 'lucide-react';
import { shopApi, api } from '@/lib/api';
import { getTypeSpriteUrl } from '@/lib/axios';
import { TrainerSaveDto, InventoryItemDto, ShopItemDto } from '@astranox/types';
import { Dropdown } from '@/shared/ui/Dropdown';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton, EmptyState, ErrorState } from '@/components/ui';
import { notify } from '@/lib/toast';

interface MoveShopItem {
  id: string;
  moveId: number;
  price: number;
  move: {
    id: number;
    name: string;
    power: number;
    damageClass: string;
    type: { name: string };
  };
}

export function Pokemart() {
  const queryClient = useQueryClient();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [multiplier, setMultiplier] = useState<number>(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMoveType, setSelectedMoveType] = useState<string>('all');
  const [storeType, setStoreType] = useState<'astral' | 'infinity'>('astral');
  const [moveSortConfig, setMoveSortConfig] = useState<{ key: 'power' | 'price'; direction: 'asc' | 'desc' } | null>(null);
  const [confirmModal, setConfirmModal] = useState<'buy' | 'sell' | null>(null);

  // Price changed 409 handling
  const [priceChangedAlert, setPriceChangedAlert] = useState<{
    itemKey: string;
    itemName: string;
    newPrice: number;
    quantity: number;
  } | null>(null);

  const handleSortMoves = (key: 'power' | 'price') => {
    setMoveSortConfig((current) => {
      if (current?.key === key) {
        return { key, direction: current.direction === 'desc' ? 'asc' : 'desc' };
      }
      return { key, direction: 'desc' };
    });
  };

  const { data: save } = useQuery({
    queryKey: ['trainerSave'],
    queryFn: async () => {
      const { data } = await api.get('/trainers/me');
      return data.data;
    },
  });

  const { data: items = [], isLoading: isItemsLoading, isError: isItemsError, refetch: refetchItems } = useQuery<ShopItemDto[]>({
    queryKey: ['shopItems'],
    queryFn: shopApi.getItems,
  });

  const { data: moves, isLoading: isMovesLoading, isError: isMovesError, refetch: refetchMoves } = useQuery<MoveShopItem[]>({
    queryKey: ['shopMoves'],
    queryFn: shopApi.getMoves,
  });

  const isLoading = isItemsLoading || isMovesLoading;
  const isError = isItemsError || isMovesError;

  // Single Item Purchase Mutation with expectedPrice
  const buySingleMutation = useMutation({
    mutationFn: async ({
      itemKey,
      quantity,
      expectedPrice,
    }: {
      itemKey: string;
      quantity: number;
      expectedPrice?: number;
    }) => {
      return shopApi.purchase({ itemKey, quantity, expectedPrice });
    },
    onSuccess: (_, { itemKey, quantity }) => {
      const item = items.find((i) => i.key === itemKey || i.id === itemKey);
      notify.success(`Purchased x${quantity} ${item?.name || 'item'}!`);
      queryClient.invalidateQueries({ queryKey: ['trainerSave'] });
      queryClient.invalidateQueries({ queryKey: ['shopItems'] });
      setQuantities((prev) => ({ ...prev, [itemKey]: 0, ...(item?.id ? { [item.id]: 0 } : {}) }));
    },
    onError: (error: any, { itemKey, quantity }) => {
      if (error.response?.status === 409 && error.response?.data?.error?.code === 'PRICE_CHANGED') {
        const item = items.find((i) => i.key === itemKey || i.id === itemKey);
        const { newPrice } = error.response.data.error;
        setPriceChangedAlert({
          itemKey,
          itemName: item?.name || itemKey,
          newPrice,
          quantity,
        });
        return;
      }
      const message = error.response?.data?.error?.message || 'Failed to buy item';
      notify.error(message, { id: 'pokemart-buy-error' });
    },
  });

  // Bulk Buy Mutation
  const buyBulkMutation = useMutation({
    mutationFn: async (buyItems: { itemKey: string; quantity: number; expectedPrice?: number }[]) => {
      for (const itm of buyItems) {
        await shopApi.purchase(itm);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainerSave'] });
      queryClient.invalidateQueries({ queryKey: ['shopItems'] });
      notify.success('All items purchased successfully!');
      setQuantities({});
      setConfirmModal(null);
    },
    onError: (error: any) => {
      if (error.response?.status === 409 && error.response?.data?.error?.code === 'PRICE_CHANGED') {
        const { newPrice, itemKey } = error.response.data.error;
        const item = items.find((i) => i.key === itemKey || i.id === itemKey);
        setConfirmModal(null);
        setPriceChangedAlert({
          itemKey,
          itemName: item?.name || itemKey,
          newPrice,
          quantity: quantities[itemKey] || 1,
        });
        return;
      }
      const message = error.response?.data?.error?.message || 'Failed to complete bulk purchase';
      notify.error(message, { id: 'pokemart-bulk-buy-error' });
      setConfirmModal(null);
    },
  });

  const sellBulkMutation = useMutation({
    mutationFn: (sellItems: { itemId: string; quantity: number }[]) => {
      return shopApi.sellBulk(sellItems);
    },
    onSuccess: (data: { data: TrainerSaveDto }) => {
      queryClient.setQueryData(['trainerSave'], data.data);
      notify.success('Sale completed successfully!');
      setQuantities({});
      setConfirmModal(null);
    },
    onError: (error: { response?: { data?: { error?: { message?: string } } } }) => {
      const message = error.response?.data?.error?.message || 'Failed to sell items';
      notify.error(message, { id: 'pokemart-sell-error' });
      setConfirmModal(null);
    },
  });

  const buyMoveMutation = useMutation({
    mutationFn: (moveId: number) => shopApi.buyMove(moveId),
    onSuccess: (data: { data: TrainerSaveDto }) => {
      queryClient.setQueryData(['trainerSave'], data.data);
      notify.success('Move purchased successfully!');
    },
    onError: (error: { response?: { data?: { error?: { message?: string } } } }) => {
      const message = error.response?.data?.error?.message || 'Failed to buy move';
      notify.error(message, { id: 'pokemart-move-error' });
    },
  });

  const handleQuantityChange = (itemKeyOrId: string, val: number) => {
    if (val < 0) val = 0;
    if (val > 999) val = 999;
    setQuantities((prev) => ({ ...prev, [itemKeyOrId]: val }));
  };

  const getItemQuantity = (item: ShopItemDto) => {
    return Number(quantities[item.key] ?? quantities[item.id] ?? 0);
  };

  const executeBulkBuy = () => {
    const itemsToBuy = visibleItems
      .filter((item) => getItemQuantity(item) > 0)
      .map((item) => ({
        itemKey: item.key,
        quantity: getItemQuantity(item),
        expectedPrice: item.effectivePrice,
      }));

    if (itemsToBuy.length > 0) {
      buyBulkMutation.mutate(itemsToBuy);
    }
  };

  const executeBulkSell = () => {
    const itemsToSell = visibleItems
      .filter((item) => {
        const owned = Number(inventoryQuantityByItemKey.get(item.key) ?? inventoryQuantityByItemKey.get(item.id) ?? 0);
        return getItemQuantity(item) > 0 && owned > 0;
      })
      .map((item) => {
        const owned = Number(inventoryQuantityByItemKey.get(item.key) ?? inventoryQuantityByItemKey.get(item.id) ?? 0);
        return {
          itemId: item.key || item.id,
          quantity: Math.min(getItemQuantity(item), owned),
        };
      })
      .filter((i) => i.quantity > 0);

    if (itemsToSell.length > 0) {
      sellBulkMutation.mutate(itemsToSell);
    }
  };

  const handleBuyMove = (move: MoveShopItem) => {
    buyMoveMutation.mutate(move.moveId);
  };

  if (isLoading) {
    return (
      <div className="flex-1 bg-background text-foreground p-3 sm:p-4 md:p-6 min-h-[calc(100dvh-64px)] flex flex-col justify-start">
        <div className="w-full mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-border pb-4">
            <Skeleton width={180} height={36} />
            <div className="flex gap-2">
              <Skeleton width={120} height={36} />
              <Skeleton width={120} height={36} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-surface rounded-2xl border border-border p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton variant="rectangular" width={48} height={48} className="rounded-xl" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton width="70%" height={16} />
                    <Skeleton width="40%" height={12} />
                  </div>
                </div>
                <Skeleton width="100%" height={28} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex-1 bg-background text-foreground p-6 min-h-[calc(100dvh-4rem)] flex items-center justify-center">
        <ErrorState
          title="Failed to Load Pokémart"
          message="Could not load the shop items from the server."
          onRetry={() => {
            refetchItems();
            refetchMoves();
          }}
        />
      </div>
    );
  }

  // Filter items based on store type
  const storeItems = items.filter((item) => {
    if (storeType === 'infinity') return item.currency === 'infinityCoins' || item.category === 'infinity-only';
    return item.currency === 'astralCoins' && item.category !== 'infinity-only';
  });

  const inventoryQuantityByItemKey = new Map<string, number>(
    (save?.inventory || []).map((entry: InventoryItemDto) => [entry.itemId, Number(entry.quantity)] as [string, number])
  );

  const visibleItems = storeItems;
  const baseItemCategories = Array.from(new Set(visibleItems.map((i) => i.category))).sort();
  const categories = storeType === 'astral' ? ['all', ...baseItemCategories, 'moves'] : ['all', ...baseItemCategories];

  const activeCategory = categories.includes(selectedCategory) ? selectedCategory : 'all';
  const filteredItems =
    activeCategory === 'moves'
      ? []
      : visibleItems.filter((item) => activeCategory === 'all' || item.category === activeCategory);

  const moveTypes = Array.from(new Set(moves?.map((m) => m.move.type.name) || [])).sort();
  const filteredMoves = selectedMoveType === 'all' ? moves : moves?.filter((m) => m.move.type.name === selectedMoveType);
  const sortedMoves = [...(filteredMoves || [])].sort((a, b) => {
    if (!moveSortConfig) return 0;
    if (moveSortConfig.key === 'power') {
      const valA = a.move.power || 0;
      const valB = b.move.power || 0;
      return moveSortConfig.direction === 'asc' ? valA - valB : valB - valA;
    }
    if (moveSortConfig.key === 'price') {
      return moveSortConfig.direction === 'asc' ? a.price - b.price : b.price - a.price;
    }
    return 0;
  });

  const getStoreCurrency = () => {
    switch (storeType) {
      case 'infinity':
        return {
          name: 'Infinity Coins',
          amount: save?.infinityCoins || 0,
          icon: <img src="/infinity.webp" alt="Infinity Coins" className="w-5 h-5 object-contain" />,
          symbol: <img src="/infinity.webp" alt="Infinity Coins" className="w-4 h-4 object-contain" />,
        };
      case 'astral':
      default:
        return {
          name: 'Astral Coins',
          amount: save?.astralCoins || 0,
          icon: <img src="/astral.webp" alt="Astral Coins" className="w-5 h-5 object-contain" />,
          symbol: <img src="/astral.webp" alt="Astral Coins" className="w-4 h-4 object-contain" />,
        };
    }
  };
  const storeCurrency = getStoreCurrency();

  let totalBulkCost = 0;
  let totalBulkPayout = 0;
  let selectedBuyItemsCount = 0;
  let selectedSellItemsCount = 0;

  if (activeCategory !== 'moves') {
    visibleItems.forEach((item) => {
      const ownedQuantity = Number(inventoryQuantityByItemKey.get(item.key) ?? inventoryQuantityByItemKey.get(item.id) ?? 0);
      const qty = getItemQuantity(item);
      const sellQty = Math.min(qty, ownedQuantity);

      if (qty > 0) {
        selectedBuyItemsCount++;
        totalBulkCost += item.effectivePrice * qty;
      }

      if (sellQty > 0) {
        selectedSellItemsCount++;
        totalBulkPayout += Math.floor(item.effectivePrice * 0.75) * sellQty;
      }
    });
  }

  return (
    <div className="flex-1 bg-background text-foreground p-4 md:p-6 min-h-[calc(100dvh-4rem)] flex flex-col justify-start">
      <div className="w-full mx-auto space-y-4 md:space-y-6">
        {/* Header and Controls section */}
        <div className="mb-8 border-b border-border pb-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
            <h1 className="text-3xl font-black text-foreground tracking-tight shrink-0">
              Pokémart
            </h1>

            <div className="w-full md:w-auto bg-surface border border-border px-4 py-2 rounded-xl flex items-center justify-between gap-3 shadow-xs shrink-0">
              <div className="flex items-center gap-2">
                {storeCurrency.icon}
                <span className="text-xs font-bold text-muted uppercase tracking-wider">
                  {storeCurrency.name}
                </span>
              </div>
              <span className="text-lg font-black text-foreground">
                {storeCurrency.amount.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4 w-full bg-surface p-3 md:p-4 rounded-2xl border border-border shadow-xs">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto flex-1">
              {/* Category Dropdown */}
              <div className="flex-1 relative z-30">
                <Dropdown
                  value={activeCategory}
                  options={categories.map((cat) => ({
                    value: cat,
                    label:
                      cat === 'infinity-only' || cat === 'potential'
                        ? 'Potential'
                        : cat === 'iv'
                        ? 'IV'
                        : cat === 'all'
                        ? 'All'
                        : cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' '),
                  }))}
                  onChange={(val) => setSelectedCategory(val)}
                  className="w-full"
                />
              </div>

              {/* Store Type Dropdown */}
              <div className="flex-1 relative z-20">
                <Dropdown
                  value={storeType}
                  options={[
                    { value: 'astral', label: 'Astral Store' },
                    { value: 'infinity', label: 'Infinity Store' },
                  ]}
                  onChange={(val) => {
                    setStoreType(val as 'astral' | 'infinity');
                    if (val === 'infinity' && selectedCategory === 'moves') {
                      setSelectedCategory('all');
                    }
                  }}
                  className="w-full"
                />
              </div>

              {/* Multiplier Quick Selector */}
              <div className="flex items-center gap-1 bg-surface-raised p-1 rounded-xl border border-border shrink-0">
                {[1, 5, 10, 50].map((m) => (
                  <button
                    key={m}
                    onClick={() => setMultiplier(m)}
                    className={`px-2.5 py-1 text-xs font-black rounded-lg transition-colors ${
                      multiplier === m
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted hover:text-foreground'
                    }`}
                  >
                    x{m}
                  </button>
                ))}
              </div>

              {/* Move Type Dropdown */}
              {activeCategory === 'moves' && (
                <div className="flex-1 relative z-10">
                  <Dropdown
                    value={selectedMoveType}
                    options={[
                      { value: 'all', label: 'All Types' },
                      ...moveTypes.map((t) => ({
                        value: t,
                        label: t,
                        icon: (
                          <img
                            src={getTypeSpriteUrl(t, true)}
                            alt={t}
                            className="h-4 w-auto object-contain hidden sm:block"
                          />
                        ),
                      })),
                    ]}
                    onChange={setSelectedMoveType}
                    className="w-full"
                  />
                </div>
              )}
            </div>

            {/* Buy and Sell Buttons */}
            {activeCategory !== 'moves' && (
              <div className="flex flex-row items-center gap-3 w-full xl:w-auto shrink-0 mt-1 xl:mt-0">
                <Button
                  variant="outline"
                  onClick={() => setConfirmModal('sell')}
                  disabled={selectedSellItemsCount === 0 || sellBulkMutation.isPending}
                  className="flex-1 text-xs font-bold"
                >
                  Sell Selected ({selectedSellItemsCount})
                </Button>

                <Button
                  onClick={() => setConfirmModal('buy')}
                  disabled={
                    selectedBuyItemsCount === 0 ||
                    storeCurrency.amount < totalBulkCost ||
                    buyBulkMutation.isPending
                  }
                  className="flex-1 text-xs font-bold"
                >
                  Buy Selected ({selectedBuyItemsCount})
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Item Cards (< md) */}
        <div className="block md:hidden space-y-3">
          {activeCategory !== 'moves' &&
            filteredItems.map((item) => {
              const ownedQuantity = Number(
                inventoryQuantityByItemKey.get(item.key) ??
                  inventoryQuantityByItemKey.get(item.id) ??
                  0
              );
              const qty = getItemQuantity(item);

              return (
                <div
                  key={item.key || item.id}
                  className="bg-surface rounded-2xl border border-border p-4 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 bg-surface-raised rounded-xl flex items-center justify-center border border-border shrink-0">
                        {item.spriteUrl ? (
                          <img
                            src={item.spriteUrl}
                            alt={item.name}
                            className="w-8 h-8 object-contain"
                          />
                        ) : (
                          <Store className="w-5 h-5 text-muted" />
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-black text-foreground capitalize text-sm truncate">
                            {item.name.replace('-', ' ')}
                          </span>
                          {item.isOnSale && (
                            <Badge
                              variant="ink"
                              className="text-[9px] font-black uppercase py-0 px-1 bg-surface-raised border-border"
                            >
                              SALE
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-muted mt-0.5">
                          <span className="bg-surface-raised px-1.5 py-0.5 rounded border border-border">
                            Owned: {ownedQuantity.toLocaleString()}
                          </span>
                          {item.dailyLimitPerUser != null && (
                            <span className="text-subtle font-mono text-[10px]">
                              {item.remainingDailyLimit ?? item.dailyLimitPerUser} left
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end shrink-0">
                      <div className="flex items-center gap-1 text-sm font-black text-foreground">
                        {storeCurrency.symbol}
                        <span>{item.effectivePrice.toLocaleString()}</span>
                      </div>
                      {item.isOnSale && (
                        <span className="text-[10px] text-muted line-through font-mono">
                          {item.price.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/60">
                    <span className="text-xs font-bold text-muted">Select Quantity</span>
                    <div className="flex items-center bg-surface-raised rounded-xl border border-border">
                      <button
                        onClick={() => handleQuantityChange(item.key, qty - multiplier)}
                        className="w-11 h-11 flex items-center justify-center text-foreground hover:bg-surface active:bg-surface rounded-l-xl transition-colors font-black text-lg touch-manipulation select-none"
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={qty || ''}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          handleQuantityChange(item.key, val ? parseInt(val) : 0);
                        }}
                        className="w-12 h-11 text-center bg-transparent font-black text-foreground outline-none text-base select-all"
                      />
                      <button
                        onClick={() => handleQuantityChange(item.key, qty + multiplier)}
                        className="w-11 h-11 flex items-center justify-center text-foreground hover:bg-surface active:bg-surface rounded-r-xl transition-colors font-black text-lg touch-manipulation select-none"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

          {activeCategory === 'moves' &&
            sortedMoves.map((m) => {
              const isOwned = save?.unlockedMoves?.includes(m.moveId);
              const canAfford = storeCurrency.amount >= m.price;

              return (
                <div
                  key={m.id}
                  className="bg-surface rounded-2xl border border-border p-4 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col gap-1 min-w-0">
                      <span className="font-black text-foreground capitalize text-base">
                        {m.move.name.replace('-', ' ')}
                      </span>
                      <div className="flex items-center gap-2">
                        <img
                          src={getTypeSpriteUrl(m.move.type.name, true)}
                          alt={m.move.type.name}
                          className="h-4 w-auto object-contain"
                        />
                        <span className="text-xs text-muted font-bold capitalize">
                          {m.move.damageClass}
                        </span>
                        <span className="text-xs font-mono font-bold text-muted">
                          PWR: {m.move.power > 0 ? m.move.power : '—'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm font-black text-foreground shrink-0">
                      {storeCurrency.symbol}
                      <span>{m.price.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border/60">
                    {isOwned ? (
                      <Badge variant="ink" className="w-full text-xs font-bold py-2 flex justify-center">
                        Owned
                      </Badge>
                    ) : (
                      <Button
                        onClick={() => handleBuyMove(m)}
                        disabled={!canAfford || buyMoveMutation.isPending}
                        className="w-full min-h-[44px] text-xs font-black uppercase tracking-wider touch-manipulation"
                      >
                        {buyMoveMutation.isPending ? 'Buying...' : !canAfford ? 'Too Expensive' : 'Buy Move'}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}

          {((activeCategory !== 'moves' && filteredItems.length === 0) ||
            (activeCategory === 'moves' && sortedMoves.length === 0)) && (
            <div className="p-8 bg-surface rounded-2xl border border-border">
              <EmptyState
                title="No Items Available"
                description="There are currently no items or moves listed in this category."
              />
            </div>
          )}
        </div>

        {/* Desktop Table of items */}
        <div className="hidden md:block bg-surface rounded-2xl border border-border shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table
              className={`w-full text-left border-collapse ${
                activeCategory === 'moves'
                  ? 'min-w-[600px] md:min-w-[800px]'
                  : 'w-full'
              }`}
            >
              <thead>
                {activeCategory === 'moves' ? (
                  <tr className="bg-surface-raised border-b border-border">
                    <th className="p-3 sm:p-4 font-bold text-muted w-auto sm:w-48 text-xs sm:text-sm">Move</th>
                    <th className="hidden sm:table-cell p-4 font-bold text-muted w-32 text-xs sm:text-sm">Type</th>
                    <th
                      className="hidden sm:table-cell p-4 font-bold text-muted w-32 cursor-pointer select-none hover:text-foreground text-xs sm:text-sm"
                      onClick={() => handleSortMoves('power')}
                    >
                      <div className="flex items-center gap-1">
                        Power
                        {moveSortConfig?.key === 'power' &&
                          (moveSortConfig.direction === 'asc' ? (
                            <ArrowUp className="w-3.5 h-3.5" />
                          ) : (
                            <ArrowDown className="w-3.5 h-3.5" />
                          ))}
                      </div>
                    </th>
                    <th className="hidden sm:table-cell p-4 font-bold text-muted w-32 text-xs sm:text-sm">Class</th>
                    <th
                      className="p-3 sm:p-4 font-bold text-muted w-auto sm:w-32 cursor-pointer select-none hover:text-foreground text-xs sm:text-sm"
                      onClick={() => handleSortMoves('price')}
                    >
                      <div className="flex items-center gap-1">
                        Price
                        {moveSortConfig?.key === 'price' &&
                          (moveSortConfig.direction === 'asc' ? (
                            <ArrowUp className="w-3.5 h-3.5" />
                          ) : (
                            <ArrowDown className="w-3.5 h-3.5" />
                          ))}
                      </div>
                    </th>
                    <th className="p-3 sm:p-4 font-bold text-muted text-center w-auto sm:w-32 text-xs sm:text-sm">Action</th>
                  </tr>
                ) : (
                  <tr className="bg-surface-raised border-b border-border">
                    <th className="p-3 sm:p-4 font-bold text-muted text-xs sm:text-sm">Item</th>
                    <th className="p-3 sm:p-4 font-bold text-muted text-right sm:text-left text-xs sm:text-sm">Price</th>
                    <th className="p-3 sm:p-4 font-bold text-muted text-right sm:text-left text-xs sm:text-sm">Quantity</th>
                  </tr>
                )}
              </thead>
              <tbody className="divide-y divide-border/60">
                {activeCategory !== 'moves' &&
                  filteredItems.map((item) => {
                    const ownedQuantity = Number(
                      inventoryQuantityByItemKey.get(item.key) ??
                        inventoryQuantityByItemKey.get(item.id) ??
                        0
                    );
                    const qty = getItemQuantity(item);

                    return (
                      <tr
                        key={item.key || item.id}
                        className="hover:bg-surface-raised transition-colors"
                      >
                        <td className="p-3 sm:p-4 align-middle">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-surface-raised rounded-xl flex items-center justify-center border border-border shrink-0">
                              {item.spriteUrl ? (
                                <img
                                  src={item.spriteUrl}
                                  alt={item.name}
                                  className="w-6 h-6 sm:w-8 sm:h-8 object-contain"
                                />
                              ) : (
                                <Store className="w-5 h-5 text-muted" />
                              )}
                            </div>
                            <div className="flex flex-col gap-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-black text-foreground capitalize text-xs sm:text-sm leading-tight">
                                  {item.name.replace('-', ' ')}
                                </span>
                                {item.isOnSale && (
                                  <Badge
                                    variant="ink"
                                    className="text-[9px] font-black uppercase py-0 px-1 bg-surface-raised border-border"
                                  >
                                    SALE
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-[10px] text-muted">
                                <span className="bg-surface-raised px-1.5 py-0.5 rounded border border-border">
                                  Owned: {ownedQuantity.toLocaleString()}
                                </span>
                                {item.dailyLimitPerUser != null && (
                                  <span className="text-subtle font-mono">
                                    Daily: {item.remainingDailyLimit ?? item.dailyLimitPerUser} left
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 sm:p-4 font-bold text-muted text-right sm:text-left align-middle">
                          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1">
                            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-black text-foreground">
                              {storeCurrency.symbol}
                              <span>{item.effectivePrice.toLocaleString()}</span>
                            </div>
                            {item.isOnSale && (
                              <span className="text-[10px] text-muted line-through font-mono">
                                {item.price.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 sm:p-4 align-middle">
                          <div className="flex items-center justify-end sm:justify-start">
                            <div className="flex items-center bg-surface-raised rounded-lg border border-border w-max">
                              <button
                                onClick={() => handleQuantityChange(item.key, qty - multiplier)}
                                className="w-7 h-7 sm:w-8 sm:h-8 rounded-l-lg flex items-center justify-center text-muted hover:text-foreground hover:bg-surface transition-colors"
                              >
                                -
                              </button>
                              <input
                                type="text"
                                value={qty || ''}
                                onChange={(e) => {
                                  const val = e.target.value.replace(/\D/g, '');
                                  handleQuantityChange(item.key, val ? parseInt(val) : 0);
                                }}
                                className="w-8 sm:w-12 text-center bg-transparent font-bold text-foreground outline-none text-xs sm:text-sm"
                              />
                              <button
                                onClick={() => handleQuantityChange(item.key, qty + multiplier)}
                                className="w-7 h-7 sm:w-8 sm:h-8 rounded-r-lg flex items-center justify-center text-muted hover:text-foreground hover:bg-surface transition-colors"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                {activeCategory === 'moves' &&
                  sortedMoves.map((m) => {
                    const isOwned = save?.unlockedMoves?.includes(m.moveId);
                    const canAfford = storeCurrency.amount >= m.price;

                    return (
                      <tr
                        key={m.id}
                        className="hover:bg-surface-raised transition-colors"
                      >
                        <td className="p-3 sm:p-4">
                          <div className="flex flex-col gap-1">
                            <span className="font-bold text-foreground capitalize text-xs sm:text-sm">
                              {m.move.name.replace(/-/g, ' ')}
                            </span>
                            <div className="sm:hidden flex items-center gap-1 text-[10px] font-bold text-muted capitalize">
                              <img
                                src={getTypeSpriteUrl(m.move.type.name, true)}
                                alt={m.move.type.name}
                                className="h-3 w-auto object-contain"
                              />
                              {m.move.type.name} • {m.move.power > 0 ? m.move.power : '-'}
                            </div>
                          </div>
                        </td>
                        <td className="hidden sm:table-cell p-4">
                          <div className="flex items-center gap-2 text-xs font-bold text-muted capitalize">
                            <img
                              src={getTypeSpriteUrl(m.move.type.name, true)}
                              alt={m.move.type.name}
                              className="h-4 w-auto object-contain"
                            />
                            {m.move.type.name}
                          </div>
                        </td>
                        <td className="hidden sm:table-cell p-4 font-bold text-muted text-xs">
                          {m.move.power > 0 ? m.move.power : '-'}
                        </td>
                        <td className="hidden sm:table-cell p-4">
                          <span className="text-xs font-bold text-foreground capitalize">
                            {m.move.damageClass}
                          </span>
                        </td>
                        <td className="p-3 sm:p-4 font-bold text-muted text-xs">
                          <div className="flex items-center gap-1.5 text-xs sm:text-sm">
                            {storeCurrency.symbol}
                            <span>{m.price.toLocaleString()}</span>
                          </div>
                        </td>
                        <td className="p-3 sm:p-4 text-center">
                          {isOwned ? (
                            <Badge variant="ink" className="text-xs font-bold py-1 px-3">
                              Owned
                            </Badge>
                          ) : (
                            <Button
                              onClick={() => handleBuyMove(m)}
                              disabled={!canAfford || buyMoveMutation.isPending}
                              className="text-xs py-1 px-4"
                            >
                              {buyMoveMutation.isPending ? 'Buying...' : 'Buy'}
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>

            {((activeCategory !== 'moves' && filteredItems.length === 0) || (activeCategory === 'moves' && sortedMoves.length === 0)) && (
              <div className="p-8">
                <EmptyState
                  title="No Items Available"
                  description="There are currently no items or moves listed in this category."
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmModal && (() => {
        const itemsToProcess = visibleItems
          .map((item) => {
            const ownedQuantity = Number(
              inventoryQuantityByItemKey.get(item.key) ??
                inventoryQuantityByItemKey.get(item.id) ??
                0
            );
            const qty = getItemQuantity(item);
            const sellQty = Math.min(qty, ownedQuantity);
            return { item, qty, sellQty };
          })
          .filter((x) => (confirmModal === 'buy' ? x.qty > 0 : x.sellQty > 0));

        return (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-background/80 backdrop-blur-xs">
            <div className="bg-surface border border-border rounded-t-3xl sm:rounded-2xl p-6 max-w-sm w-full shadow-2xl flex flex-col items-center pb-safe animate-in fade-in slide-in-from-bottom sm:zoom-in duration-200">
              <div className="sm:hidden mx-auto -mt-2 mb-3 h-1.5 w-12 rounded-full bg-border" aria-hidden="true" />
              <h2 className="text-xl font-black text-foreground mb-1 text-center">
                Confirm {confirmModal === 'buy' ? 'Purchase' : 'Sale'}
              </h2>
              <p className="text-muted text-xs mb-4 text-center">
                You are about to {confirmModal === 'buy' ? 'buy' : 'sell'}{' '}
                {confirmModal === 'buy' ? selectedBuyItemsCount : selectedSellItemsCount} items.
              </p>

              <div className="w-full max-h-48 overflow-y-auto bg-surface-raised rounded-xl p-3 border border-border mb-4 flex flex-col gap-2">
                {itemsToProcess.map(({ item, qty, sellQty }) => {
                  const displayQty = confirmModal === 'buy' ? qty : sellQty;
                  const itemTotal =
                    confirmModal === 'buy'
                      ? item.effectivePrice * qty
                      : Math.floor(item.effectivePrice * 0.75) * sellQty;

                  return (
                    <div key={item.key || item.id} className="flex items-center justify-between text-xs p-1">
                      <div className="flex items-center gap-2">
                        {item.spriteUrl ? (
                          <img src={item.spriteUrl} alt={item.name} className="w-5 h-5 object-contain" />
                        ) : (
                          <div className="w-4 h-4 bg-surface rounded-full" />
                        )}
                        <span className="font-bold text-foreground capitalize">
                          {item.name.replace('-', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-muted">x{displayQty}</span>
                        <span className="text-foreground font-black">
                          {itemTotal.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="w-full bg-surface-raised rounded-xl p-3 border border-border mb-6 flex flex-col items-center">
                <span className="block text-[10px] font-black text-muted uppercase tracking-wider mb-0.5">
                  Total {confirmModal === 'buy' ? 'Cost' : 'Payout'}
                </span>
                <div className="flex items-center justify-center gap-1.5 text-xl font-black text-foreground">
                  {storeCurrency.icon}
                  <span>
                    {(confirmModal === 'buy' ? totalBulkCost : totalBulkPayout).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex w-full gap-2">
                <Button
                  variant="outline"
                  onClick={() => setConfirmModal(null)}
                  className="flex-1 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmModal === 'buy' ? executeBulkBuy : executeBulkSell}
                  disabled={buyBulkMutation.isPending || sellBulkMutation.isPending}
                  className="flex-1 text-xs"
                >
                  Confirm
                </Button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 409 PRICE_CHANGED Alert Dialog */}
      {priceChangedAlert && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-background/80 backdrop-blur-xs">
          <div className="bg-surface border border-border rounded-t-3xl sm:rounded-2xl p-6 max-w-sm w-full shadow-2xl flex flex-col space-y-4 pb-safe animate-in fade-in slide-in-from-bottom sm:zoom-in duration-200">
            <div className="sm:hidden mx-auto -mt-2 mb-3 h-1.5 w-12 rounded-full bg-border" aria-hidden="true" />
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
              <div>
                <h3 className="text-base font-black text-foreground">Price Updated</h3>
                <p className="text-xs text-muted mt-1">
                  The price of <strong className="text-foreground">{priceChangedAlert.itemName}</strong> was
                  updated by the Pokémart manager to{' '}
                  <strong className="text-foreground">{priceChangedAlert.newPrice.toLocaleString()} coins</strong>{' '}
                  each.
                </p>
              </div>
            </div>

            <p className="text-xs text-muted">
              Would you like to complete your purchase of x{priceChangedAlert.quantity} at the new price?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <Button
                variant="outline"
                onClick={() => setPriceChangedAlert(null)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  const alert = priceChangedAlert;
                  setPriceChangedAlert(null);
                  buySingleMutation.mutate({
                    itemKey: alert.itemKey,
                    quantity: alert.quantity,
                    expectedPrice: alert.newPrice,
                  });
                }}
                className="text-xs"
              >
                Accept &amp; Buy
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
