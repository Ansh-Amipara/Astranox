import { BattleSessionService } from './services/battle-session.service';
import { BattleValidatorService } from './services/battle-validator.service';
import { BattleTurnService } from './services/battle-turn.service';
import { BattleRewardService } from './services/battle-reward.service';
import { BattlePersistenceService } from './services/battle-persistence.service';
import { BattleEventService } from './services/battle-event.service';
import { BattleLogService } from './services/battle-log.service';
import { NotFoundError, ValidationError } from '../../common/errors/AppError';
import { Prisma, BattleStatus } from '@prisma/client';
import { getBallBonus } from '../../game/battle/catch-math';
import { BattleAction } from '../../game/battle-state/types';

export class BattlesService {
  private sessionService = new BattleSessionService();
  private validatorService = new BattleValidatorService();
  private turnService = new BattleTurnService();
  private rewardService = new BattleRewardService();
  private persistenceService = new BattlePersistenceService();
  private eventService = new BattleEventService();
  private logService = new BattleLogService();

  async getAvailableSpecies() {
    return this.sessionService.getAvailableSpecies();
  }

  async startCustomEncounter(userId: string, speciesId: number, level: number) {
    return this.sessionService.startCustomEncounter(userId, speciesId, level);
  }

  async engageNpc(userId: string, npcTrainerId: string) {
    return this.sessionService.engageNpc(userId, npcTrainerId);
  }

  async getActiveSession(userId: string) {
    return this.sessionService.getActiveSession(userId);
  }

  async submitTurn(userId: string, action: string) {
    this.validatorService.validateActionFormat(action);
    return this.persistenceService.runTurnTransaction((tx) => this.submitTurnInTransaction(userId, action, tx));
  }

