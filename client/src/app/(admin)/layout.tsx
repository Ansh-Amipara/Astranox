import { AdminLayout } from '@/widgets/admin-layout/ui/AdminLayout';
import { AdminGuard } from '@/features/auth/ui/AdminGuard';

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      <AdminLayout>
        {children}
      </AdminLayout>
    </AdminGuard>
  );
}
