import React from 'react';
import { clsx } from 'clsx';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'rectangular' | 'circular' | 'text' | 'card';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'rectangular',
  width,
  height,
  className,
  style,
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'circular':
        return 'rounded-full aspect-square';
      case 'text':
        return 'rounded h-4 w-full';
      case 'card':
        return 'rounded-xl h-36 w-full';
      case 'rectangular':
      default:
        return 'rounded-lg';
    }
  };

  const inlineStyles: React.CSSProperties = {
    ...style,
    ...(width !== undefined ? { width } : {}),
    ...(height !== undefined ? { height } : {}),
  };

  return (
    <div
      className={clsx(
        'bg-surface-raised animate-pulse border border-border/40',
        getVariantStyles(),
        className
      )}
      style={inlineStyles}
      aria-hidden="true"
      {...props}
    />
  );
};
