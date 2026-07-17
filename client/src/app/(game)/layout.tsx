import { Navbar } from '@/widgets/navbar/ui/Navbar';
import { AuthGuard } from '@/features/auth/ui/AuthGuard';

export default function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <Navbar />
      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </AuthGuard>
  );
}
