import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorState } from './ErrorState';

describe('ErrorState', () => {
  it('renders error title, message, and requestId', () => {
    render(
      <ErrorState
        title="Failed to Load Inventory"
        message="Could not reach the server."
        requestId="req_12345"
      />
    );

    expect(screen.getByText('Failed to Load Inventory')).toBeInTheDocument();
    expect(screen.getByText('Could not reach the server.')).toBeInTheDocument();
    expect(screen.getByText(/req_12345/)).toBeInTheDocument();
  });

  it('renders retry button and triggers callback on click', async () => {
    const onRetry = vi.fn();
    render(
      <ErrorState
        message="Network error"
        onRetry={onRetry}
        retryLabel="Reload Data"
      />
    );

    const button = screen.getByRole('button', { name: /Reload Data/i });
    expect(button).toBeInTheDocument();

    await userEvent.click(button);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
