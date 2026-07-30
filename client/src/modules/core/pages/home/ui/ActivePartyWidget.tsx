import { useNavigate } from 'react-router-dom';
import { getSpriteUrl } from '@/shared/api/api-client';
import { OwnedPokemonDto } from '@astranox/shared';
import { Card } from '@/shared/ui/Card';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';

interface ActivePartyWidgetProps {
  party: ReadonlyArray<OwnedPokemonDto>;
  teamCp: number;
}

export function ActivePartyWidget({ party, teamCp }: ActivePartyWidgetProps) {
  const navigate = useNavigate();

  return (
    <Card variant="glass" padding="lg" className="relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-silt-gold/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none group-hover:bg-silt-gold/10 transition-colors"></div>
      
      <div className="flex justify-between items-center mb-8 relative z-10">
        <h2 className="text-2xl font-extrabold text-ink-paper drop-shadow-sm tracking-wide">
          ACTIVE SQUAD
        </h2>
        <div className="flex gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/pokemon')}>
            PC Box &rarr;
          </Button>
          <Button variant="ghost" size="sm" onClick={() => navigate('/team')} className="text-silt-peach">
            Manage Team &rarr;
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 relative z-10 hide-scrollbar">
        {Array.from({ length: 6 }).map((_, i) => {
          const pkm = party.find((p) => p.position === i);
          return (
            <div
              key={i}
              className={`relative rounded-2xl p-4 border flex flex-col items-center text-center transition-all duration-300 ${pkm
                ? 'border-ink-light/20 bg-ink-dark/60 hover:border-silt-gold/50 hover:shadow-[0_0_15px_rgba(204,162,90,0.2)]'
                : 'border-dashed border-ink-light/20 bg-transparent opacity-50'
                }`}
            >
              {pkm ? (
                <>
                  <div className="w-16 h-16 relative mb-3 group-hover:scale-110 transition-transform duration-300">
                    <div className="absolute inset-0 bg-ink-light/10 rounded-full blur-md"></div>
                    <img
                      src={getSpriteUrl(pkm.speciesId)}
                      alt={pkm.speciesName || 'Pokemon'}
                      className="w-full h-full object-contain pixelated relative z-10 drop-shadow-lg"
                    />
                  </div>
                  
                  <h3 className="font-bold text-sm text-ink-paper capitalize truncate w-full tracking-wide">
                    {pkm.nickname || (pkm as unknown as { name?: string })?.name || pkm.speciesName}
                  </h3>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="ink" size="sm">
                      Lv {pkm.level}
                    </Badge>
                    {pkm.potential && (
                      <Badge variant="silt" size="sm">
                        {pkm.potential.split('_')[0]}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="mt-3 text-[10px] font-black text-ink-dark bg-silt-gold px-2 py-1 rounded w-full truncate shadow-[0_0_10px_rgba(204,162,90,0.3)]">
                    CP {pkm.cp?.toLocaleString() || 0}
                  </div>
                </>
              ) : (
                <div className="w-16 h-16 border-2 border-ink-light/30 rounded-full flex items-center justify-center text-ink-light/50 font-black mb-2 shadow-inner">
                  EMPTY
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 pt-6 border-t border-ink-light/10 flex justify-between items-center relative z-10">
        <span className="text-xs font-bold text-ink-light uppercase tracking-widest">Total Combat Power</span>
        <span className="text-2xl font-black text-silt-peach drop-shadow-md">{teamCp.toLocaleString()}</span>
      </div>
    </Card>
  );
}
