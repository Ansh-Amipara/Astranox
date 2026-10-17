import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store';
import { AdminSidebar } from './AdminSidebar';
import { Menu, X, Gamepad2, LogOut, ChevronRight, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export function AdminLayout() {
  const { pathname } = useLocation();
  const { user, logout } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Generate breadcrumb from path
  const pathSegments = pathname.split('/').filter(Boolean);
  const currentSection = pathSegments[pathSegments.length - 1] || 'Dashboard';
  const formattedSection = currentSection
    .replace(/-/g, ' ')
    .replace(/^./, (str) => str.toUpperCase());

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Top Admin Navbar */}
      <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-border shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-xl text-muted hover:text-foreground hover:bg-surface-raised transition-colors"
                aria-label="Open sidebar menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              <Link to="/admin/dashboard" className="flex items-center gap-2.5 group">
                <img src="/logo.webp" alt="Astranox" className="w-7 h-7 object-contain" />
                <span className="text-base font-black text-foreground tracking-widest uppercase">
                  Astranox
                </span>
                <Badge variant="ink" className="text-[10px] font-black uppercase tracking-wider py-0 px-1.5">
                  Admin
                </Badge>
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 pr-3 border-r border-border">
                <Shield className="w-3.5 h-3.5 text-muted" />
                <span className="text-xs font-bold text-muted capitalize">{user?.username}</span>
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-surface-raised border border-border text-foreground uppercase">
                  {user?.role}
                </span>
              </div>

              <Link
                to="/"
                title="Back to Overworld Game"
                className="p-2 rounded-xl bg-surface-raised hover:bg-surface border border-border text-foreground transition-colors flex items-center justify-center"
              >
                <Gamepad2 className="w-4 h-4" />
              </Link>

              <button
                onClick={logout}
                title="Sign out of Admin Portal"
                className="p-2 rounded-xl bg-surface-raised hover:bg-surface border border-border text-muted hover:text-foreground transition-colors flex items-center justify-center"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 flex gap-6 py-6">
        {/* Desktop Sticky Sidebar */}
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="sticky top-24 bg-surface border border-border rounded-2xl p-3 shadow-xs">
            <span className="block px-3 py-1.5 text-[10px] font-black text-muted uppercase tracking-widest">
              Navigation
            </span>
            <AdminSidebar />
          </div>
        </aside>

        {/* Content Container with Breadcrumb */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-2 text-xs text-muted font-bold">
            <Link to="/admin/dashboard" className="hover:text-foreground transition-colors">
              Admin
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-subtle" />
            <span className="text-foreground capitalize">{formattedSection}</span>
          </nav>

          <Outlet />
        </main>
      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer Menu */}
      <div
        className={`fixed top-0 left-0 bottom-0 z-50 w-72 bg-surface border-r border-border shadow-2xl p-5 flex flex-col justify-between transform transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
            <div className="flex items-center gap-2">
              <img src="/logo.webp" alt="Astranox" className="w-6 h-6 object-contain" />
              <span className="font-black text-sm text-foreground uppercase tracking-wider">
                Staff Portal
              </span>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-1 rounded-lg text-muted hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <AdminSidebar onNavigate={() => setIsMobileMenuOpen(false)} />
        </div>

        <div className="pt-4 border-t border-border flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-foreground">{user?.username}</span>
            <span className="text-[10px] font-black text-muted uppercase">{user?.role}</span>
          </div>
          <button
            onClick={logout}
            className="p-2 rounded-xl bg-surface-raised text-muted hover:text-foreground border border-border"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
