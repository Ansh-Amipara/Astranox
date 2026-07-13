import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useThemeStore } from './store/theme.store';
import { AuthGuard } from './components/AuthGuard';
import { AdminGuard } from './components/AdminGuard';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Home } from './pages/Home';
import { Navbar } from './components/Navbar';
import { PokemonManagement } from './pages/PokemonManagement';
import { TeamPage } from './pages/TeamPage';

import { Gyms } from './pages/Gyms';
import { BattleScreen } from './pages/BattleScreen';
import { Pokemart } from './pages/Pokemart';
import { Bag } from './pages/Bag';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminLayout } from './components/AdminLayout';
import { FightSetup } from './pages/FightSetup';
import { SocialHub } from './pages/SocialHub';
import { TradeScreen } from './pages/TradeScreen';

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
      {!isAuthPage && <Navbar />}
      <main className="flex-1 flex flex-col">
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
            path="/gyms"
            element={
              <AuthGuard>
                <Gyms />
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
      </main>
    </div>
  );
}

export default App;
