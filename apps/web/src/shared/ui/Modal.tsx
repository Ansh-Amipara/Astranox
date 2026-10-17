import { Dialog, type ModalDialogProps } from '@/components/ui/Dialog';

/**
 * @deprecated Import `Dialog` from `@/components/ui` or `@/components/ui/Dialog` instead of `Modal` from `@/shared/ui/Modal`.
 */
export type ModalProps = ModalDialogProps;
export const Modal = Dialog;
