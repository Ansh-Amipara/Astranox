import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/api/api';
import { useAuthStore } from '@/features/auth/store';
import { User as UserIcon, LogOut, Menu, X, Crown } from 'lucide-react';

export function Header() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { data: _profile } = useQuery({
    queryKey: ['authProfile'],
    queryFn: async () => {
      const res = await api.get('/auth/profile');
      return res.data.data;
    },
    enabled: !!user,
  });

  const { data: save } = useQuery({
    queryKey: ['trainerSave'],
    queryFn: async () => {
      const res = await api.get('/trainers/me');
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
      <nav className="sticky top-0 z-[100] w-full backdrop-blur-md bg-surface/90 border-b border-border shadow-xs pt-safe transition-colors duration-300">
      <div className="w-full px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 lg:h-20">

          {/* Logo & Mobile Menu Toggle */}
          <div className="flex items-center flex-shrink-0 pr-4">
            <button 
              className="lg:hidden -ml-2 mr-2 w-11 h-11 flex items-center justify-center text-muted hover:text-foreground active:bg-surface rounded-xl touch-manipulation"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/10 rounded-full blur-md group-hover:bg-primary/20 transition-colors duration-300"></div>
                <img src="/logo.webp" alt="Astranox" className="w-9 h-9 object-contain relative z-10" />
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
                    className={`px-3 py-1.5 rounded-lg text-sm font-bold uppercase tracking-wider whitespace-nowrap flex-shrink-0 transition-all duration-300 ${isActive ? 'bg-primary text-primary-foreground font-extrabold shadow-sm' : 'text-muted hover:bg-surface hover:text-foreground' }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* User Actions & Currencies */}
          <div className="flex items-center space-x-2 sm:space-x-3 pl-2 sm:pl-4 flex-shrink-0">
            {user && (
              <>
                {save && (
                  <div className="hidden xl:flex items-center gap-2 mr-1">
                    <div className="flex items-center gap-1.5 bg-surface border border-border px-2.5 py-1 rounded-xl text-xs font-bold text-foreground shadow-sm" title="Astral Coins">
                      <img src="/astral.webp" alt="Astral" className="w-4 h-4 object-contain" />
                      <span>{save.astralCoins?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-surface border border-border px-2.5 py-1 rounded-xl text-xs font-bold text-foreground shadow-sm" title="Infinity Coins">
                      <img src="/infinity.webp" alt="Infinity" className="w-4 h-4 object-contain" />
                      <span>{save.infinityCoins?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-surface border border-border px-2.5 py-1 rounded-xl text-xs font-bold text-foreground shadow-sm" title="Stored XP">
                      <img src="/xp.webp" alt="Stored XP" className="w-4 h-4 object-contain" />
                      <span>{save.storedXp?.toLocaleString() || 0}</span>
                    </div>
                  </div>
                )}

                {user.role === 'ADMIN' && (
                  <Link to="/admin/dashboard" className="mr-1">
                    <button className="flex items-center gap-1.5 px-3 py-2 min-h-[44px] text-xs font-bold bg-surface text-foreground border border-border rounded-xl hover:bg-surface-raised transition-colors touch-manipulation">
                      <Crown className="w-4 h-4" /> <span className="hidden sm:inline">Admin</span>
                    </button>
                  </Link>
                )}

                <Link to="/profile">
                  <button
                    aria-label="Profile"
                    className="flex items-center justify-center w-11 h-11 bg-surface text-foreground border border-border hover:bg-surface-raised hover:text-foreground rounded-xl transition-colors touch-manipulation"
                  >
                    <UserIcon className="w-4 h-4" />
                  </button>
                </Link>
                <button
                  aria-label="Logout"
                  onClick={logout}
                  className="flex items-center justify-center w-11 h-11 text-muted hover:text-foreground hover:bg-surface rounded-xl transition-colors touch-manipulation"
                >
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
          className="fixed inset-0 bg-background/70 backdrop-blur-sm z-[110] lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <div 
        className={`fixed top-0 left-0 h-[100dvh] w-72 max-w-[85vw] bg-surface border-r border-border shadow-xl z-[120] transform transition-transform duration-300 ease-in-out lg:hidden overflow-y-auto pt-safe pb-safe ${ isSidebarOpen ? 'translate-x-0' : '-translate-x-full' }`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-border">
          <div className="flex items-center gap-2">
            <img src="/logo.webp" alt="Astranox Menu Logo" className="w-7 h-7 object-contain" />
            <span className="font-bold text-lg text-foreground">Menu</span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close menu"
            className="w-11 h-11 flex items-center justify-center text-muted hover:text-foreground active:bg-surface rounded-xl touch-manipulation -mr-2"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Currencies */}
        {save && (
          <div className="p-3 border-b border-border grid grid-cols-3 gap-2">
            <div className="flex flex-col items-center p-2 rounded-xl bg-surface border border-border" title="Astral Coins">
              <img src="/astral.webp" alt="Astral" className="w-5 h-5 object-contain mb-1" />
              <span className="text-[11px] font-black text-foreground truncate max-w-full">{save.astralCoins?.toLocaleString() || 0}</span>
            </div>
            <div className="flex flex-col items-center p-2 rounded-xl bg-surface border border-border" title="Infinity Coins">
              <img src="/infinity.webp" alt="Infinity" className="w-5 h-5 object-contain mb-1" />
              <span className="text-[11px] font-black text-foreground truncate max-w-full">{save.infinityCoins?.toLocaleString() || 0}</span>
            </div>
            <div className="flex flex-col items-center p-2 rounded-xl bg-surface border border-border" title="Stored XP">
              <img src="/xp.webp" alt="Stored XP" className="w-5 h-5 object-contain mb-1" />
              <span className="text-[11px] font-black text-foreground truncate max-w-full">{save.storedXp?.toLocaleString() || 0}</span>
            </div>
          </div>
        )}
        <div className="flex flex-col py-4 px-2 space-y-1">
          {navLinks.map((link) => {
            const isActive = location.pathname.startsWith(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setIsSidebarOpen(false)}
                className={`min-h-[44px] flex items-center px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all duration-300 touch-manipulation ${ isActive ? 'bg-primary text-primary-foreground font-extrabold shadow-sm' : 'text-muted hover:bg-surface hover:text-foreground' }`}
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

export const Navbar = Header;

