import { Navbar } from '@/widgets/navbar/ui/Navbar';
import { AuthGuard } from '@/features/auth/ui/AuthGuard';
import { RequireStarterGuard } from '@/features/auth/ui/RequireStarterGuard';

export default function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <RequireStarterGuard>
        <Navbar />
        <main className="flex-1 flex flex-col">
          {children}
        </main>
      </RequireStarterGuard>
    </AuthGuard>
  );
}
