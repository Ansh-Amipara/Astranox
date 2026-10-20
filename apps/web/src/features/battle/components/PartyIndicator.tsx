import { memo } from 'react';

export interface PartyMemberStatus {
  id?: string;
  currentHp: number;
  maxHp?: number;
  name?: string;
}

interface Props {
  party?: PartyMemberStatus[];
  singleFallbackHp?: number;
  className?: string;
}

export const PartyIndicator = memo(function PartyIndicator({
  party,
  singleFallbackHp = 1,
  className = '',
}: Props) {
  const members = party && party.length > 0 
    ? party 
    : [{ id: 'lead', currentHp: singleFallbackHp }];

  const total = members.length;
  const remaining = members.filter((m) => m.currentHp > 0).length;
  const label = `${remaining} of ${total} Pokémon remaining`;

  return (
    <div
      className={`flex items-center gap-1 sm:gap-1.5 ${className}`}
      role="group"
      aria-label={label}
      title={label}
    >
      {members.map((m, idx) => {
        const isHealthy = m.currentHp > 0;
        return (
          <div
            key={m.id || idx}
            className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border transition-colors ${
              isHealthy
                ? 'bg-health-high border-border shadow-xs'
                : 'bg-health-low border-border/80 shadow-xs'
            }`}
            title={`${m.name || 'Pokémon'} (${isHealthy ? 'Healthy' : 'Fainted'})`}
            aria-hidden="true"
          />
        );
      })}
      <span className="sr-only">{label}</span>
    </div>
  );
});
