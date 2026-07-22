'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter, usePathname } from 'next/navigation';
import { apiClient } from '../../../shared/api/api-client';

export function RequireStarterGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const { data: save, isLoading } = useQuery({
    queryKey: ['trainerSave'],
    queryFn: async () => {
      const { data } = await apiClient.get('/trainers/me');
      return data.data;
    },
  });

  useEffect(() => {
    if (!isLoading && save && !save.starterChosenAt && pathname !== '/') {
      router.replace('/');
    }
  }, [isLoading, save, pathname, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
        <div className="relative flex h-20 w-20 items-center justify-center">
          <div className="absolute h-full w-full animate-[spin_3s_linear_infinite] rounded-full border-b-2 border-l-2 border-blue-500"></div>
          <div className="absolute h-16 w-16 animate-[spin_2s_linear_infinite_reverse] rounded-full border-r-2 border-t-2 border-purple-500"></div>
          <div className="absolute h-12 w-12 animate-pulse rounded-full bg-blue-500/20 blur-sm"></div>
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
