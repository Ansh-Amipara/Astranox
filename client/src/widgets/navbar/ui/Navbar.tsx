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
    <nav className="sticky top-0 z-50 w-full backdrop-blur-md bg-ink-dark/80 border-b border-ink-light/10 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center flex-shrink-0">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-silt-gold/40 rounded-full blur-md group-hover:bg-silt-peach/60 transition-colors duration-300"></div>
                <img src="/logo.png" alt="Astranox" className="w-9 h-9 object-contain relative z-10 animate-float" style={{ animationDuration: '4s' }} />
              </div>
              <span className="text-xl font-black tracking-widest text-silt-gold drop-shadow-sm group-hover:text-silt-peach transition-colors">
                ASTRANOX
              </span>
            </Link>
          </div>

          <div className="hidden lg:block ml-10 overflow-x-auto no-scrollbar">
            <div className="flex items-baseline space-x-1 py-2">
              {navLinks.map((link) => {
                const isActive = location.pathname.startsWith(link.to);
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`px-3 py-1.5 rounded-lg text-sm font-bold uppercase tracking-wider transition-all duration-300 ${
                      isActive 
                        ? 'bg-silt-gold/20 text-silt-gold shadow-[0_0_10px_rgba(204,162,90,0.2)]' 
                        : 'text-ink-light hover:bg-ink-light/10 hover:text-ink-paper'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center space-x-3 ml-4 flex-shrink-0">
            {user && (
              <>
                {user.role === 'ADMIN' && (
                  <Link to="/admin/dashboard">
                    <Button variant="danger" size="sm" icon={ShieldAlert}>
                      Admin
                    </Button>
                  </Link>
                )}
                
                <Link to="/profile">
                  <Button variant="secondary" size="sm" icon={UserIcon} className="hidden sm:flex">
                    {profile?.username || user.username}
                  </Button>
                  <Button variant="secondary" size="sm" icon={UserIcon} className="sm:hidden px-2" />
                </Link>
                
                <Button variant="ghost" size="sm" icon={LogOut} onClick={logout} className="px-2" />
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
