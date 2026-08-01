import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, AlertCircle, ArrowUp, ArrowDown } from 'lucide-react';
import { shopApi, api } from '@/shared/api/api';
import { getTypeSpriteUrl } from '@/shared/api/axios';
import { TrainerSaveDto, InventoryItemDto } from '@astranox/shared';
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

  const handleBulkBuy = () => {
    const itemsToBuy = Object.entries(quantities)
      .filter(([itemId, qty]) => qty > 0 && visibleItems.some(i => i.id === itemId))
      .map(([itemId, quantity]) => ({ itemId, quantity }));
      
    if (itemsToBuy.length > 0) {
      buyBulkMutation.mutate(itemsToBuy);
    }
  };

  const handleBulkSell = () => {
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
  };

  const handleBuyMove = (move: MoveShopItem) => {
    buyMoveMutation.mutate(move.moveId);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-500"></div>
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
        return { name: 'Infinity Coins', amount: save?.infinityCoins || 0, icon: <img src="/infinity.png" alt="Infinity Coins" className="w-5 h-5 object-contain" />, symbol: <img src="/infinity.png" alt="Infinity Coins" className="w-4 h-4 object-contain" /> };
      case 'astral':
      default:
        return { name: 'Astral Coins', amount: save?.astralCoins || 0, icon: <img src="/astral.png" alt="Astral Coins" className="w-5 h-5 object-contain" />, symbol: <img src="/astral.png" alt="Astral Coins" className="w-4 h-4 object-contain" /> };
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
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 md:p-6 min-h-[calc(100vh-64px)] transition-colors duration-200 flex flex-col justify-start">
      <div className="w-full mx-auto space-y-4 md:space-y-6">
        {/* Header and Controls section */}
        <div className="mb-8 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center justify-between gap-3 md:gap-4 mb-4">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight shrink-0">
              Pokémart
            </h1>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-xl flex items-center justify-between gap-3 shadow-sm shrink-0">
              <div className="flex items-center gap-2">
                {storeCurrency.icon}
                <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">{storeCurrency.name}</span>
              </div>
              <span className="text-xl font-black text-slate-800 dark:text-slate-200">{storeCurrency.amount.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 md:gap-4 w-full">
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg overflow-x-auto w-full sm:w-max shrink-0">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold capitalize whitespace-nowrap transition-colors ${activeCategory === cat
                    ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                >
                  {cat === 'infinity-only' ? 'Potential' : cat === 'iv' ? 'IV' : cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' ')}
                </button>
              ))}
            </div>

            {activeCategory === 'moves' && (
              <div className="w-40 shrink-0 ml-auto">
                <Dropdown
                  value={selectedMoveType}
                  options={[
                    { value: 'all', label: 'All Types' },
                    ...moveTypes.map(t => ({
                      value: t,
                      label: t,
                      icon: <img src={getTypeSpriteUrl(t, true)} alt={t} className="h-4 w-auto object-contain" />
                    }))
                  ]}
                  onChange={setSelectedMoveType}
                  className="w-full sm:w-full"
                  dropdownClassName="w-48"
                />
              </div>
            )}

            <div className={`flex flex-wrap items-center gap-3 md:gap-4 ${activeCategory === 'moves' ? '' : 'ml-auto'}`}>
              <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-lg w-max shrink-0">
                  <button
                    onClick={() => setStoreType('astral')}
                    className={`px-4 py-2 rounded-md text-sm font-bold capitalize transition-colors ${storeType === 'astral' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                  >
                    Astral
                  </button>
                  <button
                    onClick={() => {
                      setStoreType('infinity');
                      if (selectedCategory === 'moves') {
                        setSelectedCategory('all');
                      }
                    }}
                    className={`px-4 py-2 rounded-md text-sm font-bold capitalize transition-colors ${storeType === 'infinity' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                  >
                    Infinity
                  </button>
              </div>
            </div>

          </div>
        </div>

        {/* Message Toast overlay */}
        {message && (
          <div className={`fixed top-20 right-8 px-6 py-4 rounded-xl shadow-lg z-50 transition-all transform flex items-center gap-3
          ${message.type === 'success' ? 'bg-green-100 border border-green-200 text-green-800 dark:bg-green-900/30 dark:border-green-800 dark:text-green-300' :
              'bg-red-100 border border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300'}`}>
            {message.type === 'success' ? (
              <Check className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="font-semibold">{message.text}</span>
          </div>
        )}

        {/* Table of items */}
        <div className="bg-white dark:bg-slate-800/80 backdrop-blur rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-200">
              <thead>
                {activeCategory === 'moves' ? (
                  <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                    <th className="p-4 font-bold text-slate-500 dark:text-slate-400 w-48">Move</th>
                    <th className="p-4 font-bold text-slate-500 dark:text-slate-400 w-32">Type</th>
                    <th className="p-4 font-bold text-slate-500 dark:text-slate-400 w-32 cursor-pointer select-none hover:text-slate-700 dark:hover:text-slate-200 transition-colors" onClick={() => handleSortMoves('power')}>
                      <div className="flex items-center gap-1">
                        Power
                        {moveSortConfig?.key === 'power' && (
                          moveSortConfig.direction === 'asc' ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />
                        )}
                      </div>
                    </th>
                    <th className="p-4 font-bold text-slate-500 dark:text-slate-400 w-32">Class</th>
                    <th className="p-4 font-bold text-slate-500 dark:text-slate-400 w-32 cursor-pointer select-none hover:text-slate-700 dark:hover:text-slate-200 transition-colors" onClick={() => handleSortMoves('price')}>
                      <div className="flex items-center gap-1">
                        Price
                        {moveSortConfig?.key === 'price' && (
                          moveSortConfig.direction === 'asc' ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />
                        )}
                      </div>
                    </th>
                    <th className="p-4 font-bold text-slate-500 dark:text-slate-400 text-center w-32">Action</th>
                  </tr>
                ) : (
                  <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                    <th className="p-4 font-bold text-slate-500 dark:text-slate-400">Item</th>
                    <th className="p-4 font-bold text-slate-500 dark:text-slate-400">Description</th>
                    <th className="p-4 font-bold text-slate-500 dark:text-slate-400">Price</th>
                    <th className="p-4 font-bold text-slate-500 dark:text-slate-400">Quantity</th>
                    <th className="p-4 font-bold text-slate-500 dark:text-slate-400">Buy Total / Payout</th>
                  </tr>
                )}
              </thead>
              <tbody>
                {activeCategory !== 'moves' && filteredItems?.map((item) => {
                  const ownedQuantity = Number(inventoryQuantityByItemId.get(item.id) ?? 0);
                  const qty = Number(quantities[item.id] || 0);
                  const sellQty = Math.min(qty, ownedQuantity);
                  
                  const buyTotal = item.cost * qty;
                  const sellPrice = Math.floor(item.cost * 0.75);
                  const sellTotal = sellPrice * sellQty;

                  return (
                    <tr key={item.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-900 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-800 shrink-0">
                            {item.spriteUrl ? (
                              <img src={item.spriteUrl} alt={item.name} className="w-8 h-8 object-contain filter drop-shadow-md" />
                            ) : (
                              <div className="w-6 h-6 bg-slate-300 dark:bg-slate-700 rounded-full"></div>
                            )}
                          </div>
                          <span className="font-bold text-slate-900 dark:text-white capitalize">{item.name.replace('-', ' ')}</span>
                          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-2">
                            Owned: {ownedQuantity.toLocaleString()}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-slate-500 dark:text-slate-400 max-w-xs">{item.description}</td>
                      <td className="p-4 font-bold text-slate-700 dark:text-slate-300">
                        <div className="flex items-center gap-1.5 text-sm">
                          {storeCurrency.symbol} <span>{item.cost.toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center bg-slate-100 dark:bg-slate-900/80 rounded-lg border border-slate-200 dark:border-slate-700 w-max">
                          <button
                            onClick={() => handleQuantityChange(item.id, qty - multiplier)}
                            className="w-8 h-8 rounded-l-lg flex items-center justify-center text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
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
                            className="w-12 text-center bg-transparent font-bold text-slate-700 dark:text-white outline-none text-sm"
                          />
                          <button
                            onClick={() => handleQuantityChange(item.id, qty + multiplier)}
                            className="w-8 h-8 rounded-r-lg flex items-center justify-center text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className={`p-4 font-bold text-slate-900 dark:text-slate-100`}>
                        <div className="flex items-center gap-4 text-sm whitespace-nowrap">
                          <div className="flex items-center gap-1.5 w-28">
                            <span className="text-xs text-slate-400">Buy:</span> {storeCurrency.symbol} <span className="tabular-nums">{buyTotal.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 w-28">
                            <span className="text-xs text-slate-400">Sell:</span> {storeCurrency.symbol} <span className="tabular-nums">{sellTotal.toLocaleString()}</span>
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
                    <tr key={m.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-4">
                        <span className="font-bold text-slate-900 dark:text-white capitalize">{m.move.name.replace(/-/g, ' ')}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 capitalize">
                          <img src={getTypeSpriteUrl(m.move.type.name, true)} alt={m.move.type.name} className="h-4 w-auto object-contain drop-shadow-sm" />
                          {m.move.type.name}
                        </div>
                      </td>
                      <td className="p-4 font-bold text-slate-700 dark:text-slate-300">
                        {m.move.power > 0 ? m.move.power : '-'}
                      </td>
                      <td className="p-4">
                        <span className="text-sm font-bold text-slate-900 dark:text-white capitalize">
                          {m.move.damageClass}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-slate-700 dark:text-slate-300">
                        <div className="flex items-center gap-1.5">
                          {storeCurrency.symbol}
                          <span>{m.price.toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        {isOwned ? (
                          <span className="px-6 py-2 rounded-lg font-bold bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500">
                            Owned
                          </span>
                        ) : (
                          <button
                            onClick={() => handleBuyMove(m)}
                            disabled={!canAfford || buyMoveMutation.isPending}
                            className={`px-6 py-2 rounded-lg font-bold shadow-sm transition-all whitespace-nowrap ${canAfford
                                ? 'bg-slate-800 hover:bg-slate-900 text-slate-50 dark:bg-slate-700 dark:hover:bg-slate-600 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0'
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                              }`}
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

        {/* Bulk Action Footer */}
        {activeCategory !== 'moves' && (
          <div className="mt-6 flex flex-col items-stretch md:flex-row md:items-center justify-between gap-4 p-4 bg-white dark:bg-slate-800/80 backdrop-blur rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-sm sticky bottom-4 z-10">
            <div className="flex flex-col items-center md:items-start gap-2 w-full md:w-auto">
              <button
                onClick={handleBulkBuy}
                disabled={selectedBuyItemsCount === 0 || storeCurrency.amount < totalBulkCost || buyBulkMutation.isPending}
                className={`w-full md:w-auto px-5 py-2 rounded-lg font-bold shadow-sm transition-all text-sm whitespace-nowrap flex items-center justify-center gap-2
                  ${selectedBuyItemsCount > 0 && storeCurrency.amount >= totalBulkCost
                    ? 'bg-slate-800 hover:bg-slate-900 text-slate-50 dark:bg-slate-700 dark:hover:bg-slate-600 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'}`}
              >
                Buy Items ({selectedBuyItemsCount}) for 
                <span className="flex items-center gap-1 ml-1 text-slate-300">
                  {storeCurrency.symbol}
                  {totalBulkCost.toLocaleString()}
                </span>
              </button>
            </div>
            
            <div className="flex flex-col items-center md:items-end gap-2 w-full md:w-auto">
              <button
                onClick={handleBulkSell}
                disabled={selectedSellItemsCount === 0 || sellBulkMutation.isPending}
                className={`w-full md:w-auto px-5 py-2 rounded-lg font-bold shadow-sm transition-all text-sm whitespace-nowrap flex items-center justify-center gap-2
                  ${selectedSellItemsCount > 0
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-md hover:-translate-y-0.5 active:translate-y-0'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'}`}
              >
                Sell Items ({selectedSellItemsCount}) for 
                <span className="flex items-center gap-1 ml-1 text-indigo-200">
                  {storeCurrency.symbol}
                  {totalBulkPayout.toLocaleString()}
                </span>
              </button>
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
                (Items can be sold for 75% of their base purchase price.)
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
