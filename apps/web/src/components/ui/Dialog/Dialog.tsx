import React from 'react';
import * as RadixDialog from '@radix-ui/react-dialog';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';

export const DialogRoot = RadixDialog.Root;
export const DialogTrigger = RadixDialog.Trigger;
export const DialogPortal = RadixDialog.Portal;
export const DialogClose = RadixDialog.Close;

export interface DialogOverlayProps
  extends React.ComponentPropsWithoutRef<typeof RadixDialog.Overlay> {
  ref?: React.Ref<React.ElementRef<typeof RadixDialog.Overlay>>;
}

export function DialogOverlay({ className, ref, ...props }: DialogOverlayProps) {
  return (
    <RadixDialog.Overlay
      ref={ref}
      className={cn(
        'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        className
      )}
      {...props}
    />
  );
}

export interface DialogContentProps
  extends React.ComponentPropsWithoutRef<typeof RadixDialog.Content> {
  ref?: React.Ref<React.ElementRef<typeof RadixDialog.Content>>;
}

export function DialogContent({
  className,
  children,
  ref,
  ...props
}: DialogContentProps) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <RadixDialog.Content
        ref={ref}
        className={cn(
          'fixed z-50 bg-surface border border-border text-foreground shadow-2xl flex flex-col focus:outline-none overflow-hidden',
          // Mobile: bottom sheet (slides up, 90dvh max height, safe area padding)
          'bottom-0 left-0 right-0 w-full rounded-t-3xl rounded-b-none border-b-0 max-h-[90dvh] pb-safe',
          'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom duration-300 ease-out',
          // Desktop (md+): centered dialog
          'md:bottom-auto md:top-[50%] md:left-[50%] md:translate-x-[-50%] md:translate-y-[-50%] md:w-full md:max-w-lg md:rounded-3xl md:border-b md:max-h-[85dvh]',
          'md:data-[state=closed]:slide-out-to-bottom-0 md:data-[state=open]:slide-in-from-bottom-0 md:data-[state=open]:zoom-in-95 md:data-[state=closed]:zoom-out-95',
          className
        )}
        {...props}
      >
        <div className="md:hidden mx-auto my-2.5 h-1.5 w-12 rounded-full bg-border shrink-0" aria-hidden="true" />
        {children}
      </RadixDialog.Content>
    </DialogPortal>
  );
}

export function DialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'px-6 py-4 border-b border-border flex justify-between items-center shrink-0',
        className
      )}
      {...props}
    />
  );
}

export function DialogFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'px-6 py-4 border-t border-border flex items-center justify-end gap-2 shrink-0',
        className
      )}
      {...props}
    />
  );
}

export interface DialogTitleProps
  extends React.ComponentPropsWithoutRef<typeof RadixDialog.Title> {
  ref?: React.Ref<React.ElementRef<typeof RadixDialog.Title>>;
}

export function DialogTitle({ className, ref, ...props }: DialogTitleProps) {
  return (
    <RadixDialog.Title
      ref={ref}
      className={cn('text-xl font-black text-foreground', className)}
      {...props}
    />
  );
}

export interface DialogDescriptionProps
  extends React.ComponentPropsWithoutRef<typeof RadixDialog.Description> {
  ref?: React.Ref<React.ElementRef<typeof RadixDialog.Description>>;
}

export function DialogDescription({
  className,
  ref,
  ...props
}: DialogDescriptionProps) {
  return (
    <RadixDialog.Description
      ref={ref}
      className={cn('text-sm text-muted', className)}
      {...props}
    />
  );
}

// Convenient unified modal wrapper matching existing app modal conventions
export interface ModalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  hideHeader?: boolean;
}

export function DialogConvenience({
  isOpen,
  onClose,
  title,
  description,
  children,
  className = 'max-w-4xl',
  hideHeader = false,
}: ModalDialogProps) {
  return (
    <DialogRoot open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogPortal>
        <DialogOverlay />
        <RadixDialog.Content
          className={cn(
            'fixed z-50 bg-surface border border-border text-foreground shadow-2xl flex flex-col overflow-hidden',
            // Mobile (<md): bottom sheet
            'bottom-0 left-0 right-0 w-full rounded-t-3xl rounded-b-none border-b-0 max-h-[90dvh] pb-safe',
            'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom duration-300 ease-out',
            // Desktop (md+): centered dialog
            'md:bottom-auto md:top-[50%] md:left-[50%] md:translate-x-[-50%] md:translate-y-[-50%] md:w-full md:rounded-3xl md:border-b md:max-h-[85dvh]',
            'md:data-[state=closed]:slide-out-to-bottom-0 md:data-[state=open]:slide-in-from-bottom-0 md:data-[state=open]:zoom-in-95 md:data-[state=closed]:zoom-out-95',
            className
          )}
          aria-describedby="dialog-description"
        >
          <div className="md:hidden mx-auto my-2.5 h-1.5 w-12 rounded-full bg-border shrink-0" aria-hidden="true" />
          <VisuallyHidden.Root>
            <RadixDialog.Title>{title ? String(title) : 'Dialog Modal'}</RadixDialog.Title>
            <RadixDialog.Description id="dialog-description">
              {description ? String(description) : 'A dialog window containing interactive content.'}
            </RadixDialog.Description>
          </VisuallyHidden.Root>

          {!hideHeader && title && (
            <div className="px-6 py-4 border-b border-border flex justify-between items-center shrink-0">
              <h2 className="text-xl font-black text-foreground">
                {title}
              </h2>
              <DialogClose asChild>
                <button
                  type="button"
                  aria-label="Close dialog"
                  className="p-2 hover:bg-surface-raised rounded-full transition-colors text-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-border"
                >
                  <X className="w-6 h-6" />
                </button>
              </DialogClose>
            </div>
          )}
          {children}
        </RadixDialog.Content>
      </DialogPortal>
    </DialogRoot>
  );
}

export const Dialog = Object.assign(DialogConvenience, {
  Root: DialogRoot,
  Trigger: DialogTrigger,
  Portal: DialogPortal,
  Overlay: DialogOverlay,
  Content: DialogContent,
  Header: DialogHeader,
  Footer: DialogFooter,
  Title: DialogTitle,
  Description: DialogDescription,
  Close: DialogClose,
});
