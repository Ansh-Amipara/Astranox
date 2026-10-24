import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi } from 'vitest';
import { RealmCard } from '../components/RealmCard';
import { RealmEncounterCard } from '../components/RealmEncounterCard';
import { RealmFieldGuide } from '../components/RealmFieldGuide';
import { RealmOverviewDto, RealmSearchResultDto } from '@astranox/types';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

const mockRealm: RealmOverviewDto = {
  id: 'r1',
  realmId: 'volcano',
  name: 'Volcano Realm',
  description: 'Scorched volcanic peaks with Fire, Ground, and Rock species.',
  themeKey: 'volcano',
  types: ['fire', 'ground', 'rock'],
  spawnLevelMin: 5,
  spawnLevelMax: 35,
  speciesCount: 288,
  enabled: true,
  sortOrder: 1,
};

const mockEncounter: RealmSearchResultDto = {
  encounter: {
    speciesId: 4,
    speciesName: 'charmander',
    level: 12,
    types: ['fire'],
    spriteUrl: 'https://img.test/charmander.png',
    isApex: false,
    rank: 'A',
  },
  battleId: 'battle-123',
  redirectTo: '/battle?returnUrl=/realm/volcano',
};

describe('Realm UI Components', () => {
  it('renders RealmCard with name, types, and enter button', () => {
    const queryClient = createTestQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RealmCard realm={mockRealm} />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText('Volcano Realm')).toBeInTheDocument();
    expect(screen.getByText('288 Species')).toBeInTheDocument();
    expect(screen.getByText('fire')).toBeInTheDocument();
    expect(screen.getByText('ground')).toBeInTheDocument();
    expect(screen.getByText('rock')).toBeInTheDocument();
    expect(screen.getByText(/Enter Realm/i)).toBeInTheDocument();
  });

  it('renders RealmEncounterCard with wild encounter and triggers action buttons', () => {
    const onDismiss = vi.fn();
    render(
      <MemoryRouter>
        <RealmEncounterCard encounterResult={mockEncounter} onDismiss={onDismiss} />
      </MemoryRouter>
    );

    expect(screen.getByText('charmander')).toBeInTheDocument();
    expect(screen.getByText('Lv. 12')).toBeInTheDocument();
    expect(screen.getByText('Battle')).toBeInTheDocument();

    const runBtn = screen.getByText('Run');
    fireEvent.click(runBtn);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('renders RealmFieldGuide and filters by search input', () => {
    const speciesList = [
      {
        speciesId: 4,
        speciesName: 'charmander',
        types: ['fire'],
        rank: 'A',
        spriteUrl: 'https://img.test/charmander.png',
        isCaught: true,
      },
      {
        speciesId: 74,
        speciesName: 'geodude',
        types: ['rock', 'ground'],
        rank: 'E',
        spriteUrl: 'https://img.test/geodude.png',
        isCaught: false,
      },
    ];

    render(
      <RealmFieldGuide species={speciesList} realmTypes={['fire', 'rock', 'ground']} />
    );

    expect(screen.getByText('Wilderness Field Guide')).toBeInTheDocument();
    expect(screen.getByText('charmander')).toBeInTheDocument();
    expect(screen.getByText('geodude')).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText('Search species...');
    fireEvent.change(searchInput, { target: { value: 'geo' } });

    expect(screen.queryByText('charmander')).not.toBeInTheDocument();
    expect(screen.getByText('geodude')).toBeInTheDocument();
  });
});
