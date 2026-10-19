import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface AdminSpeciesDto {
  id: number;
  name: string;
  spriteUrl: string | null;
  rank: string; // 'EX' | 'SSS' | 'SS' | 'S' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F'
  pokedexNumber?: number | null;
  category?: string;
}

export interface AdminItemDto {
  id: string;
  name: string;
  category: string;
  cost: number;
  description: string;
  spriteUrl?: string | null;
}

export function useAdminSpecies() {
  return useQuery<AdminSpeciesDto[]>({
    queryKey: ['adminSpecies'],
    queryFn: async () => {
      const res = await api.get('/admin/species');
      return res.data?.data || [];
    },
    staleTime: 1000 * 60 * 30, // 30 minutes cache
  });
}

export function useAdminItems() {
  return useQuery<AdminItemDto[]>({
    queryKey: ['adminItems'],
    queryFn: async () => {
      const res = await api.get('/admin/items');
      return res.data?.data || [];
    },
    staleTime: 1000 * 60 * 30, // 30 minutes cache
  });
}
