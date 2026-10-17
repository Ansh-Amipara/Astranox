import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store';
import {
  LayoutDashboard,
  Users,
  Store,
  LineChart,
  CalendarDays,
  Flag,
  Bell,
  ScrollText,
} from 'lucide-react';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, adminOnly: true },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Pokémart Shop', href: '/admin/shop', icon: Store, adminOnly: true },
  { name: 'Economy', href: '/admin/economy', icon: LineChart, adminOnly: true },
  { name: 'Events', href: '/admin/events', icon: CalendarDays, adminOnly: true },
  { name: 'Feature Flags', href: '/admin/flags', icon: Flag, adminOnly: true },
  { name: 'Announcements', href: '/admin/announcements', icon: Bell },
  { name: 'Audit Log', href: '/admin/audit', icon: ScrollText },
];

interface AdminSidebarProps {
  onNavigate?: () => void;
  className?: string;
}

export function AdminSidebar({ onNavigate, className = '' }: AdminSidebarProps) {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';

  const accessibleItems = SIDEBAR_ITEMS.filter((item) => {
    if (item.adminOnly && !isAdmin) return false;
    return true;
  });

  return (
    <nav className={`space-y-1 ${className}`}>
      {accessibleItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.href}
            to={item.href}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted hover:bg-surface-raised hover:text-foreground'
              }`
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span>{item.name}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
