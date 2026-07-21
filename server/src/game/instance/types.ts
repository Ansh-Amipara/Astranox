/**
 * Pure Domain Types for the Astranox Battle Engine.
 * These types are completely decoupled from Prisma/Database concepts.
 */

/**
 * Static base data representing a Pokémon species.
 * Provided by the seed data.
 */
export interface SpeciesContext {
  id: number;
  name: string;
  types: string[]; // e.g. ["dragon", "ground"]
  baseStats: {
    hp: number;
    attack: number;
    defense: number;
    spAtk: number;
    spDef: number;
    speed: number;
  };
  catchRate?: number;
  baseExp?: number;
}


import { PokemonMove } from '../battle-state/types';

/**
 * Raw data payload required to hydrate a PokemonInstance.
 */
export interface PokemonInstancePayload {
  id: string; // e.g. UUID from the database
  nickname: string | null;
  level: number;
  potential: string;
  currentXp?: number;
  ivs: {
    hp: number;
    attack: number;
    defense: number;
    spAtk: number;
    spDef: number;
    speed: number;
  };
  species: SpeciesContext;
  
  // Future Expansion:
  moves: PokemonMove[];
  // ability: string;
}

/**
 * The fully hydrated combat entity.
 * Contains both static data and dynamically calculated current-state properties.
 */
export interface PokemonInstance {
  id: string;
  name: string;
  level: number;
  potential: string;
  currentXp: number;
  types: string[];
  cp: number;
  
  // Combat Stats
  maxHp: number;
  currentHp: number;
  stats: {
    attack: number;
    defense: number;
    spAtk: number;
    spDef: number;
    speed: number;
  };
  
  // Internal State
  ivs: {
    hp: number;
    attack: number;
    defense: number;
    spAtk: number;
    spDef: number;
    speed: number;
  };
  species: SpeciesContext;
  moves: PokemonMove[];
}
