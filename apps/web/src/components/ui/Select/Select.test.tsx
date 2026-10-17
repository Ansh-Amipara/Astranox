import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Select } from './Select';

describe('Select primitive', () => {
  const options = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
  ];

  it('renders trigger with selected value', () => {
    const handleChange = vi.fn();
    render(
      <Select
        value="option1"
        options={options}
        onChange={handleChange}
        placeholder="Choose"
      />
    );

    expect(screen.getByText('Option 1')).toBeInTheDocument();
  });

  it('renders placeholder when no option is selected', () => {
    const handleChange = vi.fn();
    render(
      <Select
        value=""
        options={options}
        onChange={handleChange}
        placeholder="Choose option"
      />
    );

    expect(screen.getByText('Choose option')).toBeInTheDocument();
  });
});
