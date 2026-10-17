import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isInitialized, initialize } = useAuthStore();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

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

  // Redirect to admin login if unauthenticated
  if (!user) {
    if (typeof window !== 'undefined') {
      navigate(`/admin/login?from=${pathname}`);
    }
    return null;
  }

  // Redirect to game if not an admin
  if (user.role !== 'ADMIN') {
    if (typeof window !== 'undefined') {
      navigate('/');
    }
    return null;
  }

  // Render children if authenticated and admin
  return <>{children}</>;
}
