import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, AlertCircle } from 'lucide-react';
import { shopApi, api } from '@/shared/api/api';
import { TrainerSaveDto, InventoryItemDto } from '@astranox/shared';

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
  const [storeType, setStoreType] = useState<'astral' | 'infinity'>('astral');
  const [mode, setMode] = useState<'buy' | 'sell'>('buy');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const { data: save } = useQuery({
    queryKey: ['trainerSave'],
    queryFn: async () => {
      const { data } = await api.get('/trainers/me');
      return data.data;
    }
  });

  const { data: items, isLoading } = useQuery<Item[]>({
    queryKey: ['shopItems'],
    queryFn: shopApi.getItems
  });

  const buyMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string, quantity: number }) => {
      return shopApi.buyItem(itemId, quantity);
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
        text: error.response?.data?.error?.message || 'Failed to buy item'
      });
      setTimeout(() => setMessage(null), 3000);
    }
  });

  const sellMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string, quantity: number }) => {
      return shopApi.sellItem(itemId, quantity);
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
        text: error.response?.data?.error?.message || 'Failed to sell item'
      });
      setTimeout(() => setMessage(null), 3000);
    }
  });

  const handleQuantityChange = (itemId: string, val: number, max: number = 999) => {
    if (val < 1) val = 1;
    if (val > max) val = max;
    setQuantities(prev => ({ ...prev, [itemId]: val }));
  };

  const handleBuy = (item: Item) => {
    const qty = quantities[item.id] || 1;
    buyMutation.mutate({ itemId: item.id, quantity: qty });
  };

  const handleSell = (item: Item) => {
    const qty = quantities[item.id] || 1;
    sellMutation.mutate({ itemId: item.id, quantity: qty });
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
  const visibleItems = mode === 'sell'
    ? storeItems.filter(item => (inventoryQuantityByItemId.get(item.id) || 0) > 0)
    : storeItems;

  const categories = ['all', ...Array.from(new Set(visibleItems.map(i => i.category)))].sort();
  const activeCategory = categories.includes(selectedCategory) ? selectedCategory : 'all';
  const filteredItems = visibleItems.filter(item => activeCategory === 'all' || item.category === activeCategory);

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
                  className={`px-4 py-2 rounded-md text-sm font-bold capitalize whitespace-nowrap transition-colors ${activeCategory === cat
                    ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                >
                  {cat === 'iv' ? 'IV' : cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' ')}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3 md:gap-4 ml-auto">
              <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-lg w-max shrink-0">
                <button
                  onClick={() => setStoreType('astral')}
                  className={`px-4 py-2 rounded-md text-sm font-bold capitalize transition-colors ${storeType === 'astral' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  Astral
                </button>
                <button
                  onClick={() => setStoreType('infinity')}
                  className={`px-4 py-2 rounded-md text-sm font-bold capitalize transition-colors ${storeType === 'infinity' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  Infinity
                </button>
              </div>

              <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-lg w-max shrink-0">
                <button
                  onClick={() => setMode('buy')}
                  className={`px-4 py-2 rounded-md text-sm font-bold capitalize transition-colors ${mode === 'buy' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  Buy
                </button>
                <button
                  onClick={() => setMode('sell')}
                  className={`px-4 py-2 rounded-md text-sm font-bold capitalize transition-colors ${mode === 'sell' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  Sell
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
                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                  <th className="p-4 font-bold text-slate-500 dark:text-slate-400">Item</th>
                  <th className="p-4 font-bold text-slate-500 dark:text-slate-400">Description</th>
                  <th className="p-4 font-bold text-slate-500 dark:text-slate-400">{mode === 'buy' ? 'Price' : 'Sell Price'}</th>
                  <th className="p-4 font-bold text-slate-500 dark:text-slate-400">Quantity</th>
                  <th className="p-4 font-bold text-slate-500 dark:text-slate-400">{mode === 'buy' ? 'Total' : 'Payout'}</th>
                  <th className="p-4 font-bold text-slate-500 dark:text-slate-400 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems?.map((item) => {
                  const ownedQuantity = Number(inventoryQuantityByItemId.get(item.id) ?? 0);
                  const maxQuantity = mode === 'sell' ? ownedQuantity : 999;
                  const qty = Math.min(Number(quantities[item.id] || 1), maxQuantity);
                  const buyTotal = item.cost * qty;
                  const sellPrice = Math.floor(item.cost * 0.75);
                  const sellTotal = sellPrice * qty;
                  const canAfford = storeCurrency.amount >= buyTotal;
                  const canSell = ownedQuantity >= qty && qty > 0;

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
                          {mode === 'sell' && (
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                              Owned: {ownedQuantity.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-slate-500 dark:text-slate-400 max-w-xs">{item.description}</td>
                      <td className="p-4 font-bold text-slate-700 dark:text-slate-300">
                        <div className="flex items-center gap-1.5">
                          {storeCurrency.symbol}
                          <span>{mode === 'buy' ? item.cost.toLocaleString() : sellPrice.toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center bg-slate-100 dark:bg-slate-900/80 rounded-lg border border-slate-200 dark:border-slate-700 w-max">
                          <button
                            onClick={() => handleQuantityChange(item.id, qty - multiplier, maxQuantity)}
                            className="w-8 h-8 rounded-l-lg flex items-center justify-center text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                          >
                            -
                          </button>
                          <input
                            type="text"
                            value={qty || ''}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, '');
                              handleQuantityChange(item.id, val ? parseInt(val) : 0, maxQuantity);
                            }}
                            className="w-12 text-center bg-transparent font-bold text-slate-700 dark:text-white outline-none text-sm"
                          />
                          <button
                            onClick={() => handleQuantityChange(item.id, qty + multiplier, maxQuantity)}
                            className="w-8 h-8 rounded-r-lg flex items-center justify-center text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className={`p-4 font-bold ${mode === 'buy' ? (canAfford ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400 dark:text-slate-600') : 'text-slate-900 dark:text-slate-100'}`}>
                        <div className="flex items-center gap-1.5">
                          {storeCurrency.symbol}
                          <span>{(mode === 'buy' ? buyTotal : sellTotal).toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => mode === 'buy' ? handleBuy(item) : handleSell(item)}
                          disabled={mode === 'buy' ? (!canAfford || buyMutation.isPending) : (!canSell || sellMutation.isPending)}
                          className={`px-6 py-2 rounded-lg font-bold shadow-sm transition-all whitespace-nowrap
                          ${mode === 'buy'
                              ? (canAfford
                                ? 'bg-slate-800 hover:bg-slate-900 text-slate-50 dark:bg-slate-700 dark:hover:bg-slate-600 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0'
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed')
                              : (canSell
                                ? 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-md hover:-translate-y-0.5 active:translate-y-0'
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed')}`}
                        >
                          {mode === 'buy'
                            ? (buyMutation.isPending ? 'Buying' : 'Buy')
                            : (sellMutation.isPending ? 'Selling' : 'Sell')}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
