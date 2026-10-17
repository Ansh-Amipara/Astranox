import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { notify } from '@/lib/toast';
import { AuditLogDto } from '@astranox/types';

export const adminAuditKeys = {
  all: ['admin', 'audit-logs'] as const,
  list: (params?: Record<string, unknown>) => [...adminAuditKeys.all, params] as const,
};

export function useAdminAuditLogs(params?: {
  action?: string;
  targetType?: string;
  userId?: string;
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}) {
  return useQuery<{
    logs: AuditLogDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>({
    queryKey: adminAuditKeys.list(params),
    queryFn: async () => {
      const { data } = await api.get('/admin/audit-logs', { params });
      return data.data;
    },
  });
}

export async function exportAuditLogsCsv(params?: {
  action?: string;
  targetType?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
}) {
  try {
    const response = await api.get('/admin/audit-logs', {
      params: { ...params, format: 'csv' },
      responseType: 'blob',
    });

    const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    notify.success('Audit logs CSV exported successfully');
  } catch (error: any) {
    const message = error.response?.data?.error?.message || 'Failed to export CSV';
    notify.error(message, { id: 'admin-export-audit-error' });
  }
}
