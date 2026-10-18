import React, { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Skeleton, EmptyState, ErrorState } from '@/components/ui';

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
      <div className="bg-surface border border-border rounded-2xl p-6 space-y-3">
        <div className="flex justify-between items-center pb-3 border-b border-border">
          <Skeleton width={120} height={20} />
          <Skeleton width={80} height={20} />
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b border-border/40">
            <Skeleton width="30%" height={16} />
            <Skeleton width="20%" height={16} />
            <Skeleton width="15%" height={16} />
            <Skeleton width="10%" height={24} className="rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (error || isError) {
    return (
      <div className="p-4">
        <ErrorState
          title="Failed to Load Data"
          message={typeof error === 'string' ? error : 'An error occurred while loading administrative records.'}
          onRetry={onRetry}
        />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="p-4">
        <EmptyState
          title="No Records Found"
          description={emptyMessage}
        />
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
