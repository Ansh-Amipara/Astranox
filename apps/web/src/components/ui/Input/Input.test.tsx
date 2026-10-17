import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Input } from './Input';

describe('Input primitive', () => {
  it('renders input with default text type', () => {
    render(<Input placeholder="Enter username" />);
    const input = screen.getByPlaceholderText('Enter username');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'text');
  });

  it('strips non-digits when numericOnly is true', () => {
    const handleChange = vi.fn();
    render(<Input placeholder="Number" numericOnly onChange={handleChange} />);
    const input = screen.getByPlaceholderText('Number') as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'abc123xyz45' } });
    expect(input.value).toBe('12345');
    expect(handleChange).toHaveBeenCalled();
  });
});
