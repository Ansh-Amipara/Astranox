import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { shopApi, api } from '../services/api';

interface Item {
  id: string;
  name: string;
  cost: number;
  description: string;
  spriteUrl: string | null;
}

export function Pokemart() {
  const queryClient = useQueryClient();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
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
    if (val > 99) val = 99;
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      {/* Header section */}
      <div className="flex justify-between items-end mb-8 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Pokémart
          </h1>
        </div>
        <div className="bg-yellow-100 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/20 px-6 py-3 rounded-xl flex flex-col items-end shadow-sm">
          <span className="text-xs font-bold text-yellow-600 dark:text-yellow-500 uppercase tracking-wider mb-1">Your Money</span>
          <span className="text-2xl font-black text-yellow-700 dark:text-yellow-400">₽ {save?.money || 0}</span>
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

      {/* Grid of items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items?.map((item) => {
          const qty = quantities[item.id] || 1;
          const cost = item.cost * qty;
          const canAfford = (save?.money || 0) >= cost;

          return (
            <div key={item.id} className="group bg-white dark:bg-slate-800/80 backdrop-blur rounded-2xl p-6 border border-slate-200 dark:border-slate-700/50 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col relative overflow-hidden">
              {/* Background accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 dark:bg-red-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-500"></div>
              
              <div className="flex justify-between items-start mb-4 relative">
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-xl flex items-center justify-center p-2 border border-slate-100 dark:border-slate-800 shadow-inner">
                  {item.spriteUrl ? (
                    <img src={item.spriteUrl} alt={item.name} className="w-12 h-12 object-contain filter drop-shadow-md group-hover:scale-110 transition-transform" />
                  ) : (
                    <div className="w-8 h-8 bg-slate-300 dark:bg-slate-700 rounded-full"></div>
                  )}
                </div>
                <div className="bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-slate-700 dark:text-slate-300">₽ {item.cost}</span>
                </div>
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 capitalize relative">{item.name.replace('-', ' ')}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 flex-grow relative">{item.description}</p>

              <div className="mt-auto relative space-y-4">
                <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 p-2 rounded-xl border border-slate-100 dark:border-slate-700/50">
                  <button 
                    onClick={() => handleQuantityChange(item.id, qty - 1)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
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
                    className="w-12 text-center bg-transparent font-bold text-slate-700 dark:text-white outline-none"
                  />
                  <button 
                    onClick={() => handleQuantityChange(item.id, qty + 1)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => handleBuy(item)}
                  disabled={!canAfford || buyMutation.isPending}
                  className={`w-full py-3 px-4 rounded-xl font-bold shadow-sm transition-all flex justify-between items-center
                    ${canAfford 
                      ? 'bg-red-500 hover:bg-red-600 text-white hover:shadow-md hover:-translate-y-0.5 active:translate-y-0' 
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'}`}
                >
                  <span>{buyMutation.isPending ? 'Buying...' : 'Buy'}</span>
                  <span className={canAfford ? 'text-red-100' : 'opacity-50'}>Total: ₽ {cost}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
