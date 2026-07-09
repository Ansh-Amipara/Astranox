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
      <p className="text-slate-600 dark:text-slate-400 text-lg mb-8">
        Use the navigation menu above to manage your Pokémon Team and PC Box.
      </p>
      <div className="flex gap-4">
        <span className="rounded-full bg-yellow-100 dark:bg-yellow-500/10 px-6 py-3 text-lg font-bold text-yellow-600 dark:text-yellow-500 border border-yellow-200 dark:border-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.1)] dark:shadow-[0_0_15px_rgba(234,179,8,0.2)]">
          Balance: ₽ {save.money}
        </span>
      </div>
    </div>
  );
}
