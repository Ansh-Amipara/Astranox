import { BATTLE_CONSTANTS } from '@astranox/constants';
import { BattlePokemon, MoveData, PokemonType } from './types';

export const TYPE_CHART: Record<PokemonType, Partial<Record<PokemonType, number>>> = {
  normal: { rock: 0.5, ghost: 0, steel: 0.5 },
  fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  grass: { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
  electric: { water: 2, grass: 0.5, electric: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  ice: { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
  poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
  ground: { fire: 2, grass: 0.5, electric: 2, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
  flying: { grass: 2, electric: 0.5, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug: { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
  rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon: { dragon: 2, steel: 0.5, fairy: 0 },
  dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
  fairy: { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 },
};

export function getTypeEffectiveness(moveType: PokemonType, defenderTypes: PokemonType[]): number {
  let multiplier = 1;
  const attackingTypeMap = TYPE_CHART[moveType] || {};
  for (const defType of defenderTypes) {
    if (defType in attackingTypeMap) {
      multiplier *= attackingTypeMap[defType]!;
    }
  }
  return multiplier;
}

export interface DamageResult {
  damage: number;
  isCritical: boolean;
  effectiveness: number;
  isStab: boolean;
  hit: boolean;
}

export function calculateDamage(
  attacker: BattlePokemon,
  defender: BattlePokemon,
  move: MoveData,
  rng: () => number,
  balanceConfig: typeof BATTLE_CONSTANTS = BATTLE_CONSTANTS
): DamageResult {
  // 1. Accuracy Check
  if (move.accuracy && move.accuracy < 100) {
    const accuracyRoll = rng() * 100;
    if (accuracyRoll >= move.accuracy) {
      return { damage: 0, isCritical: false, effectiveness: 1, isStab: false, hit: false };
    }
  }

  // 2. Type Effectiveness
  const effectiveness = getTypeEffectiveness(move.type, defender.types);
  if (effectiveness === 0) {
    return { damage: 0, isCritical: false, effectiveness: 0, isStab: false, hit: true };
  }

  // 3. Stats based on move damage class
  const isPhysical = move.damageClass === 'physical';
  let attackStat = isPhysical ? attacker.attack : attacker.spAtk;
  let defenseStat = isPhysical ? defender.defense : defender.spDef;

  // Burn halves physical attack power unless ability prevents it
  if (isPhysical && attacker.status === 'burn') {
    attackStat = Math.floor(attackStat / 2);
  }

  // Guard against division by 0
  if (defenseStat <= 0) defenseStat = 1;
  if (attackStat <= 0) attackStat = 1;

  // 4. Critical Hit Roll (approx 1/24 in Gen 7+)
  const critChance = 1 / 24;
  const isCritical = rng() < critChance;

  // 5. STAB Check
  const isStab = attacker.types.includes(move.type);

  // 6. Gen 5+ Intermediate Integer Truncation formula:
  // step1 = floor( (2 * Level) / 5 ) + 2
  // step2 = floor( step1 * Power * A / D )
  // baseDamage = floor( step2 / 50 ) + 2
  const levelMult = Math.floor((2 * attacker.level) / 5) + balanceConfig.LEVEL_SCALING_OFFSET;
  const statMult = Math.floor(levelMult * move.power * (attackStat / defenseStat));
  let currentDamage = Math.floor(statMult / balanceConfig.BASE_DAMAGE_DIVISOR) + balanceConfig.BASE_DAMAGE_OFFSET;

  if (isCritical) {
    currentDamage = Math.floor(currentDamage * balanceConfig.CRITICAL_HIT_MULTIPLIER);
  }

  // Random factor between 0.85 and 1.00 (85 to 100 / 100)
  const randomFactor = (85 + Math.floor(rng() * 16)) / 100;
  currentDamage = Math.floor(currentDamage * randomFactor);

  if (isStab) {
    currentDamage = Math.floor(currentDamage * balanceConfig.STAB_MULTIPLIER);
  }

  currentDamage = Math.floor(currentDamage * effectiveness);

  // Minimum 1 damage if effectiveness > 0
  if (currentDamage < 1 && effectiveness > 0) {
    currentDamage = 1;
  }

  return {
    damage: currentDamage,
    isCritical,
    effectiveness,
    isStab,
    hit: true,
  };
}
