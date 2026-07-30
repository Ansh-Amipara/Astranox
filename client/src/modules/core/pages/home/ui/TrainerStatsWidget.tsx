import { TrainerSaveDto } from '@astranox/shared';
import { Card } from '@/shared/ui/Card';

interface TrainerStatsWidgetProps {
  save: TrainerSaveDto;
  teamCp: number;
}

export function TrainerStatsWidget({ save, teamCp }: TrainerStatsWidgetProps) {
  return (
    <div className="w-full">
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        <Card variant="glass" padding="sm" className="flex items-center gap-3 hover:-translate-y-1 overflow-hidden group">
          <div className="w-10 h-10 shrink-0 rounded-full bg-silt-gold/20 flex items-center justify-center p-1 group-hover:scale-110 transition-transform">
            <img src="/astral.png" alt="Astral Coins" className="w-full h-full object-contain" />
          </div>
          <div className="truncate">
            <p className="text-[10px] font-bold text-ink-light uppercase tracking-wider truncate">Astral Coins</p>
            <p className="text-lg font-black text-ink-paper truncate drop-shadow-sm">{save.astralCoins?.toLocaleString() || 0}</p>
          </div>
        </Card>

        <Card variant="glass" padding="sm" className="flex items-center gap-3 hover:-translate-y-1 overflow-hidden group">
          <div className="w-10 h-10 shrink-0 rounded-full bg-silt-peach/20 flex items-center justify-center p-1 group-hover:scale-110 transition-transform">
            <img src="/infinity.png" alt="Infinity Coins" className="w-full h-full object-contain" />
          </div>
          <div className="truncate">
            <p className="text-[10px] font-bold text-ink-light uppercase tracking-wider truncate">Infinity Coins</p>
            <p className="text-lg font-black text-ink-paper truncate drop-shadow-sm">{save.infinityCoins?.toLocaleString() || 0}</p>
          </div>
        </Card>

        <Card variant="glow" padding="sm" className="flex items-center gap-3 hover:-translate-y-1 overflow-hidden group">
          <div className="w-10 h-10 shrink-0 rounded-full bg-indigo-500/20 flex items-center justify-center p-1.5 group-hover:scale-110 transition-transform">
            <img src="/xp.png" alt="Stored XP" className="w-full h-full object-contain" />
          </div>
          <div className="truncate">
            <p className="text-[10px] font-bold text-ink-light uppercase tracking-wider truncate">Stored XP</p>
            <p className="text-lg font-black text-indigo-300 truncate drop-shadow-sm">{save.storedXp?.toLocaleString() || 0} XP</p>
          </div>
        </Card>

        <Card variant="glass" padding="sm" className="flex items-center gap-3 hover:-translate-y-1 overflow-hidden">
          <div className="truncate">
            <p className="text-[10px] font-bold text-ink-light uppercase tracking-wider truncate">Trainer Rank</p>
            <p className="text-lg font-black text-silt-gold capitalize truncate drop-shadow-sm">
              {save.rank.replace('_MINUS_RANK', '-').replace('_PLUS_RANK', '+').replace('_RANK', '')}
            </p>
          </div>
        </Card>

        <Card variant="glass" padding="sm" className="flex items-center gap-3 hover:-translate-y-1 overflow-hidden">
          <div className="truncate">
            <p className="text-[10px] font-bold text-ink-light uppercase tracking-wider truncate">Player CP</p>
            <p className="text-lg font-black text-silt-peach truncate drop-shadow-sm">{teamCp.toLocaleString()}</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
