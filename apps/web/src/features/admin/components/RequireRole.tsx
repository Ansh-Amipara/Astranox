import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store';
import { UserRole } from '@astranox/types';
import { Spinner } from '@/components/ui/Spinner';

interface RequireRoleProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export function RequireRole({ allowedRoles, children }: RequireRoleProps) {
  const { user, isInitialized } = useAuthStore();
  const location = useLocation();

  if (!isInitialized) {
    return (
      <div className="flex min-h-[100dvh] w-full items-center justify-center bg-background">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to={`/admin-login?from=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <h2 className="text-2xl font-black text-foreground mb-2">Access Restricted</h2>
        <p className="text-muted max-w-md text-sm mb-6">
          Your current role (<span className="font-bold text-foreground">{user.role}</span>) does not have permission to view this section.
        </p>
        <Navigate to="/admin/dashboard" replace />
      </div>
    );
  }

  return <>{children}</>;
}
