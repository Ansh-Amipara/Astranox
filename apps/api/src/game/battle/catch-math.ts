import { StatusAilment } from '../battle-state/types';
import {
  CATCH_CONSTANTS,
  getBallBonusMultiplier,
  getStatusBonusMultiplier,
} from '@astranox/constants';

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
  if (ballBonus >= CATCH_CONSTANTS.MASTER_BALL_THRESHOLD) {
    return { caught: true, shakes: CATCH_CONSTANTS.MAX_DISPLAY_SHAKES };
  }

  const statusBonus = getStatusBonusMultiplier(status);

  // Gen V+ base catch formula (a)
  let a = Math.floor(((3 * maxHp - 2 * currentHp) * catchRate * ballBonus) / (3 * maxHp)) * statusBonus;

  if (a >= CATCH_CONSTANTS.MAX_CATCH_RATE) {
    return { caught: true, shakes: CATCH_CONSTANTS.MAX_DISPLAY_SHAKES };
  }

  // Calculate probability threshold (b)
  let b = 0;
  if (a > 0) {
    b = Math.floor(
      CATCH_CONSTANTS.THRESHOLD_DIVIDEND /
        Math.sqrt(Math.sqrt(CATCH_CONSTANTS.THRESHOLD_NUMERATOR / a))
    );
  }

  let shakes = 0;
  for (let i = 0; i < CATCH_CONSTANTS.REQUIRED_SHAKES; i++) {
    // Generate random number between 0 and 65535 inclusive
    const rand =
      rngOverrides && rngOverrides[i] !== undefined
        ? rngOverrides[i]
        : Math.floor(Math.random() * 65536);

    if (rand < b) {
      shakes++;
    } else {
      break;
    }
  }

  return {
    caught: shakes === CATCH_CONSTANTS.REQUIRED_SHAKES,
    shakes: shakes === CATCH_CONSTANTS.REQUIRED_SHAKES ? CATCH_CONSTANTS.MAX_DISPLAY_SHAKES : shakes,
  };
}

export function getBallBonus(itemName: string): number {
  return getBallBonusMultiplier(itemName);
}
