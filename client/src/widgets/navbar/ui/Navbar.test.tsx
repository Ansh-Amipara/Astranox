import { render, screen } from '@testing-library/react';
import { Navbar } from './Navbar';
import { describe, it, expect, vi } from 'vitest';
import { useAuthStore } from '@/modules/auth/store/auth.store';

// Mock the auth store to simulate a logged-in state
vi.mock('@/modules/auth/store/auth.store', () => ({
  useAuthStore: vi.fn(),
}));

describe('Navbar Component', () => {
  it('renders the branding text correctly', () => {
    // Setup mock return value
    (useAuthStore as any).mockReturnValue({
      user: { username: 'TestUser', role: 'USER' },
      logout: vi.fn()
    });

    render(
      <Navbar />
    );

    // Verify the brand name (alt text of the image)
    expect(screen.getByAltText('Astranox Logo')).toBeInTheDocument();
  });

  it('renders links for a logged-in user', () => {
    (useAuthStore as any).mockReturnValue({
      user: { username: 'TestUser', role: 'USER' },
      logout: vi.fn()
    });

    render(
      <Navbar />
    );

    expect(screen.getByText('Pokémon')).toBeInTheDocument();
    expect(screen.getByText('Fight')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Trainer' })).toBeInTheDocument();
    expect(screen.getByText('Pokémart')).toBeInTheDocument();
    expect(screen.getByText('Social')).toBeInTheDocument();
  });
});
