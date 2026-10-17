import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Card } from './Card';

describe('Card compound primitive', () => {
  it('renders compound subcomponents properly', () => {
    render(
      <Card>
        <Card.Header>Card Header</Card.Header>
        <Card.Body>Card Content</Card.Body>
        <Card.Footer>Card Footer</Card.Footer>
      </Card>
    );

    expect(screen.getByText('Card Header')).toBeInTheDocument();
    expect(screen.getByText('Card Content')).toBeInTheDocument();
    expect(screen.getByText('Card Footer')).toBeInTheDocument();
  });

  it('handles click and keyboard enter when interactive', () => {
    const handleClick = vi.fn();
    render(
      <Card onClick={handleClick}>
        <Card.Body>Interactive Card</Card.Body>
      </Card>
    );

    const card = screen.getByRole('button');
    fireEvent.click(card);
    expect(handleClick).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(card, { key: 'Enter', code: 'Enter' });
    expect(handleClick).toHaveBeenCalledTimes(2);
  });
});
