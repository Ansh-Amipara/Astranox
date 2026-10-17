import React from 'react';

interface DateRangeFieldProps {
  startDate: string | null;
  endDate: string | null;
  onChange?: (startDate: string | null, endDate: string | null) => void;
  onStartDateChange?: (date: string | null) => void;
  onEndDateChange?: (date: string | null) => void;
  label?: string;
  helperText?: string;
  disabled?: boolean;
}

export function DateRangeField({
  startDate,
  endDate,
  onChange,
  onStartDateChange,
  onEndDateChange,
  label,
  helperText,
  disabled = false,
}: DateRangeFieldProps) {
  const handleStart = (val: string | null) => {
    if (onStartDateChange) onStartDateChange(val);
    if (onChange) onChange(val, endDate);
  };

  const handleEnd = (val: string | null) => {
    if (onEndDateChange) onEndDateChange(val);
    if (onChange) onChange(startDate, val);
  };

  const isInvalidRange =
    startDate && endDate ? new Date(endDate).getTime() <= new Date(startDate).getTime() : false;

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-foreground">{label}</label>
          {helperText && <span className="text-[10px] text-muted">{helperText}</span>}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-bold text-foreground">Sale Starts At</label>
          <input
            type="datetime-local"
            value={startDate ? startDate.slice(0, 16) : ''}
            onChange={(e) => handleStart(e.target.value ? new Date(e.target.value).toISOString() : null)}
            disabled={disabled}
            className="w-full bg-surface-raised border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-foreground disabled:opacity-50"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-foreground">Sale Ends At</label>
          <input
            type="datetime-local"
            value={endDate ? endDate.slice(0, 16) : ''}
            onChange={(e) => handleEnd(e.target.value ? new Date(e.target.value).toISOString() : null)}
            disabled={disabled}
            className="w-full bg-surface-raised border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-foreground disabled:opacity-50"
          />
        </div>
      </div>

      {isInvalidRange && (
        <p className="text-xs font-bold text-danger">Sale end time must be after start time.</p>
      )}
    </div>
  );
}
