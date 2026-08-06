import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuthStore } from '@/modules/auth/store/auth.store';
import { LogOut, Menu, X, Gamepad2 } from 'lucide-react';
import { ErrorBoundary } from 'react-error-boundary';
import { ModuleErrorFallback } from '@/shared/ui/ErrorFallback';

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const { logout } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Admin Navbar */}
      <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4 sm:gap-8">
              <button 
                className="sm:hidden text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu className="w-6 h-6" />
              </button>
              <span className="text-lg sm:text-xl font-black text-red-500 tracking-widest uppercase">Admin</span>

              <div className="hidden sm:flex space-x-1">
                <Link
                  to="/admin/dashboard"
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${pathname === '/admin/dashboard'
                      ? 'bg-red-500 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                    }`}
                >
                  Users
                </Link>
                <Link
                  to="/admin/events"
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${pathname === '/admin/events'
                      ? 'bg-red-500 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
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
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white p-2 rounded-lg transition-colors border border-slate-200 dark:border-transparent flex items-center justify-center"
              >
                <Gamepad2 className="w-[18px] h-[18px]" />
              </Link>
              <button
                onClick={logout}
                title="Logout"
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white p-2 rounded-lg transition-colors border border-slate-200 dark:border-transparent flex items-center justify-center"
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
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[110] sm:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <div 
        className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 shadow-xl z-[120] transform transition-transform duration-300 ease-in-out sm:hidden ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200 dark:border-slate-800">
          <span className="font-bold text-lg text-slate-900 dark:text-white">Admin Menu</span>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="flex flex-col py-4 px-2 space-y-1">
          <Link
            to="/admin/dashboard"
            onClick={() => setIsSidebarOpen(false)}
            className={`px-4 py-3 rounded-xl text-sm font-bold transition-colors ${pathname === '/admin/dashboard'
                ? 'bg-red-500 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
              }`}
          >
            Users
          </Link>
          <Link
            to="/admin/events"
            onClick={() => setIsSidebarOpen(false)}
            className={`px-4 py-3 rounded-xl text-sm font-bold transition-colors ${pathname === '/admin/events'
                ? 'bg-red-500 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
              }`}
          >
            Events
          </Link>

        </div>
      </div>
    </div>
  );
}

