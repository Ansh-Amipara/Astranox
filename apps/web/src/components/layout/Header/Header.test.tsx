import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Navbar } from './Header';
import { describe, it, expect, vi } from 'vitest';
import { useAuthStore } from '@/features/auth/store';

// Mock the auth store to simulate a logged-in state
vi.mock('@/features/auth/store', () => ({
  useAuthStore: vi.fn(),
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

describe('Navbar Component', () => {
  it('renders the branding text correctly', () => {
    // Setup mock return value
    (useAuthStore as any).mockReturnValue({
      user: { username: 'TestUser', role: 'USER' },
      logout: vi.fn()
    });

    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <Navbar />
        </MemoryRouter>
      </QueryClientProvider>
    );

    // Verify the brand name (alt text of the image)
    expect(screen.getByAltText('Astranox')).toBeInTheDocument();
  });

  it('renders links for a logged-in user', () => {
    (useAuthStore as any).mockReturnValue({
      user: { username: 'TestUser', role: 'USER' },
      logout: vi.fn()
    });

    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <Navbar />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getAllByText('Pokémon')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Arena')[0]).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Profile' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Logout' })).toBeInTheDocument();
    expect(screen.getAllByText('Pokémart')[0]).toBeInTheDocument();
  });
});
