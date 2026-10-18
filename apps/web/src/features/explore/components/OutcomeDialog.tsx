import React from 'react';
import { BattleFinalResult } from '../store';
import { PokemonSprite } from '@/components/ui/PokemonSprite';

interface OutcomeDialogProps {
  outcomeResult: BattleFinalResult;
  onClose: () => void;
}

export const OutcomeDialog: React.FC<OutcomeDialogProps> = ({ outcomeResult, onClose }) => {
  const { outcome, rewards, capturedPokemon, respawnPosition } = outcomeResult;

  const isWon = outcome === 'WON';
  const isCaptured = outcome === 'CAPTURED';
  const isDefeated = outcome === 'DEFEATED';
  const isFled = outcome === 'FLED';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="outcome-dialog-title"
    >
      <div className="w-full max-w-md bg-surface border-2 border-border rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center">
        {/* Title */}
        <h2 id="outcome-dialog-title" className="text-2xl font-black text-foreground tracking-tight">
          {isWon && 'Victory!'}
          {isCaptured && 'Pokémon Captured!'}
          {isDefeated && 'Defeated!'}
          {isFled && 'Escaped Safely!'}
        </h2>

        {/* Subtitle / Description */}
        <p className="mt-1 text-sm text-muted">
          {isWon && 'You defeated the wild Pokémon!'}
          {isCaptured && `Gotcha! ${capturedPokemon?.speciesName || 'Pokémon'} was caught!`}
          {isDefeated && 'All your Pokémon fainted! Your team has been restored.'}
          {isFled && 'You successfully fled from the wild encounter.'}
        </p>

        {/* Captured Pokémon Showcase */}
        {isCaptured && capturedPokemon && (
          <div className="my-5 flex flex-col items-center p-4 bg-surface-raised border border-border rounded-2xl w-full">
            <PokemonSprite speciesId={capturedPokemon.speciesId} size="xl" alt={capturedPokemon.speciesName} />
            <span className="mt-2 text-lg font-bold text-foreground">{capturedPokemon.speciesName}</span>
            <span className="text-xs text-muted font-mono">Level {capturedPokemon.level}</span>
            <span className="mt-2 text-xs font-semibold px-2.5 py-1 rounded-full border border-border bg-surface text-foreground">
              {capturedPokemon.isParty ? 'Added to Active Party' : 'Sent to Storage Box'}
            </span>
          </div>
        )}

        {/* Rewards / Penalties Breakdown */}
        <div className="w-full my-4 flex flex-col gap-2">
          {rewards?.coins !== undefined && rewards.coins > 0 && (
            <div className="flex items-center justify-between p-3 bg-surface-raised border border-border/60 rounded-xl text-sm">
              <span className="text-muted">Astral Coins</span>
              <span className="font-bold text-success font-mono">+{rewards.coins}</span>
            </div>
          )}

          {rewards?.xp !== undefined && rewards.xp > 0 && (
            <div className="flex items-center justify-between p-3 bg-surface-raised border border-border/60 rounded-xl text-sm">
              <span className="text-muted">Experience</span>
              <span className="font-bold text-foreground font-mono">+{rewards.xp} XP</span>
            </div>
          )}

          {rewards?.penaltyCoins !== undefined && rewards.penaltyCoins > 0 && (
            <div className="flex items-center justify-between p-3 bg-surface-raised border border-border/60 rounded-xl text-sm">
              <span className="text-muted">Coins Lost</span>
              <span className="font-bold text-danger font-mono">-{rewards.penaltyCoins}</span>
            </div>
          )}

          {isDefeated && respawnPosition && (
            <div className="p-3 bg-surface-raised border border-border/60 rounded-xl text-xs text-muted">
              Respawned at <strong className="text-foreground">{respawnPosition.mapId}</strong> ({respawnPosition.x}, {respawnPosition.y})
            </div>
          )}
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full mt-2 py-3 px-6 bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98] font-bold rounded-xl shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
        >
          Return to Map
        </button>
      </div>
    </div>
  );
};
