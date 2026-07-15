import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  const categories = ['all', ...Array.from(new Set(items?.map(i => i.category) || []))].sort();
  const filteredItems = items?.filter(item => selectedCategory === 'all' || item.category === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
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
                  className={`px-4 py-2 rounded-md text-sm font-bold capitalize whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  {cat.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>
          
          {/* Right Side: Money & Quantity */}
          <div className="flex flex-col items-start md:items-end gap-3 w-full md:w-auto">
            {/* Money */}
            <div className="bg-yellow-100 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/20 px-4 py-2 rounded-xl flex items-center justify-between md:justify-start w-full md:w-auto gap-3 shadow-sm shrink-0">
              <span className="text-sm font-bold text-yellow-600 dark:text-yellow-500 uppercase tracking-wider">Your Money</span>
              <span className="text-xl font-black text-yellow-700 dark:text-yellow-400">₽ {save?.money || 0}</span>
            </div>
            
            {/* Quantity Step */}
            <div className="flex items-center justify-between md:justify-end w-full md:w-auto">
              <span className="text-sm font-bold text-slate-500 mr-3 whitespace-nowrap">Quantity Step:</span>
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                {[1, 10, 25, 50].map(m => (
                  <button
                    key={m}
                    onClick={() => setMultiplier(m)}
                    className={`px-3 py-1.5 rounded-md text-sm font-bold transition-colors ${
                      multiplier === m 
                        ? 'bg-red-500 text-white shadow-sm' 
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    x{m}
                  </button>
                ))}
              </div>
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
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
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
                const canAfford = (save?.money || 0) >= cost;

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
                    <td className="p-4 font-bold text-slate-700 dark:text-slate-300">₽ {item.cost}</td>
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
                    <td className={`p-4 font-bold ${canAfford ? 'text-red-500' : 'text-slate-400 dark:text-slate-600'}`}>₽ {cost}</td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleBuy(item)}
                        disabled={!canAfford || buyMutation.isPending}
                        className={`px-6 py-2 rounded-lg font-bold shadow-sm transition-all whitespace-nowrap
                          ${canAfford 
                            ? 'bg-red-500 hover:bg-red-600 text-white hover:shadow-md hover:-translate-y-0.5 active:translate-y-0' 
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
  );
}
