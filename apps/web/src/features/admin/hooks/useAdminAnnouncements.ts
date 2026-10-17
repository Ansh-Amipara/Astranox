import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { notify } from '@/lib/toast';
import { AnnouncementDto, CreateAnnouncementInput } from '@astranox/types';

export const adminAnnouncementKeys = {
  all: ['admin', 'announcements'] as const,
};

export function useAdminAnnouncements() {
  return useQuery<AnnouncementDto[]>({
    queryKey: adminAnnouncementKeys.all,
    queryFn: async () => {
      const { data } = await api.get('/admin/announcements');
      return data.data;
    },
  });
}

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateAnnouncementInput) => {
      const res = await api.post('/admin/announcements', data);
      return res.data.data as AnnouncementDto;
    },
    onSuccess: () => {
      notify.success('Announcement broadcast created');
      queryClient.invalidateQueries({ queryKey: adminAnnouncementKeys.all });
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Failed to create announcement';
      notify.error(message, { id: 'admin-create-announcement-error' });
    },
  });
}

export function useDeleteAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/announcements/${id}`);
    },
    onSuccess: () => {
      notify.success('Announcement removed');
      queryClient.invalidateQueries({ queryKey: adminAnnouncementKeys.all });
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Failed to delete announcement';
      notify.error(message, { id: 'admin-delete-announcement-error' });
    },
  });
}
