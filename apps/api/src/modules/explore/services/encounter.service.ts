import { injectable } from 'tsyringe';
import { randomUUID } from 'crypto';
import { BattleEngineState, BattlePokemon, MoveData, PokemonType } from '@astranox/battle-engine';
import { calculateHpFormula, calculateStatFormula } from '@astranox/constants';
import { CacheService } from '../../../core/services/cache.service';
import { BalanceService } from '../../balance/balance.service';
import { prisma } from '../../../core/db/prisma';
import { NotFoundError } from '../../../core/errors/AppError';

export interface PublicPokemonDto {
  id: string;
  speciesId: number;
  speciesName: string;
  level: number;
  types: PokemonType[];
  maxHp: number;
  currentHp: number;
  status: string;
  moves?: MoveData[];
}

export interface PublicBattleStateDto {
  battleId: string;
  turnNumber: number;
  playerActive: PublicPokemonDto;
  playerParty: PublicPokemonDto[];
  wildPokemon: PublicPokemonDto;
  outcome: string | null;
}

@injectable()
export class EncounterService {
  constructor(
    private cache: CacheService,
    private balanceService: BalanceService
  ) {}

  private getBattleKey(battleId: string): string {
    return `battle:${battleId}`;
  }

  private getActiveBattleKey(userId: string): string {
    return `active_battle:${userId}`;
  }

