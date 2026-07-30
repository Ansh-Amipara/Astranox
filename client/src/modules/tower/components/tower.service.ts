import { api } from '@/shared/api/api';

export interface TowerState {
  id: string;
  currentFloor: number;
  highestFloor: number;
  infinityCoins: number;
  currentEncounterId: string | null;
}

export interface TowerEncounter {
  id: string;
  floor: number;
  status: 'ACTIVE' | 'CLEARED' | 'FAILED';
  enemyTeam: unknown[];
  reward: unknown;
}

export const towerService = {
  getState: async () => {
    const { data } = await api.get<{ success: boolean; data: { state: TowerState; activeEncounter: TowerEncounter | null; playerCp?: number; floorCp?: number } }>('/tower');
    return data.data;
  },

  startFloor: async () => {
    const { data } = await api.post<{ success: boolean; data: TowerEncounter }>('/tower/floor/start');
    return data.data;
  },

  startBattle: async (playerActivePokemonId?: string) => {
    const { data } = await api.post<{ success: boolean; data: unknown }>('/tower/battle/start', { playerActivePokemonId });
    return data.data;
  },

  completeBattle: async (result: 'WON' | 'LOST') => {
    const { data } = await api.post<{ success: boolean; data: unknown }>('/tower/battle/complete', { result });
    return data.data;
  },

  skipFloors: async () => {
    const { data } = await api.post<{ success: boolean; data: unknown }>('/tower/skip');
    return data.data;
  }
};
