import { memo, useEffect, useRef } from 'react';
import { ScrollText, X } from 'lucide-react';

interface Props {
  lastTurnEvents: string[];
  status: string;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  className?: string;
}

export const BattleLog = memo(function BattleLog({
  lastTurnEvents,
  status,
  isMobileOpen: _isMobileOpen = false,
  onCloseMobile,
  className = '',
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom whenever new turn events arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lastTurnEvents]);

  const hasEvents = lastTurnEvents && lastTurnEvents.length > 0;
  const promptMessage =
    status === 'WAITING_SWITCH'
      ? 'Choose your next Pokémon!'
      : status === 'WAITING_MOVE_LEARN'
      ? 'Choose a move to forget...'
      : 'What will you do?';

  return (
    <div
      className={`bg-surface border-border flex flex-col font-sans transition-colors duration-200 select-none ${className}`}
      role="log"
      aria-label="Battle events log"
      aria-live="polite"
    >
      {/* Log Header */}
      <div className="px-3 py-2 sm:px-4 sm:py-3 border-b border-border flex items-center justify-between shrink-0 bg-surface-raised/40">
        <div className="flex items-center gap-2">
          <ScrollText className="w-4 h-4 text-muted" aria-hidden="true" />
          <h2 className="text-xs sm:text-sm font-extrabold text-foreground uppercase tracking-wider">
            Battle Log
          </h2>
          {hasEvents && (
            <span className="text-[10px] font-bold px-1.5 py-0.2 bg-surface-raised text-muted border border-border rounded-full">
              {lastTurnEvents.length}
            </span>
          )}
        </div>

        {/* Mobile close button if displayed as a bottom sheet/drawer */}
        {onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Close battle log"
            className="md:hidden w-8 h-8 flex items-center justify-center text-muted hover:text-foreground rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Message List */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 no-scrollbar"
      >
        {hasEvents ? (
          lastTurnEvents.map((msg, i) => {
            const isLatest = i === lastTurnEvents.length - 1;
            return (
              <div
                key={`log-${i}`}
                className={`text-xs sm:text-sm leading-relaxed transition-all ${
                  isLatest
                    ? 'text-foreground font-bold bg-surface-raised/70 border-l-2 border-primary pl-2.5 py-1.5 rounded-r-xl'
                    : 'text-muted font-medium pl-2.5 py-0.5'
                }`}
              >
                {msg}
              </div>
            );
          })
        ) : (
          <div className="h-full flex items-center justify-center p-4">
            <p className="text-xs sm:text-sm text-muted font-bold animate-pulse text-center">
              {promptMessage}
            </p>
          </div>
        )}
      </div>
    </div>
  );
});
