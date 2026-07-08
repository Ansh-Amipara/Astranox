import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

const PSEUDO_LEGENDARIES = [
  { id: 147, name: 'Dratini', type: 'Dragon' },
  { id: 246, name: 'Larvitar', type: 'Rock / Ground' },
  { id: 371, name: 'Bagon', type: 'Dragon' },
  { id: 374, name: 'Beldum', type: 'Steel / Psychic' },
  { id: 443, name: 'Gible', type: 'Dragon / Ground' },
  { id: 633, name: 'Deino', type: 'Dark / Dragon' },
  { id: 704, name: 'Goomy', type: 'Dragon' },
  { id: 782, name: 'Jangmo-o', type: 'Dragon' },
  { id: 885, name: 'Dreepy', type: 'Dragon / Ghost' },
];

export function StarterSelection() {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const mutation = useMutation({
    mutationFn: async (speciesId: number) => {
      const { data } = await api.post('/trainers/starter', { speciesId });
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch trainer save so the Home page updates
      queryClient.invalidateQueries({ queryKey: ['trainerSave'] });
    },
  });

  const handleConfirm = () => {
    if (selectedId) {
      mutation.mutate(selectedId);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 px-4 py-12 text-slate-100 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[800px] rounded-full bg-blue-600/10 blur-[150px] pointer-events-none"></div>

      <div className="relative z-10 mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl mb-4">
            Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Partner</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Welcome to Astranox. As per house rules, you may select one Pseudo-Legendary baby form to begin your journey.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-12">
          {PSEUDO_LEGENDARIES.map((pkm) => {
            const isSelected = selectedId === pkm.id;
            return (
              <div
                key={pkm.id}
                onClick={() => setSelectedId(pkm.id)}
                className={`group relative cursor-pointer overflow-hidden rounded-2xl border transition-all duration-300 ${
                  isSelected
                    ? 'border-blue-400 bg-blue-900/20 shadow-[0_0_30px_rgba(96,165,250,0.3)] scale-105'
                    : 'border-slate-800 bg-slate-900/50 hover:border-slate-600 hover:bg-slate-800/50 hover:scale-[1.02]'
                }`}
              >
                {/* Glow behind sprite */}
                <div className={`absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10 transition-opacity ${isSelected ? 'opacity-80' : 'opacity-40 group-hover:opacity-60'}`}></div>
                
                <div className="relative z-20 flex flex-col items-center p-6">
                  <img
                    src={`http://localhost:3000/sprites/${pkm.id}.png`}
                    alt={pkm.name}
                    className="h-32 w-32 object-contain transition-transform duration-500 group-hover:scale-110"
                    style={{ imageRendering: 'pixelated' }}
                  />
                  <h3 className="mt-4 text-xl font-bold text-white capitalize">{pkm.name}</h3>
                  <span className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-400">{pkm.type}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Fixed Confirmation Bar */}
        <div className={`fixed bottom-0 left-0 right-0 border-t border-slate-800 bg-slate-950/80 backdrop-blur-md p-6 transform transition-transform duration-300 z-50 ${selectedId ? 'translate-y-0' : 'translate-y-full'}`}>
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src={selectedId ? `http://localhost:3000/sprites/${selectedId}.png` : ''}
                className="h-16 w-16"
                style={{ imageRendering: 'pixelated' }}
              />
              <div>
                <p className="text-sm text-slate-400">Selected Partner</p>
                <p className="text-xl font-bold text-white">
                  {PSEUDO_LEGENDARIES.find(p => p.id === selectedId)?.name}
                </p>
              </div>
            </div>
            
            <button
              onClick={handleConfirm}
              disabled={mutation.isPending}
              className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-3 font-semibold text-white transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] disabled:opacity-50 disabled:hover:scale-100"
            >
              {mutation.isPending ? 'Confirming...' : 'Confirm Selection'}
            </button>
          </div>
        </div>
        
        {mutation.isError && (
          <div className="mt-4 rounded-lg bg-red-900/30 p-4 text-center text-red-400 border border-red-500/20">
            {mutation.error instanceof Error ? mutation.error.message : 'Failed to choose starter.'}
          </div>
        )}
      </div>
    </div>
  );
}
