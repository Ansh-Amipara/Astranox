import * as Dialog from '@radix-ui/react-dialog';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { X } from 'lucide-react';
import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  hideHeader?: boolean;
}

export function Modal({ 
  isOpen, 
  onClose, 
  title, 
  description, 
  children, 
  className = 'max-w-4xl', 
  hideHeader = false 
}: ModalProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <Dialog.Content 
          className={`fixed z-50 left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-[95vw] sm:w-full rounded-3xl bg-white dark:bg-slate-900 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden ${className}`}
          aria-describedby="modal-description"
        >
          <VisuallyHidden.Root>
            <Dialog.Title>{title || 'Dialog Modal'}</Dialog.Title>
            <Dialog.Description id="modal-description">
              {description || 'A dialog window containing interactive content.'}
            </Dialog.Description>
          </VisuallyHidden.Root>

          {!hideHeader && title && (
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                {title}
              </h2>
              <Dialog.Close asChild>
                <button aria-label="Close dialog" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <X className="w-6 h-6" />
                </button>
              </Dialog.Close>
            </div>
          )}
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
