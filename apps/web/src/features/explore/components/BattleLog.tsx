import React, { useEffect, useRef } from 'react';
import { TurnEvent } from '@astranox/battle-engine';

interface BattleLogProps {
  events: TurnEvent[];
  className?: string;
}

export const BattleLog: React.FC<BattleLogProps> = ({ events, className = '' }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events]);

  const renderEventMessage = (ev: TurnEvent, idx: number) => {
    switch (ev.type) {
      case 'text':
        return <span key={idx} className="text-foreground font-semibold">{ev.text}</span>;
      case 'move':
        return (
          <span key={idx} className="text-muted">
            {ev.isPlayer ? 'Your Pokémon' : 'The wild Pokémon'} used <strong className="text-foreground">{ev.moveName}</strong>!
          </span>
        );
      case 'damage':
        return (
          <span key={idx} className="text-muted text-xs">
            Dealt {ev.damage} damage! ({ev.currentHp}/{ev.maxHp} HP left)
          </span>
        );
      case 'status_damage':
        return (
          <span key={idx} className="text-warning text-xs">
            Hurt by {ev.status}! (-{ev.damage} HP)
          </span>
        );
      case 'faint':
        return (
          <span key={idx} className="text-danger font-bold">
            {ev.isPlayer ? 'Your Pokémon fainted!' : 'The wild Pokémon fainted!'}
          </span>
        );
      case 'catch_attempt':
        return (
          <span key={idx} className="text-foreground font-mono text-xs">
            Threw {ev.ballType}... {ev.shakes} shake{ev.shakes === 1 ? '' : 's'}!
          </span>
        );
      case 'run_attempt':
        return <span key={idx} className="text-foreground">Tried to flee!</span>;
      case 'miss':
        return <span key={idx} className="text-muted">The attack missed!</span>;
      default:
        return null;
    }
  };

  return (
    <div
      ref={scrollRef}
      className={`w-full max-h-36 overflow-y-auto p-3.5 bg-surface border border-border rounded-xl flex flex-col gap-1.5 text-xs font-mono select-none ${className}`}
      role="log"
      aria-live="polite"
      aria-label="Battle Combat Log"
    >
      {events.length === 0 ? (
        <span className="text-muted italic">Wild encounter started! Choose your action.</span>
      ) : (
        events.map((ev, i) => (
          <div key={i} className="flex items-center gap-1.5 leading-relaxed">
            <span className="text-muted">•</span>
            {renderEventMessage(ev, i)}
          </div>
        ))
      )}
    </div>
  );
};
