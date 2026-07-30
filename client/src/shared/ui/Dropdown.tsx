import React, { ReactNode } from 'react';
import * as Select from '@radix-ui/react-select';
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
  dropdownClassName = 'w-full sm:w-56',
  optionsContainerClassName = 'flex flex-col p-2 gap-1',
  renderOption,
  renderTrigger,
  activeColor = 'blue',
}: DropdownProps) {
  const selectedOption = options.find((o) => o.value === value);

  const focusRingClass = activeColor === 'emerald' ? 'focus:ring-emerald-500' : 'focus:ring-blue-500';
  const activeBgClass = activeColor === 'emerald' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400';

  return (
    <Select.Root value={value} onValueChange={onChange} disabled={disabled}>
      <Select.Trigger
        className={`flex items-center justify-between w-full sm:w-auto px-4 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-sm focus:outline-none focus:ring-2 ${focusRingClass} font-semibold transition-colors ${
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
        <Select.Icon asChild>
          <ChevronDown className="w-4 h-4 ml-2 transition-transform duration-200 shrink-0 opacity-70" />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          className={`z-[150] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl overflow-hidden max-h-80 ${dropdownClassName}`}
          position="popper"
          sideOffset={6}
        >
          <Select.Viewport className={optionsContainerClassName}>
            {options.map((option) => {
              const isSelected = value === option.value;
              return (
                <Select.Item
                  key={option.value}
                  value={option.value}
                  className={`flex items-center gap-2 text-left px-3 py-2 rounded-md transition-colors w-full cursor-default select-none outline-none data-[highlighted]:bg-slate-100 dark:data-[highlighted]:bg-slate-800 ${
                    isSelected 
                      ? `${activeBgClass} font-bold` 
                      : 'text-slate-700 dark:text-slate-300 font-semibold'
                  } ${option.className || ''}`}
                >
                  <Select.ItemText>
                    {renderOption ? (
                      renderOption(option, isSelected)
                    ) : (
                      <div className="flex items-center gap-2">
                        {option.icon}
                        <span className="capitalize">{option.label}</span>
                      </div>
                    )}
                  </Select.ItemText>
                </Select.Item>
              );
            })}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
