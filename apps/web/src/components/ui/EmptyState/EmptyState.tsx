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
        'flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-dashed border-border/80 bg-surface/50 w-full max-w-lg mx-auto',
        className
      )}
      {...props}
    >
      <div className="w-14 h-14 rounded-full bg-surface-raised border border-border flex items-center justify-center mb-4 text-muted">
        {icon || <Inbox className="w-7 h-7" />}
      </div>
      <h3 className="text-base font-bold text-foreground mb-1">{title}</h3>
      {description && <p className="text-sm text-muted max-w-sm mb-6 leading-relaxed">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
};
