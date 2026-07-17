import { memo } from 'react';
import { typeColors } from '../lib/utils';
import { TbPokeball } from "react-icons/tb";
import { GiBackpack } from "react-icons/gi";
import { FaRunning } from "react-icons/fa";

interface Props {
  player: any;
  status: string;
  battleType: string;
  rawEvents: any[];
  isPending: boolean;
  onMoveSelect: (moveAction: string) => void;
  onSkipMove: () => void;
  onRun: () => void;
  onOpenBag: () => void;
  onOpenParty: () => void;
}

export const ActionMenu = memo(function ActionMenu({
  player,
  status,
  battleType,
  rawEvents,
  isPending,
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
          {player.nickname || player.speciesName} is trying to learn <span className="text-blue-500 uppercase">{rawEvents.find((e: any) => e.type === 'prompt_learn_move')?.moveName || 'a new move'}</span>. Which move should be forgotten?
        </div>
        <div className="flex flex-row gap-2 h-full w-full">
          {(player.moves || []).map((move: any, i: number) => (
            <button
              key={i}
              onClick={() => onMoveSelect(`learn_move:${i}`)}
              disabled={isPending}
              className="flex-1 bg-white/40 hover:bg-white/60 dark:bg-slate-800/60 dark:hover:bg-slate-700/80 backdrop-blur-md text-slate-900 dark:text-white font-bold text-lg rounded-lg border-2 border-white/50 dark:border-slate-600/50 capitalize shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 flex flex-col items-center justify-center gap-1"
            >
              <span className="text-red-600 dark:text-red-400 text-xs drop-shadow-sm">Forget</span>
              <span className="drop-shadow-sm">{(move.name || move.move?.name || 'Unknown').replace('-', ' ')}</span>
            </button>
          ))}
          <div className="w-px bg-white/20 dark:bg-slate-700/50 mx-2"></div>
          <button
            onClick={onSkipMove}
            disabled={isPending}
            className="w-32 bg-slate-400 hover:bg-slate-500 text-white font-bold text-sm tracking-wider uppercase rounded-lg shadow-sm transition-all"
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
            className="flex-1 bg-white/40 hover:bg-white/60 dark:bg-slate-800/60 dark:hover:bg-slate-700/80 backdrop-blur-md text-slate-900 dark:text-white font-bold text-lg rounded-lg border-2 border-white/50 dark:border-slate-600/50 capitalize shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 flex flex-col items-center justify-center gap-1"
          >
            <span className="drop-shadow-sm">{(move.name || move.move?.name || 'Unknown').replace('-', ' ')}</span>
            <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-sm shadow-sm ${typeColors[move.type?.toLowerCase()] || typeColors.normal}`}>
              {move.type || 'Normal'}
            </span>
          </button>
        ))}
        {/* Fill empty move slots */}
        {Array.from({ length: Math.max(0, 4 - (player.moves?.length || 0)) }).map((_, i) => (
          <div key={`empty-${i}`} className="flex-1 bg-white/10 dark:bg-slate-900/30 backdrop-blur-sm border-2 border-white/20 dark:border-slate-700/30 rounded-lg"></div>
        ))}

        {/* Divider */}
        <div className="w-px bg-white/20 dark:bg-slate-700/50 mx-2"></div>

        {/* Utility Icons */}
        <button
          onClick={onOpenBag}
          title="Bag"
          className={`w-20 bg-white hover:bg-slate-100 text-slate-900 rounded-lg shadow-sm transition-all flex items-center justify-center hover:-translate-y-0.5 border border-slate-200 dark:border-slate-700 ${battleType === 'NPC' ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
        >
          <GiBackpack size={28} />
        </button>
        <button
          onClick={onOpenParty}
          title="Pokémon"
          className="w-20 bg-white hover:bg-slate-100 text-slate-900 rounded-lg shadow-sm transition-all flex items-center justify-center hover:-translate-y-0.5 border border-slate-200 dark:border-slate-700"
        >
          <TbPokeball size={28} />
        </button>
        <button
          onClick={onRun}
          disabled={isPending}
          title="Run"
          className="w-20 bg-white hover:bg-slate-100 text-slate-900 rounded-lg shadow-sm transition-all flex items-center justify-center hover:-translate-y-0.5 disabled:opacity-50 border border-slate-200 dark:border-slate-700"
        >
          <FaRunning size={28} />
        </button>
      </div>
    </div>
  );
});
