import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

export const cardVariants = cva(
  'rounded-2xl border transition-all duration-300',
  {
    variants: {
      variant: {
        default: 'bg-neutral-950 border-neutral-800 text-white shadow-xl',
        glass:
          'bg-black/80 backdrop-blur-xl border-neutral-800/80 shadow-[0_8px_32px_rgba(0,0,0,0.8)] text-white',
        glow:
          'bg-neutral-950 border-neutral-700 shadow-glow-card hover:shadow-glow-card-hover hover:border-neutral-400 text-white',
      },
      padding: {
        none: '',
        sm: 'p-3',
        md: 'p-6',
        lg: 'p-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  ref?: React.Ref<HTMLDivElement>;
}

export function CardRoot({
  className,
  variant,
  padding,
  children,
  onClick,
  onKeyDown,
  ref,
  ...props
}: CardProps) {
  const isInteractive = Boolean(onClick);

  return (
    <div
      ref={ref}
      tabIndex={isInteractive ? 0 : undefined}
      role={isInteractive ? 'button' : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (isInteractive && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick?.(e as unknown as React.MouseEvent<HTMLDivElement>);
        }
        onKeyDown?.(e);
      }}
      className={cn(
        cardVariants({ variant, padding }),
        isInteractive &&
          'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  ref?: React.Ref<HTMLDivElement>;
}

export function CardHeader({ className, children, ref, ...props }: CardHeaderProps) {
  return (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-1.5 pb-4', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  ref?: React.Ref<HTMLDivElement>;
}

export function CardBody({ className, children, ref, ...props }: CardBodyProps) {
  return (
    <div ref={ref} className={cn('flex-1', className)} {...props}>
      {children}
    </div>
  );
}

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  ref?: React.Ref<HTMLDivElement>;
}

export function CardFooter({ className, children, ref, ...props }: CardFooterProps) {
  return (
    <div
      ref={ref}
      className={cn('flex items-center pt-4', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export const Card = Object.assign(CardRoot, {
  Header: CardHeader,
  Body: CardBody,
  Footer: CardFooter,
});
