import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';

export function AdminLayout() {
  const { pathname } = useLocation();
  const { logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Admin Navbar */}
      <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <span className="text-xl font-black text-red-500 tracking-widest uppercase">Admin Panel</span>

              <div className="flex space-x-1">
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
                  to="/admin/map"
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${pathname === '/admin/map'
                      ? 'bg-red-500 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                    }`}
                >
                  Map
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Link to="/" className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white text-sm font-bold transition-colors">
                Back to Game
              </Link>
              <button
                onClick={logout}
                title="Logout"
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white p-2 rounded-lg transition-colors border border-slate-200 dark:border-transparent flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}
