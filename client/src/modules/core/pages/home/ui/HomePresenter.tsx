import { TrainerSaveDto, OwnedPokemonDto } from '@astranox/shared';
import { TrainerStatsWidget } from './TrainerStatsWidget';
import { ActivePartyWidget } from './ActivePartyWidget';
import { HomeNavigationWidget } from './HomeNavigationWidget';

interface HomePresenterProps {
  save: TrainerSaveDto;
  party: readonly OwnedPokemonDto[];
  teamCp: number;
}

export function HomePresenter({ save, party, teamCp }: HomePresenterProps) {
  return (
    <div className="flex-1 bg-ink-dark text-ink-paper p-4 md:p-6 min-h-[calc(100vh-64px)] transition-colors duration-500 flex flex-col justify-start relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[50%] bg-silt-gold/5 rounded-full blur-[100px] animate-pulse-slow pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[30%] h-[40%] bg-ink-blue/5 rounded-full blur-[100px] animate-pulse-slow pointer-events-none" style={{ animationDelay: '2s' }}></div>

      <div className="w-full mx-auto space-y-4 md:space-y-6 max-w-none relative z-10">
        {/* Header Section */}
        <TrainerStatsWidget save={save} teamCp={teamCp} />

        {/* Active Party */}
        <ActivePartyWidget party={party} teamCp={teamCp} />

        {/* Bottom Layout (Actions + Inventory) */}
        <HomeNavigationWidget save={save} />
      </div>
    </div>
  );
}
