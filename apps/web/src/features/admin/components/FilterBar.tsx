import React from 'react';
import { Search, X } from 'lucide-react';

interface FilterOption {
  id: string;
  label: string;
}

interface FilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  categories?: FilterOption[];
  selectedCategory?: string;
  onCategoryChange?: (val: string) => void;
  placeholder?: string;
  children?: React.ReactNode;
}

export function FilterBar({
  search,
  onSearchChange,
  categories,
  selectedCategory,
  onCategoryChange,
  placeholder = 'Search by name or key...',
  children,
}: FilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface border border-border p-3 rounded-2xl shadow-sm">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-surface-raised border border-border rounded-xl pl-9 pr-8 py-2 text-xs font-bold text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-foreground transition-colors"
        />
        {search && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {categories && onCategoryChange && (
          <select
            value={selectedCategory || 'all'}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="bg-surface-raised border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-foreground transition-colors"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>
        )}

        {children}
      </div>
    </div>
  );
}
