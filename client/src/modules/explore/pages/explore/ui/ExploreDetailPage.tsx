import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ExploreService, ExploreResponse } from '@/modules/explore/services/explore.service';
import { api, getSpriteUrl } from '@/shared/api/api';
import { LOCATIONS, getRealmImagePath } from './ExplorePage';

const REGION_TYPES: Record<string, string[]> = {
  PLAINS: ['Normal', 'Flying', 'Grass'],
  FOREST: ['Bug', 'Grass', 'Poison'],
  VOLCANO: ['Fire', 'Rock', 'Ground'],
  OCEAN: ['Water', 'Ice'],
  FROZEN_PEAKS: ['Ice', 'Steel'],
  DESERT: ['Ground', 'Rock'],
  MOUNTAIN: ['Rock', 'Fighting', 'Flying'],
  HAUNTED_RUINS: ['Ghost', 'Dark'],
  FAIRY_GARDEN: ['Fairy', 'Grass'],
  SWAMP: ['Poison', 'Ground', 'Water'],
  ANCIENT_TEMPLE: ['Psychic', 'Dragon', 'Rock'],
  CRYSTAL_CAVE: ['Rock', 'Ice', 'Fairy'],
  SKY_ISLANDS: ['Flying', 'Dragon', 'Fairy'],
  ALOLA_REGION: ['Water', 'Fire', 'Grass'],
  HISUI_REGION: ['Fighting', 'Ghost', 'Ice'],
  GALAR_REGION: ['Steel', 'Dragon', 'Dark'],
  PALDEA_REGION: ['Dragon', 'Fighting', 'Fairy']
};

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
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      setError(error.response?.data?.error?.message || 'Failed to trigger encounter');
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

  const types = locationId ? (REGION_TYPES[locationId] || ['Various Types']) : [];

  return (
    <div className="flex-1 relative min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
      {/* Background Image */}
      {locationId && (
        <div className="absolute inset-0 z-0">
          <img src={getRealmImagePath(locationId)} alt={locationId} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]"></div>
        </div>
      )}

      {/* Centered Popup Card */}
      <div className="relative z-10 w-full max-w-lg bg-white/95 dark:bg-ink-dark/95 backdrop-blur-xl border border-white/20 dark:border-ink-light/20 rounded-3xl shadow-2xl p-8 text-center flex flex-col items-center">

        {error && (
          <div className="w-full mb-6 p-4 bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 font-bold rounded-xl border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}

        <h1 className="text-4xl font-black text-ink-dark dark:text-ink-paper capitalize mb-2">
          {locationId?.replace(/_/g, ' ').toLowerCase()}
        </h1>

        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {types.map(t => (
            <span key={t} className="px-3 py-1 bg-ink-blue/10 dark:bg-ink-blue/20 text-ink-blue dark:text-ink-paper font-bold text-sm rounded-full uppercase tracking-wider border border-ink-blue/20">
              {t}
            </span>
          ))}
        </div>
        <div className="w-full flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate('/explore')}
            disabled={loading}
            className="flex-1 py-4 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-black text-xl rounded-2xl transition-all hover:-translate-y-1 active:translate-y-0 disabled:opacity-50"
          >
            Leave
          </button>
          <button
            onClick={handleExplore}
            disabled={loading}
            className="flex-1 py-4 bg-ink-blue hover:bg-ink-dark text-white font-black text-xl rounded-2xl shadow-[0_0_20px_rgba(109,129,150,0.3)] hover:shadow-[0_0_30px_rgba(109,129,150,0.5)] transition-all hover:-translate-y-1 active:translate-y-0 disabled:opacity-50"
          >
            {loading ? 'Exploring...' : 'Explore'}
          </button>
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
                <div className="text-6xl mb-4 text-ink-blue">💰</div>
                <h2 className="text-2xl font-black mb-2 text-ink-dark dark:text-ink-paper">Coins Found!</h2>
                <p className="text-slate-600 dark:text-slate-300 mb-6 font-medium">{result.message}</p>
                <button onClick={() => setResult(null)} className="w-full py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-xl font-bold transition-colors">
                  Awesome!
                </button>
              </div>
            )}

            {result.type === 'POKEMON' && result.encounter && (
              <div className="text-center text-slate-900 dark:text-white">
                <h2 className="text-3xl font-black mb-2 text-ink-dark dark:text-ink-paper uppercase tracking-wider">
                  Wild Encounter!
                </h2>
                <div className="flex justify-center mb-4 relative">
                  <div className="absolute inset-0 bg-ink-blue/10 dark:bg-ink-blue/20 blur-xl rounded-full"></div>
                  <img
                    src={getSpriteUrl(result.encounter.speciesId || result.encounter.species?.id)}
                    alt={result.encounter.speciesName}
                    className="w-40 h-40 object-contain relative z-10"
                    style={{ filter: 'drop-shadow(0 0 10px rgba(109,129,150,0.2))', imageRendering: 'pixelated' }}
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
                  <button onClick={handleFight} className="py-3 bg-ink-blue hover:bg-ink-dark text-white rounded-xl font-black shadow-[0_0_15px_rgba(109,129,150,0.3)] transition-all">
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
