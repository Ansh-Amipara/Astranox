import { useState, useMemo } from 'react';
import { useAdminSpecies, AdminSpeciesDto } from '../hooks/useAdminRoster';
import { Badge } from '@/components/ui/Badge';
import { Search, X } from 'lucide-react';

export const POKEMON_TIER_ORDER = [
  'EX',
  'SSS',
  'SS',
  'S',
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
] as const;

export type PokemonTier = (typeof POKEMON_TIER_ORDER)[number];

function formatPokemonName(name: string): string {
  if (!name) return '';
  return name
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export interface PokemonTierSelectProps {
  selectedSpeciesId?: number | string | null;
  onSelect: (species: { id: number; name: string; rank: string }) => void;
  label?: string;
  placeholder?: string;
  compact?: boolean;
  disabled?: boolean;
}

export function PokemonTierSelect({
  selectedSpeciesId,
  onSelect,
  label,
  placeholder = 'Select Pokémon (Tier-wise)...',
  compact = false,
  disabled = false,
}: PokemonTierSelectProps) {
  const { data: speciesList = [], isLoading } = useAdminSpecies();

  const [activeTier, setActiveTier] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const numSpeciesId = selectedSpeciesId ? parseInt(String(selectedSpeciesId), 10) : null;
  const currentSpecies = useMemo(() => {
    if (!numSpeciesId || speciesList.length === 0) return null;
    return speciesList.find((s) => s.id === numSpeciesId) || null;
  }, [numSpeciesId, speciesList]);

  // Group species by tier
  const speciesByTier = useMemo(() => {
    const map = new Map<string, AdminSpeciesDto[]>();
    for (const tier of POKEMON_TIER_ORDER) {
      map.set(tier, []);
    }

    for (const s of speciesList) {
      const tierKey = (s.rank || 'F').toUpperCase();
      const list = map.get(tierKey) || map.get('F')!;
      list.push(s);
    }

    return map;
  }, [speciesList]);

  // Filtered list based on tier filter and search query
  const filteredTiers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return POKEMON_TIER_ORDER.filter((tier) => {
      if (activeTier !== 'all' && activeTier !== tier) return false;
      const pokes = speciesByTier.get(tier) || [];
      if (!q) return pokes.length > 0;
      return pokes.some(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          String(p.id) === q ||
          (p.pokedexNumber && String(p.pokedexNumber) === q)
      );
    }).map((tier) => {
      let pokes = speciesByTier.get(tier) || [];
      if (q) {
        pokes = pokes.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            String(p.id) === q ||
            (p.pokedexNumber && String(p.pokedexNumber) === q)
        );
      }
      return { tier, pokes };
    });
  }, [speciesByTier, activeTier, searchQuery]);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = parseInt(e.target.value, 10);
    if (isNaN(val)) return;
    const found = speciesList.find((s) => s.id === val);
    if (found) {
      onSelect({
        id: found.id,
        name: found.name,
        rank: found.rank || 'F',
      });
    }
  };

  const getTierBadgeVariant = (tier?: string) => {
    const t = (tier || 'F').toUpperCase();
    if (t === 'EX' || t === 'SSS') return 'default';
    if (t === 'SS' || t === 'S') return 'warning';
    if (t === 'A' || t === 'B') return 'success';
    return 'default';
  };

  if (compact) {
    return (
      <div className="space-y-1.5 w-full">
        {label && <label className="block text-xs font-bold text-foreground">{label}</label>}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <select
              value={selectedSpeciesId ? String(selectedSpeciesId) : ''}
              onChange={handleSelectChange}
              disabled={disabled || isLoading}
              className="w-full px-3 py-1.5 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden disabled:opacity-50 cursor-pointer"
            >
              <option value="">{isLoading ? 'Loading Pokémon roster...' : placeholder}</option>
              {POKEMON_TIER_ORDER.map((tier) => {
                const pokes = speciesByTier.get(tier) || [];
                if (pokes.length === 0) return null;
                return (
                  <optgroup key={tier} label={`--- ${tier} RANK (${pokes.length} Pokémon) ---`}>
                    {pokes.map((p) => (
                      <option key={p.id} value={p.id}>
                        [{tier}] #{p.id} {formatPokemonName(p.name)}
                      </option>
                    ))}
                  </optgroup>
                );
              })}
            </select>
          </div>
          {currentSpecies && (
            <Badge
              variant={getTierBadgeVariant(currentSpecies.rank)}
              className="text-[9px] font-black px-1.5 py-0.5 uppercase tracking-wider shrink-0"
            >
              {currentSpecies.rank || 'F'}
            </Badge>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 bg-surface border border-border rounded-xl space-y-3 w-full">
      {/* Header and Current Selection */}
      <div className="flex items-center justify-between gap-2">
        <div>
          {label && <span className="block text-xs font-bold text-foreground">{label}</span>}
          <span className="text-[10px] text-muted">
            {isLoading
              ? 'Loading Pokémon roster...'
              : `Total Roster: ${speciesList.length} species (Tier-wise)`}
          </span>
        </div>
        {currentSpecies ? (
          <div className="flex items-center gap-1.5 bg-surface-raised border border-border px-2 py-1 rounded-lg">
            <Badge
              variant={getTierBadgeVariant(currentSpecies.rank)}
              className="text-[9px] font-black px-1.5 py-0 uppercase tracking-wider"
            >
              {currentSpecies.rank || 'F'}
            </Badge>
            <span className="text-xs font-bold text-foreground font-mono">
              #{currentSpecies.id} {formatPokemonName(currentSpecies.name)}
            </span>
          </div>
        ) : (
          <span className="text-[10px] text-muted italic">No Pokémon selected</span>
        )}
      </div>

      {/* Tier Filter Tabs */}
      <div className="space-y-1">
        <span className="block text-[10px] font-bold text-muted">Filter Tier:</span>
        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTier('all')}
            className={`px-2 py-0.5 text-[10px] font-bold rounded-md border transition-colors cursor-pointer ${
              activeTier === 'all'
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background border-border text-muted hover:text-foreground'
            }`}
          >
            All Tiers ({speciesList.length})
          </button>
          {POKEMON_TIER_ORDER.map((tier) => {
            const count = speciesByTier.get(tier)?.length || 0;
            return (
              <button
                key={tier}
                type="button"
                onClick={() => setActiveTier(tier)}
                className={`px-2 py-0.5 text-[10px] font-bold rounded-md border transition-colors cursor-pointer ${
                  activeTier === tier
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background border-border text-muted hover:text-foreground'
                }`}
              >
                {tier} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Search Input & Tier-wise Dropdown */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Pokémon in roster by name or ID..."
            className="w-full pl-8 pr-7 py-1.5 bg-background border border-border rounded-lg text-xs text-foreground placeholder:text-subtle focus:outline-hidden"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-foreground cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Tier-grouped Dropdown */}
        <select
          value={selectedSpeciesId ? String(selectedSpeciesId) : ''}
          onChange={handleSelectChange}
          disabled={disabled || isLoading}
          className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden disabled:opacity-50 cursor-pointer"
        >
          <option value="">
            {isLoading
              ? 'Loading Pokémon from database...'
              : `-- Select Pokémon (${activeTier === 'all' ? 'All Tiers' : `${activeTier} Tier`}) --`}
          </option>
          {filteredTiers.map(({ tier, pokes }) => {
            if (pokes.length === 0) return null;
            return (
              <optgroup key={tier} label={`⭐ ${tier} RANK (${pokes.length} Species)`}>
                {pokes.map((p) => (
                  <option key={p.id} value={p.id}>
                    [{tier}] #{p.id} {formatPokemonName(p.name)}
                  </option>
                ))}
              </optgroup>
            );
          })}
        </select>
      </div>
    </div>
  );
}
