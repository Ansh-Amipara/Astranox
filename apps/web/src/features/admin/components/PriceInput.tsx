import React from 'react';
import { SHOP_LIMITS } from '@astranox/constants';
import { AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';

interface PriceInputProps {
  value: number;
  onChange: (val: number) => void;
  currentPrice?: number;
  referencePrice?: number;
  defaultPrice?: number;
  currency?: 'astralCoins' | 'infinityCoins';
  label?: string;
  helperText?: string;
  disabled?: boolean;
}

export function PriceInput({
  value,
  onChange,
  currentPrice,
  referencePrice,
  defaultPrice,
  currency = 'astralCoins',
  label,
  helperText,
  disabled = false,
}: PriceInputProps) {
  const baseReference = referencePrice ?? currentPrice ?? 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value.replace(/\D/g, '');
    const num = digitsOnly === '' ? 0 : parseInt(digitsOnly, 10);
    const clamped = Math.max(SHOP_LIMITS.MIN_PRICE, Math.min(num, SHOP_LIMITS.MAX_PRICE));
    onChange(clamped);
  };

  const percentVsCurrent = baseReference > 0 ? ((value - baseReference) / baseReference) * 100 : 0;
  const percentVsDefault = defaultPrice && defaultPrice > 0 ? ((value - defaultPrice) / defaultPrice) * 100 : 0;
  const isExtremeChange = Math.abs(percentVsCurrent) > SHOP_LIMITS.EXTREME_PRICE_CHANGE_PERCENT;

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-foreground">{label}</label>
          {helperText && <span className="text-[10px] text-muted">{helperText}</span>}
        </div>
      )}
      <div className="relative flex items-center">
        <input
          type="text"
          value={value === 0 ? '' : value.toString()}
          onChange={handleChange}
          placeholder="0"
          disabled={disabled}
          className="w-full bg-surface-raised border border-border rounded-xl pl-3 pr-12 py-2 text-sm font-bold text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 transition-colors"
        />
        <span className="absolute right-3 text-xs font-bold text-muted pointer-events-none uppercase">
          {currency === 'infinityCoins' ? 'Inf' : 'Ast'}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        {value !== currentPrice && (
          <span className="inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-md bg-surface-raised border border-border text-foreground">
            {percentVsCurrent > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {percentVsCurrent > 0 ? `+${percentVsCurrent.toFixed(1)}%` : `${percentVsCurrent.toFixed(1)}%`} vs current
          </span>
        )}

        {defaultPrice !== undefined && value !== defaultPrice && (
          <span className="text-[11px] text-muted font-medium">
            (Default: {defaultPrice.toLocaleString()} | {percentVsDefault > 0 ? `+${percentVsDefault.toFixed(1)}%` : `${percentVsDefault.toFixed(1)}%`})
          </span>
        )}
      </div>

      {isExtremeChange && (
        <div className="flex items-center gap-1.5 text-xs font-bold text-muted p-2 rounded-lg bg-surface border border-border">
          <AlertTriangle className="w-4 h-4 shrink-0 text-foreground" />
          <span>Warning: Price change exceeds 50% threshold. Confirmation required.</span>
        </div>
      )}
    </div>
  );
}
