import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';

// Layouts and Guards
import { Navbar } from '@/widgets/navbar/ui/Navbar';
import { AuthGuard } from '@/features/auth/ui/AuthGuard';
import { RequireStarterGuard } from '@/features/auth/ui/RequireStarterGuard';
import { AdminGuard } from '@/features/auth/ui/AdminGuard';
import { AdminLayout } from '@/widgets/admin-layout/ui/AdminLayout';

// Views
import { Home } from '@/views/home/ui/Home';
import { Login } from '@/views/login/ui/Login';
import { Register } from '@/views/register/ui/Register';
import { AdminLogin } from '@/views/admin-login/ui/AdminLogin';
import { AdminDashboard } from '@/views/admin-dashboard/ui/AdminDashboard';
import { BattleScreen } from '@/views/battle/ui/BattleScreen';
import { Bag } from '@/views/bag/ui/Bag';
import { PokemonManagement } from '@/views/pokemon-management/ui/PokemonManagement';
import { PokedexPage } from '@/views/pokedex/ui/PokedexPage';
import { Profile } from '@/views/profile/ui/Profile';
import { RankPage } from '@/views/rank/ui/RankPage';
import { InfoPage } from '@/views/info/ui/InfoPage';
import { ArenaPage } from '@/views/arena/ui/ArenaPage';
import { InfinityTowerPage } from '@/views/infinity-tower/InfinityTowerPage';
import { RiftPage } from '@/views/rift/ui/RiftPage';
import { MarketplacePage } from '@/views/marketplace/ui/MarketplacePage';
import { ListingDetailsPage } from '@/views/marketplace/ui/ListingDetailsPage';
import { CreateListingPage } from '@/views/marketplace/ui/CreateListingPage';

import { Pokemart } from '@/views/pokemart/ui/Pokemart';
import { TeamPage } from '@/views/team/ui/TeamPage';
import { TradeScreen } from '@/views/trade/ui/TradeScreen';

import { NotFound } from '@/views/not-found/ui/NotFound';

function GameLayout() {
  return (
    <AuthGuard>
      <RequireStarterGuard>
        <Navbar />
        <main className="flex-1 flex flex-col">
          <Outlet />
        </main>
      </RequireStarterGuard>
    </AuthGuard>
  );
}

function AdminRootLayout() {
  return (
    <AdminGuard>
      <AdminLayout>
        <Outlet />
      </AdminLayout>
    </AdminGuard>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin-login" element={<AdminLogin />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminRootLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
        </Route>

        {/* Game Routes */}
        <Route path="/" element={<GameLayout />}>
          <Route index element={<Home />} />
          <Route path="battle" element={<BattleScreen />} />
          <Route path="inventory" element={<Bag />} />
          <Route path="pokemon" element={<PokemonManagement />} />
          <Route path="pokedex" element={<PokedexPage />} />
          <Route path="profile" element={<Profile />} />
          <Route path="rank" element={<RankPage />} />
          <Route path="info" element={<InfoPage />} />
          <Route path="shop" element={<Pokemart />} />
          <Route path="arena" element={<ArenaPage />} />
          <Route path="team" element={<TeamPage />} />
          <Route path="trade" element={<TradeScreen />} />
          <Route path="marketplace" element={<MarketplacePage />} />
          <Route path="marketplace/create" element={<CreateListingPage />} />
          <Route path="marketplace/:id" element={<ListingDetailsPage />} />
          <Route path="tower" element={<InfinityTowerPage />} />
          <Route path="rift" element={<RiftPage />} />

        </Route>

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
