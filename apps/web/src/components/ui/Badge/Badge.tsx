import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

export const badgeVariants = cva(
  'inline-flex items-center justify-center font-bold uppercase tracking-wider rounded-full whitespace-nowrap transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-surface-raised text-muted border border-border',
        success: 'bg-success/10 text-success border border-success/30',
        warning: 'bg-warning/10 text-warning border border-warning/30',
        error: 'bg-danger/10 text-danger border border-danger/30',
        silt: 'bg-primary text-primary-foreground border border-border font-black shadow-glow',
        ink: 'bg-surface text-foreground border border-border',
      },
      size: {
        sm: 'px-2 py-0.5 text-[9px]',
        md: 'px-2.5 py-1 text-[10px]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  icon?: LucideIcon;
  ref?: React.Ref<HTMLSpanElement>;
}

export function Badge({
  className,
  variant,
  size,
  icon: Icon,
  children,
  ref,
  ...props
}: BadgeProps) {
  return (
    <span
      ref={ref}
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    >
      {Icon && <Icon className="w-3 h-3 mr-1" />}
      {children}
    </span>
  );
}
