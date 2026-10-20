import { calculateTowerLevel, calculateTowerIVs } from './difficulty';
import { calculatePokemonCP } from '../instance/cp';
import { getMinPotentialForLevel } from '../instance/PokemonInstance';

export interface TowerEncounterConfig {
  floor: number;
  teamSize: number;
  level: number;
  ivs: number;
  isMiniBoss: boolean;
  isBoss: boolean;
  isMegaBoss: boolean;
  evolutionStage: 'BASIC' | 'MIDDLE' | 'FINAL' | 'ANY';
  allowLegendaryMythical: boolean;
  allowPseudoLegendary: boolean;
  allowParadoxUltraBeast: boolean;
  allowMega: boolean;
  allowGmax: boolean;
  bossMultiplier: number;
  rewardCoins: number;
  rewardXp: number;
}

export function generateTowerConfig(floor: number): TowerEncounterConfig {
  const isMegaBoss = floor % 100 === 0;
  const isBoss = !isMegaBoss && floor % 50 === 0;
  const isMiniBoss = !isBoss && !isMegaBoss && floor % 25 === 0;

  let level = calculateTowerLevel(floor);
  let ivs = calculateTowerIVs(floor);
  let teamSize = Math.min(1 + Math.floor(floor / 20), 6);
  let bossMultiplier = 1;

  if (isMiniBoss) {
    level = Math.min(1000, level + 10);
    ivs = Math.min(31, ivs + 5);
    bossMultiplier = 2;
  } else if (isBoss) {
    teamSize = 6;
    ivs = 31;
    bossMultiplier = 5;
  } else if (isMegaBoss) {
    teamSize = 6;
    ivs = 31;
    bossMultiplier = 10;
  }
  level = Math.min(1000, level);

  let evolutionStage: 'BASIC' | 'MIDDLE' | 'FINAL' | 'ANY' = 'BASIC';
  if (level >= 36 || isBoss || isMegaBoss) {
    evolutionStage = 'FINAL';
  } else if (level >= 16) {
    evolutionStage = 'MIDDLE';
  }

  // Tiered Pool Unlocks
  const allowPseudoLegendary = floor > 100;
  const allowMega = floor > 100;
  
  const allowGmax = floor > 300;
  const allowParadoxUltraBeast = floor > 300;

  // Legendary and Mythical only after floor 500, AND only on 25, 50, 75, 00 floors
  const allowLegendaryMythical = floor > 500 && (isMiniBoss || isBoss || isMegaBoss);

  // Coins: 10 + floor^0.65
  const baseCoins = Math.floor(10 + Math.pow(floor, 0.65));
  const rewardCoins = baseCoins * bossMultiplier;
  const rewardXp = teamSize * (level * 100);

  return {
    floor,
    teamSize,
    level,
    ivs,
    isMiniBoss,
    isBoss,
    isMegaBoss,
    evolutionStage,
    allowLegendaryMythical,
    allowPseudoLegendary,
    allowParadoxUltraBeast,
    allowMega,
    allowGmax,
    bossMultiplier,
    rewardCoins,
    rewardXp
  };
}

export function estimateTowerFloorCP(floor: number): number {
  const config = generateTowerConfig(floor);
  
  // Average base stats
  let avgBaseStat = 75;
  if (config.evolutionStage === 'MIDDLE') avgBaseStat = 85;
  if (config.evolutionStage === 'FINAL') avgBaseStat = 100;
  
  if (config.allowLegendaryMythical) avgBaseStat = 110;
  else if (config.allowParadoxUltraBeast) avgBaseStat = 105;
  else if (config.allowPseudoLegendary) avgBaseStat = 100;

  const baseStats = { 
    hp: avgBaseStat, 
    attack: avgBaseStat, 
    defense: avgBaseStat, 
    spAtk: avgBaseStat, 
    spDef: avgBaseStat, 
    speed: avgBaseStat 
  };
  
  const ivs = { 
    hp: config.ivs, 
    attack: config.ivs, 
    defense: config.ivs, 
    spAtk: config.ivs, 
    spDef: config.ivs, 
    speed: config.ivs 
  };

  const singleCp = calculatePokemonCP(
    baseStats, 
    ivs, 
    config.level, 
    getMinPotentialForLevel(config.level, config.isBoss || config.isMegaBoss ? 'EX' : 'F'),
    config.allowMega || config.allowGmax // Pass a boolean if cp depends on isGmax/isMega
  );
  
  return singleCp * config.teamSize;
}
