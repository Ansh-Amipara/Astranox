import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { FallbackProps } from 'react-error-boundary';
import { Button } from '@/components/ui/Button';

export const GlobalErrorFallback: React.FC<FallbackProps> = ({
  error,
  resetErrorBoundary,
}) => {
  return (
    <div className="min-h-screen bg-neutral-900 text-white flex flex-col items-center justify-center p-4">
      <div className="bg-neutral-800 border border-red-500/30 rounded-xl p-8 max-w-lg w-full text-center shadow-2xl">
        <div className="w-16 h-16 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={32} />
        </div>
        <h1 className="text-2xl font-bold text-red-400 mb-2">A Fatal Error Occurred</h1>
        <p className="text-neutral-400 mb-6">
          The application encountered an unexpected state and could not recover.
        </p>
        <div className="bg-neutral-950 p-4 rounded-lg text-left overflow-auto max-h-48 mb-8 border border-neutral-700/50">
          <code className="text-sm text-red-300 whitespace-pre-wrap font-mono">
            {error instanceof Error ? error.message : String(error)}
          </code>
        </div>
        <Button
          onClick={resetErrorBoundary}
          className="w-full bg-red-600 hover:bg-red-700 text-white border-none flex items-center justify-center gap-2 py-6 text-lg"
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
      <div className="bg-neutral-800/80 backdrop-blur border border-red-500/20 rounded-xl p-6 max-w-md w-full text-center shadow-lg">
        <AlertTriangle size={28} className="text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-neutral-100 mb-2">Module Crashed</h2>
        <p className="text-neutral-400 text-sm mb-4">
          This section of the interface encountered an error.
        </p>
        <div className="bg-neutral-900/80 p-3 rounded text-left overflow-hidden mb-6 border border-neutral-700/30 text-xs">
          <p className="text-red-300 truncate font-mono">
            {error instanceof Error ? error.message : String(error)}
          </p>
        </div>
        <Button
          onClick={resetErrorBoundary}
          variant="outline"
          className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10 flex items-center justify-center gap-2"
        >
          <RefreshCw size={16} />
          Try Again
        </Button>
      </div>
    </div>
  );
};
