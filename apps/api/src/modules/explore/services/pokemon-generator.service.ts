import { injectable } from 'tsyringe';
import { PokemonPotential } from '@prisma/client';
import crypto from 'crypto';
import { createPokemonInstance } from '../../../game/instance/PokemonInstance';
import { toActivePokemon } from '../../battles/services/battle-session.service';
import { NotFoundError } from '../../../core/errors/AppError';
import { prisma } from '../../../core/db/prisma';
import { CacheService } from '../../../core/services/cache.service';

function generateWildIVs() {
  return {
    hp: Math.floor(Math.random() * 32),
    attack: Math.floor(Math.random() * 32),
    defense: Math.floor(Math.random() * 32),
    spAtk: Math.floor(Math.random() * 32),
    spDef: Math.floor(Math.random() * 32),
    speed: Math.floor(Math.random() * 32),
  };
}

const POTENTIAL_DISTRIBUTION = [
  { p: PokemonPotential.F, weight: 35 },
  { p: PokemonPotential.E, weight: 15 },
  { p: PokemonPotential.D, weight: 12 },
  { p: PokemonPotential.C, weight: 10 },
  { p: PokemonPotential.B, weight: 8 },
  { p: PokemonPotential.A, weight: 5 },
  { p: PokemonPotential.S_MINUS, weight: 4 },
  { p: PokemonPotential.S, weight: 3 },
  { p: PokemonPotential.S_PLUS, weight: 2 },
  { p: PokemonPotential.SS_MINUS, weight: 1.5 },
  { p: PokemonPotential.SS, weight: 1.5 },
  { p: PokemonPotential.SS_PLUS, weight: 1.0 },
  { p: PokemonPotential.SSS_MINUS, weight: 0.8 },
  { p: PokemonPotential.SSS, weight: 0.7 },
  { p: PokemonPotential.SSS_PLUS, weight: 0.5 }
];

function generateRandomPotential(): PokemonPotential {
  const totalWeight = POTENTIAL_DISTRIBUTION.reduce((a, b) => a + b.weight, 0); // Should be exactly 100
  let randomVal = Math.random() * totalWeight;

  for (const entry of POTENTIAL_DISTRIBUTION) {
    if (randomVal < entry.weight) {
      return entry.p;
    }
    randomVal -= entry.weight;
  }
  return PokemonPotential.F; // Fallback
}

@injectable()
export class PokemonGeneratorService {
  constructor(private cache: CacheService) {}

  async generateWildPokemon(speciesName: string, level: number) {
    const formattedSpeciesName = speciesName.toLowerCase().replace(/-/g, ' ');
    const speciesKey = `species:${formattedSpeciesName}`;
    let species = await this.cache.getOrSet(speciesKey, () =>
      prisma.species.findUnique({
        where: { name: formattedSpeciesName },
        include: { type1: true, type2: true }
      })
    );

    if (!species && formattedSpeciesName.includes(' ')) {
      const baseName = formattedSpeciesName.split(' ')[0];
      const baseKey = `species:${baseName}`;
      species = await this.cache.getOrSet(baseKey, () =>
        prisma.species.findUnique({
          where: { name: baseName },
          include: { type1: true, type2: true }
        })
      );
    }

    if (!species) {
      throw new NotFoundError(`Species ${speciesName} not found in database.`);
    }

    const potential = generateRandomPotential();
    const ivs = generateWildIVs();

    const types = [species.type1.name];
    if (species.type2) types.push(species.type2.name);

    const learnset = await prisma.pokemonLearnset.findMany({
      where: { speciesId: species.id, unlockLevel: { lte: level } },
      orderBy: { unlockLevel: 'asc' },
      include: { move: { include: { type: true } } }
    });

    const uniqueMoves: any[] = [];
    const seen = new Set();
    for (let i = learnset.length - 1; i >= 0; i--) {
      if (!seen.has(learnset[i].moveId)) {
        seen.add(learnset[i].moveId);
        uniqueMoves.unshift(learnset[i]);
      }
    }

    const latestMoves = uniqueMoves.slice(-4);
    const generatedMoves = latestMoves.map((m: any, i: number) => ({
      moveId: m.moveId,
      currentSlot: i,
      name: m.move.name,
      type: m.move.type.name
    }));

    const { getXpForLevel } = require('../../../game/battle/level-math');
    
    const wildInstance = createPokemonInstance({
      id: crypto.randomUUID(),
      nickname: species.name,
      level: level,
      potential: potential,
      currentXp: getXpForLevel(level),
      ivs,
      species: {
        id: species.id,
        name: species.name,
        types,
        baseStats: species,
      },
      moves: generatedMoves
    });

    return toActivePokemon(wildInstance);
  }
}
