import React from 'react';
import { useFlag } from '@/hooks/useFeatureFlags';
import { useAuthStore } from '@/features/auth/store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';
import { ShieldAlert, Wrench } from 'lucide-react';

export interface MaintenanceGuardProps {
  children: React.ReactNode;
}

export const MaintenanceGuard: React.FC<MaintenanceGuardProps> = ({ children }) => {
  const isMaintenance = useFlag('maintenanceMode');
  const user = useAuthStore((state) => state.user);

  // If maintenance mode is active and user is NOT an admin, display the maintenance screen
  if (isMaintenance && user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-foreground font-sans">
        <Card className="max-w-md w-full text-center border-border/80 shadow-2xl bg-surface">
          <Card.Body className="p-8 space-y-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-surface-raised border border-border flex items-center justify-center">
              <Wrench className="w-8 h-8 text-foreground animate-pulse" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-black tracking-tight text-foreground">
                Scheduled Maintenance
              </h1>
              <p className="text-sm text-muted leading-relaxed">
                Astranox is temporarily undergoing system maintenance and balance tuning. Our servers
                will be back online shortly. Thank you for your patience!
              </p>
            </div>

            <div className="pt-4 border-t border-border/50 flex flex-col gap-2">
              <Link to="/admin-login">
                <Button variant="outline" size="sm" className="w-full gap-2">
                  <ShieldAlert className="w-4 h-4" />
                  Staff / Admin Access
                </Button>
              </Link>
            </div>
          </Card.Body>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};
