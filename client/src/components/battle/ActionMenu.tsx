import { memo } from 'react';
import { typeColors } from './utils';

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
              className="flex-1 bg-white hover:bg-slate-50 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-bold text-lg rounded-lg border-2 border-slate-300 dark:border-slate-600 capitalize shadow-sm hover:-translate-y-0.5 transition-all disabled:opacity-50 flex flex-col items-center justify-center gap-1"
            >
              <span className="text-red-500 text-xs">Forget</span>
              <span>{(move.name || move.move?.name || 'Unknown').replace('-', ' ')}</span>
            </button>
          ))}
          <div className="w-px bg-slate-300 dark:bg-slate-700 mx-2"></div>
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
            className="flex-1 bg-white hover:bg-slate-50 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-bold text-lg rounded-lg border-2 border-slate-300 dark:border-slate-600 capitalize shadow-sm hover:-translate-y-0.5 transition-all disabled:opacity-50 flex flex-col items-center justify-center gap-1"
          >
            <span>{(move.name || move.move?.name || 'Unknown').replace('-', ' ')}</span>
            <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-sm ${typeColors[move.type?.toLowerCase()] || typeColors.normal}`}>
              {move.type || 'Normal'}
            </span>
          </button>
        ))}
        {/* Fill empty move slots */}
        {Array.from({ length: Math.max(0, 4 - (player.moves?.length || 0)) }).map((_, i) => (
          <div key={`empty-${i}`} className="flex-1 bg-slate-300 dark:bg-slate-800 border-2 border-slate-400 dark:border-slate-700 rounded-lg"></div>
        ))}

        {/* Divider */}
        <div className="w-px bg-slate-300 dark:bg-slate-700 mx-2"></div>

        {/* Utility Icons */}
        <button 
          onClick={onOpenBag}
          title="Bag"
          className={`w-20 bg-gradient-to-br from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-white font-bold text-sm tracking-wider uppercase rounded-lg shadow-sm transition-all flex items-center justify-center hover:-translate-y-0.5 ${battleType === 'NPC' ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
        >
          Bag
        </button>
        <button 
          onClick={onOpenParty}
          title="Pokémon"
          className="w-20 bg-gradient-to-br from-green-500 to-green-700 hover:from-green-400 hover:to-green-600 text-white font-bold text-sm tracking-wider uppercase rounded-lg shadow-sm transition-all flex items-center justify-center hover:-translate-y-0.5"
        >
          Pkmn
        </button>
        <button 
          onClick={onRun}
          disabled={isPending}
          title="Run"
          className="w-20 bg-gradient-to-br from-blue-500 to-blue-700 hover:from-blue-400 hover:to-blue-600 text-white font-bold text-sm tracking-wider uppercase rounded-lg shadow-sm transition-all flex items-center justify-center hover:-translate-y-0.5 disabled:opacity-50"
        >
          Run
        </button>
      </div>
    </div>
  );
});
