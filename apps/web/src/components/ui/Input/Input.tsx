import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

export const inputVariants = cva(
  'w-full rounded-xl border bg-ink-dark/30 px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-neutral-500 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-silt-gold focus-visible:ring-offset-1 focus-visible:ring-offset-ink-dark disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      hasError: {
        true: 'border-red-500/60 focus-visible:ring-red-500',
        false: 'border-ink-light/20 focus-visible:border-silt-gold/60',
      },
    },
    defaultVariants: {
      hasError: false,
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'>,
    VariantProps<typeof inputVariants> {
  type?: 'text' | 'password' | 'email' | 'search' | 'tel' | 'url';
  numericOnly?: boolean;
  ref?: React.Ref<HTMLInputElement>;
}

export function Input({
  className,
  type = 'text',
  numericOnly = false,
  hasError,
  onChange,
  ref,
  ...props
}: InputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (numericOnly) {
      const sanitized = e.target.value.replace(/\D/g, '');
      e.target.value = sanitized;
    }
    onChange?.(e);
  };

  return (
    <input
      ref={ref}
      type={type}
      onChange={handleChange}
      className={cn(inputVariants({ hasError }), className)}
      {...props}
    />
  );
}
