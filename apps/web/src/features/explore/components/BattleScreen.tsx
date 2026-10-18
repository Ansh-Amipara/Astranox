import React, { useState } from 'react';
import { ExploreBattleState } from '../store';
import { PokemonSprite } from '@/components/ui/PokemonSprite';
import { MoveMenu } from './MoveMenu';
import { BallMenu } from './BallMenu';
import { PartyPanel } from './PartyPanel';
import { BattleLog } from './BattleLog';
import { TurnEvent } from '@astranox/battle-engine';
import { Swords, Backpack, Users, LogOut } from 'lucide-react';

interface BattleScreenProps {
  battleState: ExploreBattleState;
  events: TurnEvent[];
  inventory: any[];
  onAction: (action: any) => void;
  disabled?: boolean;
}

type MenuMode = 'root' | 'fight' | 'bag' | 'party';

export const BattleScreen: React.FC<BattleScreenProps> = ({
  battleState,
  events,
  inventory,
  onAction,
  disabled = false,
}) => {
  const [menuMode, setMenuMode] = useState<MenuMode>('root');

  const { playerActive, wildPokemon, playerParty } = battleState;

  // HP Percentages
  const wildHpPercent = Math.max(0, Math.min(100, (wildPokemon.currentHp / (wildPokemon.maxHp || 1)) * 100));
  const playerHpPercent = Math.max(0, Math.min(100, (playerActive.currentHp / (playerActive.maxHp || 1)) * 100));

  const handleFight = () => setMenuMode('fight');
  const handleBag = () => setMenuMode('bag');
  const handleParty = () => setMenuMode('party');
  const handleRun = () => onAction({ type: 'RUN' });

  const handleSelectMove = (moveId: number) => {
    onAction({ type: 'USE_MOVE', moveId });
    setMenuMode('root');
  };

  const handleThrowBall = (ballType: string) => {
    onAction({ type: 'THROW_BALL', ballType });
    setMenuMode('root');
  };

  const handleSwitchPokemon = (targetId: string) => {
    onAction({ type: 'SWITCH_POKEMON', targetPokemonId: targetId });
    setMenuMode('root');
  };

  return (
    <div
      className="w-full max-w-xl flex flex-col bg-surface border-2 border-border rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 select-none"
      role="region"
      aria-label="Wild Pokémon Battle Interface"
    >
      {/* 1. Combat Visual Arena */}
      <div className="relative w-full h-64 bg-surface-raised/60 border-b border-border p-4 flex flex-col justify-between overflow-hidden">
        {/* Opponent (Top Right) */}
        <div className="flex items-start justify-end gap-3">
          <div className="bg-surface/90 backdrop-blur-md border border-border px-4 py-2.5 rounded-2xl shadow-sm min-w-[170px]">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-foreground text-sm truncate">{wildPokemon.speciesName}</span>
              <span className="text-xs font-mono text-muted">Lv.{wildPokemon.level}</span>
            </div>
            <div className="mt-1.5 w-full bg-surface-raised h-2 rounded-full overflow-hidden border border-border/40">
              <div
                className={`h-full transition-all duration-300 ${
                  wildHpPercent > 50
                    ? 'bg-health-high'
                    : wildHpPercent > 20
                    ? 'bg-health-mid'
                    : 'bg-health-low'
                }`}
                style={{ width: `${wildHpPercent}%` }}
              />
            </div>
            <div className="mt-1 text-right text-[11px] font-mono text-muted">
              {wildPokemon.currentHp} / {wildPokemon.maxHp} HP
            </div>
          </div>

          <div className="w-20 h-20 bg-surface rounded-2xl border border-border flex items-center justify-center shadow-md">
            <PokemonSprite speciesId={wildPokemon.speciesId} size="lg" alt={wildPokemon.speciesName} />
          </div>
        </div>

        {/* Player Active (Bottom Left) */}
        <div className="flex items-end justify-start gap-3">
          <div className="w-20 h-20 bg-surface rounded-2xl border border-border flex items-center justify-center shadow-md">
            <PokemonSprite speciesId={playerActive.speciesId} size="lg" alt={playerActive.speciesName} />
          </div>

          <div className="bg-surface/90 backdrop-blur-md border border-border px-4 py-2.5 rounded-2xl shadow-sm min-w-[170px]">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-foreground text-sm truncate">{playerActive.speciesName}</span>
              <span className="text-xs font-mono text-muted">Lv.{playerActive.level}</span>
            </div>
            <div className="mt-1.5 w-full bg-surface-raised h-2 rounded-full overflow-hidden border border-border/40">
              <div
                className={`h-full transition-all duration-300 ${
                  playerHpPercent > 50
                    ? 'bg-health-high'
                    : playerHpPercent > 20
                    ? 'bg-health-mid'
                    : 'bg-health-low'
                }`}
                style={{ width: `${playerHpPercent}%` }}
              />
            </div>
            <div className="mt-1 text-right text-[11px] font-mono text-muted">
              {playerActive.currentHp} / {playerActive.maxHp} HP
            </div>
          </div>
        </div>
      </div>

      {/* 2. Accessible Battle Log */}
      <div className="p-4 border-b border-border bg-surface">
        <BattleLog events={events} />
      </div>

      {/* 3. Interactive Action / Submenus */}
      <div className="p-4 bg-surface min-h-[160px] flex items-center justify-center">
        {menuMode === 'root' && (
          <div className="w-full grid grid-cols-2 gap-3">
            <button
              type="button"
              disabled={disabled}
              onClick={handleFight}
              className="flex items-center gap-3 p-4 bg-surface hover:bg-surface-raised active:scale-[0.98] border border-border text-foreground rounded-2xl font-bold shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground disabled:opacity-40"
              aria-label="Fight, select moves"
            >
              <Swords className="w-6 h-6" />
              <div className="flex flex-col text-left">
                <span className="text-base">Fight</span>
                <span className="text-xs text-muted font-normal font-mono">Keys 1-4</span>
              </div>
            </button>

            <button
              type="button"
              disabled={disabled}
              onClick={handleBag}
              className="flex items-center gap-3 p-4 bg-surface hover:bg-surface-raised active:scale-[0.98] border border-border text-foreground rounded-2xl font-bold shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground disabled:opacity-40"
              aria-label="Bag, throw Pokéballs"
            >
              <Backpack className="w-6 h-6" />
              <div className="flex flex-col text-left">
                <span className="text-base">Pokéballs</span>
                <span className="text-xs text-muted font-normal font-mono">Catch wild</span>
              </div>
            </button>

            <button
              type="button"
              disabled={disabled}
              onClick={handleParty}
              className="flex items-center gap-3 p-4 bg-surface hover:bg-surface-raised active:scale-[0.98] border border-border text-foreground rounded-2xl font-bold shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground disabled:opacity-40"
              aria-label="Switch Pokémon party member"
            >
              <Users className="w-6 h-6" />
              <div className="flex flex-col text-left">
                <span className="text-base">Pokémon</span>
                <span className="text-xs text-muted font-normal font-mono">Switch team</span>
              </div>
            </button>

            <button
              type="button"
              disabled={disabled}
              onClick={handleRun}
              className="flex items-center gap-3 p-4 bg-surface hover:bg-surface-raised active:scale-[0.98] border border-border text-foreground rounded-2xl font-bold shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground disabled:opacity-40"
              aria-label="Flee from wild battle"
            >
              <LogOut className="w-6 h-6" />
              <div className="flex flex-col text-left">
                <span className="text-base">Run</span>
                <span className="text-xs text-muted font-normal font-mono">Flee battle</span>
              </div>
            </button>
          </div>
        )}

        {menuMode === 'fight' && (
          <MoveMenu
            moves={playerActive.moves || []}
            onSelectMove={handleSelectMove}
            onCancel={() => setMenuMode('root')}
            disabled={disabled}
          />
        )}

        {menuMode === 'bag' && (
          <BallMenu
            inventory={inventory}
            onThrowBall={handleThrowBall}
            onCancel={() => setMenuMode('root')}
            disabled={disabled}
          />
        )}

        {menuMode === 'party' && (
          <PartyPanel
            party={playerParty}
            activePokemonId={playerActive.id}
            onSwitch={handleSwitchPokemon}
            onCancel={() => setMenuMode('root')}
            disabled={disabled}
          />
        )}
      </div>
    </div>
  );
};
