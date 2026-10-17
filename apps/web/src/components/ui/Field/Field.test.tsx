import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Field } from './Field';
import { Input } from '../Input';

describe('Field Component', () => {
  it('renders label, helperText, and associates child input', () => {
    render(
      <Field label="Username" helperText="Enter your game username">
        <Input placeholder="Ash" />
      </Field>
    );

    expect(screen.getByText('Username')).toBeDefined();
    expect(screen.getByText('Enter your game username')).toBeDefined();
    const input = screen.getByPlaceholderText('Ash');
    expect(input).toBeDefined();
    expect(input.getAttribute('aria-invalid')).toBeNull();
  });

  it('renders error message and sets aria-invalid and aria-describedby', () => {
    render(
      <Field label="Email" error="Invalid email address">
        <Input placeholder="user@example.com" />
      </Field>
    );

    const errorEl = screen.getByRole('alert');
    expect(errorEl.textContent).toContain('Invalid email address');

    const input = screen.getByPlaceholderText('user@example.com');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toBe(errorEl.id);
  });
});