  /**
   * Generates a wild encounter, creates a Redis BattleEngineState, and returns public view.
   */
  async startWildEncounter(
    userId: string,
    trainerSave: any,
    speciesId: number,
    level: number
  ): Promise<{ battleId: string; wildPokemon: PublicPokemonDto; playerParty: PublicPokemonDto[]; state: PublicBattleStateDto }> {
    const battleId = `wb_${randomUUID().replace(/-/g, '')}`;

    // 1. Fetch species data
    const species = await prisma.species.findUnique({
      where: { id: speciesId },
      include: {
        type1: true,
        type2: true,
      },
    });

    if (!species) {
      throw new NotFoundError(`Species ${speciesId} not found in database.`);
    }

    const speciesTypes: PokemonType[] = [species.type1.name.toLowerCase() as PokemonType];
    if (species.type2) {
      speciesTypes.push(species.type2.name.toLowerCase() as PokemonType);
    }

    // Generate wild IVs
    const ivHp = Math.floor(Math.random() * 32);
    const ivAttack = Math.floor(Math.random() * 32);
    const ivDefense = Math.floor(Math.random() * 32);
    const ivSpAtk = Math.floor(Math.random() * 32);
    const ivSpDef = Math.floor(Math.random() * 32);
    const ivSpeed = Math.floor(Math.random() * 32);

    const wildMaxHp = calculateHpFormula(species.hp, ivHp, level);
    const wildAttack = calculateStatFormula(species.attack, ivAttack, level);
    const wildDefense = calculateStatFormula(species.defense, ivDefense, level);
    const wildSpAtk = calculateStatFormula(species.spAtk, ivSpAtk, level);
    const wildSpDef = calculateStatFormula(species.spDef, ivSpDef, level);
    const wildSpeed = calculateStatFormula(species.speed, ivSpeed, level);

    const learnset = await prisma.pokemonLearnset.findMany({
      where: { speciesId: species.id, unlockLevel: { lte: level } },
      orderBy: { unlockLevel: 'desc' },
      include: { move: { include: { type: true } } },
      take: 4,
    });

    const wildMoves: MoveData[] =
      learnset.length > 0
        ? learnset.map((item) => ({
            id: item.move.id,
            name: item.move.name,
            power: item.move.power || 40,
            accuracy: 100,
            type: item.move.type.name.toLowerCase() as PokemonType,
            damageClass: (item.move.damageClass as any) || 'physical',
          }))
        : [
            {
              id: 33,
              name: 'Tackle',
              power: 40,
              accuracy: 100,
              type: 'normal',
              damageClass: 'physical',
            },
          ];

    const wildPokemon: BattlePokemon = {
      id: `wild_${randomUUID().slice(0, 8)}`,
      speciesId: species.id,
      speciesName: species.name,
      level,
      types: speciesTypes,
      maxHp: wildMaxHp,
      currentHp: wildMaxHp,
      attack: wildAttack,
      defense: wildDefense,
      spAtk: wildSpAtk,
      spDef: wildSpDef,
      speed: wildSpeed,
      status: 'none',
      moves: wildMoves,
      catchRate: species.catchRate || 45,
      baseExp: species.baseExp || 64,
    };

    // 2. Map Player Party
    const dbParty = (trainerSave.party as any[]) || [];
    const playerParty: BattlePokemon[] = [];

    for (const p of dbParty) {
      const pSpecies = await prisma.species.findUnique({
        where: { id: p.speciesId },
        include: {
          type1: true,
          type2: true,
        },
      });

      if (!pSpecies) continue;

      const pTypes: PokemonType[] = [pSpecies.type1.name.toLowerCase() as PokemonType];
      if (pSpecies.type2) {
        pTypes.push(pSpecies.type2.name.toLowerCase() as PokemonType);
      }

      const pMaxHp = calculateHpFormula(pSpecies.hp, p.ivHp ?? 15, p.level ?? 5);
      const pAttack = calculateStatFormula(pSpecies.attack, p.ivAttack ?? 15, p.level ?? 5);
      const pDefense = calculateStatFormula(pSpecies.defense, p.ivDefense ?? 15, p.level ?? 5);
      const pSpAtk = calculateStatFormula(pSpecies.spAtk, p.ivSpAtk ?? 15, p.level ?? 5);
      const pSpDef = calculateStatFormula(pSpecies.spDef, p.ivSpDef ?? 15, p.level ?? 5);
      const pSpeed = calculateStatFormula(pSpecies.speed, p.ivSpeed ?? 15, p.level ?? 5);

      const pLearnset = await prisma.pokemonLearnset.findMany({
        where: { speciesId: p.speciesId, unlockLevel: { lte: p.level ?? 5 } },
        orderBy: { unlockLevel: 'desc' },
        include: { move: { include: { type: true } } },
        take: 4,
      });

      const pMoves: MoveData[] =
        pLearnset.length > 0
          ? pLearnset.map((item) => ({
              id: item.move.id,
              name: item.move.name,
              power: item.move.power || 40,
              accuracy: 100,
              type: item.move.type.name.toLowerCase() as PokemonType,
              damageClass: (item.move.damageClass as any) || 'physical',
            }))
          : [
              {
                id: 33,
                name: 'Tackle',
                power: 40,
                accuracy: 100,
                type: 'normal',
                damageClass: 'physical',
              },
            ];

      playerParty.push({
        id: p.id,
        speciesId: p.speciesId,
        speciesName: pSpecies.name,
        level: p.level ?? 5,
        types: pTypes,
        maxHp: pMaxHp,
        currentHp: p.currentHp !== undefined ? Math.min(pMaxHp, p.currentHp) : pMaxHp,
        attack: pAttack,
        defense: pDefense,
        spAtk: pSpAtk,
        spDef: pSpDef,
        speed: pSpeed,
        status: p.status || 'none',
        moves: pMoves,
        catchRate: 45,
      });
    }

    // Active Pokémon is the first conscious party member
    const playerActive = playerParty.find((p) => p.currentHp > 0) || playerParty[0];

    // Seeded PRNG seed
    const seed = Math.floor(Math.random() * 2147483647);
    const explorationConfig = await this.balanceService.get('exploration');
    const activeBalanceRecord = await prisma.balanceConfig.findFirst({
      where: { section: 'battle', status: 'active' },
      orderBy: { version: 'desc' },
      select: { version: true },
    });
    const balanceVersion = activeBalanceRecord?.version || 1;

    const engineState: BattleEngineState = {
      battleId,
      turnNumber: 1,
      playerActive,
      playerParty,
      wildPokemon,
      outcome: null,
      seed,
      balanceVersion,
    };

    // Store in Redis with TTL from balance
    await this.cache.set(
      this.getBattleKey(battleId),
      engineState,
      explorationConfig.ABANDONED_BATTLE_TTL_SECONDS
    );
    await this.cache.set(
      this.getActiveBattleKey(userId),
      battleId,
      explorationConfig.ABANDONED_BATTLE_TTL_SECONDS
    );

    const publicState = this.toPublicBattleState(engineState);

    return {
      battleId,
      wildPokemon: publicState.wildPokemon,
      playerParty: publicState.playerParty,
      state: publicState,
    };
  }

  /**
   * Retrieves public battle state for an active battle by ID.
   */
  async getPublicBattleState(battleId: string): Promise<PublicBattleStateDto | null> {
    const raw = await this.cache.get<BattleEngineState>(this.getBattleKey(battleId));
    if (!raw) return null;
    return this.toPublicBattleState(raw);
  }

  private toPublicPokemon(p: BattlePokemon, includeMoves: boolean = false): PublicPokemonDto {
    return {
      id: p.id,
      speciesId: p.speciesId,
      speciesName: p.speciesName,
      level: p.level,
      types: p.types,
      maxHp: p.maxHp,
      currentHp: p.currentHp,
      status: p.status,
      moves: includeMoves ? p.moves : undefined,
    };
  }

  public toPublicBattleState(s: BattleEngineState): PublicBattleStateDto {
    return {
      battleId: s.battleId,
      turnNumber: s.turnNumber,
      playerActive: this.toPublicPokemon(s.playerActive, true),
      playerParty: s.playerParty.map((p) => this.toPublicPokemon(p, p.id === s.playerActive.id)),
      wildPokemon: this.toPublicPokemon(s.wildPokemon, false),
      outcome: s.outcome,
    };
  }
}
