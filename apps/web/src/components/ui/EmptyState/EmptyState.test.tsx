import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('renders title and description', () => {
    render(
      <EmptyState
        title="No Pokémon Found"
        description="Try searching with a different name or type filter."
      />
    );

    expect(screen.getByText('No Pokémon Found')).toBeInTheDocument();
    expect(
      screen.getByText('Try searching with a different name or type filter.')
    ).toBeInTheDocument();
  });

  it('renders action element when provided', () => {
    render(
      <EmptyState
        title="Empty Box"
        action={<button>Capture More</button>}
      />
    );

    expect(screen.getByRole('button', { name: 'Capture More' })).toBeInTheDocument();
  });
});
