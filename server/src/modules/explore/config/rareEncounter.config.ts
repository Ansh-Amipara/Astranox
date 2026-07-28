import { PSEUDO_LEGENDARY_POKEMON } from './rare/pseudo.pool';
import { ULTRA_BEAST_POKEMON } from './rare/ultraBeast.pool';
import { PARADOX_POKEMON } from './rare/paradox.pool';
import { MYTHICAL_POKEMON } from './rare/mythical.pool';
import { LEGENDARY_POKEMON } from './rare/legendary.pool';
import { SUPER_LEGENDARY_POKEMON } from './rare/superLegendary.pool';

export type RarePoolType = 
  | 'PSEUDO_LEGENDARY'
  | 'ULTRA_BEAST'
  | 'PARADOX'
  | 'MYTHICAL'
  | 'LEGENDARY'
  | 'SUPER_LEGENDARY';

export const RARE_POOLS: Record<RarePoolType, string[]> = {
  PSEUDO_LEGENDARY: PSEUDO_LEGENDARY_POKEMON,
  ULTRA_BEAST: ULTRA_BEAST_POKEMON,
  PARADOX: PARADOX_POKEMON,
  MYTHICAL: MYTHICAL_POKEMON,
  LEGENDARY: LEGENDARY_POKEMON,
  SUPER_LEGENDARY: SUPER_LEGENDARY_POKEMON
};

export const RARE_ENCOUNTER_RATES: Array<{ type: RarePoolType, chance: number }> = [
  { type: 'SUPER_LEGENDARY', chance: 0.00001 },  // 0.001%
  { type: 'LEGENDARY', chance: 0.00019 },        // 0.019%
  { type: 'MYTHICAL', chance: 0.0003 },          // 0.03%
  { type: 'PARADOX', chance: 0.0007 },           // 0.07%
  { type: 'ULTRA_BEAST', chance: 0.0008 },       // 0.08%
  { type: 'PSEUDO_LEGENDARY', chance: 0.003 }    // 0.30%
];
