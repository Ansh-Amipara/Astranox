import { z } from 'zod';

export const realmBalanceSchema = z.object({
  WIN_CURRENCY_MULTIPLIER: z.number().min(0).max(1000).describe('Currency awarded on winning a wild battle: species level * multiplier'),
  CAPTURE_CURRENCY_REWARD: z.number().min(0).max(10000).describe('Astral coins awarded directly on a successful capture'),
  CAPTURE_XP_RATIO: z.number().min(0.0).max(5.0).describe('XP multiplier granted on capture relative to victory XP'),
  DEFEAT_CURRENCY_PENALTY_RATIO: z.number().min(0.0).max(1.0).describe('Ratio of Astral Coins deducted when player party faints'),
  DEFEAT_CURRENCY_PENALTY_CAP: z.number().min(0).max(1000000).describe('Maximum cap of Astral Coins lost upon DEFEATED'),
  ABANDONED_BATTLE_TTL_SECONDS: z.number().min(60).max(86400).describe('Abandoned battle TTL in seconds before expiration'),
  SEARCH_COOLDOWN_MS: z.number().min(0).max(5000).describe('Minimum cooldown between searches in milliseconds'),
});

export type RealmBalanceConfig = z.infer<typeof realmBalanceSchema>;

export const REALM_CONSTANTS = {
  WIN_CURRENCY_MULTIPLIER: 10,
  CAPTURE_CURRENCY_REWARD: 25,
  CAPTURE_XP_RATIO: 1.0,
  DEFEAT_CURRENCY_PENALTY_RATIO: 0.10,
  DEFEAT_CURRENCY_PENALTY_CAP: 1000,
  ABANDONED_BATTLE_TTL_SECONDS: 900,
  SEARCH_COOLDOWN_MS: 500,
} as const;

// Backward-compatibility alias for battle services checking balance config
export const EXPLORATION_CONSTANTS = REALM_CONSTANTS;
export const explorationBalanceSchema = realmBalanceSchema;
export type ExplorationBalanceConfig = RealmBalanceConfig;

export const REALM_RANK_SPAWN_WEIGHTS: Record<string, number> = {
  F: 1000,
  E: 800,
  D: 600,
  C: 450,
  B: 300,
  A: 180,
  S: 70,
  SS: 25,
  SSS: 8,
  EX: 2,
};

export const APEX_GUARDIAN_WEIGHT = 15;

export interface RealmDefinitionConfig {
  realmId: string;
  name: string;
  description: string;
  themeKey: string;
  types: string[];
  spawnLevelMin: number;
  spawnLevelMax: number;
  sortOrder: number;
}

export const CANON_REALMS: RealmDefinitionConfig[] = [
  {
    realmId: 'volcano',
    name: 'Volcano Realm',
    description: 'Scorched volcanic peaks and magma caverns teeming with Fire, Ground, and Rock species.',
    themeKey: 'volcano',
    types: ['fire', 'ground', 'rock'],
    spawnLevelMin: 5,
    spawnLevelMax: 35,
    sortOrder: 1,
  },
  {
    realmId: 'ocean',
    name: 'Ocean Realm',
    description: 'Luminous coastal reefs and abyssal glacial depths inhabited by Water and Ice species.',
    themeKey: 'ocean',
    types: ['water', 'ice'],
    spawnLevelMin: 5,
    spawnLevelMax: 35,
    sortOrder: 2,
  },
  {
    realmId: 'storm-peaks',
    name: 'Storm Peaks',
    description: 'Tempestuous mountain summits and thunderous skies ruled by Electric, Flying, and Dragon species.',
    themeKey: 'storm-peaks',
    types: ['electric', 'flying', 'dragon'],
    spawnLevelMin: 5,
    spawnLevelMax: 35,
    sortOrder: 3,
  },
  {
    realmId: 'forest',
    name: 'Forest Realm',
    description: 'Verdant primordial canopies and sunlit clearings bustling with Grass, Bug, and Normal species.',
    themeKey: 'forest',
    types: ['grass', 'bug', 'normal'],
    spawnLevelMin: 5,
    spawnLevelMax: 35,
    sortOrder: 4,
  },
  {
    realmId: 'shadow-hollow',
    name: 'Shadow Hollow',
    description: 'Cursed spectral ruins and toxic miasma caverns harboring Ghost, Dark, and Poison species.',
    themeKey: 'shadow-hollow',
    types: ['ghost', 'dark', 'poison'],
    spawnLevelMin: 5,
    spawnLevelMax: 35,
    sortOrder: 5,
  },
  {
    realmId: 'mind-temple',
    name: 'Mind Temple',
    description: 'Astral crystalline shrines and enchanted sanctums radiating with Psychic and Fairy species.',
    themeKey: 'mind-temple',
    types: ['psychic', 'fairy'],
    spawnLevelMin: 5,
    spawnLevelMax: 35,
    sortOrder: 6,
  },
  {
    realmId: 'iron-dojo',
    name: 'Iron Dojo',
    description: 'Ancient martial training halls and metallic bulwarks dominated by Fighting and Steel species.',
    themeKey: 'iron-dojo',
    types: ['fighting', 'steel'],
    spawnLevelMin: 5,
    spawnLevelMax: 35,
    sortOrder: 7,
  },
];
