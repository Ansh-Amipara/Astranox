import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

export const inputVariants = cva(
  'w-full min-h-[44px] rounded-xl border bg-surface px-4 py-2.5 text-base sm:text-sm text-foreground placeholder:text-subtle shadow-xs transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 touch-manipulation',
  {
    variants: {
      hasError: {
        true: 'border-danger focus-visible:ring-danger',
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
      inputMode={numericOnly ? (props.inputMode || 'numeric') : props.inputMode}
      onChange={handleChange}
      className={cn(inputVariants({ hasError }), className)}
      {...props}
    />
  );
}
