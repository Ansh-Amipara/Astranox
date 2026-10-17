import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

export const badgeVariants = cva(
  'inline-flex items-center justify-center font-bold uppercase tracking-wider rounded-full whitespace-nowrap transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-neutral-800 text-neutral-300 border border-neutral-700',
        success: 'bg-neutral-800 text-white border border-neutral-600',
        warning: 'bg-neutral-800 text-neutral-200 border border-neutral-600',
        error: 'bg-neutral-900 text-neutral-300 border border-neutral-700',
        silt: 'bg-white text-black border border-white font-black shadow-[0_0_10px_rgba(255,255,255,0.2)]',
        ink: 'bg-black text-white border border-neutral-800',
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
