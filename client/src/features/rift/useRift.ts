import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../shared/api/api';

export function useRiftState() {
  return useQuery({
    queryKey: ['riftState'],
    queryFn: async () => {
      const { data } = await api.get('/rift');
      return data.data; // { state, rank }
    },
  });
}

export function useStartRiftRun() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ rank, difficulty }: { rank: string; difficulty: string }) => {
      const { data } = await api.post('/rift/start', { rank, difficulty });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['riftState'] });
    },
  });
}

export function useGenerateRiftEncounter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/rift/encounter');
      return data.data; // { encounter, battle }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['riftState'] });
      queryClient.invalidateQueries({ queryKey: ['battleSession'] });
    },
  });
}

export function useAbandonRiftRun() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/rift/abandon');
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['riftState'] });
    },
  });
}

export function useCompleteRiftEncounter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/rift/complete');
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['riftState'] });
      queryClient.invalidateQueries({ queryKey: ['trainerSave'] });
    },
  });
}
