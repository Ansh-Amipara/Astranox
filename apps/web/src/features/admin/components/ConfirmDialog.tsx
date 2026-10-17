import React, { useState } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { ReasonField } from './ReasonField';
import { AlertCircle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void> | void;
  title: string;
  description: string;
  summary?: React.ReactNode;
  confirmLabel?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  requireReason?: boolean;
  initialReason?: string;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  summary,
  confirmLabel = 'Confirm',
  isDestructive = false,
  isLoading = false,
  requireReason = true,
  initialReason = '',
}: ConfirmDialogProps) {
  const [reason, setReason] = useState(initialReason);
  const [error, setError] = useState<string | undefined>();

  const handleConfirm = async () => {
    if (requireReason && reason.trim().length < 5) {
      setError('Please provide a reason with at least 5 characters.');
      return;
    }
    setError(undefined);
    await onConfirm(reason);
  };

  const isConfirmDisabled = isLoading || (requireReason && reason.trim().length < 5);

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <Dialog.Content className="max-w-md w-full bg-surface border-border p-6 rounded-2xl shadow-xl">
        <Dialog.Header>
          <div className="flex items-center gap-3">
            {isDestructive && (
              <div className="w-9 h-9 rounded-xl bg-surface-raised border border-border flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-foreground" />
              </div>
            )}
            <div>
              <Dialog.Title className="text-xl font-black text-foreground">{title}</Dialog.Title>
              <Dialog.Description className="text-xs text-muted mt-0.5">{description}</Dialog.Description>
            </div>
          </div>
        </Dialog.Header>

        {summary && (
          <div className="my-4 p-3 bg-surface-raised border border-border rounded-xl text-sm font-medium text-foreground">
            {summary}
          </div>
        )}

        {requireReason && (
          <div className="my-4">
            <ReasonField
              value={reason}
              onChange={(val) => {
                setReason(val);
                if (val.trim().length >= 5) setError(undefined);
              }}
              error={error}
              disabled={isLoading}
            />
          </div>
        )}

        <Dialog.Footer className="flex items-center justify-end gap-2 mt-6">
          <Button variant="ghost" onClick={onClose} disabled={isLoading} className="font-bold">
            Cancel
          </Button>
          <Button
            variant={isDestructive ? 'danger' : 'primary'}
            onClick={handleConfirm}
            disabled={isConfirmDisabled}
            isLoading={isLoading}
            className="font-bold"
          >
            {confirmLabel}
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>
  );
}
