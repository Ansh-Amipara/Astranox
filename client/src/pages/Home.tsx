import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/auth.store';
import { api } from '../services/api';
import { StarterSelection } from './StarterSelection';

export function Home() {
  const { user, logout } = useAuthStore();

  const { data: save, isLoading, isError } = useQuery({
    queryKey: ['trainerSave'],
    queryFn: async () => {
      const { data } = await api.get('/trainers/me');
      return data.data; // The TrainerSave object
    },
  });

  if (isLoading) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading Trainer Data...</div>;
  }

  if (isError) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-red-500">Failed to load save data.</div>;
  }

  if (!save?.starterChosenAt) {
    return <StarterSelection />;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <nav className="border-b border-slate-800 bg-slate-950 px-6 py-4 flex items-center justify-between">
        <div className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Astranox Terminal
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-400">
            Trainer <span className="font-semibold text-slate-200">{user?.username}</span>
          </span>
          <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-sm font-medium text-yellow-500 border border-yellow-500/20">
            ₽ {save.money}
          </span>
          <button 
            onClick={logout}
            className="rounded-md bg-slate-800 px-3 py-1.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Welcome back, {user?.username}</h1>
          <p className="text-slate-400 mt-2">Manage your party and prepare for battle.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            <h2 className="text-xl font-semibold text-white border-b border-slate-800 pb-2">Your Party</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {save.party?.map((pkmn: any) => (
                <div key={pkmn.id} className="rounded-xl border border-slate-800 bg-slate-900 p-4 flex items-center gap-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 px-3 py-1 bg-blue-900/30 text-blue-400 text-xs font-bold rounded-bl-lg border-b border-l border-blue-900/50">
                    Lv. {pkmn.level}
                  </div>
                  <div className="h-16 w-16 rounded-full bg-slate-800/50 flex items-center justify-center p-2 border border-slate-700">
                    <img src={`http://localhost:3000/sprites/${pkmn.speciesId}.png`} alt={pkmn.species.name} style={{ imageRendering: 'pixelated' }} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white capitalize">{pkmn.nickname || pkmn.species.name}</h3>
                    <div className="flex gap-2 mt-1">
                      <span className="text-xs text-slate-400">HP IV: {pkmn.ivHp}</span>
                      <span className="text-xs text-slate-400">ATK IV: {pkmn.ivAttack}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
