import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MoveMenu } from '../components/MoveMenu';
import { MoveData } from '@astranox/battle-engine';

const mockMoves: MoveData[] = [
  { id: 33, name: 'Tackle', power: 40, accuracy: 100, type: 'normal', damageClass: 'physical' },
  { id: 52, name: 'Ember', power: 40, accuracy: 100, type: 'fire', damageClass: 'special' },
];

describe('MoveMenu Component', () => {
  it('renders available moves with power and type', () => {
    render(<MoveMenu moves={mockMoves} onSelectMove={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByText('Tackle')).toBeInTheDocument();
    expect(screen.getByText('Ember')).toBeInTheDocument();
  });

  it('triggers onSelectMove on click', () => {
    const onSelectMock = vi.fn();
    render(<MoveMenu moves={mockMoves} onSelectMove={onSelectMock} onCancel={vi.fn()} />);

    fireEvent.click(screen.getByText('Tackle'));
    expect(onSelectMock).toHaveBeenCalledWith(33);
  });

  it('triggers onSelectMove on number key press', () => {
    const onSelectMock = vi.fn();
    render(<MoveMenu moves={mockMoves} onSelectMove={onSelectMock} onCancel={vi.fn()} />);

    fireEvent.keyDown(window, { key: '2' });
    expect(onSelectMock).toHaveBeenCalledWith(52);
  });

  it('triggers onCancel when Back button is clicked', () => {
    const onCancelMock = vi.fn();
    render(<MoveMenu moves={mockMoves} onSelectMove={vi.fn()} onCancel={onCancelMock} />);

    fireEvent.click(screen.getByRole('button', { name: 'Back to main battle menu' }));
    expect(onCancelMock).toHaveBeenCalled();
  });
});
