import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

export interface DropdownOption {
  value: string;
  label: string;
  icon?: ReactNode;
  className?: string;
}

interface DropdownProps {
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  dropdownClassName?: string;
  optionsContainerClassName?: string;
  renderOption?: (option: DropdownOption, isSelected: boolean) => ReactNode;
  renderTrigger?: (selectedOption: DropdownOption | undefined) => ReactNode;
  activeColor?: 'blue' | 'emerald';
}

export function Dropdown({
  value,
  options,
  onChange,
  placeholder = 'Select...',
  disabled = false,
  className = '',
  dropdownClassName = 'w-full sm:w-56 max-h-80',
  optionsContainerClassName = 'flex flex-col p-2 gap-1',
  renderOption,
  renderTrigger,
  activeColor = 'blue',
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((o) => o.value === value);

  const focusRingClass = activeColor === 'emerald' ? 'focus:ring-emerald-500' : 'focus:ring-blue-500';
  const activeBgClass = activeColor === 'emerald' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400';

  return (
    <div className="relative w-full sm:w-auto" ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full px-4 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-sm focus:outline-none focus:ring-2 ${focusRingClass} font-semibold transition-colors ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50 dark:hover:bg-slate-800'
        } ${className}`}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          {renderTrigger ? (
            renderTrigger(selectedOption)
          ) : selectedOption ? (
            <>
              {selectedOption.icon}
              <span className="capitalize truncate">{selectedOption.label}</span>
            </>
          ) : (
            <span className="truncate">{placeholder}</span>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 ml-2 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className={`absolute z-50 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl overflow-y-auto ${dropdownClassName}`}>
          <div className={optionsContainerClassName}>
            {options.map((option) => {
              const isSelected = value === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`flex items-center gap-2 text-left px-3 py-2 rounded-md transition-colors w-full ${
                    isSelected 
                      ? `${activeBgClass} font-bold` 
                      : 'text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800'
                  } ${option.className || ''}`}
                >
                  {renderOption ? (
                    renderOption(option, isSelected)
                  ) : (
                    <>
                      {option.icon}
                      <span className="capitalize">{option.label}</span>
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
