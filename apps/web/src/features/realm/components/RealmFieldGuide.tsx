import React, { useState, useMemo } from 'react';
import { RealmSpeciesPreviewItem } from '@astranox/types';
import { getTypeSpriteUrl } from '@/lib/axios';
import { Search, CheckCircle2, ShieldAlert } from 'lucide-react';

interface RealmFieldGuideProps {
  species: RealmSpeciesPreviewItem[];
  realmTypes: string[];
}

export const RealmFieldGuide: React.FC<RealmFieldGuideProps> = ({
  species,
  realmTypes,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  const filteredSpecies = useMemo(() => {
    return species.filter((s) => {
      const matchesSearch =
        s.speciesName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(s.speciesId).includes(searchTerm);
      const matchesType =
        selectedType === 'all' ||
        s.types.some((t) => t.toLowerCase() === selectedType.toLowerCase());
      return matchesSearch && matchesType;
    });
  }, [species, searchTerm, selectedType]);

  return (
    <div className="w-full bg-surface border border-border rounded-3xl p-5 sm:p-7 space-y-5">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg sm:text-xl font-black text-foreground tracking-tight">
            Wilderness Field Guide
          </h3>
          <p className="text-xs sm:text-sm text-muted">
            {species.length} species inhabit this Realm. Discover and catch them all.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search species..."
            className="w-full pl-10 pr-4 py-2.5 bg-surface-raised border border-border rounded-xl text-sm font-semibold text-foreground placeholder:text-muted focus:outline-hidden focus:ring-2 focus:ring-primary/20 transition-all select-text"
          />
        </div>
      </div>

      {/* Type Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedType('all')}
          className={`min-h-[36px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all touch-manipulation select-none shrink-0 border ${
            selectedType === 'all'
              ? 'bg-primary text-primary-foreground border-primary shadow-xs'
              : 'bg-surface-raised text-muted border-border hover:bg-surface'
          }`}
        >
          All Types ({species.length})
        </button>
        {realmTypes.map((t) => {
          const typeCount = species.filter((s) =>
            s.types.some((st) => st.toLowerCase() === t.toLowerCase())
          ).length;
          return (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`min-h-[36px] px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 touch-manipulation select-none shrink-0 border ${
                selectedType === t
                  ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                  : 'bg-surface-raised text-muted border-border hover:bg-surface'
              }`}
            >
              <img
                src={getTypeSpriteUrl(t, true)}
                alt={t}
                className="w-3.5 h-3.5 object-contain"
              />
              <span className="capitalize">{t}</span>
              <span className="text-[10px] opacity-70">({typeCount})</span>
            </button>
          );
        })}
      </div>

      {/* Species Grid */}
      {filteredSpecies.length === 0 ? (
        <div className="py-12 text-center text-muted text-sm font-semibold">
          No species found matching &ldquo;{searchTerm}&rdquo;.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-[520px] overflow-y-auto pr-1">
          {filteredSpecies.map((s) => (
            <div
              key={s.speciesId}
              className="group bg-surface-raised/70 hover:bg-surface-raised border border-border rounded-2xl p-3 flex flex-col items-center text-center transition-all duration-200 relative"
            >
              {/* Caught Indicator Pill */}
              {s.isCaught && (
                <div
                  className="absolute top-2 left-2 text-success"
                  title="Caught in Pokédex"
                >
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              )}

              {/* Apex Badge */}
              {s.isApex && (
                <div
                  className="absolute top-2 right-2 text-danger"
                  title="Apex Guardian (Battle to Unlock)"
                >
                  <ShieldAlert className="w-4 h-4" />
                </div>
              )}

              {/* Sprite */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center my-1">
                <img
                  src={s.spriteUrl}
                  alt={s.speciesName}
                  loading="lazy"
                  className="w-full h-full object-contain group-hover:scale-110 transition-transform"
                />
              </div>

              {/* Info */}
              <span className="text-[10px] font-mono text-muted">#{s.speciesId}</span>
              <span className="text-xs font-bold text-foreground capitalize truncate w-full mt-0.5">
                {s.speciesName}
              </span>

              {/* Types */}
              <div className="flex items-center gap-1 mt-1.5">
                {s.types.map((t) => (
                  <img
                    key={t}
                    src={getTypeSpriteUrl(t, true)}
                    alt={t}
                    title={t}
                    className="w-3.5 h-3.5 object-contain"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
