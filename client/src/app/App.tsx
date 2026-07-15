import { useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useThemeStore } from '../shared/store/theme.store';
import { AuthGuard } from '../features/auth/ui/AuthGuard';
import { AdminGuard } from '../features/auth/ui/AdminGuard';
import { Login } from '../pages/login/ui/Login';
import { Register } from '../pages/register/ui/Register';
import { Home } from '../pages/home/ui/Home';
import { Navbar } from '../widgets/navbar/ui/Navbar';
import { PokemonManagement } from '../pages/pokemon-management/ui/PokemonManagement';
import { TeamPage } from '../pages/team/ui/TeamPage';

import { Trainers } from '../pages/trainers/ui/Trainers';
import { BattleScreen } from '../pages/battle/ui/BattleScreen';
import { Pokemart } from '../pages/pokemart/ui/Pokemart';
import { Bag } from '../pages/bag/ui/Bag';
import { AdminLogin } from '../pages/admin-login/ui/AdminLogin';
import { AdminDashboard } from '../pages/admin-dashboard/ui/AdminDashboard';
import { AdminLayout } from '../widgets/admin-layout/ui/AdminLayout';
import { FightSetup } from '../pages/fight-setup/ui/FightSetup';
import { SocialHub } from '../pages/social-hub/ui/SocialHub';
import { TradeScreen } from '../pages/trade/ui/TradeScreen';

import { ErrorBoundary } from 'react-error-boundary';
import { GlobalErrorFallback } from '../shared/ui/GlobalErrorFallback';
import { Toaster } from 'sonner';

function App() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register' || location.pathname.startsWith('/admin');
  const { theme } = useThemeStore();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-200">
      <Toaster position="top-right" richColors />
      {!isAuthPage && <Navbar />}
      <main className="flex-1 flex flex-col">
        <ErrorBoundary FallbackComponent={GlobalErrorFallback} onReset={() => window.location.href = '/'}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/"
              element={
                <AuthGuard>
                  <Home />
                </AuthGuard>
              }
            />
            <Route
              path="/team"
              element={
                <AuthGuard>
                  <TeamPage />
                </AuthGuard>
              }
            />
            <Route
              path="/box"
              element={
                <AuthGuard>
                  <PokemonManagement />
                </AuthGuard>
              }
            />
            <Route
              path="/fight"
              element={
                <AuthGuard>
                  <FightSetup />
                </AuthGuard>
              }
            />
  
            <Route
              path="/trainers"
              element={<Navigate to="/trainers/league" replace />}
            />
            <Route
              path="/trainers/:mode"
              element={
                <AuthGuard>
                  <Trainers />
                </AuthGuard>
              }
            />
            <Route
              path="/battle"
              element={
                <AuthGuard>
                  <BattleScreen />
                </AuthGuard>
              }
            />
            <Route
              path="/shop"
              element={
                <AuthGuard>
                  <Pokemart />
                </AuthGuard>
              }
            />
            <Route
              path="/bag"
              element={
                <AuthGuard>
                  <Bag />
                </AuthGuard>
              }
            />
            <Route
              path="/social"
              element={
                <AuthGuard>
                  <SocialHub />
                </AuthGuard>
              }
            />
            <Route
              path="/trade/:friendId"
              element={
                <AuthGuard>
                  <TradeScreen />
                </AuthGuard>
              }
            />
            <Route path="/admin/login" element={<AdminLogin />} />
  
            {/* Admin Routes with Layout */}
            <Route path="/admin" element={
              <AdminGuard>
                <AdminLayout />
              </AdminGuard>
            }>
              <Route path="dashboard" element={<AdminDashboard />} />
            </Route>
          </Routes>
        </ErrorBoundary>
      </main>
    </div>
  );
}

export default App;
