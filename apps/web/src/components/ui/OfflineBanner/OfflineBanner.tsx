import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { clsx } from 'clsx';

export interface OfflineBannerProps {
  className?: string;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({ className }) => {
  const [isOffline, setIsOffline] = useState(
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  );

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={clsx(
        'w-full bg-surface-raised border-b border-border/80 px-4 py-2.5 text-foreground flex items-center justify-between text-xs font-medium z-50 transition-all',
        className
      )}
    >
      <div className="flex items-center gap-2 max-w-2xl mx-auto w-full justify-between">
        <div className="flex items-center gap-2">
          <WifiOff className="w-4 h-4 text-muted animate-pulse" />
          <span>
            You are currently offline. Real-time battle moves and trade synchronization are paused.
          </span>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface hover:bg-surface-raised border border-border text-[11px] font-semibold text-foreground transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          Reconnect
        </button>
      </div>
    </div>
  );
};
