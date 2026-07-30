import React from 'react';
import { getTypeSpriteUrl } from '@/shared/api/axios';
import { Dropdown, DropdownOption } from './Dropdown';

interface TypeSelectProps {
  value: string;
  onChange: (type: string) => void;
  types: string[];
  disabled?: boolean;
}

export function TypeSelect({ value, onChange, types, disabled }: TypeSelectProps) {
  const options: DropdownOption[] = [
    { value: '', label: 'All Types', className: 'col-span-2 justify-center' },
    ...types.map(t => ({
      value: t.toLowerCase(),
      label: t,
      icon: <img src={getTypeSpriteUrl(t, true)} alt={t} className="h-5 w-auto object-contain drop-shadow-sm" />
    }))
  ];

  return (
    <Dropdown
      value={value}
      options={options}
      onChange={onChange}
      placeholder="All Types"
      disabled={disabled}
      activeColor="emerald"
      className="sm:w-48"
      dropdownClassName="w-full sm:w-64 max-h-80"
      optionsContainerClassName="grid grid-cols-2 gap-1 p-2"
      renderOption={(option, isSelected) => (
        <>
          {option.icon}
          <span className="capitalize text-sm font-semibold">{option.label}</span>
        </>
      )}
    />
  );
}
