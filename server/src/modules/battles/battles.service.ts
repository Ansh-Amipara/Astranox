import { BattleSessionService } from './services/battle-session.service';
import { BattleValidatorService } from './services/battle-validator.service';
import { BattleTurnService } from './services/battle-turn.service';
import { BattleRewardService } from './services/battle-reward.service';
import { BattlePersistenceService } from './services/battle-persistence.service';
import { BattleEventService } from './services/battle-event.service';
import { BattleLogService } from './services/battle-log.service';
import { BattleStateMachine } from './services/state-machine/battle-state-machine';
import { StateMachineServices } from './services/state-machine/battle-state.interface';
import { NotFoundError } from '../../common/errors/AppError';
import { Prisma } from '@prisma/client';

export class BattlesService {
  private sessionService = new BattleSessionService();
  
  private stateMachineServices: StateMachineServices = {
    validator: new BattleValidatorService(),
    turn: new BattleTurnService(),
    reward: new BattleRewardService(),
    persistence: new BattlePersistenceService(),
    event: new BattleEventService(),
    log: new BattleLogService()
  };

  private stateMachine = new BattleStateMachine();

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
    this.stateMachineServices.validator.validateActionFormat(action);
    return this.stateMachineServices.persistence.runTurnTransaction((tx) => this.submitTurnInTransaction(userId, action, tx));
  }

  private async submitTurnInTransaction(userId: string, action: string, tx: Prisma.TransactionClient) {
    const trainerSave = await this.stateMachineServices.persistence.getTrainerForTurn(tx, userId);
    if (!trainerSave) throw new NotFoundError('Trainer profile not found.');
    
    const session = await this.stateMachineServices.persistence.getActiveBattleForUpdate(tx, trainerSave.id);
    if (!session) throw new NotFoundError('No active battle session found.');
    
    return this.stateMachine.processAction(action, session, trainerSave, tx, this.stateMachineServices);
  }
}
