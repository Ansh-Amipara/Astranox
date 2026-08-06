import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/api/api';
import { useAuthStore } from '@/modules/auth/store/auth.store';
import { User as UserIcon, LogOut, ShieldAlert, Menu, X, Crown } from 'lucide-react';
import { Button } from '@/shared/ui/Button';

export function Navbar() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ['authProfile'],
    queryFn: async () => {
      const res = await api.get('/auth/profile');
      return res.data.data;
    },
    enabled: !!user,
  });

  const navLinks = [
    { to: '/arena', label: 'Arena' },
    { to: '/tower', label: 'Tower' },
    { to: '/rift', label: 'Rift' },
    { to: '/explore', label: 'Realm' },
    { to: '/events', label: 'Events' },
    { to: '/rank', label: 'Rank' },
    { to: '/marketplace', label: 'Market' },
    { to: '/shop', label: 'Pokémart' },
    { to: '/team', label: 'Team' },
    { to: '/pokemon', label: 'Pokémon' },
    { to: '/inventory', label: 'Bag' },
    { to: '/pokedex', label: 'Pokédex' },
    { to: '/info', label: 'Info' },
  ];

  return (
    <>
      <nav className="sticky top-0 z-[100] w-full backdrop-blur-md bg-white/80 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-300">
      <div className="w-full px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 lg:h-20">

          {/* Logo & Mobile Menu Toggle */}
          <div className="flex items-center flex-shrink-0 pr-4">
            <button 
              className="lg:hidden mr-3 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 dark:bg-blue-500/40 rounded-full blur-md group-hover:bg-blue-400/30 transition-colors duration-300"></div>
                <img src="/logo.png" alt="Astranox" className="w-9 h-9 object-contain relative z-10" />
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex flex-1 items-center px-2">
            <div className="flex items-center space-x-1.5 py-2">
              {navLinks.map((link) => {
                const isActive = location.pathname.startsWith(link.to);
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`px-3 py-1.5 rounded-lg text-sm font-bold uppercase tracking-wider whitespace-nowrap flex-shrink-0 transition-all duration-300 ${isActive
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
                      }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-3 pl-4 flex-shrink-0">
            {user && (
              <>
                {user.role === 'ADMIN' && (
                  <Link to="/admin/dashboard" className="mr-1">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 rounded-xl hover:bg-indigo-500/20 transition-colors">
                      <Crown className="w-4 h-4" /> <span className="hidden sm:inline">Admin</span>
                    </button>
                  </Link>
                )}

                <Link to="/profile">
                  <button
                    aria-label="Profile"
                    className="flex items-center justify-center w-8 h-8 bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 rounded-xl"
                  >
                    <UserIcon className="w-4 h-4" />
                  </button>
                </Link>
                <button aria-label="Logout" onClick={logout} className="flex items-center justify-center w-8 h-8 text-slate-500 rounded-xl">
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      </nav>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[110] lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <div 
        className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 shadow-xl z-[120] transform transition-transform duration-300 ease-in-out lg:hidden overflow-y-auto ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200 dark:border-slate-800">
          <span className="font-bold text-lg text-slate-900 dark:text-white">Menu</span>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="flex flex-col py-4 px-2 space-y-1">
          {navLinks.map((link) => {
            const isActive = location.pathname.startsWith(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setIsSidebarOpen(false)}
                className={`px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all duration-300 ${
                  isActive
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
