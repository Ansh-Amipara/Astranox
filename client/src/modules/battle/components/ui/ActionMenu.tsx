import { memo } from 'react';
import { getTypeSpriteUrl } from '@/shared/api/axios';
import { TbPokeball } from "react-icons/tb";
import { GiBackpack } from "react-icons/gi";
import { FaRunning } from "react-icons/fa";

interface Props {
  player: any;
  status: string;
  rawEvents: any[];
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
        <div className="text-center font-bold text-slate-800 dark:text-slate-200 mb-2">
          {player.nickname || player.speciesName} is trying to learn <span className="text-slate-600 dark:text-slate-400 uppercase">{rawEvents.find((e: any) => e.type === 'prompt_learn_move')?.moveName || 'a new move'}</span>. Which move should be forgotten?
        </div>
        <div className="flex flex-row gap-4 h-full w-full">
          {/* Moves Container (2x2 Grid) */}
          <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-3 h-full">
            {(player.moves || []).map((move: any, i: number) => (
              <button
                key={i}
                onClick={() => onMoveSelect(`learn_move:${i}`)}
                disabled={isPending}
                className="bg-slate-50/80 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-700/80 backdrop-blur-md text-slate-900 dark:text-white font-bold text-lg rounded-lg border-2 border-slate-300 dark:border-slate-600/50 capitalize shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 flex flex-col items-center justify-center gap-1"
              >
                <span className="text-red-600 dark:text-red-400 text-xs drop-shadow-sm uppercase tracking-wider">Forget</span>
                <span className="drop-shadow-sm truncate">{(move.name || move.move?.name || 'Unknown').replace('-', ' ')}</span>
              </button>
            ))}
          </div>
          
          {/* Divider */}
          <div className="w-px bg-slate-300 dark:bg-slate-700/50 my-2 shrink-0"></div>
          
          <button
            onClick={onSkipMove}
            disabled={isPending}
            className="w-24 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-sm tracking-wider uppercase rounded-lg shadow-sm transition-all border border-slate-400 dark:border-slate-600"
          >
            Skip
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-row gap-2 h-full w-full">
        {/* Moves */}
        {(player.moves || []).map((move: any, i: number) => (
          <button
            key={i}
            onClick={() => onMoveSelect(`move:${move.moveId}`)}
            disabled={isPending}
            className="flex-1 bg-slate-50/80 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-700/80 backdrop-blur-md text-slate-900 dark:text-white font-bold text-lg rounded-lg border-2 border-slate-300 dark:border-slate-600/50 capitalize shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 flex flex-row items-center justify-center gap-2"
          >
            <img src={getTypeSpriteUrl(move.type, true)} alt={move.type} title={move.type} className="h-5 w-auto object-contain drop-shadow-sm shrink-0" />
            <span className="drop-shadow-sm truncate">{(move.name || move.move?.name || 'Unknown').replace('-', ' ')}</span>
          </button>
        ))}
        {/* Fill empty move slots */}
        {Array.from({ length: Math.max(0, 4 - (player.moves?.length || 0)) }).map((_, i) => (
          <div key={`empty-${i}`} className="flex-1 bg-slate-200/50 dark:bg-slate-900/30 backdrop-blur-sm border-2 border-slate-300 dark:border-slate-700/30 rounded-lg"></div>
        ))}

        {/* Divider */}
        <div className="w-px bg-slate-300 dark:bg-slate-700/50 mx-2"></div>

        {/* Utility Icons */}
        <button
          onClick={onOpenBag}
          disabled={battleType !== 'WILD'}
          title={battleType === 'WILD' ? "Bag" : "Cannot use bag here"}
          className="w-20 bg-slate-50 hover:bg-slate-200 text-slate-900 rounded-lg shadow-sm transition-all flex items-center justify-center hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 border border-slate-200 dark:border-slate-700 disabled:bg-slate-300 dark:disabled:bg-slate-800"
        >
          <GiBackpack size={28} />
        </button>
        <button
          onClick={onOpenParty}
          title="Pokémon"
          className="w-20 bg-slate-50 hover:bg-slate-200 text-slate-900 rounded-lg shadow-sm transition-all flex items-center justify-center hover:-translate-y-0.5 border border-slate-200 dark:border-slate-700"
        >
          <TbPokeball size={28} />
        </button>
        <button
          onClick={onRun}
          disabled={isPending || battleType === 'NPC'}
          title={battleType === 'NPC' ? "Cannot run from this battle" : "Run"}
          className="w-20 bg-slate-50 hover:bg-slate-200 text-slate-900 rounded-lg shadow-sm transition-all flex items-center justify-center hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 border border-slate-200 dark:border-slate-700 disabled:bg-slate-300 dark:disabled:bg-slate-800"
        >
          <FaRunning size={28} />
        </button>
      </div>
    </div>
  );
});
