import React from 'react';
import { clsx } from 'clsx';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  message: string;
  requestId?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message,
  requestId,
  onRetry,
  retryLabel = 'Try Again',
  className,
  ...props
}) => {
  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-border/80 bg-surface max-w-lg w-full mx-auto shadow-sm',
        className
      )}
      role="alert"
      aria-live="assertive"
      {...props}
    >
      <div className="w-14 h-14 rounded-full bg-surface-raised border border-border flex items-center justify-center mb-4 text-muted">
        <AlertCircle className="w-7 h-7" />
      </div>

      <h3 className="text-base font-bold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted max-w-sm mb-4 leading-relaxed">{message}</p>

      {requestId && (
        <div className="mb-6 px-3 py-1.5 rounded-md bg-surface-raised border border-border/60 text-[11px] font-mono text-subtle">
          Request ID: {requestId}
        </div>
      )}

      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="gap-2 text-xs font-semibold"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          {retryLabel}
        </Button>
      )}
    </div>
  );
};
