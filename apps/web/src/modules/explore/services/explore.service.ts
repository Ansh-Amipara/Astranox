import { api } from '@/shared/api/api';

export interface ExploreResponse {
  type: 'POKEMON' | 'COINS' | 'NOTHING';
  message?: string;
  amount?: number;
  encounter?: any;
  battleSessionId?: string;
}

export const ExploreService = {
  explore: async (location: string): Promise<ExploreResponse> => {
    const { data } = await api.post('/explore', { location });
    return data.data;
  }
};
