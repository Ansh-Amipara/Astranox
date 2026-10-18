import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Skeleton } from './Skeleton';

describe('Skeleton', () => {
  it('renders with default rectangular variant', () => {
    render(<Skeleton data-testid="skeleton" />);
    const el = screen.getByTestId('skeleton');
    expect(el).toBeInTheDocument();
    expect(el).toHaveClass('animate-pulse');
    expect(el).toHaveClass('bg-surface-raised');
    expect(el).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders circular variant', () => {
    render(<Skeleton variant="circular" data-testid="skeleton-circle" />);
    const el = screen.getByTestId('skeleton-circle');
    expect(el).toHaveClass('rounded-full');
  });

  it('renders with custom width and height styles', () => {
    render(<Skeleton width={120} height={40} data-testid="skeleton-custom" />);
    const el = screen.getByTestId('skeleton-custom');
    expect(el).toHaveStyle({ width: '120px', height: '40px' });
  });
});
