import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../shared/api/api';
import { useState } from 'react';
import { toast } from 'sonner';

interface InventoryItem {
  itemId: string;
  quantity: number;
  item: {
    name: string;
    description: string;
    spriteUrl: string | null;
    category: string;
  };
}

export function Bag() {
  const queryClient = useQueryClient();
  const [selectedItemToUse, setSelectedItemToUse] = useState<InventoryItem | null>(null);
  const { data: save, isLoading } = useQuery({
    queryKey: ['trainerSave'],
    queryFn: async () => {
      const { data } = await api.get('/trainers/me');
      return data.data;
    }
  });

  const useItemMutation = useMutation({
    mutationFn: async (data: { itemId: string; targetPokemonId?: string; quantity?: number }) => {
      const res = await api.post('/inventory/use', data);
      return res.data;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['trainerSave'] });
      toast.success(res.data.message);
      setSelectedItemToUse(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Failed to use item');
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  const inventory: InventoryItem[] = (save?.inventory || []).filter(
    (inv: InventoryItem) => inv.quantity > 0
  );

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 md:p-6 min-h-[calc(100vh-64px)] transition-colors duration-200 flex flex-col justify-start">
      <div className="w-full mx-auto space-y-4 md:space-y-6">
      <div className="flex justify-between items-end mb-8 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            My Bag
          </h1>
        </div>
      </div>

      {inventory.length === 0 ? (
        <div className="bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-12 text-center">
          <p className="text-slate-500 dark:text-slate-400 text-lg">Your bag is empty.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {inventory.map((inv) => (
            <div key={inv.itemId} className="bg-white dark:bg-slate-800/80 backdrop-blur rounded-2xl p-6 border border-slate-200 dark:border-slate-700/50 shadow-sm flex items-start gap-4">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-xl flex items-center justify-center p-2 border border-slate-100 dark:border-slate-800 shadow-inner shrink-0">
                {inv.item.spriteUrl ? (
                  <img src={inv.item.spriteUrl} alt={inv.item.name} className="w-12 h-12 object-contain filter drop-shadow-md" />
                ) : (
                  <div className="w-8 h-8 bg-slate-300 dark:bg-slate-700 rounded-full"></div>
                )}
              </div>
              <div className="flex flex-col justify-between h-full w-full">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white capitalize">{inv.item.name.replace('-', ' ')}</h3>
                    <span className="bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 px-3 py-1 rounded-full text-sm font-bold border border-red-200 dark:border-red-500/30">
                      x {inv.quantity}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{inv.item.description}</p>
                </div>
                {inv.item.category === 'xp-candy' && (
                  <div className="mt-4 flex gap-2 w-full overflow-x-auto no-scrollbar">
                    <button 
                      onClick={() => useItemMutation.mutate({ itemId: inv.itemId, quantity: 1 })}
                      disabled={useItemMutation.isPending}
                      className="flex-shrink-0 px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-800/50 rounded-lg font-bold transition-colors disabled:opacity-50"
                    >
                      {useItemMutation.isPending ? 'Using...' : 'Use'}
                    </button>
                    
                    {inv.quantity > 1 && (
                      <div className="flex items-center gap-1.5 ml-auto">
                        {[5, 10, 25, 50].map(qty => inv.quantity >= qty ? (
                          <button
                            key={qty}
                            onClick={() => useItemMutation.mutate({ itemId: inv.itemId, quantity: qty })}
                            disabled={useItemMutation.isPending}
                            className="px-2.5 py-2 text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
                          >
                            {qty}x
                          </button>
                        ) : null)}
                        <button
                          onClick={() => useItemMutation.mutate({ itemId: inv.itemId, quantity: inv.quantity })}
                          disabled={useItemMutation.isPending}
                          className="px-2.5 py-2 text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
                        >
                          Max
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}



      {/* Use Item Modal for items requiring Pokemon target */}
      {selectedItemToUse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-black mb-2 dark:text-white">Use {selectedItemToUse.item.name}</h2>
            <p className="text-slate-500 mb-6">Select a Pokémon to use this item on.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {save?.party?.map((p: any) => (
                <button
                  key={p.id}
                  onClick={() => useItemMutation.mutate({ itemId: selectedItemToUse.itemId, targetPokemonId: p.id })}
                  disabled={useItemMutation.isPending}
                  className="flex items-center gap-4 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-blue-500 dark:hover:border-blue-500 transition-colors text-left disabled:opacity-50"
                >
                  <img src={`https://res.cloudinary.com/d0baluu2/image/upload/astranox/pokemon/${p.species.id}.png`} alt={p.species.name} className="w-16 h-16 object-contain drop-shadow" />
                  <div>
                    <div className="font-bold text-lg capitalize dark:text-white">{p.nickname || p.species.name}</div>
                    <div className="text-sm font-bold text-slate-500">Level {p.level} &bull; {p.potential}</div>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setSelectedItemToUse(null)}
                className="px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}
