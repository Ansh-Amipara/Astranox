import { PrismaClient, TrainerRank } from '@prisma/client';
import crypto from 'crypto';
import {
  BRACKET_ORDER,
  BRACKET_OFFSET,
  TRAINER_RANK_TO_BRACKET,
  BRACKET_POTENTIALS
} from '../config/potentialBracket.config';
import { createPokemonInstance } from '../../../game/instance/PokemonInstance';
import { toActivePokemon } from '../../battles/services/battle-session.service';
import { NotFoundError } from '../../../core/errors/AppError';

const prisma = new PrismaClient();

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

export class PokemonGeneratorService {
  async generateWildPokemon(speciesName: string, level: number, playerRank: TrainerRank) {
    const species = await prisma.species.findUnique({
      where: { name: speciesName.toLowerCase() },
      include: { type1: true, type2: true }
    });

    if (!species) {
      throw new NotFoundError(`Species ${speciesName} not found in database.`);
    }

    // Determine Potential
    const userBracket = TRAINER_RANK_TO_BRACKET[playerRank];
    const userBracketIdx = BRACKET_ORDER.indexOf(userBracket);
    const minBracketIdx = Math.max(0, userBracketIdx - BRACKET_OFFSET);

    const availableBrackets = BRACKET_ORDER.slice(minBracketIdx, userBracketIdx + 1);

    // Dynamic Weighted Probabilities for up to 5 stages (Lowest to Highest)
    // 40%, 30%, 20%, 8%, 2%
    const baseWeights = [40, 30, 20, 8, 2];
    const currentWeights = baseWeights.slice(0, availableBrackets.length);
    const totalWeight = currentWeights.reduce((a, b) => a + b, 0);

    let randomVal = Math.random() * totalWeight;
    let selectedBracket = availableBrackets[0];

    for (let i = 0; i < availableBrackets.length; i++) {
      if (randomVal < currentWeights[i]) {
        selectedBracket = availableBrackets[i];
        break;
      }
      randomVal -= currentWeights[i];
    }

    const potentials = BRACKET_POTENTIALS[selectedBracket];
    const potential = potentials[Math.floor(Math.random() * potentials.length)];

    const ivs = generateWildIVs();

    const types = [species.type1.name];
    if (species.type2) types.push(species.type2.name);

    const wildInstance = createPokemonInstance({
      id: crypto.randomUUID(),
      nickname: species.name,
      level: level,
      potential: potential,
      ivs,
      species: {
        id: species.id,
        name: species.name,
        types,
        baseStats: {
          hp: species.hp,
          attack: species.attack,
          defense: species.defense,
          spAtk: species.spAtk,
          spDef: species.spDef,
          speed: species.speed
        },
        isGmax: species.isGmax
      },
      moves: []
    });

    // Populate moves dynamically from Learnset
    const learnset = await prisma.learnset.findMany({
      where: { speciesId: species.id, level: { lte: level } },
      orderBy: [{ level: 'asc' }, { learnOrder: 'asc' }],
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
    wildInstance.moves = latestMoves.map((m: any, i: number) => ({
      moveId: m.moveId,
      currentSlot: i,
      name: m.move.name,
      type: m.move.type.name
    }));

    const wildActive = toActivePokemon(wildInstance);
    return wildActive;
  }
}
