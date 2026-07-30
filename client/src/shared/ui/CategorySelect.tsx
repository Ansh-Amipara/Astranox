import React from 'react';
import { Dropdown, DropdownOption } from './Dropdown';

interface CategorySelectProps {
  value: string;
  onChange: (category: string) => void;
  disabled?: boolean;
}

export function CategorySelect({ value, onChange, disabled }: CategorySelectProps) {
  const options: DropdownOption[] = [
    { value: 'all', label: 'All Categories' },
    { value: 'Normal', label: 'Normal' },
    { value: 'Legendary', label: 'Legendary' },
    { value: 'Mythical', label: 'Mythical' },
    { value: 'Pseudo Legendary', label: 'Pseudo-Legendary' },
    { value: 'Ultra Beast', label: 'Ultra Beast' },
    { value: 'Paradox', label: 'Paradox' },
    { value: 'mega', label: 'Mega Evolutions' },
    { value: 'gmax', label: 'Gigantamax (G-Max)' },
  ];

  return (
    <Dropdown
      value={value}
      options={options}
      onChange={onChange}
      disabled={disabled}
      className="sm:w-48"
    />
  );
}
