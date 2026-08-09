import { injectable } from 'tsyringe';
import { TrainersRepository } from '../trainers/trainers.repository';
import { BattlesRepository } from '../battles/repositories/battles.repository';
import { ExploreRepository } from './explore.repository';
import { PokemonGeneratorService } from './services/pokemon-generator.service';
import { RewardGeneratorService } from './services/reward-generator.service';
import { EncounterGeneratorService } from './services/encounter-generator.service';
import { EXPLORE_OUTCOME_RATES } from './config/explore.config';
import { ExploreLocation } from './config/coinRewards.config';
import { NotFoundError, ValidationError } from '../../core/errors/AppError';
import { mapOwnedPokemonToInstance } from '../trainers/owned-pokemon.mapper';
import { toActivePokemon } from '../battles/services/battle-session.service';

@injectable()
export class ExploreService {
  constructor(
    private exploreRepo: ExploreRepository,
    private trainersRepo: TrainersRepository,
    private battlesRepo: BattlesRepository,
    private pokemonGen: PokemonGeneratorService,
    private rewardGen: RewardGeneratorService,
    private encounterGen: EncounterGeneratorService
  ) {}

  async explore(userId: string, location: ExploreLocation) {
    const trainerSave = await this.trainersRepo.findByUserId(userId);
    if (!trainerSave) {
      throw new NotFoundError('Trainer save not found');
    }

    const activeBattle = await this.battlesRepo.getActiveBattleByTrainer(trainerSave.id);
    if (activeBattle) {
      if (activeBattle.battleType === 'WILD' || activeBattle.battleType === 'TOWER' || activeBattle.battleType === 'RIFT') {
        return {
          type: 'POKEMON',
          encounter: activeBattle.opponentPokemonData,
          battleSessionId: activeBattle.id,
          isResume: true
        };
      }
      throw new ValidationError('You cannot explore while in a battle.');
    }

    const roll = Math.random();

    // 10% Nothing
    if (roll < EXPLORE_OUTCOME_RATES.NOTHING) {
      return { type: 'NOTHING', message: 'Nothing was found.' };
    }

    // 15% Coins (between 0.10 and 0.25)
    if (roll < EXPLORE_OUTCOME_RATES.NOTHING + EXPLORE_OUTCOME_RATES.COINS) {
      const coins = this.rewardGen.generateCoins(location);
      await this.exploreRepo.addAstralCoins(trainerSave.id, coins);
      return { 
        type: 'COINS', 
        message: `You found ${coins} Astral Coins.`,
        amount: coins
      };
    }

    // 75% Pokemon
    if (trainerSave.party.length === 0) {
      throw new ValidationError('You have no Pokemon to battle with!');
    }

    const { speciesName, level } = await this.encounterGen.generateEncounterAsync(location);
    const wildActive = await this.pokemonGen.generateWildPokemon(speciesName, level);

    const lead = trainerSave.party[0];
    const playerInstance = mapOwnedPokemonToInstance(lead as any);
    const playerActive = toActivePokemon(playerInstance);
    const playerPartyData = trainerSave.party.map((p: any) => toActivePokemon(mapOwnedPokemonToInstance(p)));

    const session = await this.battlesRepo.createBattleSession({
      trainerId: trainerSave.id,
      playerActivePokemonId: playerActive.id,
      opponentPokemonData: wildActive,
      playerPokemonData: playerActive,
      playerPartyData,
      battleType: 'WILD'
    });

    return {
      type: 'POKEMON',
      encounter: wildActive,
      battleSessionId: session.id
    };
  }
}
