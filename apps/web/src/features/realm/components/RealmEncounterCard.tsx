import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RealmSearchResultDto } from '@astranox/types';
import { getTypeSpriteUrl } from '@/lib/axios';
import { Swords, X, ShieldAlert } from 'lucide-react';

interface RealmEncounterCardProps {
  encounterResult: RealmSearchResultDto;
  onDismiss: () => void;
}

export const RealmEncounterCard: React.FC<RealmEncounterCardProps> = ({
  encounterResult,
  onDismiss,
}) => {
  const navigate = useNavigate();
  const { encounter, redirectTo } = encounterResult;

  const handleFight = () => {
    navigate(redirectTo);
  };

  return (
    <div className="w-full bg-surface border-2 border-primary/30 rounded-3xl p-5 sm:p-7 shadow-lg flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200 relative overflow-hidden">
      {/* Close/Dismiss Button */}
      <button
        onClick={onDismiss}
        className="absolute top-4 right-4 p-2 text-muted hover:text-foreground rounded-full hover:bg-surface-raised transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
        aria-label="Dismiss Encounter"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Apex Warning Pill */}
      {encounter.isApex && (
        <div className="mb-3 px-3 py-1 rounded-full bg-danger/15 text-danger border border-danger/30 text-xs font-black tracking-wider uppercase flex items-center gap-1.5 animate-pulse">
          <ShieldAlert className="w-4 h-4" />
          Apex Guardian Detected
        </div>
      )}

      {/* Wild Pokémon Sprite */}
      <div className="w-32 h-32 sm:w-40 sm:h-40 flex items-center justify-center my-2 relative">
        <div className="absolute inset-0 bg-radial from-surface-raised to-transparent rounded-full opacity-60" />
        <img
          src={encounter.spriteUrl}
          alt={encounter.speciesName}
          className="w-full h-full object-contain drop-shadow-md z-10 transition-transform hover:scale-105"
        />
      </div>

      {/* Species Name & Level */}
      <div className="space-y-1">
        <div className="flex items-center justify-center gap-2">
          <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-md bg-surface-raised border border-border text-muted">
            Lv. {encounter.level}
          </span>
          <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-surface-raised border border-border text-foreground">
            Rank {encounter.rank}
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-foreground capitalize tracking-tight">
          {encounter.speciesName}
        </h2>
      </div>

      {/* Type Badges */}
      <div className="flex items-center justify-center gap-2 mt-3 mb-6">
        {encounter.types.map((t) => (
          <span
            key={t}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-surface-raised border border-border shadow-2xs text-foreground"
          >
            <img
              src={getTypeSpriteUrl(t, true)}
              alt={t}
              className="w-4 h-4 object-contain"
            />
            {t}
          </span>
        ))}
      </div>

      {/* Actions */}
      <div className="w-full max-w-sm grid grid-cols-2 gap-3">
        <button
          onClick={handleFight}
          className="min-h-[48px] px-6 py-3 bg-primary text-primary-foreground hover:opacity-90 font-black text-sm uppercase tracking-wider rounded-2xl shadow-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] touch-manipulation select-none col-span-2 sm:col-span-1"
        >
          <Swords className="w-4 h-4" />
          Battle
        </button>
        <button
          onClick={onDismiss}
          className="min-h-[48px] px-6 py-3 bg-surface-raised hover:bg-surface border border-border text-foreground font-black text-sm uppercase tracking-wider rounded-2xl transition-all active:scale-[0.98] touch-manipulation select-none col-span-2 sm:col-span-1"
        >
          Run
        </button>
      </div>
    </div>
  );
};
