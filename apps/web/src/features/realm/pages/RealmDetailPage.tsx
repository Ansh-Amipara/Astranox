import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRealmDetail, useRealmSearch } from '../hooks/useRealms';
import { RealmBackdrop } from '../components/RealmBackdrop';
import { RealmEncounterCard } from '../components/RealmEncounterCard';
import { RealmFieldGuide } from '../components/RealmFieldGuide';
import { Skeleton, ErrorState } from '@/components/ui';
import { getTypeSpriteUrl } from '@/lib/axios';
import { RealmSearchResultDto } from '@astranox/types';
import { ArrowLeft, Compass, Loader2 } from 'lucide-react';

export const RealmDetailPage: React.FC = () => {
  const { realmId } = useParams<{ realmId: string }>();
  const navigate = useNavigate();
  const { data: realm, isLoading, isError, error, refetch } = useRealmDetail(realmId);
  const searchMutation = useRealmSearch();

  const [activeEncounter, setActiveEncounter] = useState<RealmSearchResultDto | null>(null);

  const handleSearch = async () => {
    if (!realmId) return;
    try {
      const result = await searchMutation.mutateAsync(realmId);
      setActiveEncounter(result);
    } catch {
      // Handled in mutation onError toast
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 bg-background p-4 sm:p-6 min-h-[calc(100dvh-4rem)] flex flex-col justify-start">
        <div className="w-full max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-10 w-28 rounded-xl" />
          <Skeleton className="h-56 w-full rounded-3xl" />
          <Skeleton className="h-96 w-full rounded-3xl" />
        </div>
      </div>
    );
  }

  if (isError || !realm) {
    return (
      <div className="flex-1 bg-background p-4 sm:p-6 min-h-[calc(100dvh-4rem)] flex items-center justify-center">
        <ErrorState
          title="Realm Not Found"
          message={(error as Error)?.message || 'The requested wilderness realm does not exist.'}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 bg-background text-foreground p-3 sm:p-4 md:p-6 min-h-[calc(100dvh-4rem)] flex flex-col justify-start">
      <div className="w-full max-w-7xl mx-auto space-y-6">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/realm')}
            className="min-h-[44px] px-4 py-2 bg-surface hover:bg-surface-raised border border-border text-foreground rounded-xl font-bold transition-all shadow-xs flex items-center gap-2 touch-manipulation select-none active:scale-[0.98]"
          >
            <ArrowLeft className="w-4 h-4" />
            All Realms
          </button>
        </div>

        {/* Hero Banner with Theme Backdrop */}
        <RealmBackdrop
          themeKey={realm.themeKey}
          className="p-6 sm:p-8 md:p-10 border border-border space-y-6"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-xl">
              <div className="flex flex-wrap items-center gap-2">
                {realm.types.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-surface/90 backdrop-blur-md border border-border shadow-2xs text-foreground"
                  >
                    <img
                      src={getTypeSpriteUrl(t, true)}
                      alt={t}
                      className="w-4 h-4 object-contain"
                    />
                    {t}
                  </span>
                ))}
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-surface-raised border border-border text-muted">
                  Spawn Level {realm.spawnLevelMin} - {realm.spawnLevelMax}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
                {realm.name}
              </h1>
              <p className="text-sm sm:text-base text-muted leading-relaxed">
                {realm.description}
              </p>
            </div>

            {/* Primary Search Button */}
            <div className="flex flex-col items-center sm:items-end justify-center">
              <button
                onClick={handleSearch}
                disabled={searchMutation.isPending}
                className="w-full sm:w-auto min-h-[52px] px-8 py-3.5 bg-primary text-primary-foreground hover:opacity-90 font-black text-base uppercase tracking-wider rounded-2xl shadow-md flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] disabled:opacity-50 touch-manipulation select-none"
              >
                {searchMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Searching Wilderness...
                  </>
                ) : (
                  <>
                    <Compass className="w-5 h-5" />
                    Search Realm
                  </>
                )}
              </button>
            </div>
          </div>
        </RealmBackdrop>

        {/* Encounter Card Overlay / Section */}
        {activeEncounter && (
          <RealmEncounterCard
            encounterResult={activeEncounter}
            onDismiss={() => setActiveEncounter(null)}
          />
        )}

        {/* Wilderness Field Guide */}
        <RealmFieldGuide
          species={realm.species}
          realmTypes={realm.types}
        />
      </div>
    </div>
  );
};
