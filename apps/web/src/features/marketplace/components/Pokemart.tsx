import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, AlertCircle, ArrowUp, ArrowDown } from 'lucide-react';
import { shopApi, api } from '@/shared/api/api';
import { getTypeSpriteUrl } from '@/lib/axios';
import { TrainerSaveDto, InventoryItemDto } from '@astranox/types';;
import { Dropdown } from '@/shared/ui/Dropdown';

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

interface Item {
  id: string;
  name: string;
  cost: number;
  description: string;
  spriteUrl: string | null;
  category: string;
}

export function Pokemart() {
  const queryClient = useQueryClient();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [multiplier, setMultiplier] = useState<number>(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMoveType, setSelectedMoveType] = useState<string>('all');
  const [storeType, setStoreType] = useState<'astral' | 'infinity'>('astral');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [moveSortConfig, setMoveSortConfig] = useState<{ key: 'power' | 'price', direction: 'asc' | 'desc' } | null>(null);
  const [confirmModal, setConfirmModal] = useState<'buy' | 'sell' | null>(null);

  const handleSortMoves = (key: 'power' | 'price') => {
    setMoveSortConfig(current => {
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
    }
  });

  const { data: items, isLoading: isItemsLoading } = useQuery<Item[]>({
    queryKey: ['shopItems'],
    queryFn: shopApi.getItems
  });

  const { data: moves, isLoading: isMovesLoading } = useQuery<MoveShopItem[]>({
    queryKey: ['shopMoves'],
    queryFn: shopApi.getMoves
  });

  const isLoading = isItemsLoading || isMovesLoading;

  const buyBulkMutation = useMutation({
    mutationFn: (items: { itemId: string, quantity: number }[]) => {
      return shopApi.buyBulk(items);
    },
    onSuccess: (data: { data: TrainerSaveDto }) => {
      queryClient.setQueryData(['trainerSave'], data.data);
      setMessage({ type: 'success', text: 'Purchase successful!' });
      setQuantities({});
      setTimeout(() => setMessage(null), 3000);
    },
    onError: (error: { response?: { data?: { error?: { message?: string } } } }) => {
      setMessage({
        type: 'error',
        text: error.response?.data?.error?.message || 'Failed to buy items'
      });
      setTimeout(() => setMessage(null), 3000);
    }
  });

  const sellBulkMutation = useMutation({
    mutationFn: (items: { itemId: string, quantity: number }[]) => {
      return shopApi.sellBulk(items);
    },
    onSuccess: (data: { data: TrainerSaveDto }) => {
      queryClient.setQueryData(['trainerSave'], data.data);
      setMessage({ type: 'success', text: 'Sale successful!' });
      setQuantities({});
      setTimeout(() => setMessage(null), 3000);
    },
    onError: (error: { response?: { data?: { error?: { message?: string } } } }) => {
      setMessage({
        type: 'error',
        text: error.response?.data?.error?.message || 'Failed to sell items'
      });
      setTimeout(() => setMessage(null), 3000);
    }
  });

  const buyMoveMutation = useMutation({
    mutationFn: (moveId: number) => shopApi.buyMove(moveId),
    onSuccess: (data: { data: TrainerSaveDto }) => {
      queryClient.setQueryData(['trainerSave'], data.data);
      setMessage({ type: 'success', text: 'Move purchased successfully!' });
      setTimeout(() => setMessage(null), 3000);
    },
    onError: (error: { response?: { data?: { error?: { message?: string } } } }) => {
      setMessage({
        type: 'error',
        text: error.response?.data?.error?.message || 'Failed to buy move'
      });
      setTimeout(() => setMessage(null), 3000);
    }
  });

  const handleQuantityChange = (itemId: string, val: number) => {
    if (val < 0) val = 0;
    if (val > 999) val = 999;
    setQuantities(prev => ({ ...prev, [itemId]: val }));
  };

  const executeBulkBuy = () => {
    const itemsToBuy = Object.entries(quantities)
      .filter(([itemId, qty]) => qty > 0 && visibleItems.some(i => i.id === itemId))
      .map(([itemId, quantity]) => ({ itemId, quantity }));
      
    if (itemsToBuy.length > 0) {
      buyBulkMutation.mutate(itemsToBuy);
    }
    setConfirmModal(null);
  };

  const executeBulkSell = () => {
    const itemsToSell = Object.entries(quantities)
      .filter(([itemId, qty]) => qty > 0 && visibleItems.some(i => i.id === itemId))
      .map(([itemId, quantity]) => {
        const ownedQuantity = Number(inventoryQuantityByItemId.get(itemId) ?? 0);
        return { itemId, quantity: Math.min(quantity, ownedQuantity) };
      })
      .filter(item => item.quantity > 0);
      
    if (itemsToSell.length > 0) {
      sellBulkMutation.mutate(itemsToSell);
    }
    setConfirmModal(null);
  };

  const handleBuyMove = (move: MoveShopItem) => {
    buyMoveMutation.mutate(move.moveId);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-border"></div>
      </div>
    );
  }

  const storeItems = items?.filter(item => {
    if (storeType === 'infinity') return item.category === 'infinity-only';
    return item.category !== 'infinity-only';
  }) || [];

  const inventoryQuantityByItemId = new Map<string, number>(
    (save?.inventory || []).map((entry: InventoryItemDto) => [entry.itemId, Number(entry.quantity)] as [string, number])
  );
  const visibleItems = storeItems;

  const baseItemCategories = Array.from(new Set(visibleItems.map(i => i.category))).sort();
  const categories = storeType === 'astral' ? ['all', ...baseItemCategories, 'moves'] : ['all', ...baseItemCategories];

  const activeCategory = categories.includes(selectedCategory) ? selectedCategory : 'all';
  const filteredItems = activeCategory === 'moves' ? [] : visibleItems.filter(item => activeCategory === 'all' || item.category === activeCategory);
  
  const moveTypes = Array.from(new Set(moves?.map(m => m.move.type.name) || [])).sort();
  const filteredMoves = selectedMoveType === 'all' ? moves : moves?.filter(m => m.move.type.name === selectedMoveType);
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
        return { name: 'Infinity Coins', amount: save?.infinityCoins || 0, icon: <img src="/infinity.webp" alt="Infinity Coins" className="w-5 h-5 object-contain" />, symbol: <img src="/infinity.webp" alt="Infinity Coins" className="w-4 h-4 object-contain" /> };
      case 'astral':
      default:
        return { name: 'Astral Coins', amount: save?.astralCoins || 0, icon: <img src="/astral.webp" alt="Astral Coins" className="w-5 h-5 object-contain" />, symbol: <img src="/astral.webp" alt="Astral Coins" className="w-4 h-4 object-contain" /> };
    }
  };
  const storeCurrency = getStoreCurrency();

  let totalBulkCost = 0;
  let totalBulkPayout = 0;
  let selectedBuyItemsCount = 0;
  let selectedSellItemsCount = 0;
  
  if (activeCategory !== 'moves') {
    visibleItems.forEach(item => {
      const ownedQuantity = Number(inventoryQuantityByItemId.get(item.id) ?? 0);
      const qty = Number(quantities[item.id] || 0);
      const sellQty = Math.min(qty, ownedQuantity);
      
      if (qty > 0) {
        selectedBuyItemsCount++;
        totalBulkCost += item.cost * qty;
      }
      
      if (sellQty > 0) {
        selectedSellItemsCount++;
        totalBulkPayout += Math.floor(item.cost * 0.75) * sellQty;
      }
    });
  }

  return (
    <div className="flex-1 bg-background text-foreground p-4 md:p-6 min-h-[calc(100vh-64px)] transition-colors duration-200 flex flex-col justify-start">
      <div className="w-full mx-auto space-y-4 md:space-y-6">
        {/* Header and Controls section */}
        <div className="mb-8 border-b border-border pb-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
            <h1 className="text-3xl font-black text-foreground tracking-tight shrink-0">
              Pokémart
            </h1>

            <div className="w-full md:w-auto bg-surface border border-border px-4 py-2 rounded-xl flex items-center justify-between gap-3 shadow-sm shrink-0">
              <div className="flex items-center gap-2">
                {storeCurrency.icon}
                <span className="text-sm font-bold text-subtle uppercase tracking-wider">{storeCurrency.name}</span>
              </div>
              <span className="text-xl font-black text-foreground">{storeCurrency.amount.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4 w-full bg-surface/50 p-3 md:p-4 rounded-2xl border border-border shadow-sm">
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto flex-1">
              {/* Category Dropdown */}
              <div className="flex-1 relative z-30">
                <Dropdown
                  value={activeCategory}
                  options={categories.map(cat => ({
                    value: cat,
                    label: cat === 'infinity-only' || cat === 'potential' ? 'Potential' : cat === 'iv' ? 'IV' : cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' ')
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
                    { value: 'astral', label: 'Astral' },
                    { value: 'infinity', label: 'Infinity' }
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

              {/* Move Type Dropdown */}
              {activeCategory === 'moves' && (
                <div className="flex-1 relative z-10">
                  <Dropdown
                    value={selectedMoveType}
                    options={[
                      { value: 'all', label: 'All Types' },
                      ...moveTypes.map(t => ({
                        value: t,
                        label: t,
                        icon: <img src={getTypeSpriteUrl(t, true)} alt={t} className="h-4 w-auto object-contain hidden sm:block" />
                      }))
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
                <button
                  onClick={() => setConfirmModal('sell')}
                  disabled={selectedSellItemsCount === 0 || sellBulkMutation.isPending}
                  className={`px-4 py-2.5 rounded-xl font-bold shadow-sm transition-all text-sm flex items-center justify-center gap-1.5 flex-1 ${selectedSellItemsCount > 0 ? 'bg-surface-raised hover:bg-surface-raised text-foreground hover:shadow-md hover:-translate-y-0.5 active:translate-y-0' : 'bg-surface-raised text-muted cursor-not-allowed'}`}
                >
                  <span className="hidden sm:inline">Sell</span>
                  <span className="sm:hidden">Sell ({selectedSellItemsCount})</span>
                </button>

                <button
                  onClick={() => setConfirmModal('buy')}
                  disabled={selectedBuyItemsCount === 0 || storeCurrency.amount < totalBulkCost || buyBulkMutation.isPending}
                  className={`px-4 py-2.5 rounded-xl font-bold shadow-sm transition-all text-sm flex items-center justify-center gap-1.5 flex-1 ${selectedBuyItemsCount > 0 && storeCurrency.amount >= totalBulkCost ? 'bg-surface-raised hover:bg-surface text-foreground hover:shadow-md hover:-translate-y-0.5 active:translate-y-0' : 'bg-surface-raised text-muted cursor-not-allowed'}`}
                >
                  <span className="hidden sm:inline">Buy</span>
                  <span className="sm:hidden">Buy ({selectedBuyItemsCount})</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Message Toast overlay */}
        {message && (
          <div className={`fixed top-20 right-8 px-6 py-4 rounded-xl shadow-lg z-50 transition-all transform flex items-center gap-3 ${message.type === 'success' ? 'bg-surface-raised border border-border text-foreground ' : 'bg-surface-raised border border-border text-foreground '}`}>
            {message.type === 'success' ? (
              <Check className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="font-semibold">{message.text}</span>
          </div>
        )}

        {/* Table of items */}
        <div className="bg-surface/80 backdrop-blur rounded-2xl border border-border/50 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className={`w-full text-left border-collapse ${activeCategory === 'moves' ? 'min-w-[320px] sm:min-w-[600px] md:min-w-[800px]' : 'min-w-[320px]'}`}>
              <thead>
                {activeCategory === 'moves' ? (
                  <tr className="bg-surface-raised border-b border-border">
                    <th className="p-2 sm:p-4 font-bold text-muted w-auto sm:w-48 text-xs sm:text-base">Move</th>
                    <th className="hidden sm:table-cell p-4 font-bold text-muted w-32">Type</th>
                    <th className="hidden sm:table-cell p-4 font-bold text-muted w-32 cursor-pointer select-none hover:text-subtle transition-colors" onClick={() => handleSortMoves('power')}>
                      <div className="flex items-center gap-1">
                        Power
                        {moveSortConfig?.key === 'power' && (
                          moveSortConfig.direction === 'asc' ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />
                        )}
                      </div>
                    </th>
                    <th className="hidden sm:table-cell p-4 font-bold text-muted w-32">Class</th>
                    <th className="p-2 sm:p-4 font-bold text-muted w-auto sm:w-32 cursor-pointer select-none hover:text-subtle transition-colors text-xs sm:text-base" onClick={() => handleSortMoves('price')}>
                      <div className="flex items-center gap-1">
                        Price
                        {moveSortConfig?.key === 'price' && (
                          moveSortConfig.direction === 'asc' ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />
                        )}
                      </div>
                    </th>
                    <th className="p-2 sm:p-4 font-bold text-muted text-center w-auto sm:w-32 text-xs sm:text-base">Action</th>
                  </tr>
                ) : (
                  <tr className="bg-surface-raised border-b border-border">
                    <th className="p-2 sm:p-4 font-bold text-muted text-xs sm:text-base">Item</th>
                    <th className="p-2 sm:p-4 font-bold text-muted text-right sm:text-left text-xs sm:text-base">Price</th>
                    <th className="p-2 sm:p-4 font-bold text-muted text-right sm:text-left text-xs sm:text-base">Quantity</th>
                  </tr>
                )}
              </thead>
              <tbody>
                {activeCategory !== 'moves' && filteredItems?.map((item) => {
                  const ownedQuantity = Number(inventoryQuantityByItemId.get(item.id) ?? 0);
                  const qty = Number(quantities[item.id] || 0);
                  const sellQty = Math.min(qty, ownedQuantity);

                  return (
                    <tr key={item.id} className="border-b border-border/50 hover:bg-surface-raised transition-colors">
                      <td className="p-2 sm:p-4 align-middle">
                        <div className="flex items-center gap-2 sm:gap-4">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-surface-raised rounded-xl flex items-center justify-center border border-border shrink-0">
                            {item.spriteUrl ? (
                              <img src={item.spriteUrl} alt={item.name} className="w-6 h-6 sm:w-8 sm:h-8 object-contain filter drop-shadow-md" />
                            ) : (
                              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-surface-raised rounded-full"></div>
                            )}
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="font-bold text-foreground capitalize text-xs sm:text-base leading-tight break-words max-w-[100px] sm:max-w-none">{item.name.replace('-', ' ')}</span>
                            <span className="text-[9px] sm:text-xs font-bold text-muted bg-surface-raised/80 px-1.5 py-0.5 rounded border border-border w-max mt-0.5">
                              Owned: {ownedQuantity.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-2 sm:p-4 font-bold text-muted text-right sm:text-left align-middle">
                        <div className="flex items-center justify-end sm:justify-start gap-1 sm:gap-1.5 text-xs sm:text-sm">
                          <span className="scale-75 sm:scale-100">{storeCurrency.symbol}</span> <span>{item.cost.toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="p-2 sm:p-4 align-middle">
                        <div className="flex items-center justify-end sm:justify-start">
                          <div className="flex items-center bg-surface-raised rounded-lg border border-border w-max">
                            <button
                              onClick={() => handleQuantityChange(item.id, qty - multiplier)}
                              className="w-7 h-7 sm:w-8 sm:h-8 rounded-l-lg flex items-center justify-center text-subtle hover:bg-surface-raised transition-colors"
                            >
                              -
                            </button>
                            <input
                              type="text"
                              value={qty || ''}
                              onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '');
                                handleQuantityChange(item.id, val ? parseInt(val) : 0);
                              }}
                              className="w-8 sm:w-12 text-center bg-transparent font-bold text-subtle outline-none text-xs sm:text-sm"
                            />
                            <button
                              onClick={() => handleQuantityChange(item.id, qty + multiplier)}
                              className="w-7 h-7 sm:w-8 sm:h-8 rounded-r-lg flex items-center justify-center text-subtle hover:bg-surface-raised transition-colors"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {activeCategory === 'moves' && sortedMoves?.map((m) => {
                  const isOwned = save?.unlockedMoves?.includes(m.moveId);
                  const canAfford = storeCurrency.amount >= m.price;

                  return (
                    <tr key={m.id} className="border-b border-border/50 hover:bg-surface-raised transition-colors">
                      <td className="p-2 sm:p-4">
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-foreground capitalize text-xs sm:text-base">{m.move.name.replace(/-/g, ' ')}</span>
                          <div className="sm:hidden flex items-center gap-1 text-[10px] font-bold text-subtle capitalize">
                            <img src={getTypeSpriteUrl(m.move.type.name, true)} alt={m.move.type.name} className="h-3 w-auto object-contain drop-shadow-sm" />
                            {m.move.type.name} • {m.move.power > 0 ? m.move.power : '-'} {m.move.damageClass === 'status' ? 'Status' : 'Pwr'}
                          </div>
                        </div>
                      </td>
                      <td className="hidden sm:table-cell p-4">
                        <div className="flex items-center gap-2 text-sm font-bold text-muted capitalize">
                          <img src={getTypeSpriteUrl(m.move.type.name, true)} alt={m.move.type.name} className="h-4 w-auto object-contain drop-shadow-sm" />
                          {m.move.type.name}
                        </div>
                      </td>
                      <td className="hidden sm:table-cell p-4 font-bold text-muted">
                        {m.move.power > 0 ? m.move.power : '-'}
                      </td>
                      <td className="hidden sm:table-cell p-4">
                        <span className="text-sm font-bold text-foreground capitalize">
                          {m.move.damageClass}
                        </span>
                      </td>
                      <td className="p-2 sm:p-4 font-bold text-muted">
                        <div className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-base">
                          <span className="scale-75 sm:scale-100 flex items-center">{storeCurrency.symbol}</span>
                          <span>{m.price.toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="p-2 sm:p-4 text-center">
                        {isOwned ? (
                          <span className="px-3 py-1.5 sm:px-6 sm:py-2 rounded-lg font-bold bg-surface-raised text-muted text-xs sm:text-base">
                            Owned
                          </span>
                        ) : (
                          <button
                            onClick={() => handleBuyMove(m)}
                            disabled={!canAfford || buyMoveMutation.isPending}
                            className={`px-3 py-1.5 sm:px-6 sm:py-2 rounded-lg font-bold shadow-sm transition-all whitespace-nowrap text-xs sm:text-base ${canAfford ? 'bg-surface-raised hover:bg-surface text-foreground hover:shadow-md hover:-translate-y-0.5 active:translate-y-0' : 'bg-surface-raised text-muted cursor-not-allowed' }`}
                          >
                            {buyMoveMutation.isPending ? 'Buying' : 'Buy'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Confirmation Modal */}
      {confirmModal && (() => {
        const itemsToProcess = visibleItems.map(item => {
          const ownedQuantity = Number(inventoryQuantityByItemId.get(item.id) ?? 0);
          const qty = Number(quantities[item.id] || 0);
          const sellQty = Math.min(qty, ownedQuantity);
          return { item, qty, sellQty };
        }).filter(x => confirmModal === 'buy' ? x.qty > 0 : x.sellQty > 0);

        return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-surface border border-border rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl flex flex-col items-center animate-in zoom-in-95 duration-200">
              <h2 className="text-2xl font-black text-foreground mb-2 text-center">
                Confirm {confirmModal === 'buy' ? 'Purchase' : 'Sale'}
              </h2>
              <p className="text-muted font-medium mb-4 text-center text-sm">
                You are about to {confirmModal === 'buy' ? 'buy' : 'sell'} {confirmModal === 'buy' ? selectedBuyItemsCount : selectedSellItemsCount} items.
              </p>
              
              <div className="w-full max-h-48 overflow-y-auto bg-surface-raised rounded-2xl p-3 border border-border mb-4 flex flex-col gap-2 custom-scrollbar">
                {itemsToProcess.map(({ item, qty, sellQty }) => {
                  const displayQty = confirmModal === 'buy' ? qty : sellQty;
                  const itemTotal = confirmModal === 'buy' ? item.cost * qty : Math.floor(item.cost * 0.75) * sellQty;
                  return (
                    <div key={item.id} className="flex items-center justify-between p-1">
                      <div className="flex items-center gap-2">
                        {item.spriteUrl ? (
                          <img src={item.spriteUrl} alt={item.name} className="w-6 h-6 object-contain" />
                        ) : (
                          <div className="w-4 h-4 bg-surface-raised rounded-full"></div>
                        )}
                        <span className="font-bold text-muted capitalize text-sm">{item.name.replace('-', ' ')}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-subtle">x{displayQty}</span>
                        <span className="text-sm font-bold text-foreground w-12 text-right">
                          {itemTotal.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="w-full bg-surface-raised rounded-2xl p-4 border border-border mb-6 flex flex-col items-center">
                <span className="block text-xs font-bold text-muted mb-1 uppercase tracking-wider">
                  Total {confirmModal === 'buy' ? 'Cost' : 'Payout'}
                </span>
                <div className="flex items-center justify-center gap-2 text-2xl font-black text-foreground">
                  <span>{storeCurrency.icon}</span>
                  <span>{(confirmModal === 'buy' ? totalBulkCost : totalBulkPayout).toLocaleString()}</span>
                </div>
              </div>
              
              <div className="flex w-full gap-3">
                <button 
                  onClick={() => setConfirmModal(null)}
                  className="flex-1 py-3 bg-surface-raised hover:bg-surface-raised text-muted font-bold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmModal === 'buy' ? executeBulkBuy : executeBulkSell}
                  className={`flex-1 py-3 font-bold rounded-xl text-foreground shadow-lg transition-colors flex items-center justify-center gap-2 ${confirmModal === 'buy' ? 'bg-surface-raised hover:bg-surface-raised shadow-glow' : 'bg-surface-raised hover:bg-surface-raised shadow-glow'}`}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
