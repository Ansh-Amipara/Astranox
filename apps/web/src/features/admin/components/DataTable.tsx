import React, { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ArrowUpDown, ArrowUp, ArrowDown, AlertCircle, Inbox } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';

export interface Column<T> {
  key?: string;
  accessorKey?: string;
  header: React.ReactNode;
  cell: (item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  className?: string;
}

export type ColumnDef<T> = Column<T>;

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor?: (item: T) => string;
  isLoading?: boolean;
  isError?: boolean;
  error?: string | null | boolean;
  onRetry?: () => void;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (key: string) => void;
  renderMobileCard?: (item: T) => React.ReactNode;
  emptyMessage?: string;
  estimateRowHeight?: number;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor = (item: any) => item.id || item.key || String(Math.random()),
  isLoading = false,
  isError = false,
  error = null,
  onRetry,
  sortKey,
  sortDirection,
  onSort,
  renderMobileCard,
  emptyMessage = 'No records found.',
  estimateRowHeight = 56,
}: DataTableProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  // Virtualizer for long lists (> 50 rows)
  const isVirtualized = data.length > 50;
  const rowVirtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateRowHeight,
    overscan: 10,
    enabled: isVirtualized,
  });

  if (isLoading) {
    return (
      <div className="bg-surface border border-border rounded-2xl p-12 flex flex-col items-center justify-center gap-3">
        <Spinner size="lg" />
        <span className="text-xs font-bold text-muted">Loading records...</span>
      </div>
    );
  }

  if (error || isError) {
    return (
      <div className="bg-surface border border-border rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-2">
        <AlertCircle className="w-8 h-8 text-danger" />
        <h4 className="text-sm font-black text-foreground">Failed to load data</h4>
        <p className="text-xs text-muted max-w-sm">
          {typeof error === 'string' ? error : 'An error occurred while loading records.'}
        </p>
        {onRetry && (
          <button
            onClick={() => onRetry()}
            className="mt-2 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition-opacity"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-2xl p-12 flex flex-col items-center justify-center text-center gap-2">
        <Inbox className="w-8 h-8 text-muted" />
        <span className="text-sm font-bold text-muted">{emptyMessage}</span>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Mobile Card Layout (visible on mobile if renderMobileCard provided) */}
      {renderMobileCard && (
        <div className="block md:hidden space-y-3">
          {data.map((item) => (
            <div key={keyExtractor(item)}>{renderMobileCard(item)}</div>
          ))}
        </div>
      )}

      {/* Desktop Table Layout (hidden on mobile if mobile card provided) */}
      <div
        className={`${renderMobileCard ? 'hidden md:block' : 'block'} bg-surface border border-border rounded-2xl overflow-hidden shadow-sm`}
      >
        <div
          ref={parentRef}
          className="overflow-x-auto max-h-[700px] overflow-y-auto relative custom-scrollbar"
        >
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 bg-surface border-b border-border">
              <tr>
                {columns.map((col, idx) => {
                  const colKey = col.key || col.accessorKey || String(idx);
                  return (
                    <th
                      key={colKey}
                      scope="col"
                      style={{ width: col.width }}
                      className={`px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider select-none ${col.className || ''}`}
                    >
                      {col.sortable && onSort ? (
                        <button
                          onClick={() => onSort(colKey)}
                          className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors group font-bold"
                        >
                          <span>{col.header}</span>
                          {sortKey === colKey ? (
                            sortDirection === 'asc' ? (
                              <ArrowUp className="w-3.5 h-3.5 text-foreground" />
                            ) : (
                              <ArrowDown className="w-3.5 h-3.5 text-foreground" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3.5 h-3.5 text-muted opacity-50 group-hover:opacity-100" />
                          )}
                        </button>
                      ) : (
                        <span>{col.header}</span>
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>

            {isVirtualized ? (
              <tbody
                style={{
                  height: `${rowVirtualizer.getTotalSize()}px`,
                  position: 'relative',
                }}
              >
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                  const item = data[virtualRow.index];
                  return (
                    <tr
                      key={keyExtractor(item)}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: `${virtualRow.size}px`,
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                      className="border-b border-border/50 hover:bg-surface-raised transition-colors flex items-center"
                    >
                      {columns.map((col) => (
                        <td
                          key={col.key}
                          style={{ width: col.width }}
                          className={`px-4 py-2.5 text-xs font-medium text-foreground ${col.className || ''}`}
                        >
                          {col.cell(item)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            ) : (
              <tbody className="divide-y divide-border/50">
                {data.map((item) => (
                  <tr
                    key={keyExtractor(item)}
                    className="hover:bg-surface-raised transition-colors"
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        style={{ width: col.width }}
                        className={`px-4 py-3 text-xs font-medium text-foreground ${col.className || ''}`}
                      >
                        {col.cell(item)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
