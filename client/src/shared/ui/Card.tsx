import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'glow';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(({
  className = '',
  variant = 'default',
  padding = 'md',
  children,
  ...props
}, ref) => {
  
  const baseStyles = "rounded-2xl border transition-all duration-300";
  
  const variants = {
    default: "bg-ink-dark/80 border-ink-light/20 shadow-xl",
    glass: "bg-ink-dark/40 backdrop-blur-xl border-ink-light/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)]",
    glow: "bg-ink-dark/90 border-silt-gold/30 shadow-[0_0_20px_rgba(204,162,90,0.15)] hover:shadow-[0_0_30px_rgba(204,162,90,0.25)] hover:border-silt-gold/60"
  };

  const paddings = {
    none: "",
    sm: "p-3",
    md: "p-6",
    lg: "p-8"
  };

  const isInteractive = !!props.onClick;

  return (
    <div
      ref={ref}
      tabIndex={isInteractive ? 0 : undefined}
      role={isInteractive ? 'button' : undefined}
      onKeyDown={(e) => {
        if (isInteractive && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          props.onClick?.(e as unknown as React.MouseEvent<HTMLDivElement>);
        }
        props.onKeyDown?.(e);
      }}
      className={`${baseStyles} ${isInteractive ? 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-silt-gold focus-visible:ring-offset-2 focus-visible:ring-offset-ink-dark' : ''} ${variants[variant]} ${paddings[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';
