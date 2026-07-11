import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/auth.store';
import { api } from '../services/api';
import { StarterSelection } from './StarterSelection';

export function Home() {
  const { user } = useAuthStore();

  const { data: save, isLoading: isSaveLoading } = useQuery({
    queryKey: ['trainerSave'],
    queryFn: async () => {
      const { data } = await api.get('/trainers/me');
      return data.data;
    },
  });

  if (isSaveLoading) {
    return <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-900 dark:text-white transition-colors duration-200">Loading Trainer Data...</div>;
  }

  if (!save?.starterChosenAt) {
    return <StarterSelection />;
  }

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center min-h-[calc(100vh-64px)] transition-colors duration-200">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-4">
        Welcome to Astranox, Trainer {user?.username}!
      </h1>
      <div className="flex gap-4">
        <span className="rounded-full bg-yellow-100 dark:bg-yellow-500/10 px-6 py-3 text-lg font-bold text-yellow-600 dark:text-yellow-500 border border-yellow-200 dark:border-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.1)] dark:shadow-[0_0_15px_rgba(234,179,8,0.2)]">
          Balance: ₽ {save.money}
        </span>
      </div>

      <div className="mt-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm max-w-2xl w-full text-center">
        <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-200">Badges Earned</h2>
        {save.badges && save.badges.length > 0 ? (
          <div className="flex flex-wrap gap-4 justify-center">
            {save.badges.map((badge: string) => (
              <div key={badge} className="px-4 py-2 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-semibold shadow-inner text-slate-700 dark:text-slate-300">
                {badge}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 dark:text-slate-500 italic">No badges earned yet. Challenge Gym Leaders to earn them!</p>
        )}
      </div>
    </div>
  );
}
