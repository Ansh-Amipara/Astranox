import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Spinner } from './Spinner';

describe('Spinner primitive', () => {
  it('renders with accessible role status', () => {
    render(<Spinner label="Fetching data" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Fetching data')).toBeInTheDocument();
  });
});
