'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-black text-red-500">A Fatal Error Occurred</h2>
            <p className="text-slate-400">{error.message || 'Something went horribly wrong.'}</p>
            <button
              onClick={() => reset()}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-xl font-bold transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
