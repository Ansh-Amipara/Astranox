import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ExploreService, ExploreResponse } from '../api';
import { api, getSpriteUrl } from '@/shared/api/api';
import { LOCATIONS } from './Explore';
import { getTypeSpriteUrl } from '@/lib/axios';
import { notify } from '@/lib/toast';
import { parseApiError } from '@/lib/apiError';
import { ArrowLeft } from 'lucide-react';

export function ExploreDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<ExploreResponse | null>(null);

  const locationId = id?.toUpperCase();
  const isValidLocation = LOCATIONS.includes(locationId || '');

  if (!isValidLocation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[calc(100dvh-64px)] bg-background p-4 text-center">
        <h2 className="text-xl sm:text-2xl font-black text-foreground mb-4">Location not found</h2>
        <button onClick={() => navigate('/explore')} className="px-6 py-2.5 min-h-[44px] bg-surface-raised hover:bg-surface border border-border text-foreground rounded-xl font-bold touch-manipulation">
          Go Back
        </button>
      </div>
    );
  }

  const handleExplore = async () => {
    if (!locationId) return;
    setLoading(true);
    try {
      const data = await ExploreService.explore(locationId);
      if (data.type === 'NOTHING') {
        notify.info(data.message || 'Nothing found');
      } else if (data.type === 'COINS') {
        notify.success(data.message || 'Coins obtained');
      } else {
        setResult(data);
      }
    } catch (err: unknown) {
      notify.error(parseApiError(err).message || 'Failed to trigger encounter');
    } finally {
      setLoading(false);
    }
  };

  const handleRun = async () => {
    if (result?.battleSessionId) {
      try {
        await api.post('/battles/turn', { action: 'run' });
      } catch (e) {
        notify.error(parseApiError(e).message || 'Failed to flee', { id: 'explore-flee-error' });
      }
    }
    setResult(null);
  };

  const handleFight = () => {
    navigate('/battle?returnUrl=/explore/' + locationId);
  };

  const typeName = locationId ? locationId.replace('_REGION', '').toLowerCase() : '';

  return (
    <div className="flex-1 relative min-h-[calc(100dvh-4rem)] flex items-center justify-center p-4 bg-background">
      {/* Leave Button */}
      <button 
        onClick={() => navigate('/explore')} 
        className="absolute top-4 left-4 z-20 min-h-[44px] px-4 py-2 bg-surface/80 hover:bg-surface backdrop-blur-md border border-border text-foreground rounded-xl font-bold transition-all shadow-xs flex items-center gap-2 touch-manipulation select-none active:scale-[0.98]"
      >
        <ArrowLeft className="w-4 h-4" /> Leave
      </button>

      {/* Centered Region Card */}
      <div className="relative z-10 w-full max-w-md bg-surface border border-border rounded-2xl shadow-xs p-6 sm:p-8 text-center flex flex-col items-center">
        <div className="w-20 h-20 sm:w-24 sm:h-24 mb-4 rounded-2xl bg-surface-raised flex items-center justify-center border border-border/60">
          <img src={getTypeSpriteUrl(typeName, true)} alt={typeName} className="h-8 w-auto object-contain drop-shadow-xs" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-foreground capitalize mb-2">
          {typeName} Region
        </h1>
        <p className="text-xs sm:text-sm text-muted mb-6">Explore the wilderness to discover wild Pokémon encounters.</p>

        <div className="w-full">
          <button
            onClick={handleExplore}
            disabled={loading}
            className="w-full min-h-[48px] py-3 bg-primary hover:opacity-90 text-primary-foreground font-black text-base sm:text-lg rounded-xl shadow-xs transition-all active:scale-[0.98] disabled:opacity-50 touch-manipulation select-none"
          >
            {loading ? 'Exploring...' : 'Explore Zone'}
          </button>
        </div>
      </div>

      {/* Result Modal */}
      {result && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-background/80 backdrop-blur-xs">
          <div className="bg-surface border border-border rounded-t-3xl sm:rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative pb-safe animate-in fade-in slide-in-from-bottom sm:zoom-in duration-200">
            <div className="sm:hidden mx-auto -mt-2 mb-4 h-1.5 w-12 rounded-full bg-border" aria-hidden="true" />

            {result.type === 'POKEMON' && result.encounter && (
              <div className="text-center text-foreground space-y-4">
                <span className="inline-block text-xs font-black uppercase tracking-wider px-3 py-1 bg-surface-raised border border-border rounded-full text-muted">
                  Wild Encounter!
                </span>

                <div className="flex justify-center py-2 relative">
                  <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-2xl bg-surface-raised border border-border flex items-center justify-center shadow-xs">
                    <img
                      src={getSpriteUrl(result.encounter.speciesId || result.encounter.species?.id)}
                      alt={result.encounter.speciesName}
                      className="w-24 h-24 sm:w-28 sm:h-28 object-contain pixelated"
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-xl sm:text-2xl font-black capitalize text-foreground">
                    {result.encounter.speciesName}
                  </h3>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <span className="bg-surface-raised px-2.5 py-0.5 rounded-full border border-border text-xs font-bold text-muted">
                      Lv. {result.encounter.level}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={handleRun}
                    className="min-h-[44px] py-2.5 bg-surface-raised hover:bg-surface-raised/80 text-muted hover:text-foreground rounded-xl font-bold text-xs uppercase tracking-wider border border-border transition-all active:scale-[0.98] touch-manipulation select-none"
                  >
                    Run Away
                  </button>
                  <button
                    onClick={handleFight}
                    className="min-h-[44px] py-2.5 bg-primary hover:opacity-90 text-primary-foreground rounded-xl font-black text-xs uppercase tracking-wider shadow-xs transition-all active:scale-[0.98] touch-manipulation select-none"
                  >
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

export const ExploreDetail = ExploreDetailPage;

