import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Navbar } from './Navbar';
import { describe, it, expect, vi } from 'vitest';
import { useAuthStore } from '../../../shared/store/auth.store';

// Mock the auth store to simulate a logged-in state
vi.mock('../../../shared/store/auth.store', () => ({
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
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
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
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    expect(screen.getByText('Pokémon')).toBeInTheDocument();
    expect(screen.getByText('Fight')).toBeInTheDocument();
    expect(screen.getByText('Gyms')).toBeInTheDocument();
    expect(screen.getByText('Pokémart')).toBeInTheDocument();
    expect(screen.getByText('Social')).toBeInTheDocument();
  });
});
