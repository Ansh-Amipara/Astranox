import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

export const buttonVariants = cva(
  'inline-flex items-center justify-center font-bold tracking-tight transition-all duration-200 ease-out rounded-xl active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background touch-manipulation select-none',
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-primary-foreground hover:bg-primary/90 border border-primary/20 shadow-xs hover:shadow-sm',
        secondary:
          'bg-surface text-foreground border border-border hover:bg-surface-raised hover:border-border shadow-xs',
        ghost:
          'bg-transparent text-muted hover:bg-surface-raised hover:text-foreground',
        danger:
          'bg-danger text-danger-foreground border border-danger hover:bg-danger/90 shadow-xs',
        outline:
          'bg-transparent border border-border text-foreground hover:bg-surface-raised hover:border-border shadow-xs',
      },
      size: {
        sm: 'min-h-[44px] min-w-[44px] px-3.5 py-2 text-xs sm:text-sm',
        md: 'min-h-[44px] px-5 py-2.5 text-sm sm:text-base',
        lg: 'min-h-[48px] px-7 py-3 text-base sm:text-lg tracking-normal',
        icon: 'min-h-[44px] min-w-[44px] p-2.5',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  icon?: LucideIcon;
  isLoading?: boolean;
  ref?: React.Ref<HTMLButtonElement>;
}

export function Button({
  className,
  variant,
  size,
  fullWidth,
  icon: Icon,
  isLoading,
  children,
  disabled,
  ref,
  ...props
}: ButtonProps) {
  if (import.meta.env.DEV) {
    if (!children && Icon && !props['aria-label'] && !props['aria-labelledby']) {
      console.warn(
        'Button component: An icon-only button was rendered without an `aria-label`. This is an accessibility violation.'
      );
    }
  }

  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      aria-disabled={disabled || isLoading}
      aria-busy={isLoading}
      className={cn(buttonVariants({ variant, size, fullWidth }), className)}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : Icon ? (
        <Icon className={cn('w-4 h-4', children ? 'mr-2' : '')} />
      ) : null}
      {children}
    </button>
  );
}
