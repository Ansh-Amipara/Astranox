import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuthStore } from '@/features/auth/store';
import { LogOut, Menu, X, Gamepad2 } from 'lucide-react';
import { ErrorBoundary } from 'react-error-boundary';
import { ModuleErrorFallback } from '@/shared/ui/ErrorFallback';

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const { logout } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Admin Navbar */}
      <nav className="bg-neutral-950 border-b border-neutral-800 shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4 sm:gap-8">
              <button 
                className="sm:hidden text-neutral-400 hover:text-white"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu className="w-6 h-6" />
              </button>
              <Link to="/" className="flex items-center gap-2 group">
                <img src="/logo.webp" alt="Astranox" className="w-7 h-7 object-contain" />
                <span className="text-lg sm:text-xl font-black text-white tracking-widest uppercase">Admin</span>
              </Link>

              <div className="hidden sm:flex space-x-1">
                <Link
                  to="/admin/dashboard"
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${pathname === '/admin/dashboard'
                      ? 'bg-white text-black shadow-sm'
                      : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
                    }`}
                >
                  Users
                </Link>
                <Link
                  to="/admin/events"
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${pathname === '/admin/events'
                      ? 'bg-white text-black shadow-sm'
                      : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
                    }`}
                >
                  Events
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <Link
                to="/"
                title="Back to Game"
                className="bg-neutral-900 hover:bg-neutral-800 text-white p-2 rounded-lg transition-colors border border-neutral-800 flex items-center justify-center"
              >
                <Gamepad2 className="w-[18px] h-[18px]" />
              </Link>
              <button
                onClick={logout}
                title="Logout"
                className="bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white p-2 rounded-lg transition-colors border border-neutral-800 flex items-center justify-center"
              >
                <LogOut className="w-[18px] h-[18px]" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        <ErrorBoundary FallbackComponent={ModuleErrorFallback}>
          {children}
        </ErrorBoundary>
      </main>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[110] sm:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <div 
        className={`fixed top-0 left-0 h-full w-64 bg-black border-r border-neutral-800 shadow-xl z-[120] transform transition-transform duration-300 ease-in-out sm:hidden ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-neutral-800">
          <span className="font-bold text-lg text-white">Admin Menu</span>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="text-neutral-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="flex flex-col py-4 px-2 space-y-1">
          <Link
            to="/admin/dashboard"
            onClick={() => setIsSidebarOpen(false)}
            className={`px-4 py-3 rounded-xl text-sm font-bold transition-colors ${pathname === '/admin/dashboard'
                ? 'bg-white text-black shadow-sm'
                : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
              }`}
          >
            Users
          </Link>
          <Link
            to="/admin/events"
            onClick={() => setIsSidebarOpen(false)}
            className={`px-4 py-3 rounded-xl text-sm font-bold transition-colors ${pathname === '/admin/events'
                ? 'bg-white text-black shadow-sm'
                : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
              }`}
          >
            Events
          </Link>

        </div>
      </div>
    </div>
  );
}
