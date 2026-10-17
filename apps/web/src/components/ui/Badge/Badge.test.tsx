import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Badge } from './Badge';

describe('Badge primitive', () => {
  it('renders badge text correctly', () => {
    render(<Badge>Level 50</Badge>);
    expect(screen.getByText('Level 50')).toBeInTheDocument();
  });

  it('renders variant correctly', () => {
    render(<Badge variant="success">Completed</Badge>);
    const badge = screen.getByText('Completed');
    expect(badge.className).toContain('text-white');
    expect(badge.className).toContain('bg-neutral-800');
  });
});
