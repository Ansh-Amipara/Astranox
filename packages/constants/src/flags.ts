export interface FeatureFlagDefinition {
  key: string;
  name: string;
  description: string;
  defaultValue: boolean;
}

export const FEATURE_FLAGS: FeatureFlagDefinition[] = [
  {
    key: 'shop',
    name: 'Pokémart Shop',
    description: 'Enables players to purchase items and moves from the Pokémart.',
    defaultValue: true,
  },
  {
    key: 'battles',
    name: 'Wild & Trainer Battles',
    description: 'Enables turn-based battle encounters and rewards.',
    defaultValue: true,
  },
  {
    key: 'realms',
    name: 'Wilderness Realms',
    description: 'Enables wild Pokémon encounters and exploration across elemental Realms.',
    defaultValue: true,
  },
  {
    key: 'trading',
    name: 'Player Trading & Marketplace',
    description: 'Allows player-to-player trade requests and market listings.',
    defaultValue: true,
  },
  {
    key: 'newRegistrations',
    name: 'New Registrations',
    description: 'Allows new players to register accounts.',
    defaultValue: true,
  },
  {
    key: 'maintenanceMode',
    name: 'Maintenance Mode',
    description: 'Locks non-admin players out of game actions for scheduled maintenance.',
    defaultValue: false,
  },
];
