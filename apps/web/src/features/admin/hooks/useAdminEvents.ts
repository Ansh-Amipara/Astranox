import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { notify } from '@/lib/toast';
import type {
  EventChallengeDto,
  CreateEventInput,
  UpdateEventInput,
  ArchiveEventInput,
} from '@astranox/types';

export const adminEventKeys = {
  all: ['admin', 'events'] as const,
  list: (isArchived?: string) => [...adminEventKeys.all, 'list', isArchived] as const,
};

export function useAdminEvents(isArchived?: 'true' | 'false' | 'all') {
  return useQuery<EventChallengeDto[]>({
    queryKey: adminEventKeys.list(isArchived),
    queryFn: async () => {
      const { data } = await api.get('/admin/events', { params: { isArchived } });
      return data.data;
    },
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateEventInput) => {
      const res = await api.post('/admin/events', data, {
        headers: {
          'Idempotency-Key': crypto.randomUUID(),
        },
      });
      return res.data.data as EventChallengeDto;
    },
    onSuccess: (created) => {
      notify.success(`Created event "${created.name}"!`);
      queryClient.invalidateQueries({ queryKey: adminEventKeys.all });
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Failed to create event';
      notify.error(message, { id: 'admin-create-event-error' });
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateEventInput }) => {
      const res = await api.patch(`/admin/events/${id}`, data);
      return res.data.data as EventChallengeDto;
    },
    onSuccess: (updated) => {
      notify.success(`Updated event "${updated.name}"`);
      queryClient.invalidateQueries({ queryKey: adminEventKeys.all });
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Failed to update event';
      notify.error(message, { id: 'admin-update-event-error' });
    },
  });
}

export function useArchiveEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ArchiveEventInput }) => {
      const res = await api.delete(`/admin/events/${id}`, { data });
      return res.data.data as EventChallengeDto;
    },
    onSuccess: (archived) => {
      notify.success(`Archived event "${archived.name}"`);
      queryClient.invalidateQueries({ queryKey: adminEventKeys.all });
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Failed to archive event';
      notify.error(message, { id: 'admin-archive-event-error' });
    },
  });
}

export function useUnarchiveEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ArchiveEventInput }) => {
      const res = await api.post(`/admin/events/${id}/restore`, data);
      return res.data.data as EventChallengeDto;
    },
    onSuccess: (restored) => {
      notify.success(`Restored event "${restored.name}"`);
      queryClient.invalidateQueries({ queryKey: adminEventKeys.all });
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Failed to restore event';
      notify.error(message, { id: 'admin-restore-event-error' });
    },
  });
}
