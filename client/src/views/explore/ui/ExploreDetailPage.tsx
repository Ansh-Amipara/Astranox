import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ExploreService, ExploreResponse } from '@/services/explore.service';
import { api, getSpriteUrl } from '@/shared/api/api';
import { LOCATIONS } from './ExplorePage';

export function ExploreDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<ExploreResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const locationId = id?.toUpperCase();
  const isValidLocation = LOCATIONS.includes(locationId || '');

  if (!isValidLocation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-950">
        <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-4">Location not found</h2>
        <button onClick={() => navigate('/explore')} className="px-6 py-2 bg-slate-200 dark:bg-slate-800 rounded-xl font-bold">
          Go Back
        </button>
      </div>
    );
  }

  const handleExplore = async () => {
    if (!locationId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await ExploreService.explore(locationId);
      setResult(data);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to explore.');
    } finally {
      setLoading(false);
    }
  };

  const handleRun = async () => {
    if (result?.battleSessionId) {
      try {
        await api.post('/battles/turn', { action: 'run' });
      } catch (e) {
        console.error('Failed to flee:', e);
      }
    }
    setResult(null);
  };

  const handleFight = () => {
    navigate('/battle?returnUrl=/explore/' + locationId);
  };

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 md:p-6 min-h-[calc(100vh-64px)] transition-colors duration-200 flex flex-col justify-start">
      <div className="w-full mx-auto flex flex-col min-h-[calc(100vh-112px)]">
        
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-2 capitalize">
              {locationId?.replace('_', ' ').toLowerCase()}
            </h1>
            <p className="text-slate-500 font-medium">
              You have arrived at this location. Will you explore the area?
            </p>
          </div>
          
          <button
            onClick={() => navigate('/explore')}
            disabled={loading}
            className="px-6 py-3 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl transition-colors disabled:opacity-50 w-full sm:w-auto text-center"
          >
            Leave Area
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 font-bold rounded-xl border border-red-200 dark:border-red-800/50">
            {error}
          </div>
        )}

        <div className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-sm flex flex-col items-center justify-center p-8 relative overflow-hidden group">
          <div className="absolute inset-0 bg-emerald-500/5 dark:bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

          <button
            onClick={handleExplore}
            disabled={loading}
            className="relative z-10 w-full max-w-lg py-6 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-2xl rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {loading ? 'Exploring...' : 'Search Area'}
          </button>
          
          <p className="text-slate-400 dark:text-slate-500 mt-6 font-medium relative z-10">
            Click to search the environment for wild Pokémon and items.
          </p>
        </div>
      </div>

      {/* Result Modal */}
      {result && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in duration-200">
            
            {result.type === 'NOTHING' && (
              <div className="text-center text-slate-900 dark:text-white">
                <div className="text-6xl mb-4">💨</div>
                <h2 className="text-2xl font-black mb-2">Nothing Found</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-6 font-medium">{result.message}</p>
                <button onClick={() => setResult(null)} className="w-full py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-xl font-bold transition-colors">
                  Continue
                </button>
              </div>
            )}

            {result.type === 'COINS' && (
              <div className="text-center text-slate-900 dark:text-white">
                <div className="text-6xl mb-4 text-amber-500">💰</div>
                <h2 className="text-2xl font-black mb-2 text-amber-600 dark:text-amber-400">Coins Found!</h2>
                <p className="text-slate-600 dark:text-slate-300 mb-6 font-medium">{result.message}</p>
                <button onClick={() => setResult(null)} className="w-full py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-xl font-bold transition-colors">
                  Awesome!
                </button>
              </div>
            )}

            {result.type === 'POKEMON' && result.encounter && (
              <div className="text-center text-slate-900 dark:text-white">
                <h2 className="text-3xl font-black mb-2 text-red-500 dark:text-red-400 uppercase tracking-wider">
                  Wild Encounter!
                </h2>
                <div className="flex justify-center mb-4 relative">
                  <div className="absolute inset-0 bg-red-500/10 dark:bg-red-500/20 blur-xl rounded-full"></div>
                  <img 
                    src={getSpriteUrl(result.encounter.speciesId || result.encounter.species?.id)} 
                    alt={result.encounter.speciesName} 
                    className="w-40 h-40 object-contain relative z-10"
                    style={{ filter: 'drop-shadow(0 0 10px rgba(239,68,68,0.2))', imageRendering: 'pixelated' }}
                  />
                </div>
                
                <h3 className="text-2xl font-black capitalize mb-2">
                  {result.encounter.speciesName}
                </h3>
                <div className="flex items-center justify-center gap-4 text-sm font-bold mb-6">
                  <span className="bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-md text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    Lv. {result.encounter.level}
                  </span>
                  <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-md uppercase tracking-wider">
                    {result.encounter.potential.replace('_', ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button onClick={handleRun} className="py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-xl font-black transition-colors">
                    Run Away
                  </button>
                  <button onClick={handleFight} className="py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-black shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all">
                    Fight!
                  </button>
                </div>
              </div>
            )}
            
          </div>
        </div>
      )}
    </div>
  );
}
