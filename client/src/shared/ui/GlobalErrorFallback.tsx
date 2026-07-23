import type { FallbackProps } from 'react-error-boundary';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

export function GlobalErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const navigate = useNavigate();

  const handleReset = () => {
    resetErrorBoundary();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 shadow-xl rounded-2xl overflow-hidden border border-red-100 dark:border-red-900/30">
        <div className="p-6">
          <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full mb-6">
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-center text-slate-800 dark:text-white mb-2">
            Oops, something went wrong!
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-center mb-6">
            An unexpected error occurred in the application.
          </p>
          
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 mb-6 overflow-x-auto border border-slate-100 dark:border-slate-700">
            <p className="text-sm font-mono text-red-600 dark:text-red-400 break-words">
              {(error as Error)?.message || 'Unknown error'}
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleReset}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center"
            >
              <Home className="w-5 h-5 mr-2" />
              Return Home
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center border border-slate-200 dark:border-slate-700"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Reload Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
