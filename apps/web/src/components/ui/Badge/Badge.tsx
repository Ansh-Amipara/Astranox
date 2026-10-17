import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

export const badgeVariants = cva(
  'inline-flex items-center justify-center font-bold uppercase tracking-wider rounded-full whitespace-nowrap transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-ink-light/20 text-ink-light border border-ink-light/30',
        success: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
        warning: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
        error: 'bg-red-500/20 text-red-400 border border-red-500/30',
        silt: 'bg-silt-gold/20 text-silt-gold border border-silt-gold/30 shadow-[0_0_10px_rgba(204,162,90,0.2)]',
        ink: 'bg-ink-dark text-ink-paper border border-ink-light/20',
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
