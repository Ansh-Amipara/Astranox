import React, { useState, useEffect } from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const [inputValue, setInputValue] = useState(currentPage.toString());

  useEffect(() => {
    setInputValue(currentPage.toString());
  }, [currentPage]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Enforce digit-only input per project rules
    const val = e.target.value.replace(/\D/g, '');
    setInputValue(val);
  };

  const submitPage = () => {
    if (!inputValue) {
      setInputValue(currentPage.toString());
      return;
    }
    
    let newPage = parseInt(inputValue, 10);
    if (isNaN(newPage)) newPage = 1;

    // Handle out of bounds
    if (newPage < 1) newPage = 1;
    if (newPage > totalPages) newPage = totalPages;

    setInputValue(newPage.toString());
    if (newPage !== currentPage) {
      onPageChange(newPage);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      submitPage();
    }
  };

  const isFirst = currentPage <= 1;
  const isLast = currentPage >= totalPages || totalPages === 0;

  return (
    <div className="flex items-center gap-2 select-none justify-center">
      <button
        onClick={() => onPageChange(1)}
        disabled={isFirst}
        className="px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
        title="First Page"
      >
        {'<<'}
      </button>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={isFirst}
        className="px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
        title="Previous Page"
      >
        {'<'}
      </button>

      <div className="flex items-center gap-2 px-2 text-sm font-bold text-slate-600 dark:text-slate-400">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={submitPage}
          onKeyDown={handleKeyDown}
          className="w-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-1 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
        />
        <span>/ {Math.max(1, totalPages)}</span>
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={isLast}
        className="px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
        title="Next Page"
      >
        {'>'}
      </button>
      <button
        onClick={() => onPageChange(totalPages)}
        disabled={isLast}
        className="px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
        title="Last Page"
      >
        {'>>'}
      </button>
    </div>
  );
}
