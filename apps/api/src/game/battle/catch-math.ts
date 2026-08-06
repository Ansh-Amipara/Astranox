import { StatusAilment } from '../battle-state/types';

export interface CatchParams {
  maxHp: number;
  currentHp: number;
  catchRate: number; // Species base catch rate (1-255)
  ballBonus: number;
  status: StatusAilment;
}

export interface CatchResult {
  caught: boolean;
  shakes: number; // 0, 1, 2, or 3 visual shakes before breaking out, or 3 for caught
}

/**
 * Calculates whether a wild Pokemon is caught using the Gen V+ formula.
 * @param params The stats and status of the Pokemon, plus ball used.
 * @param rngOverrides Optional array of 4 numbers [0, 65535] for testing deterministic outcomes.
 */
export function calculateCatchResult(params: CatchParams, rngOverrides?: number[]): CatchResult {
  const { maxHp, currentHp, catchRate, ballBonus, status } = params;

  // Master Ball is a guaranteed catch bypass
  if (ballBonus >= 255) {
    return { caught: true, shakes: 3 };
  }

  let statusBonus = 1;
  if (status === 'sleep' || status === 'freeze') {
    statusBonus = 2.5;
  } else if (status === 'paralysis' || status === 'poison' || status === 'burn') {
    statusBonus = 1.5;
  }

  // Gen V+ base catch formula (a)
  let a = Math.floor( ( (3 * maxHp - 2 * currentHp) * catchRate * ballBonus ) / (3 * maxHp) ) * statusBonus;
  
  if (a >= 255) {
    return { caught: true, shakes: 3 };
  }

  // Calculate probability threshold (b)
  let b = 0;
  if (a > 0) {
    b = Math.floor(1048560 / Math.sqrt(Math.sqrt(16711680 / a)));
  }

  let shakes = 0;
  for (let i = 0; i < 4; i++) {
    // Generate random number between 0 and 65535 inclusive
    const rand = rngOverrides && rngOverrides[i] !== undefined 
      ? rngOverrides[i] 
      : Math.floor(Math.random() * 65536);
    
    if (rand < b) {
      shakes++;
    } else {
      break;
    }
  }

  return {
    caught: shakes === 4,
    shakes: shakes === 4 ? 3 : shakes // 3 visual shakes means caught, otherwise it broke out after 'shakes' wobbles
  };
}

export function getBallBonus(itemName: string): number {
  switch (itemName.toLowerCase()) {
    case 'poke-ball': return 1;
    case 'great-ball': return 1.5;
    case 'ultra-ball': return 2;
    case 'luxury-ball': return 1;
    case 'master-ball': return 255;
    default: return 1;
  }
}
