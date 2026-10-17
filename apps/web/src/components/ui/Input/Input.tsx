import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

export const inputVariants = cva(
  'w-full rounded-xl border bg-surface px-3.5 py-2.5 text-sm text-foreground placeholder:text-subtle transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      hasError: {
        true: 'border-border focus-visible:ring-border',
        false: 'border-border focus-visible:border-border',
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
