import React from 'react';
import { LucideIcon } from 'lucide-react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'silt' | 'ink';
  size?: 'sm' | 'md';
  icon?: LucideIcon;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(({
  className = '',
  variant = 'default',
  size = 'md',
  icon: Icon,
  children,
  ...props
}, ref) => {
  
  const baseStyles = "inline-flex items-center justify-center font-bold uppercase tracking-wider rounded-full whitespace-nowrap transition-colors";
  
  const variants = {
    default: "bg-ink-light/20 text-ink-light border border-ink-light/30",
    success: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
    warning: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
    error: "bg-red-500/20 text-red-400 border border-red-500/30",
    silt: "bg-silt-gold/20 text-silt-gold border border-silt-gold/30 shadow-[0_0_10px_rgba(204,162,90,0.2)]",
    ink: "bg-ink-dark text-ink-paper border border-ink-light/20"
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[9px]",
    md: "px-2.5 py-1 text-[10px]"
  };

  return (
    <span
      ref={ref}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-3 h-3 mr-1" />}
      {children}
    </span>
  );
});

Badge.displayName = 'Badge';
