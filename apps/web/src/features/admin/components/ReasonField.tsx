import React from 'react';

interface ReasonFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  label?: string;
  helperText?: string;
  placeholder?: string;
  minLength?: number;
  disabled?: boolean;
}

export function ReasonField({
  value,
  onChange,
  error,
  label = 'Audit Reason',
  helperText,
  placeholder = 'Explain the rationale for this change (required for audit logs)...',
  minLength = 5,
  disabled = false,
}: ReasonFieldProps) {
  const currentLength = value.trim().length;
  const isSatisfied = currentLength >= minLength;

  return (
    <div className="space-y-1.5 w-full">
      <div className="flex items-center justify-between text-xs font-bold">
        <label className="text-foreground">
          {label} <span className="text-muted">*</span>
          {helperText && <span className="text-[10px] text-muted font-normal block">{helperText}</span>}
        </label>
        <span className={`text-[11px] ${isSatisfied ? 'text-subtle' : 'text-muted font-semibold'}`}>
          {currentLength}/{minLength} min chars
        </span>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        rows={3}
        className="w-full bg-surface-raised border border-border rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 transition-colors resize-none"
      />
      {error && <p className="text-xs font-medium text-danger">{error}</p>}
    </div>
  );
}
