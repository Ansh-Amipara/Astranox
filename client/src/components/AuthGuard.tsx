import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isInitialized, initialize } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  // Premium loading state while checking auth
  if (!isInitialized) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950">
        <div className="relative flex h-20 w-20 items-center justify-center">
          <div className="absolute h-full w-full animate-[spin_3s_linear_infinite] rounded-full border-b-2 border-l-2 border-blue-500"></div>
          <div className="absolute h-16 w-16 animate-[spin_2s_linear_infinite_reverse] rounded-full border-r-2 border-t-2 border-purple-500"></div>
          <div className="absolute h-12 w-12 animate-pulse rounded-full bg-blue-500/20 blur-sm"></div>
        </div>
      </div>
    );
  }

  // Redirect to login if unauthenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Render children if authenticated
  return <>{children}</>;
}
