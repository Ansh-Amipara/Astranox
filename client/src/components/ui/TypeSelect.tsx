import React, { useState, useRef, useEffect } from 'react';
import { getTypeSpriteUrl } from '../../shared/api/axios';
import { ChevronDown } from 'lucide-react';

interface TypeSelectProps {
  value: string;
  onChange: (type: string) => void;
  types: string[];
  disabled?: boolean;
}

export function TypeSelect({ value, onChange, types, disabled }: TypeSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full sm:w-48 px-4 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold capitalize transition-colors ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50 dark:hover:bg-slate-800'
        }`}
      >
        <div className="flex items-center gap-2">
          {value ? (
            <>
              <img src={getTypeSpriteUrl(value, true)} alt={value} className="h-5 w-auto object-contain drop-shadow-sm" />
              <span>{value}</span>
            </>
          ) : (
            <span>All Types</span>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full sm:w-64 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl max-h-80 overflow-y-auto">
          <button
            type="button"
            onClick={() => {
              onChange('');
              setIsOpen(false);
            }}
            className="flex items-center w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-b border-slate-100 dark:border-slate-800 font-semibold text-slate-700 dark:text-slate-300"
          >
            All Types
          </button>
          <div className="grid grid-cols-2 gap-1 p-2">
            {types.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  onChange(t.toLowerCase());
                  setIsOpen(false);
                }}
                className={`flex items-center gap-2 px-2 py-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                  value === t.toLowerCase() ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-bold' : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                <img src={getTypeSpriteUrl(t, true)} alt={t} title={t} className="h-5 w-auto object-contain drop-shadow-sm" />
                <span className="capitalize text-sm font-semibold">{t}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
