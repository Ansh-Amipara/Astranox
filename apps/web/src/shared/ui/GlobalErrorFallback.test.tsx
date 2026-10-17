import { render, screen, fireEvent } from '@testing-library/react';
import { GlobalErrorFallback } from './ErrorFallback';
import { vi, describe, beforeEach, it, expect } from 'vitest';

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

describe('GlobalErrorFallback', () => {
  const mockReset = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (error: Error) => {
    return render(
      <GlobalErrorFallback error={error} resetErrorBoundary={mockReset} />
    );
  };

  it('renders the error message correctly', () => {
    renderComponent(new Error('Test error message'));
    expect(screen.getByText('A Fatal Error Occurred')).toBeInTheDocument();
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('calls resetErrorBoundary when Reload Application is clicked', () => {
    renderComponent(new Error('Test error message'));
    const reloadButton = screen.getByRole('button', { name: /reload application/i });
    fireEvent.click(reloadButton);
    expect(mockReset).toHaveBeenCalledTimes(1);
  });
});
