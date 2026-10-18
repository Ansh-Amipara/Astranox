import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PokemonSprite } from './PokemonSprite';

describe('PokemonSprite', () => {
  it('renders image with optimized url and displays skeleton until loaded', () => {
    const { container } = render(
      <PokemonSprite speciesId={25} alt="Pikachu" />
    );

    const img = screen.getByRole('img', { name: 'Pikachu' });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('alt', 'Pikachu');
    // Initially image is opacity-0 and skeleton is present
    expect(img).toHaveClass('opacity-0');
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();

    // Trigger image load
    fireEvent.load(img);
    expect(img).toHaveClass('opacity-100');
    expect(container.querySelector('.animate-pulse')).not.toBeInTheDocument();
  });

  it('renders fallback when image fails to load', () => {
    render(<PokemonSprite speciesId={99999} alt="Missing Pokémon" />);
    const img = screen.getByRole('img', { name: 'Missing Pokémon' });

    fireEvent.error(img);

    expect(screen.queryByRole('img', { name: 'Missing Pokémon' })).toBeInTheDocument();
    // Error fallback container rendered
    expect(screen.getByLabelText('Missing Pokémon')).toBeInTheDocument();
  });
});
