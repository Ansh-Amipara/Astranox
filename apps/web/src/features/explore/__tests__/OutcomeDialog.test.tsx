import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OutcomeDialog } from '../components/OutcomeDialog';

describe('OutcomeDialog Component', () => {
  it('renders WON outcome with rewards', () => {
    const outcome = {
      outcome: 'WON' as const,
      rewards: { coins: 50, xp: 120 },
    };

    render(<OutcomeDialog outcomeResult={outcome} onClose={vi.fn()} />);

    expect(screen.getByText('Victory!')).toBeInTheDocument();
    expect(screen.getByText('+50')).toBeInTheDocument();
    expect(screen.getByText('+120 XP')).toBeInTheDocument();
  });

  it('renders CAPTURED outcome with species name and destination', () => {
    const outcome = {
      outcome: 'CAPTURED' as const,
      rewards: { coins: 25 },
      capturedPokemon: {
        id: 'new-poke-1',
        speciesId: 16,
        speciesName: 'Pidgey',
        level: 3,
        isParty: true,
      },
    };

    render(<OutcomeDialog outcomeResult={outcome} onClose={vi.fn()} />);

    expect(screen.getByText('Pokémon Captured!')).toBeInTheDocument();
    expect(screen.getByText('Pidgey')).toBeInTheDocument();
    expect(screen.getByText('Added to Active Party')).toBeInTheDocument();
    expect(screen.getByText('+25')).toBeInTheDocument();
  });

  it('renders DEFEATED outcome with penalty info and handles onClose', () => {
    const onCloseMock = vi.fn();
    const outcome = {
      outcome: 'DEFEATED' as const,
      rewards: { penaltyCoins: 100 },
      respawnPosition: {
        mapId: 'pallet-town',
        x: 5,
        y: 5,
      },
    };

    render(<OutcomeDialog outcomeResult={outcome} onClose={onCloseMock} />);

    expect(screen.getByText('Defeated!')).toBeInTheDocument();
    expect(screen.getByText('-100')).toBeInTheDocument();
    expect(screen.getByText('pallet-town')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Return to Map' }));
    expect(onCloseMock).toHaveBeenCalled();
  });
});
