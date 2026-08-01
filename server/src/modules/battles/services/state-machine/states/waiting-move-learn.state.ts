import { Prisma, BattleSession, TrainerSave, BattleStatus } from '@prisma/client';
import { IBattleState, StateMachineServices } from '../battle-state.interface';
import { ValidationError } from '../../../../../core/errors/AppError';

export class WaitingMoveLearnState implements IBattleState {
  async handleAction(
    action: string,
    session: BattleSession,
    trainerSave: TrainerSave,
    tx: Prisma.TransactionClient,
    services: StateMachineServices
  ): Promise<any> {
    const { persistence, event, log } = services;

    let playerPokemon = session.playerPokemonData as any;
    let playerPartyData = (session.playerPartyData as any[]) || [];
    const wildPokemon = session.opponentPokemonData as any;
    
    const pendingLearns = (playerPokemon as any).pendingMoveLearns || [];
    if (pendingLearns.length === 0) throw new ValidationError('No pending move to learn.');

    const currentLearn = pendingLearns[0];
    const pendingMoveId = currentLearn.moveId;

    let eventLog = [];

    if (action.startsWith('learn_move:')) {
      const slotToReplace = parseInt(action.split(':')[1]);
      if (isNaN(slotToReplace) || slotToReplace < 0 || slotToReplace > 3) {
        throw new ValidationError('Invalid slot to replace.');
      }

      await persistence.learnMove(playerPokemon.id, pendingMoveId, slotToReplace, tx);
      
      const moveData = await tx.move.findUnique({ where: { id: pendingMoveId }, include: { type: true } });
      if (moveData) {
        playerPokemon.moves[slotToReplace] = {
          id: moveData.id,
          name: moveData.name,
          type: moveData.type.name,
          power: moveData.power,
          damageClass: moveData.damageClass
        };
        eventLog.push(event.createLearnedMoveEvent(playerPokemon.id, moveData.name));
      }
    } else if (action === 'skip_move') {
      eventLog.push(event.createSkippedMoveEvent(playerPokemon.id));
    } else {
      throw new ValidationError('You must choose to learn the move or skip it.');
    }

    // Remove the move we just processed
    pendingLearns.shift();
    (playerPokemon as any).pendingMoveLearns = pendingLearns;

    let nextStatus: BattleStatus;
    if (pendingLearns.length > 0) {
      nextStatus = BattleStatus.WAITING_MOVE_LEARN;
      const nextLearn = pendingLearns[0];
      eventLog.push({ 
        type: 'prompt_learn_move', 
        pokemonId: playerPokemon.id, 
        moveId: nextLearn.moveId, 
        moveName: nextLearn.moveName 
      });
    } else {
      nextStatus = (playerPokemon as any).finalStatusAfterMoveLearn || BattleStatus.WON;
      delete (playerPokemon as any).finalStatusAfterMoveLearn;
    }

    const updatedLog = log.appendTurnLog(session.log, session.turnNumber, eventLog);
    const updated = await persistence.updateTurnIfCurrent(session.trainerId, session.turnNumber, {
      status: nextStatus,
      playerPokemonData: playerPokemon,
      playerPartyData: playerPartyData as any,
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
}
