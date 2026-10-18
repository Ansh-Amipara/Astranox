import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Dpad } from '../components/Dpad';

describe('Dpad Component', () => {
  it('renders all four directional buttons', () => {
    render(<Dpad onMove={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Move Up' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Move Down' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Move Left' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Move Right' })).toBeInTheDocument();
  });

  it('triggers onMove callback with correct direction on pointerDown', () => {
    const onMoveMock = vi.fn();
    render(<Dpad onMove={onMoveMock} />);

    const upButton = screen.getByRole('button', { name: 'Move Up' });
    fireEvent.pointerDown(upButton);

    expect(onMoveMock).toHaveBeenCalledWith('UP');
  });

  it('disables all buttons when disabled prop is true', () => {
    render(<Dpad onMove={vi.fn()} disabled={true} />);

    expect(screen.getByRole('button', { name: 'Move Up' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Move Down' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Move Left' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Move Right' })).toBeDisabled();
  });
});
