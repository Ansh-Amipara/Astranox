import { memo } from 'react';
import { getTypeSpriteUrl } from '@/lib/axios';
import { TbPokeball } from "react-icons/tb";
import { GiBackpack } from "react-icons/gi";
import { FaRunning } from "react-icons/fa";
import { ActivePokemonDto, TurnEventDto, PokemonMoveDto } from '@astranox/types';;

interface Props {
  player: ActivePokemonDto & { name?: string; nickname?: string; speciesName?: string };
  status: string;
  rawEvents: TurnEventDto[];
  isPending: boolean;
  battleType?: string;
  onMoveSelect: (moveAction: string) => void;
  onSkipMove: () => void;
  onRun: () => void;
  onOpenBag: () => void;
  onOpenParty: () => void;
}

export const ActionMenu = memo(function ActionMenu({
  player,
  status,
  rawEvents,
  isPending,
  battleType,
  onMoveSelect,
  onSkipMove,
  onRun,
  onOpenBag,
  onOpenParty
}: Props) {
  if (status === 'WAITING_MOVE_LEARN') {
    return (
      <div className="flex flex-col h-full w-full justify-center">
        <div className="text-center font-bold text-foreground mb-2">
          {player.nickname || player.speciesName} is trying to learn <span className="text-muted uppercase">{rawEvents.find((e: TurnEventDto) => e.type === 'prompt_learn_move')?.moveName || 'a new move'}</span>. Which move should be forgotten?
        </div>
        <div className="flex flex-row gap-4 h-full w-full">
          {/* Moves Container (2x2 Grid) */}
          <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-3 h-full">
            {(player.moves || []).map((move: PokemonMoveDto, i: number) => (
              <button
                key={i}
                onClick={() => onMoveSelect(`learn_move:${i}`)}
                disabled={isPending}
                className="bg-surface-raised/80 hover:bg-surface-raised/60 backdrop-blur-md text-foreground font-bold text-lg rounded-lg border-2 border-border/50 capitalize shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 flex flex-col items-center justify-center gap-1"
              >
                <span className="text-foreground text-xs drop-shadow-sm uppercase tracking-wider">Forget</span>
                <span className="drop-shadow-sm truncate">{((move as any).name || (move as any).move?.name || 'Unknown').replace('-', ' ')}</span>
              </button>
            ))}
          </div>
          
          {/* Divider */}
          <div className="w-px bg-surface-raised/50 my-2 shrink-0"></div>
          
          <button
            onClick={onSkipMove}
            disabled={isPending}
            className="w-24 bg-surface-raised hover:bg-surface-raised text-foreground font-bold text-sm tracking-wider uppercase rounded-lg shadow-sm transition-all border border-border"
          >
            Skip
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col sm:flex-row gap-2 h-full w-full">
        {/* Moves */}
        <div className="flex-1 grid grid-cols-2 sm:flex sm:flex-row gap-2">
          {(player.moves || []).map((move: PokemonMoveDto, i: number) => (
            <button
              key={i}
              onClick={() => onMoveSelect(`move:${move.moveId}`)}
              disabled={isPending}
              className="col-span-1 flex-1 py-1 sm:py-3 bg-surface-raised/80 hover:bg-surface-raised/60 backdrop-blur-md text-foreground font-bold text-xs sm:text-lg rounded-lg border-2 border-border/50 capitalize shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 flex flex-row items-center justify-center gap-1 sm:gap-2 px-1 sm:px-2 overflow-hidden"
            >
              <img src={getTypeSpriteUrl(move.type, true)} alt={move.type} title={move.type} className="h-3 sm:h-5 w-auto object-contain drop-shadow-sm shrink-0" />
              <span className="drop-shadow-sm truncate">{((move as any).name || (move as any).move?.name || 'Unknown').replace('-', ' ')}</span>
            </button>
          ))}
          {/* Fill empty move slots */}
          {Array.from({ length: Math.max(0, 4 - (player.moves?.length || 0)) }).map((_, i) => (
            <div key={`empty-${i}`} className="col-span-1 flex-1 min-h-[2.5rem] sm:min-h-[3rem] bg-surface-raised/50 backdrop-blur-sm border-2 border-border/30 rounded-lg"></div>
          ))}
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px bg-surface-raised/50 mx-2"></div>
        <div className="sm:hidden h-px bg-surface-raised/50 my-1 w-full"></div>

        {/* Utility Icons */}
        <div className="flex flex-row gap-2 justify-center sm:justify-start">
          <button
            onClick={onOpenBag}
            disabled={battleType !== 'WILD'}
            title={battleType === 'WILD' ? "Bag" : "Cannot use bag here"}
            className="flex-1 sm:flex-none sm:w-20 py-1.5 sm:py-2 bg-surface-raised hover:bg-surface-raised text-primary-foreground rounded-lg shadow-sm transition-all flex items-center justify-center hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 border border-border disabled:bg-surface-raised"
          >
            <GiBackpack size={24} className="sm:w-[28px] sm:h-[28px]" />
          </button>
          <button
            onClick={onOpenParty}
            title="Pokémon"
            className="flex-1 sm:flex-none sm:w-20 py-1.5 sm:py-2 bg-surface-raised hover:bg-surface-raised text-primary-foreground rounded-lg shadow-sm transition-all flex items-center justify-center hover:-translate-y-0.5 border border-border"
          >
            <TbPokeball size={24} className="sm:w-[28px] sm:h-[28px]" />
          </button>
          <button
            onClick={onRun}
            disabled={isPending || battleType === 'NPC'}
            title={battleType === 'NPC' ? "Cannot run from this battle" : "Run"}
            className="flex-1 sm:flex-none sm:w-20 py-1.5 sm:py-2 bg-surface-raised hover:bg-surface-raised text-primary-foreground rounded-lg shadow-sm transition-all flex items-center justify-center hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 border border-border disabled:bg-surface-raised"
          >
            <FaRunning size={24} className="sm:w-[28px] sm:h-[28px]" />
          </button>
        </div>
      </div>
    </div>
  );
});
