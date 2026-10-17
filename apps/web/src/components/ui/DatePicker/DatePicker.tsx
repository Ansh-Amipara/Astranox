import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

export interface DatePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  placeholder?: string;
  name?: string;
  required?: boolean;
}

export function DatePicker({
  value: initialValue,
  onChange,
  className = '',
  placeholder = 'dd/mm/yyyy',
  name,
  required,
}: DatePickerProps) {
  const [value, setValue] = useState(initialValue || '');
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(
    initialValue ? new Date(initialValue) : new Date()
  );

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setValue(initialValue || '');
    if (initialValue) {
      setCurrentMonth(new Date(initialValue));
    }
  }, [initialValue]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDateSelect = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const str = `${y}-${m}-${d}`;
    setValue(str);
    if (onChange) onChange(str);
    setIsOpen(false);
  };

  const formattedValue = value
    ? (() => {
        const d = new Date(value);
        return isNaN(d.getTime())
          ? ''
          : `${String(d.getDate()).padStart(2, '0')}/${String(
              d.getMonth() + 1
            ).padStart(2, '0')}/${d.getFullYear()}`;
      })()
    : '';

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days: (Date | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {name && (
        <input type="hidden" name={name} value={value} required={required} />
      )}
      <div
        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white flex justify-between items-center cursor-pointer min-h-[42px]"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>
          {formattedValue || (
            <span className="text-slate-400">{placeholder}</span>
          )}
        </span>
        <Calendar className="w-4 h-4 text-slate-500" />
      </div>

      {isOpen && (
        <div className="absolute z-[100] mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl p-4 w-64">
          <div className="flex justify-between items-center mb-4">
            <button
              type="button"
              onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-400"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-sm text-slate-900 dark:text-white">
              {currentMonth.toLocaleString('default', {
                month: 'long',
                year: 'numeric',
              })}
            </span>
            <button
              type="button"
              onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-400"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2 text-slate-500 font-bold">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 text-sm">
            {days.map((date, i) => {
              if (!date) return <div key={`empty-${i}`} />;
              const isSelected =
                value && new Date(value).toDateString() === date.toDateString();
              const isToday = new Date().toDateString() === date.toDateString();
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleDateSelect(date)}
                  className={`p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                    isSelected
                      ? 'bg-purple-600 hover:bg-purple-700 text-white font-bold'
                      : isToday
                      ? 'text-purple-600 dark:text-purple-400 font-bold'
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
