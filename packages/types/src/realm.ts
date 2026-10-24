import { z } from 'zod';

export const realmSearchSchema = z.object({
  realmId: z.string().trim().min(1, 'Realm ID is required'),
});

export type RealmSearchInput = z.infer<typeof realmSearchSchema>;

export interface RealmSpawnEntry {
  speciesId: number;
  speciesName: string;
  types: string[];
  rank: string;
  weight: number;
  minLevel?: number;
  maxLevel?: number;
  isApex?: boolean;
}

export interface RealmOverviewDto {
  id: string;
  realmId: string;
  name: string;
  description: string;
  themeKey: string;
  types: string[];
  spawnLevelMin: number;
  spawnLevelMax: number;
  speciesCount: number;
  enabled: boolean;
  sortOrder: number;
}

export interface RealmSpeciesPreviewItem {
  speciesId: number;
  speciesName: string;
  types: string[];
  rank: string;
  spriteUrl: string;
  isApex?: boolean;
  isCaught?: boolean;
}

export interface RealmDetailDto extends RealmOverviewDto {
  species: RealmSpeciesPreviewItem[];
  totalSpecies: number;
}

export interface RealmSearchResultDto {
  encounter: {
    speciesId: number;
    speciesName: string;
    level: number;
    types: string[];
    spriteUrl: string;
    isApex: boolean;
    rank: string;
  };
  battleId: string;
  redirectTo: string;
}
