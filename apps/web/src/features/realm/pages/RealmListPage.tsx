import React from 'react';
import { useRealms } from '../hooks/useRealms';
import { RealmCard } from '../components/RealmCard';
import { Skeleton, ErrorState } from '@/components/ui';

export const RealmListPage: React.FC = () => {
  const { data: realms, isLoading, isError, error, refetch } = useRealms();

  return (
    <div className="flex-1 bg-background text-foreground p-3 sm:p-4 md:p-6 min-h-[calc(100dvh-4rem)] flex flex-col justify-start">
      <div className="w-full max-w-7xl mx-auto space-y-6">
        {/* Hero Header */}
        <div className="relative w-full rounded-3xl overflow-hidden border border-border shadow-xs bg-surface p-6 sm:p-8 md:p-10">
          <div className="max-w-2xl space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-xs font-black tracking-widest uppercase px-2.5 py-0.5 rounded-full bg-surface-raised border border-border text-foreground">
                Wilderness Realms
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-muted">
                18 Elemental Habitats
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground tracking-tight">
              Wilderness Realms
            </h1>
            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              Venture into elemental zones to discover wild species, battle powerful opponents, and expand your Pokédex across 7 distinct thematic realms.
            </p>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="p-6 rounded-3xl border border-border bg-surface space-y-4">
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-20 w-full rounded-2xl" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && (
          <ErrorState
            title="Failed to Load Realms"
            message={(error as Error)?.message || 'Unable to connect to the wilderness realms server.'}
            onRetry={() => refetch()}
          />
        )}

        {/* Realms Grid */}
        {realms && realms.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {realms.map((realm) => (
              <RealmCard key={realm.realmId} realm={realm} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
