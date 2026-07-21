'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '../../../shared/store/auth.store';

import { ChevronDown, User as UserIcon, LogOut } from 'lucide-react';

export function Navbar() {
  const [isPokemonOpen, setIsPokemonOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuthStore();

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
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3 text-xl font-extrabold text-red-500 tracking-wider">
              <img src="/logo.png" alt="Astranox Logo" className="w-8 h-8 object-contain" />
            </Link>

            <div className="ml-10 flex items-baseline space-x-4">
              <Link href="/fight" className="hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors px-3 py-2 rounded-md text-sm font-medium">Fight</Link>
              <Link href="/shop" className="hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors px-3 py-2 rounded-md text-sm font-medium">Pokémart</Link>
              <Link href="/rank" className="hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors px-3 py-2 rounded-md text-sm font-medium text-black-600 dark:text-black-400">Rank</Link>
              <Link href="/realms" className="hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors px-3 py-2 rounded-md text-sm font-medium text-black-600 dark:text-black-400">Realms</Link>
              {/* Pokemon Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsPokemonOpen(!isPokemonOpen)}
                  className="hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors px-3 py-2 rounded-md text-sm font-medium focus:outline-none flex items-center"
                >
                  Pokémon
                  <ChevronDown className={`ml-1 w-4 h-4 transition-transform ${isPokemonOpen ? 'rotate-180' : ''}`} />
                </button>

                {isPokemonOpen && (
                  <div className="absolute left-0 mt-2 w-48 rounded-md shadow-[0_4px_20px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.5)] bg-white dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-black ring-opacity-20 focus:outline-none overflow-hidden origin-top-left transition-all z-[100]">
                    <div className="py-1 flex flex-col" role="menu" aria-orientation="vertical">
                      <Link
                        href="/team"
                        className="px-4 py-3 text-sm text-slate-700 dark:text-white font-medium hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-red-500 dark:hover:text-red-400 transition-colors border-b border-slate-100 dark:border-slate-700/50"
                        role="menuitem"
                        onClick={() => setIsPokemonOpen(false)}
                      >
                        Team
                      </Link>
                      <Link
                        href="/pokemon"
                        className="px-4 py-3 text-sm text-slate-700 dark:text-white font-medium hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-red-500 dark:hover:text-red-400 transition-colors border-b border-slate-100 dark:border-slate-700/50"
                        role="menuitem"
                        onClick={() => setIsPokemonOpen(false)}
                      >
                        Pokémon
                      </Link>
                      <Link
                        href="/inventory"
                        className="px-4 py-3 text-sm text-slate-700 dark:text-white font-medium hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                        role="menuitem"
                        onClick={() => setIsPokemonOpen(false)}
                      >
                        Inventory
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
                <Link
                  href="/profile"
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
                  <Link
                    href="/admin/dashboard"
                    className="px-3 py-1.5 rounded-lg font-bold text-sm bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400 transition-colors ml-2"
                  >
                    Admin
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
