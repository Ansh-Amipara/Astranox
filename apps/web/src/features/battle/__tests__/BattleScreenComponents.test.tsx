import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PartyIndicator } from '../components/PartyIndicator';
import { PokemonInfoCard } from '../components/PokemonInfoCard';
import { MovePanel } from '../components/MovePanel';
import { ActionBar } from '../components/ActionBar';
import { BattleLog } from '../components/BattleLog';

describe('Battle Screen UI Components', () => {
  describe('PartyIndicator', () => {
    it('renders correct accessible remaining count label and indicators', () => {
      const party = [
        { id: '1', currentHp: 50, maxHp: 50 },
        { id: '2', currentHp: 0, maxHp: 50 },
        { id: '3', currentHp: 30, maxHp: 50 },
      ];

      render(<PartyIndicator party={party} />);

      const indicator = screen.getByRole('group', { name: '2 of 3 Pokémon remaining' });
      expect(indicator).toBeInTheDocument();
      expect(screen.getByText('2 of 3 Pokémon remaining')).toHaveClass('sr-only');
    });

    it('renders defeated Pokémon indicator in red (bg-health-low)', () => {
      const party = [
        { id: '1', currentHp: 50, maxHp: 50 },
        { id: '2', currentHp: 0, maxHp: 50 },
      ];

      const { container } = render(<PartyIndicator party={party} />);
      const dots = container.querySelectorAll('[aria-hidden="true"]');
      expect(dots[0]).toHaveClass('bg-health-high');
      expect(dots[1]).toHaveClass('bg-health-low');
    });
  });

  describe('PokemonInfoCard', () => {
    it('renders Pokemon details, numeric HP, level, and clarified potential tier', () => {
      render(
        <PokemonInfoCard
          isPlayer={true}
          name="Charizard"
          level={47}
          currentHp={120}
          maxHp={150}
          types={['fire', 'flying']}
          potential="B"
          partyData={[{ id: '1', currentHp: 120, maxHp: 150 }]}
        />
      );

      expect(screen.getByText('Charizard')).toBeInTheDocument();
      expect(screen.getByText('Lv 47')).toBeInTheDocument();
      expect(screen.getByText('120 / 150 HP')).toBeInTheDocument();
      expect(screen.getByText('Tier B')).toBeInTheDocument();
      expect(screen.getByTitle('Potential Tier: B')).toBeInTheDocument();
    });
  });

  describe('MovePanel', () => {
    it('renders moves with name, category, and handles selection without displaying PP', () => {
      const onMoveSelect = vi.fn();
      const moves = [
        { moveId: 101, currentSlot: 0, name: 'Flamethrower', type: 'fire', power: 90, damageClass: 'special' },
        { moveId: 102, currentSlot: 1, name: 'Air Slash', type: 'flying', power: 75, damageClass: 'special' },
      ];

      render(
        <MovePanel
          moves={moves as any}
          isPending={false}
          onMoveSelect={onMoveSelect}
        />
      );

      expect(screen.getByText('Flamethrower')).toBeInTheDocument();
      expect(screen.getByText('Air Slash')).toBeInTheDocument();
      expect(screen.getByText('Pwr 90')).toBeInTheDocument();
      // Ensure no PP is displayed
      expect(screen.queryByText(/PP/i)).not.toBeInTheDocument();

      const moveBtn = screen.getByRole('button', { name: /Use move Flamethrower/i });
      fireEvent.click(moveBtn);
      expect(onMoveSelect).toHaveBeenCalledWith('move:101');
    });

    it('disables move buttons during turn resolution', () => {
      const moves = [
        { moveId: 101, currentSlot: 0, name: 'Tackle', type: 'normal' },
      ];

      render(
        <MovePanel
          moves={moves as any}
          isPending={true}
          onMoveSelect={vi.fn()}
        />
      );

      const moveBtn = screen.getByRole('button', { name: /Use move Tackle/i });
      expect(moveBtn).toBeDisabled();
    });
  });

  describe('ActionBar', () => {
    it('renders Bag, Switch, and Run with visible icons and labels in wild battles', () => {
      const onOpenBag = vi.fn();
      const onOpenParty = vi.fn();
      const onRun = vi.fn();

      render(
        <ActionBar
          isPending={false}
          battleType="WILD"
          onOpenBag={onOpenBag}
          onOpenParty={onOpenParty}
          onRun={onRun}
        />
      );

      const bagBtn = screen.getByRole('button', { name: /Bag items/i });
      const switchBtn = screen.getByRole('button', { name: /Switch active Pokémon/i });
      const runBtn = screen.getByRole('button', { name: /Run from battle/i });

      expect(bagBtn).toBeEnabled();
      expect(switchBtn).toBeEnabled();
      expect(runBtn).toBeEnabled();

      fireEvent.click(bagBtn);
      expect(onOpenBag).toHaveBeenCalled();

      fireEvent.click(switchBtn);
      expect(onOpenParty).toHaveBeenCalled();

      fireEvent.click(runBtn);
      expect(onRun).toHaveBeenCalled();
    });

    it('disables Run and Bag with explanatory title during trainer and arena battles', () => {
      render(
        <ActionBar
          isPending={false}
          battleType="NPC"
          onOpenBag={vi.fn()}
          onOpenParty={vi.fn()}
          onRun={vi.fn()}
        />
      );

      const bagBtn = screen.getByRole('button', { name: /Bag items/i });
      const runBtn = screen.getByRole('button', { name: /Cannot run from trainer battle/i });

      expect(bagBtn).toBeDisabled();
      expect(runBtn).toBeDisabled();
      expect(runBtn).toHaveAttribute('title', 'Cannot flee from a trainer battle');
      expect(bagBtn).toHaveAttribute('title', 'Cannot use Bag items in trainer or arena battles');
    });
  });

  describe('BattleLog', () => {
    it('renders turn messages in font-sans and emphasizes latest entry', () => {
      const events = [
        'Pikachu used Thunderbolt!',
        'Wild Pidgey took 45 damage!',
      ];

      render(<BattleLog lastTurnEvents={events} status="ACTIVE" />);

      expect(screen.getByText('Pikachu used Thunderbolt!')).toBeInTheDocument();
      const latest = screen.getByText('Wild Pidgey took 45 damage!');
      expect(latest).toBeInTheDocument();
      expect(latest).toHaveClass('font-bold');
      expect(screen.getByRole('log')).toHaveClass('font-sans');
    });
  });
});
