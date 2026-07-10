import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';

export function AdminLayout() {
  const { pathname } = useLocation();
  const { logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Admin Navbar */}
      <nav className="bg-slate-900 text-white shadow-lg z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <span className="text-xl font-black text-red-500 tracking-widest uppercase">Admin Panel</span>
              
              <div className="flex space-x-1">
                <Link
                  to="/admin/dashboard"
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                    pathname === '/admin/dashboard' 
                      ? 'bg-red-500 text-white shadow-sm' 
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  Users
                </Link>
                <Link
                  to="/admin/map"
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                    pathname === '/admin/map' 
                      ? 'bg-red-500 text-white shadow-sm' 
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  Map
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Link to="/" className="text-slate-400 hover:text-white text-sm font-bold transition-colors">
                Exit to Game
              </Link>
              <button 
                onClick={logout}
                className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
              >
                Logout
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
