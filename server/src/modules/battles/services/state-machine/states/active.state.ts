import { Prisma, BattleSession, TrainerSave, BattleStatus } from '@prisma/client';
import { IBattleState, StateMachineServices } from '../battle-state.interface';
import { ValidationError } from '../../../../../common/errors/AppError';
import { BattleAction } from '../../../../../game/battle-state/types';
import { getBallBonus } from '../../../../../game/battle/catch-math';

export class ActiveState implements IBattleState {
  async handleAction(
    action: string,
    session: BattleSession,
    trainerSave: TrainerSave,
    tx: Prisma.TransactionClient,
    services: StateMachineServices
  ): Promise<any> {
    const { validator, turn, reward, persistence, event, log } = services;

    if (action === 'run') {
      if (session.battleType !== 'WILD') {
        throw new ValidationError('You cannot run from an NPC battle.');
      }

      const fledEvent = event.createFledEvent(session.playerActivePokemonId);
      const updatedLog = log.appendTurnLog(session.log, session.turnNumber, [fledEvent]);

      const updated = await persistence.updateTurnIfCurrent(tx, session.id, session.turnNumber, {
        status: BattleStatus.FLED,
        turnNumber: session.turnNumber + 1,
        playerPokemonData: session.playerPokemonData as Prisma.InputJsonValue,
        opponentPokemonData: session.opponentPokemonData as Prisma.InputJsonValue,
        log: updatedLog,
      });
      if (!updated) throw new ValidationError('Battle action was already processed. Refresh the battle state.');
      return { status: BattleStatus.FLED, events: [fledEvent] };
    }

    let playerAction: BattleAction;
    const wildPokemon = session.opponentPokemonData as any;
    let playerPokemon = session.playerPokemonData as any;
    let playerPartyData = (session.playerPartyData as any[]) || [];

    // --- PARSE ACTION ---
    if (action.startsWith('switch:')) {
      const targetId = action.split(':')[1];
      const targetData = validator.validateSwitchTarget(targetId, playerPartyData, session.playerActivePokemonId);

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
      const inventoryItem = validator.validateItem(itemId, (trainerSave as any).inventory as any[], session.battleType);
      
      await persistence.useItem(inventoryItem.id, inventoryItem.quantity, tx);

      playerAction = {
        type: 'item',
        pokemonId: session.playerActivePokemonId,
        itemId,
        ballBonus: getBallBonus(itemId)
      };
    } else {
      const moveId = parseInt(action.split(':')[1]);
      validator.validateMove(moveId, playerPokemon.moves || []);

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
        typeEffectivenessMultiplier: validator.calculateTypeMultiplier(playerMoveData.type, wildPokemon.types),
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

    // --- OPPONENT ACTION & EXECUTE TURN ---
    const wildAction = await turn.getOpponentAction(wildPokemon, playerPokemon, tx);
    const result = turn.executeTurn(playerPokemon, playerAction, wildPokemon, wildAction);

    // Sync p1 state back to party data
    const p1Index = playerPartyData.findIndex(p => p.id === result.p1State.id);
    if (p1Index !== -1) playerPartyData[p1Index] = result.p1State;

    // --- CHECK RESULTS ---
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
      
      const faintResult = await reward.processFaintRewards(result, wildPokemon, tx);
      if (faintResult.newStatus) {
         newStatus = faintResult.newStatus;
      }
      await persistence.syncPartyExperience(playerPartyData, result.p1State, tx);

      if (session.battleType === 'NPC') {
        const p2Index = opponentPartyData.findIndex(p => p.id === result.p2State.id);
        if (p2Index !== -1) opponentPartyData[p2Index] = result.p2State;
        
        const nextHealthy = opponentPartyData.find(p => p.currentHp > 0);
        if (nextHealthy) {
          result.p2State = nextHealthy;
          result.events.push(event.createSwitchEvent(nextHealthy.id, nextHealthy.id, nextHealthy.speciesName, false));
        } else if (newStatus === BattleStatus.ACTIVE) {
          newStatus = BattleStatus.WON;
        }
      } else if (newStatus === BattleStatus.ACTIVE) {
        newStatus = BattleStatus.WON;
      }
    }

    // --- POST-BATTLE PROCESSING ---
    if (isCaught) {
      await persistence.saveCaughtPokemon(trainerSave, wildPokemon, tx);
    }

    if (newStatus === BattleStatus.WON && session.battleType === 'NPC' && session.npcTrainerId) {
       await reward.processNpcVictory(trainerSave, session.npcTrainerId, tx);
    }

    const updatedLog = log.appendTurnLog(session.log, session.turnNumber, result.events);

    const updated = await persistence.updateTurnIfCurrent(tx, session.id, session.turnNumber, {
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
