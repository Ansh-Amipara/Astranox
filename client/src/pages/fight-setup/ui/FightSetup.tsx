import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api, getSpriteUrl } from '../../../shared/api/api';


interface Species {
  id: number;
  name: string;
  spriteUrl: string;
}

export function FightSetup() {
  const navigate = useNavigate();
  const [speciesId, setSpeciesId] = useState<string>('');
  const [level, setLevel] = useState<string>('5');
  const [error, setError] = useState('');

  // Fetch species
  const { data: speciesData, isLoading: speciesLoading } = useQuery<{ success: boolean; data: Species[] }>({
    queryKey: ['availableSpecies'],
    queryFn: async () => {
      const { data } = await api.get('/battles/available-species');
      return data;
    }
  });

  const speciesList = speciesData?.data || [];

  const engageMutation = useMutation({
    mutationFn: (data: { speciesId: number; level: number }) => api.post('/battles/engage-custom', data),
    onSuccess: () => {
      navigate('/battle');
    },
    onError: (err: any) => {
      setError(err.response?.data?.error?.message || 'Failed to start battle');
    }
  });

  const handleBattle = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!speciesId) {
      setError('Please select a Pokemon.');
      return;
    }

    const levelNum = parseInt(level, 10);
    if (isNaN(levelNum) || levelNum < 1 || levelNum > 100) {
      setError('Please enter a valid level between 1 and 100.');
      return;
    }

    engageMutation.mutate({
      speciesId: parseInt(speciesId, 10),
      level: levelNum
    });
  };

  if (speciesLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent" />
      </div>
    );
  }

  const selectedSpecies = speciesList.find(s => s.id === parseInt(speciesId, 10));

  return (
    <div className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col items-center">
      <div className="w-full mb-8 text-center">
        <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Custom Battle</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Select a Pokémon and level to fight against.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 w-full max-w-md">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 border border-red-200 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleBattle} className="space-y-6">
          <div>
            <label htmlFor="speciesId" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Select Pokémon
            </label>
            <select
              id="speciesId"
              value={speciesId}
              onChange={(e) => setSpeciesId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
            >
              <option value="">-- Choose a Pokémon --</option>
              {speciesList.map((species) => (
                <option key={species.id} value={species.id}>
                  #{species.id} {species.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="level" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Level (1-100)
            </label>
            <input
              type="text"
              id="level"
              value={level}
              onChange={(e) => setLevel(e.target.value.replace(/\D/g, ''))}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all font-mono"
            />
          </div>

          {selectedSpecies && (
            <div className="flex justify-center my-6">
              <div className="relative">
                <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full" />
                <img
                  src={getSpriteUrl(selectedSpecies.id)}
                  alt={selectedSpecies.name}
                  className="w-32 h-32 object-contain relative z-10"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={engageMutation.isPending || !speciesId || !level}
            className="w-full bg-red-500 hover:bg-red-600 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition-colors text-lg shadow-md hover:shadow-lg disabled:shadow-none flex items-center justify-center gap-2"
          >
            {engageMutation.isPending ? 'Starting...' : 'Battle!'}
          </button>
        </form>
      </div>
    </div>
  );
}
