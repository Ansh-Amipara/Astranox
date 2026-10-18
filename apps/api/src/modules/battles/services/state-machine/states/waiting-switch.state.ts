import { Prisma, BattleSession, TrainerSave, BattleStatus } from '@prisma/client';
import { IBattleState, StateMachineServices } from '../battle-state.interface';
import { ValidationError } from '../../../../../core/errors/AppError';

export class WaitingSwitchState implements IBattleState {
  async handleAction(
    action: string,
    session: BattleSession,
    _trainerSave: TrainerSave,
    _tx: Prisma.TransactionClient,
    services: StateMachineServices
  ): Promise<any> {
    const { validator, persistence, event, log } = services;

    if (!action.startsWith('switch:')) {
      throw new ValidationError('You must switch in a new Pokemon.');
    }
    
    let playerPartyData = (session.playerPartyData as any[]) || [];
    const targetId = action.split(':')[1];
    const targetData = validator.validateSwitchForFainted(targetId, playerPartyData);
    
    const wildPokemon = session.opponentPokemonData as any;

    const switchEvent = event.createSwitchEvent(targetId, targetId, targetData.speciesName, true);
    const updatedLog = log.appendTurnLog(session.log, session.turnNumber, [switchEvent]);

    const updated = await persistence.updateTurnIfCurrent(session.trainerId, session.turnNumber, {
      status: BattleStatus.ACTIVE,
      playerActivePokemonId: targetId,
      playerPokemonData: targetData,
      playerPartyData: playerPartyData as any,
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
}
