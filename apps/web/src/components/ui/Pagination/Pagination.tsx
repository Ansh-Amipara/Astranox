import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  page,
  totalPages,
  onPageChange,
  className = '',
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(page.toString());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputValue(page.toString());
  }, [page]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSubmit = () => {
    setIsEditing(false);
    const newPage = parseInt(inputValue, 10);
    if (!isNaN(newPage)) {
      if (newPage <= 0) {
        onPageChange(1);
      } else if (newPage > totalPages) {
        onPageChange(totalPages);
      } else {
        onPageChange(newPage);
      }
    } else {
      setInputValue(page.toString());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setInputValue(page.toString());
    }
  };

  if (totalPages <= 1) return null;

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <button
        onClick={() => onPageChange(1)}
        disabled={page === 1}
        className="flex items-center justify-center w-10 h-10 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        title="First Page"
      >
        <ChevronsLeft className="w-5 h-5" />
      </button>
      <button
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="flex items-center justify-center w-10 h-10 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        title="Previous Page"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <div className="flex items-center px-4 h-10 bg-neutral-900 rounded-lg border border-neutral-800">
        <span className="text-sm font-black text-white flex items-center gap-1.5">
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value.replace(/\D/g, ''))}
              onBlur={handleSubmit}
              onKeyDown={handleKeyDown}
              className="w-12 text-center bg-black border border-neutral-700 rounded text-white font-black outline-none focus:ring-1 focus:ring-white py-0.5"
            />
          ) : (
            <span
              className="cursor-pointer hover:text-white transition-colors px-1.5 py-0.5 rounded hover:bg-neutral-800"
              onClick={() => setIsEditing(true)}
              title="Click to jump to page"
            >
              {page}
            </span>
          )}
          <span className="text-neutral-500 font-bold">of</span>
          <span>{totalPages}</span>
        </span>
      </div>

      <button
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="flex items-center justify-center w-10 h-10 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        title="Next Page"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
      <button
        onClick={() => onPageChange(totalPages)}
        disabled={page === totalPages}
        className="flex items-center justify-center w-10 h-10 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        title="Last Page"
      >
        <ChevronsRight className="w-5 h-5" />
      </button>
    </div>
  );
};
