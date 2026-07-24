import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../shared/api/api';
import { useAuthStore } from '../../../shared/store/auth.store';

import { User as UserIcon, LogOut } from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuthStore();

  const { data: profile } = useQuery({
    queryKey: ['authProfile'],
    queryFn: async () => {
      const res = await api.get('/auth/profile');
      return res.data.data;
    },
    enabled: !!user,
  });

  const { data: trainerSave } = useQuery({
    queryKey: ['trainerSave'],
    queryFn: async () => {
      const res = await api.get('/trainers/me');
      return res.data.data;
    },
    enabled: !!user,
  });

  return (
    <nav className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-md relative z-[60] transition-colors duration-200 border-b border-slate-200 dark:border-transparent">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 text-xl font-extrabold text-red-500 tracking-wider">
              <img src="/logo.png" alt="Astranox Logo" className="w-8 h-8 object-contain" />
            </Link>

            <div className="ml-10 flex items-baseline space-x-4">
              <Link to="/arena" className="hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors px-3 py-2 rounded-md text-sm font-medium">Arena</Link>
              <Link to="/rank" className="hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors px-3 py-2 rounded-md text-sm font-medium">Rank</Link>
              <Link to="/shop" className="hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors px-3 py-2 rounded-md text-sm font-medium">Pokémart</Link>
              <Link to="/team" className="hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors px-3 py-2 rounded-md text-sm font-medium">Team</Link>
              <Link to="/pokemon" className="hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors px-3 py-2 rounded-md text-sm font-medium">Pokémon</Link>
              <Link to="/inventory" className="hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors px-3 py-2 rounded-md text-sm font-medium">Inventory</Link>
              <Link to="/pokedex" className="hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors px-3 py-2 rounded-md text-sm font-medium">Pokédex</Link>
              <Link to="/info" className="hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors px-3 py-2 rounded-md text-sm font-medium">Info</Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {user && (
              <div className="flex items-center space-x-2">

                <Link
                  to="/profile"
                  className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                  aria-label="Profile"
                  title="Profile"
                >
                  <UserIcon className="w-5 h-5" />
                </Link>
                <button
                  onClick={logout}
                  className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                  aria-label="Logout"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
                {user.role === 'ADMIN' && (
                  <div className="flex space-x-2 ml-2">
                    <Link
                      to="/admin/dashboard"
                      className="px-3 py-1.5 rounded-lg font-bold text-sm bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400 transition-colors"
                    >
                      Admin
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
