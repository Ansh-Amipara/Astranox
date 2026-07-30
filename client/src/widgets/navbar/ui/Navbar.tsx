import { Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/api/api';
import { useAuthStore } from '@/modules/auth/store/auth.store';
import { User as UserIcon, LogOut, ShieldAlert } from 'lucide-react';
import { Button } from '@/shared/ui/Button';

export function Navbar() {
  const { user, logout } = useAuthStore();
  const location = useLocation();

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
  ];

  return (
    <nav className="sticky top-0 z-[100] w-full backdrop-blur-md bg-white/80 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-300">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 lg:h-20">
          
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 pr-4">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 dark:bg-blue-500/40 rounded-full blur-md group-hover:bg-blue-400/30 transition-colors duration-300"></div>
                <img src="/logo.png" alt="Astranox" className="w-9 h-9 object-contain relative z-10 animate-float" style={{ animationDuration: '4s' }} />
              </div>
              <span className="text-xl font-black tracking-widest text-blue-600 dark:text-blue-400 drop-shadow-sm group-hover:text-blue-500 transition-colors">
                ASTRANOX
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-1 items-center overflow-x-auto no-scrollbar mask-linear-fade px-2">
            <div className="flex items-center space-x-1.5 py-2">
              {navLinks.map((link) => {
                const isActive = location.pathname.startsWith(link.to);
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`px-3 py-1.5 rounded-lg text-sm font-bold uppercase tracking-wider whitespace-nowrap flex-shrink-0 transition-all duration-300 ${
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

          {/* User Actions */}
          <div className="flex items-center space-x-3 pl-4 flex-shrink-0">
            {user && (
              <>
                {user.role === 'ADMIN' && (
                  <Link to="/admin/dashboard" className="hidden sm:block">
                    <Button variant="danger" size="sm" icon={ShieldAlert}>
                      Admin
                    </Button>
                  </Link>
                )}
                
                <Link to="/profile">
                  <Button variant="secondary" size="sm" icon={UserIcon} className="hidden sm:flex bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700">
                    {profile?.username || user.username}
                  </Button>
                  <Button aria-label="Profile" variant="secondary" size="sm" icon={UserIcon} className="sm:hidden px-2 bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700" />
                </Link>
                
                <Button aria-label="Logout" variant="ghost" size="sm" icon={LogOut} onClick={logout} className="px-2 text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20" />
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
