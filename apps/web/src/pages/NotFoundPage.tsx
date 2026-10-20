import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-background text-foreground p-4">
      <div className="text-center space-y-4 max-w-md w-full bg-surface border border-border p-8 rounded-2xl shadow-xs">
        <span className="text-5xl font-black text-muted tracking-tight">404</span>
        <h2 className="text-xl font-black text-foreground">Page Not Found</h2>
        <p className="text-sm text-muted">The coordinate you traveled to does not exist in the Astranox realm.</p>
        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 min-h-[44px] bg-primary text-primary-foreground hover:opacity-90 rounded-xl font-black text-sm transition-all shadow-xs active:scale-[0.98] touch-manipulation select-none"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const NotFoundPage = NotFound;
export default NotFoundPage;

