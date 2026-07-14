import { render, screen, fireEvent } from '@testing-library/react';
import { GlobalErrorFallback } from './GlobalErrorFallback';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';

describe('GlobalErrorFallback', () => {
  const mockReset = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (error: Error) => {
    return render(
      <BrowserRouter>
        <GlobalErrorFallback error={error} resetErrorBoundary={mockReset} />
      </BrowserRouter>
    );
  };

  it('renders the error message correctly', () => {
    renderComponent(new Error('Test error message'));
    expect(screen.getByText('Oops, something went wrong!')).toBeInTheDocument();
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('calls resetErrorBoundary when Return Home is clicked', () => {
    renderComponent(new Error('Test error message'));
    const returnHomeButton = screen.getByRole('button', { name: /return home/i });
    fireEvent.click(returnHomeButton);
    expect(mockReset).toHaveBeenCalledTimes(1);
  });
});
