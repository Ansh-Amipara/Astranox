import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';

// Layouts and Guards
import { Navbar } from '@/widgets/navbar/ui/Navbar';
import { AuthGuard } from '@/modules/auth/components/AuthGuard';
import { RequireStarterGuard } from '@/modules/auth/components/RequireStarterGuard';
import { AdminGuard } from '@/modules/auth/components/AdminGuard';
import { AdminLayout } from '@/widgets/admin-layout/ui/AdminLayout';
import { ErrorBoundary } from 'react-error-boundary';
import { ModuleErrorFallback } from '@/shared/ui/ErrorFallback';

// Views
import { Home } from '@/modules/core/pages/home/ui/Home';
import { Login } from '@/modules/auth/pages/login/ui/Login';
import { Register } from '@/modules/auth/pages/register/ui/Register';
import { AdminLogin } from '@/modules/auth/pages/admin-login/ui/AdminLogin';
import { AdminDashboard } from '@/modules/admin/pages/admin-dashboard/ui/AdminDashboard';
import { AdminEventManagement } from '@/modules/admin/pages/admin-events/ui/AdminEventManagement';
import { BattleScreen } from '@/modules/battle/pages/battle/ui/BattleScreen';
import { Bag } from '@/modules/inventory/pages/bag/ui/Bag';
import { PokemonManagement } from '@/modules/pokemon/pages/pokemon-management/ui/PokemonManagement';
import { PokedexPage } from '@/modules/pokedex/pages/pokedex/ui/PokedexPage';
import { Profile } from '@/modules/profile/pages/profile/ui/Profile';
import { RankPage } from '@/modules/social/pages/rank/ui/RankPage';
import { InfoPage } from '@/modules/core/pages/info/ui/InfoPage';
import { ArenaPage } from '@/modules/battle/pages/arena/ui/ArenaPage';
import { InfinityTowerPage } from '@/modules/tower/pages/infinity-tower/InfinityTowerPage';
import { ChangeMovesPage } from '@/modules/pokemon/pages/change-moves/ui/ChangeMovesPage';
import { RiftPage } from '@/modules/rift/pages/rift/ui/RiftPage';
import { ExplorePage } from '@/modules/explore/pages/explore/ui/ExplorePage';
import { ExploreDetailPage } from '@/modules/explore/pages/explore/ui/ExploreDetailPage';
import { MarketplacePage } from '@/modules/marketplace/pages/marketplace/ui/MarketplacePage';
import { ListingDetailsPage } from '@/modules/marketplace/pages/marketplace/ui/ListingDetailsPage';
import { CreateListingPage } from '@/modules/marketplace/pages/marketplace/ui/CreateListingPage';

import { Pokemart } from '@/modules/marketplace/pages/pokemart/ui/Pokemart';
import { TeamPage } from '@/modules/pokemon/pages/team/ui/TeamPage';
import { TradeScreen } from '@/modules/marketplace/pages/trade/ui/TradeScreen';
import { EventDashboard } from '@/modules/events/pages/events/ui/EventDashboard';

import { NotFound } from '@/modules/core/pages/not-found/ui/NotFound';

function GameLayout() {
  return (
    <AuthGuard>
      <RequireStarterGuard>
        <Navbar />
        <main className="flex-1 flex flex-col relative">
          <ErrorBoundary FallbackComponent={ModuleErrorFallback}>
            <Outlet />
          </ErrorBoundary>
        </main>
      </RequireStarterGuard>
    </AuthGuard>
  );
}

function AdminRootLayout() {
  return (
    <AdminGuard>
      <AdminLayout>
        <ErrorBoundary FallbackComponent={ModuleErrorFallback}>
          <Outlet />
        </ErrorBoundary>
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
          <Route path="events" element={<AdminEventManagement />} />
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
        </Route>

        {/* Game Routes */}
        <Route path="/" element={<GameLayout />}>
          <Route index element={<Home />} />
          <Route path="battle" element={<BattleScreen />} />
          <Route path="inventory" element={<Bag />} />
          <Route path="pokemon" element={<PokemonManagement />} />
          <Route path="pokemon/:id/moves" element={<ChangeMovesPage />} />
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
          <Route path="explore" element={<ExplorePage />} />
          <Route path="explore/:id" element={<ExploreDetailPage />} />
          <Route path="events" element={<EventDashboard />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
