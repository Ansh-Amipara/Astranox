import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode | React.ComponentType<{ className?: string }>;
  subtitle?: string;
  description?: string;
  trend?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  icon,
  subtitle,
  description,
  trend,
  className = '',
}: StatCardProps) {
  const detailText = description || subtitle;

  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) return icon;
    const IconComponent = icon as React.ComponentType<{ className?: string }>;
    return <IconComponent className="w-4 h-4" />;
  };

  return (
    <div
      className={`bg-surface border border-border rounded-2xl p-4 sm:p-5 shadow-xs transition-all hover:border-foreground/30 flex flex-col justify-between ${className}`}
    >
      <div className="flex items-center justify-between gap-3 mb-2">
        <span className="text-xs font-bold text-muted uppercase tracking-wider">{title}</span>
        {icon && (
          <div className="w-8 h-8 rounded-xl bg-surface-raised border border-border flex items-center justify-center shrink-0 text-foreground">
            {renderIcon()}
          </div>
        )}
      </div>

      <div className="space-y-1">
        <div className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        {(detailText || trend) && (
          <div className="flex items-center gap-2 text-xs text-muted font-medium">
            {trend && <span className="font-bold text-foreground">{trend}</span>}
            {detailText && <span>{detailText}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
