import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

export function Navbar() {
  const [isPokemonOpen, setIsPokemonOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuthStore();

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
    <nav className="bg-slate-900 text-white shadow-md relative z-[60]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-extrabold text-red-500 tracking-wider">ASTRANOX</Link>
            
            <div className="ml-10 flex items-baseline space-x-4">
              <Link to="/" className="hover:bg-slate-800 transition-colors px-3 py-2 rounded-md text-sm font-medium">Home</Link>
              <Link to="/map" className="hover:bg-slate-800 transition-colors px-3 py-2 rounded-md text-sm font-medium">Map</Link>
              
              {/* Pokemon Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsPokemonOpen(!isPokemonOpen)}
                  className="hover:bg-slate-800 transition-colors px-3 py-2 rounded-md text-sm font-medium focus:outline-none flex items-center"
                >
                  Pokémon
                  <svg className={`ml-1 w-4 h-4 transition-transform ${isPokemonOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isPokemonOpen && (
                  <div className="absolute left-0 mt-2 w-48 rounded-md shadow-[0_4px_20px_rgba(0,0,0,0.5)] bg-slate-800 ring-1 ring-black ring-opacity-20 focus:outline-none overflow-hidden origin-top-left transition-all z-[100]">
                    <div className="py-1 flex flex-col" role="menu" aria-orientation="vertical">
                      <Link 
                        to="/team" 
                        className="px-4 py-3 text-sm text-white font-medium hover:bg-slate-700 hover:text-red-400 transition-colors border-b border-slate-700/50" 
                        role="menuitem"
                        onClick={() => setIsPokemonOpen(false)}
                      >
                        Team
                      </Link>
                      <Link 
                        to="/box" 
                        className="px-4 py-3 text-sm text-white font-medium hover:bg-slate-700 hover:text-red-400 transition-colors" 
                        role="menuitem"
                        onClick={() => setIsPokemonOpen(false)}
                      >
                        Box
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {user && (
              <>
                <span className="text-sm text-slate-400 hidden sm:inline-block">
                  Trainer <span className="font-semibold text-slate-200">{user.username}</span>
                </span>
                {save && (
                  <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-sm font-medium text-yellow-500 border border-yellow-500/20">
                    ₽ {save.money}
                  </span>
                )}
                <button 
                  onClick={logout}
                  className="rounded-md bg-slate-800 px-3 py-1.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
