import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, AlertCircle } from 'lucide-react';
import { shopApi, api } from '../../../shared/api/api';

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
  const [storeType, setStoreType] = useState<'astral' | 'infinity' | 'void'>('astral');
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
    onSuccess: (data) => {
      queryClient.setQueryData(['trainerSave'], data.data);
      setMessage({ type: 'success', text: 'Purchase successful!' });
      setQuantities({});
      setTimeout(() => setMessage(null), 3000);
    },
    onError: (error: any) => {
      setMessage({
        type: 'error',
        text: error.response?.data?.error?.message || 'Failed to buy item'
      });
      setTimeout(() => setMessage(null), 3000);
    }
  });

  const handleQuantityChange = (itemId: string, val: number) => {
    if (val < 1) val = 1;
    if (val > 999) val = 999;
    setQuantities(prev => ({ ...prev, [itemId]: val }));
  };

  const handleBuy = (item: Item) => {
    const qty = quantities[item.id] || 1;
    buyMutation.mutate({ itemId: item.id, quantity: qty });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-500"></div>
      </div>
    );
  }

  const storeItems = items?.filter(item => {
    if (storeType === 'infinity') return item.category === 'infinity-only'; // placeholder for future
    if (storeType === 'void') return item.category === 'void-only'; // placeholder for future
    return true; // Astral shows everything for now
  }) || [];

  const categories = ['all', ...Array.from(new Set(storeItems.map(i => i.category)))].sort();
  const activeCategory = categories.includes(selectedCategory) ? selectedCategory : 'all';
  const filteredItems = storeItems.filter(item => activeCategory === 'all' || item.category === activeCategory);

  const getStoreCurrency = () => {
    switch (storeType) {
      case 'infinity':
        return { name: 'Infinity Coins', amount: save?.infinityCoins || 0, icon: <img src="/infinity.png" alt="Infinity Coins" className="w-5 h-5 object-contain" />, symbol: <img src="/infinity.png" alt="Infinity Coins" className="w-4 h-4 object-contain" /> };
      case 'void':
        return { name: 'Void Coins', amount: save?.voidCoins || 0, icon: <img src="/void.png" alt="Void Coins" className="w-5 h-5 object-contain" />, symbol: <img src="/void.png" alt="Void Coins" className="w-4 h-4 object-contain" /> };
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

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">

            {/* Left Side: Title & Filter */}
            <div className="flex flex-col gap-6 w-full md:w-auto">
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Pokémart
              </h1>

              {/* Category Filter */}
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg overflow-x-auto w-full sm:w-max">
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
            </div>

            {/* Right Side: Tabs & Money */}
            <div className="flex flex-col items-start md:items-end gap-3 w-full md:w-auto">
              
              {/* Store Type Tabs */}
              <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-lg w-max">
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
                <button
                  onClick={() => setStoreType('void')}
                  className={`px-4 py-2 rounded-md text-sm font-bold capitalize transition-colors ${storeType === 'void' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  Void
                </button>
              </div>

              {/* Money */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-xl flex items-center justify-between md:justify-start w-full md:w-auto gap-3 shadow-sm shrink-0">
                <div className="flex items-center gap-2">
                  {storeCurrency.icon}
                  <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">{storeCurrency.name}</span>
                </div>
                <span className="text-xl font-black text-slate-800 dark:text-slate-200">{storeCurrency.amount.toLocaleString()}</span>
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
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                  <th className="p-4 font-bold text-slate-500 dark:text-slate-400">Item</th>
                  <th className="p-4 font-bold text-slate-500 dark:text-slate-400">Description</th>
                  <th className="p-4 font-bold text-slate-500 dark:text-slate-400">Price</th>
                  <th className="p-4 font-bold text-slate-500 dark:text-slate-400">Quantity</th>
                  <th className="p-4 font-bold text-slate-500 dark:text-slate-400">Total</th>
                  <th className="p-4 font-bold text-slate-500 dark:text-slate-400 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems?.map((item) => {
                  const qty = quantities[item.id] || 1;
                  const cost = item.cost * qty;
                  const canAfford = storeCurrency.amount >= cost;

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
                        </div>
                      </td>
                      <td className="p-4 text-sm text-slate-500 dark:text-slate-400 max-w-xs">{item.description}</td>
                      <td className="p-4 font-bold text-slate-700 dark:text-slate-300">
                        <div className="flex items-center gap-1.5">
                          {storeCurrency.symbol}
                          <span>{item.cost.toLocaleString()}</span>
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
                      <td className={`p-4 font-bold ${canAfford ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400 dark:text-slate-600'}`}>
                        <div className="flex items-center gap-1.5">
                          {storeCurrency.symbol}
                          <span>{cost.toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleBuy(item)}
                          disabled={!canAfford || buyMutation.isPending}
                          className={`px-6 py-2 rounded-lg font-bold shadow-sm transition-all whitespace-nowrap
                          ${canAfford
                              ? 'bg-slate-800 hover:bg-slate-900 text-slate-50 dark:bg-slate-700 dark:hover:bg-slate-600 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'}`}
                        >
                          {buyMutation.isPending ? 'Buying...' : 'Buy'}
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