import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isInitialized, initialize } = useAuthStore();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [initStarted, setInitStarted] = useState(false);
  const [initError, setInitError] = useState<Error | null>(null);

  useEffect(() => {
    if (!isInitialized && !initStarted) {
      setInitStarted(true);
      initialize().catch((error) => {
        setInitError(error);
      });
    }
  }, [isInitialized, initialize, initStarted]);

  useEffect(() => {
    if (isInitialized && !user) {
      navigate(`/login?from=${pathname}`);
    }
  }, [isInitialized, user, navigate, pathname]);

  if (initError) {
    throw initError;
  }

  // Premium loading state while checking auth
  if (!isInitialized) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background transition-colors duration-200">
        <div className="relative flex h-20 w-20 items-center justify-center">
          <div className="absolute h-full w-full animate-[spin_3s_linear_infinite] rounded-full border-b-2 border-l-2 border-border"></div>
          <div className="absolute h-16 w-16 animate-[spin_2s_linear_infinite_reverse] rounded-full border-r-2 border-t-2 border-border"></div>
          <div className="absolute h-12 w-12 animate-pulse rounded-full bg-surface-raised blur-sm"></div>
        </div>
      </div>
    );
  }


  // Redirect to login if unauthenticated
  if (!user) {
    return null;
  }

  // Render children if authenticated
  return <>{children}</>;
}
