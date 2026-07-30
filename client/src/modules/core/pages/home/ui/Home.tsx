import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/modules/auth/store/auth.store';
import { api } from '@/shared/api/api';
import { StarterSelection } from '@/modules/pokemon/pages/starter-selection/ui/StarterSelection';
import { TrainerSaveDto } from '@astranox/shared';
import { HomePresenter } from './HomePresenter';

export function Home() {
  const { user } = useAuthStore();

  const { data: save, isLoading: isSaveLoading } = useQuery<TrainerSaveDto>({
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

  const party = save?.party || [];
  const teamCp = party.reduce((sum: number, p) => sum + (p.cp || 0), 0);

  return <HomePresenter save={save!} party={party} teamCp={teamCp} />;
}