  private async submitTurnInTransaction(userId: string, action: string, tx: Prisma.TransactionClient) {
    const trainerSave = await this.persistenceService.getTrainerForTurn(tx, userId);
    if (!trainerSave) throw new NotFoundError('Trainer profile not found.');
    
    const session = await this.persistenceService.getActiveBattleForUpdate(tx, trainerSave.id);
    if (!session) throw new NotFoundError('No active battle session found.');
    
    // --- 1. RUN ACTION ---
    if (action === 'run') {
      if (session.battleType !== 'WILD') {
        throw new ValidationError('You cannot run from an NPC battle.');
      }

      const event = this.eventService.createFledEvent(session.playerActivePokemonId);
      const updatedLog = this.logService.appendTurnLog(session.log, session.turnNumber, [event]);

      const updated = await this.persistenceService.updateTurnIfCurrent(tx, session.id, session.turnNumber, {
        status: BattleStatus.FLED,
        turnNumber: session.turnNumber + 1,
        playerPokemonData: session.playerPokemonData as Prisma.InputJsonValue,
        opponentPokemonData: session.opponentPokemonData as Prisma.InputJsonValue,
        log: updatedLog,
      });
      if (!updated) throw new ValidationError('Battle action was already processed. Refresh the battle state.');
      return { status: BattleStatus.FLED, events: [event] };
    }

    let playerAction: BattleAction;
    const wildPokemon = session.opponentPokemonData as any;
    let playerPokemon = session.playerPokemonData as any;
    let playerPartyData = (session.playerPartyData as any[]) || [];

    // --- 2. WAITING_MOVE_LEARN STATE ---
    if (session.status === BattleStatus.WAITING_MOVE_LEARN) {
      const pendingMoveId = (playerPokemon as any).pendingMoveToLearn;
      if (!pendingMoveId) throw new ValidationError('No pending move to learn.');

      let eventLog = [];

      if (action.startsWith('learn_move:')) {
        const slotToReplace = parseInt(action.split(':')[1]);
        if (isNaN(slotToReplace) || slotToReplace < 0 || slotToReplace > 3) {
          throw new ValidationError('Invalid slot to replace.');
        }

        await this.persistenceService.learnMove(playerPokemon.id, pendingMoveId, slotToReplace, tx);
        
        const moveData = await tx.move.findUnique({ where: { id: pendingMoveId }, include: { type: true } });
        if (moveData) {
          playerPokemon.moves[slotToReplace] = {
            id: moveData.id,
            name: moveData.name,
            type: moveData.type.name,
            power: moveData.power,
            accuracy: moveData.accuracy,
            priority: moveData.priority,
            damageClass: moveData.damageClass
          };
          eventLog.push(this.eventService.createLearnedMoveEvent(playerPokemon.id, moveData.name));
        }
      } else if (action === 'skip_move') {
        eventLog.push(this.eventService.createSkippedMoveEvent(playerPokemon.id));
      } else {
        throw new ValidationError('You must choose to learn the move or skip it.');
      }

      delete (playerPokemon as any).pendingMoveToLearn;

      let nextStatus: BattleStatus = BattleStatus.WON;
      let opponentPartyData = (session.opponentPartyData as any[]) || [];
      if (session.battleType === 'NPC') {
        const nextHealthy = opponentPartyData.find(p => p.currentHp > 0);
        if (nextHealthy) {
          nextStatus = BattleStatus.ACTIVE; 
        }
      }

      const updatedLog = this.logService.appendTurnLog(session.log, session.turnNumber, eventLog);
      const updated = await this.persistenceService.updateTurnIfCurrent(tx, session.id, session.turnNumber, {
        status: nextStatus,
        playerPokemonData: playerPokemon,
        playerPartyData,
        turnNumber: session.turnNumber + 1,
        log: updatedLog
      });
      if (!updated) throw new ValidationError('Battle action was already processed. Refresh the battle state.');
      
      return {
        status: nextStatus,
        turnNumber: session.turnNumber,
        events: eventLog,
        p1State: playerPokemon,
        p2State: wildPokemon
      };
    }

    // --- 3. WAITING_SWITCH STATE ---
    if (session.status === BattleStatus.WAITING_SWITCH) {
      if (!action.startsWith('switch:')) {
        throw new ValidationError('You must switch in a new Pokemon.');
      }
      const targetId = action.split(':')[1];
      const targetData = this.validatorService.validateSwitchForFainted(targetId, playerPartyData);
      
      playerPokemon = targetData;
      session.playerActivePokemonId = targetId;
      session.playerPokemonData = targetData;

      const event = this.eventService.createSwitchEvent(targetId, targetId, targetData.speciesName, true);
      const updatedLog = this.logService.appendTurnLog(session.log, session.turnNumber, [event]);

      const updated = await this.persistenceService.updateTurnIfCurrent(tx, session.id, session.turnNumber, {
        status: BattleStatus.ACTIVE,
        playerActivePokemonId: targetId,
        playerPokemonData: targetData,
        playerPartyData,
        turnNumber: session.turnNumber + 1,
        log: updatedLog
      });
      if (!updated) throw new ValidationError('Battle action was already processed. Refresh the battle state.');

      return {
        status: BattleStatus.ACTIVE,
        turnNumber: session.turnNumber,
        events: [],
        p1State: targetData,
        p2State: wildPokemon
      };
    }

    // --- 4. PARSE ACTION ---
    if (action.startsWith('switch:')) {
      const targetId = action.split(':')[1];
      const targetData = this.validatorService.validateSwitchTarget(targetId, playerPartyData, session.playerActivePokemonId);

      const oldIndex = playerPartyData.findIndex(p => p.id === playerPokemon.id);
      if (oldIndex !== -1) playerPartyData[oldIndex] = playerPokemon;

      playerPokemon = targetData;
      session.playerActivePokemonId = targetId;

      playerAction = {
        type: 'switch',
        pokemonId: targetId,
        targetPokemonId: targetId
      };
    } else if (action.startsWith('item:')) {
      const itemId = action.split(':')[1];
      const inventoryItem = this.validatorService.validateItem(itemId, trainerSave.inventory, session.battleType);
      
      await this.persistenceService.useItem(inventoryItem.id, inventoryItem.quantity, tx);

      playerAction = {
        type: 'item',
        pokemonId: session.playerActivePokemonId,
        itemId,
        ballBonus: getBallBonus(itemId)
      };
    } else {
      const moveId = parseInt(action.split(':')[1]);
      this.validatorService.validateMove(moveId, playerPokemon.moves || []);

      const playerMoveData = await tx.move.findUnique({
        where: { id: moveId },
        include: { type: true }
      });

      if (!playerMoveData) {
        throw new ValidationError(`Move not found in database.`);
      }

      playerAction = {
        type: 'move',
        pokemonId: session.playerActivePokemonId,
        typeEffectivenessMultiplier: this.validatorService.calculateTypeMultiplier(playerMoveData.type, wildPokemon.types),
        move: {
          name: playerMoveData.name,
          power: playerMoveData.power,
          accuracy: playerMoveData.accuracy,
          type: playerMoveData.type.name,
          priority: playerMoveData.priority,
          damageClass: playerMoveData.damageClass as any,
          ailment: playerMoveData.ailment,
          ailmentChance: playerMoveData.ailmentChance,
          flinchChance: playerMoveData.flinchChance
        }
      };
    }

    // --- 5. OPPONENT ACTION & EXECUTE TURN ---
    const wildAction = await this.turnService.getOpponentAction(wildPokemon, playerPokemon, tx);
    const result = this.turnService.executeTurn(playerPokemon, playerAction, wildPokemon, wildAction);

    // Sync p1 state back to party data
    const p1Index = playerPartyData.findIndex(p => p.id === result.p1State.id);
    if (p1Index !== -1) playerPartyData[p1Index] = result.p1State;

    // --- 6. CHECK RESULTS ---
    const catchEvent = result.events.find(e => e.type === 'catch_attempt') as any;
    const isCaught = catchEvent && catchEvent.success;

    let newStatus: BattleStatus = BattleStatus.ACTIVE;
    let opponentPartyData = (session.opponentPartyData as any[]) || [];

    if (isCaught) {
      newStatus = BattleStatus.CAUGHT;
    } else if (result.p1State.currentHp <= 0) {
      const hasHealthy = playerPartyData.some(p => p.currentHp > 0);
      newStatus = hasHealthy ? BattleStatus.WAITING_SWITCH : BattleStatus.LOST;
    } else if (result.p2State.currentHp <= 0) {
      
      const faintResult = await this.rewardService.processFaintRewards(result, wildPokemon, tx);
      if (faintResult.newStatus) {
         newStatus = faintResult.newStatus;
      }
      await this.persistenceService.syncPartyExperience(playerPartyData, result.p1State, tx);

      if (session.battleType === 'NPC') {
        const p2Index = opponentPartyData.findIndex(p => p.id === result.p2State.id);
        if (p2Index !== -1) opponentPartyData[p2Index] = result.p2State;
        
        const nextHealthy = opponentPartyData.find(p => p.currentHp > 0);
        if (nextHealthy) {
          result.p2State = nextHealthy;
          result.events.push(this.eventService.createSwitchEvent(nextHealthy.id, nextHealthy.id, nextHealthy.speciesName, false));
        } else if (newStatus === BattleStatus.ACTIVE) {
          newStatus = BattleStatus.WON;
        }
      } else if (newStatus === BattleStatus.ACTIVE) {
        newStatus = BattleStatus.WON;
      }
    }

    // --- 7. POST-BATTLE PROCESSING ---
    if (isCaught) {
      await this.persistenceService.saveCaughtPokemon(trainerSave, wildPokemon, tx);
    }

    if (newStatus === BattleStatus.WON && session.battleType === 'NPC' && session.npcTrainerId) {
       await this.rewardService.processNpcVictory(trainerSave, session.npcTrainerId, tx);
    }

    const updatedLog = this.logService.appendTurnLog(session.log, session.turnNumber, result.events);

    const updated = await this.persistenceService.updateTurnIfCurrent(tx, session.id, session.turnNumber, {
      status: newStatus,
      turnNumber: session.turnNumber + 1,
      playerActivePokemonId: session.playerActivePokemonId,
      playerPokemonData: result.p1State as any,
      playerPartyData: playerPartyData as any,
      opponentPokemonData: result.p2State as any,
      opponentPartyData: opponentPartyData as any,
      log: updatedLog,
    });
    if (!updated) throw new ValidationError('Battle action was already processed. Refresh the battle state.');

    return {
      status: newStatus,
      turnNumber: session.turnNumber,
      events: result.events,
      p1State: result.p1State,
      p2State: result.p2State
    };
  }
}
