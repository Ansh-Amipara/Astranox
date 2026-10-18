import { CATCH_CONSTANTS, getBallBonusMultiplier, getStatusBonusMultiplier } from '@astranox/constants';
import { BattlePokemon } from './types';

export interface CalculateCaptureParams {
  wild: BattlePokemon;
  ball: string;
  rng: () => number;
}

export interface CaptureResult {
  success: boolean;
  shakes: number;
  shakeChecks: boolean[];
}

/**
 * Calculates whether a wild Pokémon is caught using the Gen V+ formula.
 * Deterministic via injected rng function.
 */
export function calculateCapture(params: CalculateCaptureParams): CaptureResult {
  const { wild, ball, rng } = params;
  const ballBonus = getBallBonusMultiplier(ball);

  // Master Ball guarantees capture
  if (ballBonus >= CATCH_CONSTANTS.MASTER_BALL_THRESHOLD) {
    return {
      success: true,
      shakes: CATCH_CONSTANTS.MAX_DISPLAY_SHAKES,
      shakeChecks: [true, true, true, true],
    };
  }

  const statusBonus = getStatusBonusMultiplier(wild.status);
  const maxHp = Math.max(1, wild.maxHp);
  const currentHp = Math.max(1, wild.currentHp);
  const catchRate = Math.max(1, wild.catchRate || 45);

  // Gen V+ base catch formula (a)
  const hpFactor = Math.floor(((3 * maxHp - 2 * currentHp) * catchRate * ballBonus) / (3 * maxHp));
  const a = Math.floor(hpFactor * statusBonus);

  if (a >= CATCH_CONSTANTS.MAX_CATCH_RATE) {
    return {
      success: true,
      shakes: CATCH_CONSTANTS.MAX_DISPLAY_SHAKES,
      shakeChecks: [true, true, true, true],
    };
  }

  // Calculate probability threshold (b)
  let b = 0;
  if (a > 0) {
    b = Math.floor(
      CATCH_CONSTANTS.THRESHOLD_DIVIDEND /
        Math.sqrt(Math.sqrt(CATCH_CONSTANTS.THRESHOLD_NUMERATOR / a))
    );
  }

  const shakeChecks: boolean[] = [];
  let successfulShakes = 0;

  for (let i = 0; i < CATCH_CONSTANTS.REQUIRED_SHAKES; i++) {
    const rand = Math.floor(rng() * 65536);
    if (rand < b) {
      shakeChecks.push(true);
      successfulShakes++;
    } else {
      shakeChecks.push(false);
      break;
    }
  }

  // Fill remaining checks as false if broken out early
  while (shakeChecks.length < CATCH_CONSTANTS.REQUIRED_SHAKES) {
    shakeChecks.push(false);
  }

  const success = successfulShakes === CATCH_CONSTANTS.REQUIRED_SHAKES;
  const displayShakes = success
    ? CATCH_CONSTANTS.MAX_DISPLAY_SHAKES
    : Math.min(successfulShakes, CATCH_CONSTANTS.MAX_DISPLAY_SHAKES);

  return {
    success,
    shakes: displayShakes,
    shakeChecks,
  };
}
