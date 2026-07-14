import type { FallbackProps } from 'react-error-boundary';
import { useNavigate } from 'react-router-dom';

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
            <svg className="w-8 h-8 text-red-600 dark:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
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
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Return Home
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center border border-slate-200 dark:border-slate-700"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reload Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
