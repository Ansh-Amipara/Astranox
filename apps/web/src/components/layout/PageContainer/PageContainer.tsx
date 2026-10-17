import React from 'react';
import { cn } from '@/lib/cn';

export interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl' | 'full';
  noPadding?: boolean;
}

export function PageContainer({
  className,
  maxWidth = '7xl',
  noPadding = false,
  children,
  ...props
}: PageContainerProps) {
  const maxWidthClass = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    '2xl': 'max-w-screen-2xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full',
  }[maxWidth];

  return (
    <div
      className={cn(
        'w-full mx-auto',
        maxWidthClass,
        !noPadding && 'px-4 sm:px-6 lg:px-8 py-6',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
