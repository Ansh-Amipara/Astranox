import React, { useId } from 'react';
import { cn } from '@/lib/cn';

export interface FieldProps {
  label?: React.ReactNode;
  htmlFor?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function Field({
  label,
  htmlFor,
  error,
  helperText,
  required = false,
  className,
  children,
}: FieldProps) {
  const generatedId = useId();
  const inputId = htmlFor || generatedId;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

  return (
    <div className={cn('flex flex-col gap-1.5 w-full text-left', className)}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1"
        >
          <span>{label}</span>
          {required && <span className="text-foreground" aria-hidden="true">*</span>}
        </label>
      )}

      {React.isValidElement(children)
        ? React.cloneElement(children as React.ReactElement<any>, {
            id: (children.props as any).id || inputId,
            hasError: !!error || (children.props as any).hasError,
            'aria-invalid': error ? true : undefined,
            'aria-describedby': error ? errorId : helperText ? helperId : undefined,
          })
        : children}

      {error ? (
        <span
          id={errorId}
          role="alert"
          className="text-xs font-semibold text-foreground tracking-tight flex items-center gap-1 mt-0.5"
        >
          • {error}
        </span>
      ) : helperText ? (
        <span id={helperId} className="text-xs text-subtle tracking-tight mt-0.5">
          {helperText}
        </span>
      ) : null}
    </div>
  );
}
