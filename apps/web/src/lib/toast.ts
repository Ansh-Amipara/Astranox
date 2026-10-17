import { toast } from 'sonner';
import type { ReactNode } from 'react';

export interface ToastOptions {
  id?: string | number;
  duration?: number;
  description?: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const notify = {
  success: (message: string, options?: ToastOptions) => {
    return toast.success(message, {
      id: options?.id,
      duration: options?.duration ?? 4000,
      description: options?.description,
      action: options?.action,
    });
  },

  error: (message: string, options?: ToastOptions) => {
    return toast.error(message, {
      id: options?.id,
      duration: options?.duration ?? 5000,
      description: options?.description,
      action: options?.action,
    });
  },

  info: (message: string, options?: ToastOptions) => {
    return toast.info(message, {
      id: options?.id,
      duration: options?.duration ?? 4000,
      description: options?.description,
      action: options?.action,
    });
  },

  warning: (message: string, options?: ToastOptions) => {
    return toast.warning(message, {
      id: options?.id,
      duration: options?.duration ?? 4500,
      description: options?.description,
      action: options?.action,
    });
  },

  promise: <T>(
    promise: Promise<T>,
    data: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: unknown) => string);
    }
  ) => {
    return toast.promise(promise, data);
  },

  dismiss: (id?: string | number) => {
    toast.dismiss(id);
  },
};
