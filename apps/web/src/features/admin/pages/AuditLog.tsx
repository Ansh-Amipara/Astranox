import { useState } from 'react';
import { useAdminAuditLogs, exportAuditLogsCsv } from '../hooks/useAdminAudit';
import { DataTable, ColumnDef } from '../components/DataTable';
import { AuditLogDto } from '@astranox/types';
import { Download, Filter, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export function AuditLog() {
  const [actionFilter, setActionFilter] = useState('');
  const [targetTypeFilter, setTargetTypeFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const limit = 50;

  const { data, isLoading, isError, refetch } = useAdminAuditLogs({
    action: actionFilter || undefined,
    targetType: targetTypeFilter || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    page,
    limit,
  });

  const logs = data?.logs || [];

  const handleExport = () => {
    exportAuditLogsCsv({
      action: actionFilter || undefined,
      targetType: targetTypeFilter || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });
  };

  const columns: ColumnDef<AuditLogDto>[] = [
    {
      header: 'Timestamp',
      accessorKey: 'createdAt',
      className: 'w-36',
      cell: (log) => (
        <span className="text-xs text-muted font-mono">
          {new Date(log.createdAt).toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Staff Admin',
      accessorKey: 'adminUsername',
      cell: (log) => (
        <span className="text-xs font-bold text-foreground">
          {log.adminUsername || 'System'}
        </span>
      ),
    },
    {
      header: 'Action',
      accessorKey: 'action',
      cell: (log) => (
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-black text-foreground">{log.action}</span>
          <Badge variant="ink" className="text-[9px] py-0 px-1 font-mono uppercase bg-surface-raised">
            {log.entityType}
          </Badge>
        </div>
      ),
    },
    {
      header: 'Reason',
      accessorKey: 'reason',
      cell: (log) => (
        <span className="text-xs text-muted block max-w-sm truncate" title={log.reason || 'N/A'}>
          {log.reason || 'N/A'}
        </span>
      ),
    },
    {
      header: 'Details',
      accessorKey: 'id',
      className: 'text-right',
      cell: (log) => (
        <button
          onClick={() => setExpandedLogId((cur) => (cur === log.id ? null : log.id))}
          className="text-xs font-bold text-muted hover:text-foreground flex items-center gap-1 ml-auto"
        >
          <span>{expandedLogId === log.id ? 'Hide' : 'Inspect'}</span>
          {expandedLogId === log.id ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 bg-surface border border-border rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-black text-foreground tracking-tight">Audit Trail</h1>
            <Badge variant="ink" className="text-[10px] font-black uppercase">
              {data?.total ?? 0} Recorded
            </Badge>
          </div>
          <p className="text-xs text-muted">
            Immutable log of all administrative actions, currency grants, price alterations, and player moderations.
          </p>
        </div>
        <Button
          onClick={handleExport}
          variant="outline"
          className="flex items-center gap-1.5 text-xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV</span>
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-surface border border-border rounded-2xl space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPage(1);
              }}
              placeholder="Filter by action..."
              className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-xl text-xs text-foreground placeholder:text-muted focus:outline-hidden"
            />
          </div>

          <div className="relative">
            <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={targetTypeFilter}
              onChange={(e) => {
                setTargetTypeFilter(e.target.value);
                setPage(1);
              }}
              placeholder="Target (User, Shop, Flag)..."
              className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-xl text-xs text-foreground placeholder:text-muted focus:outline-hidden"
            />
          </div>

          <div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden"
            />
          </div>

          <div>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* Virtualized Data Table */}
      <DataTable
        data={logs}
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        emptyMessage="No audit records match the selected filters."
      />

      {/* Expanded Inspection Drawer / Dialog */}
      {expandedLogId && (
        <div className="p-4 bg-surface-raised border border-border rounded-2xl space-y-2">
          {(() => {
            const currentLog = logs.find((l) => l.id === expandedLogId);
            if (!currentLog) return null;
            return (
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-black text-foreground">
                    Record ID: <span className="font-mono text-muted">{currentLog.id}</span>
                  </span>
                  {currentLog.requestId && (
                    <span className="text-[10px] text-muted font-mono">
                      Request ID: {currentLog.requestId}
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-muted block text-[10px] uppercase font-black">Changes / Values</span>
                  <pre className="p-3 bg-background border border-border rounded-xl text-[11px] font-mono overflow-x-auto text-foreground">
                    {JSON.stringify(currentLog.afterValues || currentLog.beforeValues || {}, null, 2)}
                  </pre>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Pagination Controls */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between p-4 bg-surface border border-border rounded-2xl text-xs">
          <span className="text-muted">
            Page <strong className="text-foreground">{data.page}</strong> of{' '}
            <strong className="text-foreground">{data.totalPages}</strong> ({data.total} records)
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              disabled={data.page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="text-xs"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={data.page >= data.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="text-xs"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
