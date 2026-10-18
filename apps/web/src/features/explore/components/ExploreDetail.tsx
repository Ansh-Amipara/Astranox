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
      <div className="flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-background">
        <h2 className="text-2xl font-black text-foreground mb-4">Location not found</h2>
        <button onClick={() => navigate('/explore')} className="px-6 py-2 bg-surface-raised rounded-xl font-bold">
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
    <div className="flex-1 relative min-h-[calc(100vh-64px)] flex items-center justify-center p-4 bg-surface-raised">
      
      {/* Leave Button */}
      <button 
        onClick={() => navigate('/explore')} 
        className="absolute top-4 left-4 z-20 px-4 py-2 bg-primary/50 hover:bg-primary/80 backdrop-blur-md border border-border text-foreground rounded-xl font-bold transition-all shadow-sm flex items-center gap-2"
      >
        <ArrowLeft className="w-5 h-5" /> Leave
      </button>

      {/* Centered Popup Card */}
      <div className="relative z-10 w-full max-w-lg bg-primary/95 backdrop-blur-xl border border-border/20 rounded-3xl shadow-2xl p-8 text-center flex flex-col items-center">

        <div className="w-24 h-24 mb-4 flex items-center justify-center">
           <img src={getTypeSpriteUrl(typeName, true)} alt={typeName} className="w-full h-full object-contain" />
        </div>

        <h1 className="text-4xl font-black text-ink-dark capitalize mb-8">
          {typeName} Region
        </h1>
        <div className="w-full">
          <button
            onClick={handleExplore}
            disabled={loading}
            className="w-full py-4 bg-ink-blue hover:bg-ink-dark text-foreground font-black text-xl rounded-2xl shadow-glow hover:shadow-glow transition-all hover:-translate-y-1 active:translate-y-0 disabled:opacity-50"
          >
            {loading ? 'Exploring...' : 'Explore'}
          </button>
        </div>
      </div>

      {/* Result Modal */}
      {result && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/60 backdrop-blur-sm">
          <div className="bg-surface border border-border rounded-2xl p-8 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in duration-200">



            {result.type === 'POKEMON' && result.encounter && (
              <div className="text-center text-foreground">
                <h2 className="text-3xl font-black mb-2 text-foreground uppercase tracking-wider">
                  Wild Encounter!
                </h2>
                <div className="flex justify-center mb-4 relative">
                  <div className="absolute inset-0 bg-surface-raised blur-xl rounded-full"></div>
                  <img
                    src={getSpriteUrl(result.encounter.speciesId || result.encounter.species?.id)}
                    alt={result.encounter.speciesName}
                    className="w-40 h-40 object-contain relative z-10 drop-shadow-md"
                    style={{ imageRendering: 'pixelated' }}
                  />
                </div>

                <h3 className="text-2xl font-black capitalize mb-2">
                  {result.encounter.speciesName}
                </h3>
                <div className="flex items-center justify-center gap-4 text-sm font-bold mb-6">
                  <span className="bg-surface-raised px-3 py-1 rounded-md text-muted uppercase tracking-wider">
                    Lv. {result.encounter.level}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button onClick={handleRun} className="py-3 bg-surface-raised hover:bg-surface-raised text-muted rounded-xl font-black transition-colors">
                    Run Away
                  </button>
                  <button onClick={handleFight} className="py-3 bg-ink-blue hover:bg-ink-dark text-foreground rounded-xl font-black shadow-glow transition-all">
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

