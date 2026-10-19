import { useMemo } from 'react';
import { useAdminItems } from '../hooks/useAdminRoster';

export interface ItemSelectProps {
  value: string;
  onChange: (itemKey: string) => void;
  label?: string;
  placeholder?: string;
  allowCustom?: boolean;
}

export function ItemSelect({
  value,
  onChange,
  label,
  placeholder = 'Select Item from Database...',
  allowCustom = true,
}: ItemSelectProps) {
  const { data: items = [], isLoading } = useAdminItems();

  const isCustom = useMemo(() => {
    if (!value) return false;
    return !items.some((it) => it.id === value);
  }, [value, items]);

  // Group items by category
  const itemsByCategory = useMemo(() => {
    const map = new Map<string, typeof items>();
    for (const it of items) {
      const cat = it.category || 'misc';
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(it);
    }
    return map;
  }, [items]);

  return (
    <div className="space-y-1 w-full">
      {label && <label className="block text-[10px] text-muted font-bold">{label}</label>}
      {isCustom ? (
        <div className="flex items-center gap-1">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
            placeholder="custom-item-key"
            className="w-full px-2 py-1 bg-background border border-border rounded text-xs font-mono text-foreground focus:outline-hidden"
          />
          <button
            type="button"
            onClick={() => {
              if (items.length > 0) onChange(items[0].id);
            }}
            className="px-2 py-1 text-[9px] bg-surface-raised border border-border rounded text-muted hover:text-foreground shrink-0 cursor-pointer font-bold"
          >
            DB List
          </button>
        </div>
      ) : (
        <select
          value={value}
          onChange={(e) => {
            if (e.target.value === '__custom__') {
              onChange('new-item');
            } else {
              onChange(e.target.value);
            }
          }}
          disabled={isLoading}
          className="w-full px-2 py-1 bg-background border border-border rounded text-xs text-foreground focus:outline-hidden cursor-pointer"
        >
          <option value="">{isLoading ? 'Loading items from DB...' : placeholder}</option>
          {Array.from(itemsByCategory.entries()).map(([cat, catItems]) => (
            <optgroup key={cat} label={`-- ${cat.toUpperCase()} (${catItems.length}) --`}>
              {catItems.map((it) => (
                <option key={it.id} value={it.id}>
                  {it.name} ({it.id})
                </option>
              ))}
            </optgroup>
          ))}
          {allowCustom && <option value="__custom__">+ Enter Custom Item Key...</option>}
        </select>
      )}
    </div>
  );
}
