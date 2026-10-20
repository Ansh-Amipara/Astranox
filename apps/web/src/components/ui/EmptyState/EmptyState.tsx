import React from 'react';
import { clsx } from 'clsx';
import { Inbox } from 'lucide-react';

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className,
  ...props
}) => {
  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-3xl border border-dashed border-border bg-surface shadow-xs w-full max-w-lg mx-auto',
        className
      )}
      {...props}
    >
      <div className="w-16 h-16 rounded-2xl bg-surface-raised border border-border flex items-center justify-center mb-4 text-muted shadow-xs">
        {icon || <Inbox className="w-8 h-8" />}
      </div>
      <h3 className="text-lg font-black text-foreground mb-1.5 tracking-tight">{title}</h3>
      {description && <p className="text-sm text-muted max-w-sm mb-6 leading-relaxed">{description}</p>}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
};
