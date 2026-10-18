
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '@/shared/api/api';

export function RequireStarterGuard({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const { data: save, isLoading } = useQuery({
    queryKey: ['trainerSave'],
    queryFn: async () => {
      const { data } = await api.get('/trainers/me');
      return data.data;
    },
  });

  useEffect(() => {
    if (!isLoading && save && !save.starterChosenAt && pathname !== '/') {
      navigate('/');
    }
  }, [isLoading, save, pathname, navigate]);

  if (isLoading) {
    return (
      <div className="flex min-h-[100dvh] w-full items-center justify-center bg-background transition-colors duration-200">
        <div className="relative flex h-20 w-20 items-center justify-center">
          <div className="absolute h-full w-full animate-[spin_3s_linear_infinite] rounded-full border-b-2 border-l-2 border-border"></div>
          <div className="absolute h-16 w-16 animate-[spin_2s_linear_infinite_reverse] rounded-full border-r-2 border-t-2 border-border"></div>
          <div className="absolute h-12 w-12 animate-pulse rounded-full bg-surface-raised blur-sm"></div>
        </div>
      </div>
    );
  }

  // If on a different page and no starter chosen, don't render children to avoid flash
  if (!isLoading && save && !save.starterChosenAt && pathname !== '/') {
    return null;
  }

  return <>{children}</>;
}
