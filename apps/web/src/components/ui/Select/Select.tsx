import React, { ReactNode } from 'react';
import * as RadixSelect from '@radix-ui/react-select';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';

export const SelectRoot = RadixSelect.Root;
export const SelectGroup = RadixSelect.Group;
export const SelectValue = RadixSelect.Value;
export const SelectTrigger = RadixSelect.Trigger;
export const SelectContent = RadixSelect.Content;
export const SelectLabel = RadixSelect.Label;
export const SelectItem = RadixSelect.Item;
export const SelectItemText = RadixSelect.ItemText;
export const SelectSeparator = RadixSelect.Separator;
export const SelectViewport = RadixSelect.Viewport;
export const SelectPortal = RadixSelect.Portal;

export interface SelectOption {
  value: string;
  label: string;
  icon?: ReactNode;
  className?: string;
}

export interface SelectProps {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  dropdownClassName?: string;
  optionsContainerClassName?: string;
  renderOption?: (option: SelectOption, isSelected: boolean) => ReactNode;
  renderTrigger?: (selectedOption: SelectOption | undefined) => ReactNode;
  activeColor?: 'blue' | 'emerald';
}

export function SelectDropdown({
  value,
  options,
  onChange,
  placeholder = 'Select...',
  disabled = false,
  className = '',
  dropdownClassName = 'min-w-[var(--radix-select-trigger-width)]',
  optionsContainerClassName = 'flex flex-col p-2 gap-1',
  renderOption,
  renderTrigger,
  activeColor = 'blue',
}: SelectProps) {
  const selectedOption = options.find((o) => o.value === value);

  const focusRingClass =
    activeColor === 'emerald'
      ? 'focus-visible:ring-emerald-500'
      : 'focus-visible:ring-blue-500';
  const activeBgClass =
    activeColor === 'emerald'
      ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
      : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400';

  return (
    <RadixSelect.Root value={value} onValueChange={onChange} disabled={disabled}>
      <RadixSelect.Trigger
        className={cn(
          'flex items-center justify-between w-full px-4 py-2 rounded-xl bg-ink-dark/30 border border-ink-light/20 text-slate-200 shadow-sm focus:outline-none focus-visible:ring-2 font-semibold transition-colors',
          focusRingClass,
          disabled
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:bg-ink-dark/50 hover:border-silt-gold/40',
          className
        )}
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
            <span className="truncate text-neutral-500">{placeholder}</span>
          )}
        </div>
        <RadixSelect.Icon asChild>
          <ChevronDown className="w-4 h-4 ml-2 transition-transform duration-200 shrink-0 opacity-70" />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>

      <RadixSelect.Portal>
        <RadixSelect.Content
          className={cn(
            'z-[150] bg-neutral-900 border border-ink-light/20 rounded-xl shadow-2xl overflow-hidden max-h-80',
            dropdownClassName
          )}
          position="popper"
          sideOffset={6}
        >
          <RadixSelect.Viewport className={optionsContainerClassName}>
            {options.map((option) => {
              const isSelected = value === option.value;
              return (
                <RadixSelect.Item
                  key={option.value}
                  value={option.value}
                  className={cn(
                    'flex items-center gap-2 text-left px-3 py-2 rounded-lg transition-colors w-full cursor-default select-none outline-none data-[highlighted]:bg-neutral-800 text-slate-200 font-semibold',
                    isSelected && `${activeBgClass} font-bold`,
                    option.className
                  )}
                >
                  <RadixSelect.ItemText>
                    {renderOption ? (
                      renderOption(option, isSelected)
                    ) : (
                      <div className="flex items-center gap-2">
                        {option.icon}
                        <span className="capitalize">{option.label}</span>
                      </div>
                    )}
                  </RadixSelect.ItemText>
                </RadixSelect.Item>
              );
            })}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
}

export const Select = Object.assign(SelectDropdown, {
  Root: SelectRoot,
  Group: SelectGroup,
  Value: SelectValue,
  Trigger: SelectTrigger,
  Content: SelectContent,
  Label: SelectLabel,
  Item: SelectItem,
  ItemText: SelectItemText,
  Separator: SelectSeparator,
  Viewport: SelectViewport,
  Portal: SelectPortal,
});
