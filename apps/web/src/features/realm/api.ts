import { api } from '@/shared/api/api';
import {
  RealmOverviewDto,
  RealmDetailDto,
  RealmSearchResultDto,
} from '@astranox/types';

export const RealmService = {
  listRealms: async (): Promise<RealmOverviewDto[]> => {
    const { data } = await api.get('/realms');
    return data.data;
  },

  getRealmDetail: async (realmId: string): Promise<RealmDetailDto> => {
    const { data } = await api.get(`/realms/${realmId}`);
    return data.data;
  },

  searchRealm: async (realmId: string): Promise<RealmSearchResultDto> => {
    const { data } = await api.post(`/realms/${realmId}/search`);
    return data.data;
  },
};
