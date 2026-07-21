'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../shared/api/api';

interface InventoryItem {
  itemId: string;
  quantity: number;
  item: {
    name: string;
    description: string;
    spriteUrl: string | null;
  };
}

export function Bag() {
  const { data: save, isLoading } = useQuery({
    queryKey: ['trainerSave'],
    queryFn: async () => {
      const { data } = await api.get('/trainers/me');
      return data.data;
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  const inventory: InventoryItem[] = save?.inventory || [];

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
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    </div>
  );
}
