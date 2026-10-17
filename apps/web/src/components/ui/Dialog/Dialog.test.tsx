import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Dialog } from './Dialog';

describe('Dialog primitive', () => {
  it('renders content when open is true', () => {
    const handleClose = vi.fn();
    render(
      <Dialog isOpen={true} onClose={handleClose} title="Test Dialog">
        <div>Dialog Body Content</div>
      </Dialog>
    );

    expect(screen.getAllByText('Test Dialog')[0]).toBeInTheDocument();
    expect(screen.getByText('Dialog Body Content')).toBeInTheDocument();
  });

  it('does not render content when isOpen is false', () => {
    const handleClose = vi.fn();
    render(
      <Dialog isOpen={false} onClose={handleClose} title="Test Dialog">
        <div>Dialog Body Content</div>
      </Dialog>
    );

    expect(screen.queryByText('Test Dialog')).not.toBeInTheDocument();
  });
});
