import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-black text-muted">404 - Not Found</h2>
        <p className="text-lg text-subtle">The page you are looking for does not exist.</p>
        <div className="pt-4">
          <Link to="/" className="bg-primary hover:bg-surface-raised px-6 py-3 rounded-xl font-bold transition-colors text-primary-foreground inline-block border border-border">
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const NotFoundPage = NotFound;
export default NotFoundPage;

