import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  className = '',
  variant = 'primary',
  size = 'md',
  icon: Icon,
  isLoading,
  children,
  disabled,
  ...props
}, ref) => {
  if (import.meta.env.DEV) {
    if (!children && Icon && !props['aria-label'] && !props['aria-labelledby']) {
      console.warn('Button component: An icon-only button was rendered without an `aria-label`. This is an accessibility violation.');
    }
  }

  const baseStyles = "inline-flex items-center justify-center font-bold transition-all duration-300 rounded-xl active:scale-95 disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-silt-gold focus-visible:ring-offset-2 focus-visible:ring-offset-ink-dark";
  
  const variants = {
    primary: "bg-silt-gold text-ink-dark hover:bg-silt-peach shadow-[0_0_15px_rgba(204,162,90,0.4)] hover:shadow-[0_0_25px_rgba(255,177,110,0.6)]",
    secondary: "bg-ink-light/20 text-ink-light border border-ink-light/30 hover:bg-ink-light/30 hover:border-silt-pale hover:text-silt-pale backdrop-blur-md",
    danger: "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/40 hover:text-red-200",
    ghost: "bg-transparent text-ink-light hover:bg-ink-light/10 hover:text-silt-pale",
    outline: "bg-transparent border-2 border-silt-khaki text-silt-khaki hover:bg-silt-khaki hover:text-ink-dark"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-8 py-3 text-base tracking-wide"
  };

  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      aria-disabled={disabled || isLoading}
      aria-busy={isLoading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : Icon && (
        <Icon className={`w-4 h-4 ${children ? 'mr-2' : ''}`} />
      )}
      {children}
    </button>
  );
});

Button.displayName = 'Button';
