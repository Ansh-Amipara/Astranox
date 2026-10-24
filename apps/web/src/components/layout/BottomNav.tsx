import { Link, useLocation } from 'react-router-dom';
import { Compass, BookOpen, Backpack, ShoppingBag, Users } from 'lucide-react';
import { cn } from '@/lib/cn';

interface BottomNavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: BottomNavItem[] = [
  { to: '/realm', label: 'Realm', icon: Compass },
  { to: '/pokedex', label: 'Pokédex', icon: BookOpen },
  { to: '/inventory', label: 'Bag', icon: Backpack },
  { to: '/shop', label: 'Shop', icon: ShoppingBag },
  { to: '/team', label: 'Team', icon: Users },
];

export function BottomNav() {
  const location = useLocation();

  // Hide bottom nav during active battle to maximize screen space for the battle controls
  if (location.pathname.startsWith('/battle')) {
    return null;
  }

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-surface/90 backdrop-blur-lg border-t border-border pb-safe lg:hidden shadow-lg"
    >
      <div className="grid grid-cols-5 h-14 items-center px-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
          const isActive = location.pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                'flex flex-col items-center justify-center h-full min-h-[44px] py-1 text-[11px] font-bold transition-colors select-none touch-manipulation',
                isActive
                  ? 'text-foreground font-black'
                  : 'text-muted hover:text-foreground active:text-foreground'
              )}
            >
              <div
                className={cn(
                  'flex items-center justify-center w-9 h-7 rounded-full transition-all duration-200',
                  isActive ? 'bg-surface-raised border border-border shadow-xs' : 'bg-transparent'
                )}
              >
                <Icon className={cn('w-4 h-4 transition-transform duration-200', isActive ? 'text-foreground scale-110' : 'text-muted')} />
              </div>
              <span className="truncate max-w-[56px] mt-0.5 tracking-tight">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
