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
  allowLegendary: boolean;
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
    level = Math.min(5000, level + 10);
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

  let evolutionStage: 'BASIC' | 'MIDDLE' | 'FINAL' | 'ANY' = 'BASIC';
  if (floor > 60 || isBoss || isMegaBoss) {
    evolutionStage = 'FINAL';
  } else if (floor > 35) {
    evolutionStage = 'FINAL';
  } else if (floor > 15) {
    evolutionStage = 'MIDDLE';
  }

  const allowLegendary = isBoss || isMegaBoss;

  // Coins: 10 + floor^0.65
  const baseCoins = Math.floor(10 + Math.pow(floor, 0.65));
  const rewardCoins = baseCoins * bossMultiplier;
  const rewardXp = rewardCoins * 25; // 25 XP per coin

  return {
    floor,
    teamSize,
    level,
    ivs,
    isMiniBoss,
    isBoss,
    isMegaBoss,
    evolutionStage,
    allowLegendary,
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
  if (config.allowLegendary) avgBaseStat = 110;

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
    getMinPotentialForLevel(config.level, config.isBoss || config.isMegaBoss ? 'DIAMOND' : 'SILVER')
  );
  
  return singleCp * config.teamSize;
}
