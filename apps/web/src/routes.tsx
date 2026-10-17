import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';

// Layouts and Guards
import { Header } from '@/components/layout/Header';
import { AuthGuard } from '@/features/auth/components/AuthGuard';
import { RequireStarterGuard } from '@/features/auth/components/RequireStarterGuard';
import { AdminGuard } from '@/features/auth/components/AdminGuard';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ErrorBoundary } from 'react-error-boundary';
import { ModuleErrorFallback } from '@/components/ui/ErrorFallback';

// Pages
import {
  LoginPage,
  RegisterPage,
  AdminLoginPage,
  AdminDashboardPage,
  AdminEventsPage,
  HomePage,
  BattlePage,
  ArenaPage,
  InventoryPage,
  PokemonManagementPage,
  ChangeMovesPage,
  StarterSelectionPage,
  TeamPage,
  PokedexPage,
  ProfilePage,
  RankPage,
  InfoPage,
  PokemartPage,
  TradePage,
  MarketplacePage,
  CreateListingPage,
  ListingDetailsPage,
  InfinityTowerPage,
  RiftPage,
  ExplorePage,
  ExploreDetailPage,
  EventLandingPage,
  ActiveEventPage,
  EventHistoryPage,
  NotFoundPage,
} from '@/pages';

function GameLayout() {
  return (
    <AuthGuard>
      <RequireStarterGuard>
        <Header />
        <main className="flex-1 flex flex-col relative w-full overflow-x-hidden">
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

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/admin-login" element={<AdminLoginPage />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminRootLayout />}>
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="events" element={<AdminEventsPage />} />
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
        </Route>

        {/* Game Routes */}
        <Route path="/" element={<GameLayout />}>
          <Route index element={<HomePage />} />
          <Route path="battle" element={<BattlePage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="pokemon" element={<PokemonManagementPage />} />
          <Route path="pokemon/:id/moves" element={<ChangeMovesPage />} />
          <Route path="pokedex" element={<PokedexPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="rank" element={<RankPage />} />
          <Route path="info" element={<InfoPage />} />
          <Route path="shop" element={<PokemartPage />} />
          <Route path="arena" element={<ArenaPage />} />
          <Route path="team" element={<TeamPage />} />
          <Route path="trade" element={<TradePage />} />
          <Route path="marketplace" element={<MarketplacePage />} />
          <Route path="marketplace/create" element={<CreateListingPage />} />
          <Route path="marketplace/:id" element={<ListingDetailsPage />} />
          <Route path="tower" element={<InfinityTowerPage />} />
          <Route path="rift" element={<RiftPage />} />
          <Route path="explore" element={<ExplorePage />} />
          <Route path="explore/:id" element={<ExploreDetailPage />} />
          <Route path="events">
            <Route index element={<EventLandingPage />} />
            <Route path="active" element={<ActiveEventPage />} />
            <Route path="history" element={<EventHistoryPage />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
