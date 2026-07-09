import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { useThemeStore } from '../store/theme.store';

export function Navbar() {
  const [isPokemonOpen, setIsPokemonOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();

  const { data: save } = useQuery({
    queryKey: ['trainerSave'],
    queryFn: async () => {
      const { data } = await api.get('/trainers/me');
      return data.data;
    },
    enabled: !!user,
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsPokemonOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-md relative z-[60] transition-colors duration-200 border-b border-slate-200 dark:border-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-extrabold text-red-500 tracking-wider">ASTRANOX</Link>
            
            <div className="ml-10 flex items-baseline space-x-4">
              <Link to="/" className="hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors px-3 py-2 rounded-md text-sm font-medium">Home</Link>
              <Link to="/map" className="hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors px-3 py-2 rounded-md text-sm font-medium">Map</Link>
              <Link to="/shop" className="hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors px-3 py-2 rounded-md text-sm font-medium text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300">Pokémart</Link>
              
              {/* Pokemon Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsPokemonOpen(!isPokemonOpen)}
                  className="hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors px-3 py-2 rounded-md text-sm font-medium focus:outline-none flex items-center"
                >
                  Pokémon
                  <svg className={`ml-1 w-4 h-4 transition-transform ${isPokemonOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isPokemonOpen && (
                  <div className="absolute left-0 mt-2 w-48 rounded-md shadow-[0_4px_20px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.5)] bg-white dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-black ring-opacity-20 focus:outline-none overflow-hidden origin-top-left transition-all z-[100]">
                    <div className="py-1 flex flex-col" role="menu" aria-orientation="vertical">
                      <Link 
                        to="/team" 
                        className="px-4 py-3 text-sm text-slate-700 dark:text-white font-medium hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-red-500 dark:hover:text-red-400 transition-colors border-b border-slate-100 dark:border-slate-700/50" 
                        role="menuitem"
                        onClick={() => setIsPokemonOpen(false)}
                      >
                        Team
                      </Link>
                      <Link 
                        to="/box" 
                        className="px-4 py-3 text-sm text-slate-700 dark:text-white font-medium hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-red-500 dark:hover:text-red-400 transition-colors border-b border-slate-100 dark:border-slate-700/50" 
                        role="menuitem"
                        onClick={() => setIsPokemonOpen(false)}
                      >
                        Box
                      </Link>
                      <Link 
                        to="/bag" 
                        className="px-4 py-3 text-sm text-slate-700 dark:text-white font-medium hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-red-500 dark:hover:text-red-400 transition-colors" 
                        role="menuitem"
                        onClick={() => setIsPokemonOpen(false)}
                      >
                        Bag
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            {user && (
              <>
                <span className="text-sm text-slate-500 dark:text-slate-400 hidden sm:inline-block">
                  Trainer <span className="font-semibold text-slate-800 dark:text-slate-200">{user.username}</span>
                </span>
                {save && (
                  <span className="rounded-full bg-yellow-100 dark:bg-yellow-500/10 px-3 py-1 text-sm font-medium text-yellow-700 dark:text-yellow-500 border border-yellow-200 dark:border-yellow-500/20">
                    ₽ {save.money}
                  </span>
                )}
                <button 
                  onClick={logout}
                  className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                  aria-label="Logout"
                  title="Logout"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
