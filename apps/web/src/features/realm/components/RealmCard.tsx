import React from 'react';
import { Link } from 'react-router-dom';
import { RealmOverviewDto } from '@astranox/types';
import { getTypeSpriteUrl } from '@/lib/axios';
import { RealmBackdrop } from './RealmBackdrop';
import { Compass, Sparkles } from 'lucide-react';

interface RealmCardProps {
  realm: RealmOverviewDto;
}

export const RealmCard: React.FC<RealmCardProps> = ({ realm }) => {
  return (
    <RealmBackdrop
      themeKey={realm.themeKey}
      className="group p-5 sm:p-6 flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 border border-border"
    >
      <div className="space-y-4">
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {realm.types.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-surface/80 backdrop-blur-md border border-border shadow-2xs text-foreground"
              >
                <img
                  src={getTypeSpriteUrl(t, true)}
                  alt={t}
                  className="w-3.5 h-3.5 object-contain"
                  loading="lazy"
                />
                {t}
              </span>
            ))}
          </div>
          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-surface-raised border border-border text-muted">
            Lv.{realm.spawnLevelMin}-{realm.spawnLevelMax}
          </span>
        </div>

        {/* Title & Description */}
        <div>
          <h3 className="text-xl sm:text-2xl font-black text-foreground tracking-tight group-hover:text-foreground transition-colors">
            {realm.name}
          </h3>
          <p className="text-xs sm:text-sm text-muted mt-1.5 line-clamp-2 leading-relaxed">
            {realm.description}
          </p>
        </div>
      </div>

      {/* Footer Info & Action */}
      <div className="pt-6 mt-4 border-t border-border/40 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-xs text-muted font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{realm.speciesCount} Species</span>
        </div>

        <Link
          to={`/realm/${realm.realmId}`}
          className="min-h-[44px] px-5 py-2.5 bg-primary text-primary-foreground hover:opacity-90 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center gap-2 touch-manipulation select-none active:scale-[0.98]"
        >
          <Compass className="w-4 h-4" />
          Enter Realm
        </Link>
      </div>
    </RealmBackdrop>
  );
};
