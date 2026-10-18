import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';

// Layouts and Guards
import { Header } from '@/components/layout/Header';
import { AuthGuard } from '@/features/auth/components/AuthGuard';
import { RequireStarterGuard } from '@/features/auth/components/RequireStarterGuard';
import { AdminGuard } from '@/features/auth/components/AdminGuard';
import { AdminLayout } from '@/features/admin/components/AdminLayout';
import { RequireRole } from '@/features/admin/components/RequireRole';
import { ErrorBoundary } from 'react-error-boundary';
import { ModuleErrorFallback } from '@/components/ui/ErrorFallback';
import { Spinner } from '@/components/ui/Spinner';

// Pages
import {
  LoginPage,
  RegisterPage,
  AdminLoginPage,
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

// Lazy Loaded Modular Admin Pages
const AdminDashboard = React.lazy(() =>
  import('@/features/admin/pages/Dashboard').then((m) => ({ default: m.Dashboard }))
);
const AdminUsers = React.lazy(() =>
  import('@/features/admin/pages/Users').then((m) => ({ default: m.Users }))
);
const AdminUserDetail = React.lazy(() =>
  import('@/features/admin/pages/UserDetail').then((m) => ({ default: m.UserDetail }))
);
const AdminShop = React.lazy(() =>
  import('@/features/admin/pages/Shop').then((m) => ({ default: m.Shop }))
);
const AdminEconomy = React.lazy(() =>
  import('@/features/admin/pages/Economy').then((m) => ({ default: m.Economy }))
);
const AdminEvents = React.lazy(() =>
  import('@/features/admin/pages/Events').then((m) => ({ default: m.Events }))
);
const AdminFlags = React.lazy(() =>
  import('@/features/admin/pages/Flags').then((m) => ({ default: m.Flags }))
);
const AdminAnnouncements = React.lazy(() =>
  import('@/features/admin/pages/Announcements').then((m) => ({ default: m.Announcements }))
);
const AdminAuditLog = React.lazy(() =>
  import('@/features/admin/pages/AuditLog').then((m) => ({ default: m.AuditLog }))
);

function AdminSuspense({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[50vh]">
          <Spinner size="lg" />
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

import { MaintenanceGuard } from '@/components/layout/MaintenanceScreen';

function GameLayout() {
  return (
    <MaintenanceGuard>
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
    </MaintenanceGuard>
  );
}

function AdminRootLayout() {
  return (
    <AdminGuard>
      <AdminLayout />
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

        {/* Admin Routes with Role Protection and Lazy Loading */}
        <Route path="/admin" element={<AdminRootLayout />}>
          <Route
            path="dashboard"
            element={
              <RequireRole allowedRoles={['ADMIN']}>
                <AdminSuspense>
                  <AdminDashboard />
                </AdminSuspense>
              </RequireRole>
            }
          />
          <Route
            path="users"
            element={
              <RequireRole allowedRoles={['ADMIN', 'MODERATOR']}>
                <AdminSuspense>
                  <AdminUsers />
                </AdminSuspense>
              </RequireRole>
            }
          />
          <Route
            path="users/:id"
            element={
              <RequireRole allowedRoles={['ADMIN', 'MODERATOR']}>
                <AdminSuspense>
                  <AdminUserDetail />
                </AdminSuspense>
              </RequireRole>
            }
          />
          <Route
            path="shop"
            element={
              <RequireRole allowedRoles={['ADMIN']}>
                <AdminSuspense>
                  <AdminShop />
                </AdminSuspense>
              </RequireRole>
            }
          />
          <Route
            path="economy"
            element={
              <RequireRole allowedRoles={['ADMIN']}>
                <AdminSuspense>
                  <AdminEconomy />
                </AdminSuspense>
              </RequireRole>
            }
          />
          <Route
            path="events"
            element={
              <RequireRole allowedRoles={['ADMIN']}>
                <AdminSuspense>
                  <AdminEvents />
                </AdminSuspense>
              </RequireRole>
            }
          />
          <Route
            path="flags"
            element={
              <RequireRole allowedRoles={['ADMIN']}>
                <AdminSuspense>
                  <AdminFlags />
                </AdminSuspense>
              </RequireRole>
            }
          />
          <Route
            path="announcements"
            element={
              <RequireRole allowedRoles={['ADMIN', 'MODERATOR']}>
                <AdminSuspense>
                  <AdminAnnouncements />
                </AdminSuspense>
              </RequireRole>
            }
          />
          <Route
            path="audit"
            element={
              <RequireRole allowedRoles={['ADMIN', 'MODERATOR']}>
                <AdminSuspense>
                  <AdminAuditLog />
                </AdminSuspense>
              </RequireRole>
            }
          />
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
