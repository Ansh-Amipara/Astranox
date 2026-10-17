import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { FallbackProps } from 'react-error-boundary';
import { Button } from '@/components/ui/Button';

export const GlobalErrorFallback: React.FC<FallbackProps> = ({
  error,
  resetErrorBoundary,
}) => {
  return (
    <div className="min-h-screen bg-surface text-foreground flex flex-col items-center justify-center p-4">
      <div className="bg-surface-raised border border-border/30 rounded-xl p-8 max-w-lg w-full text-center shadow-2xl">
        <div className="w-16 h-16 bg-surface-raised text-muted rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={32} />
        </div>
        <h1 className="text-2xl font-bold text-muted mb-2">A Fatal Error Occurred</h1>
        <p className="text-muted mb-6">
          The application encountered an unexpected state and could not recover.
        </p>
        <div className="bg-background p-4 rounded-lg text-left overflow-auto max-h-48 mb-8 border border-border/50">
          <code className="text-sm text-muted whitespace-pre-wrap font-mono">
            {error instanceof Error ? error.message : String(error)}
          </code>
        </div>
        <Button
          onClick={resetErrorBoundary}
          className="w-full bg-surface-raised hover:bg-surface-raised text-foreground border-none flex items-center justify-center gap-2 py-6 text-lg"
        >
          <RefreshCw size={20} />
          Reload Application
        </Button>
      </div>
    </div>
  );
};

export const ModuleErrorFallback: React.FC<FallbackProps> = ({
  error,
  resetErrorBoundary,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 h-full w-full min-h-[300px]">
      <div className="bg-surface-raised/80 backdrop-blur border border-border/20 rounded-xl p-6 max-w-md w-full text-center shadow-lg">
        <AlertTriangle size={28} className="text-muted mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">Module Crashed</h2>
        <p className="text-muted text-sm mb-4">
          This section of the interface encountered an error.
        </p>
        <div className="bg-surface/80 p-3 rounded text-left overflow-hidden mb-6 border border-border/30 text-xs">
          <p className="text-muted truncate font-mono">
            {error instanceof Error ? error.message : String(error)}
          </p>
        </div>
        <Button
          onClick={resetErrorBoundary}
          variant="outline"
          className="w-full border-border/30 text-muted hover:bg-surface-raised flex items-center justify-center gap-2"
        >
          <RefreshCw size={16} />
          Try Again
        </Button>
      </div>
    </div>
  );
};
