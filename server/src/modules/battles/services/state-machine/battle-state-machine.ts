import { injectable } from 'tsyringe';
import { Prisma, BattleSession, TrainerSave, BattleStatus } from '@prisma/client';
import { IBattleState, StateMachineServices } from './battle-state.interface';
import { ActiveState } from './states/active.state';
import { WaitingSwitchState } from './states/waiting-switch.state';

import { ValidationError } from '../../../../core/errors/AppError';

@injectable()
export class BattleStateMachine {
  private states: Record<string, IBattleState>;

  constructor() {
    this.states = {
      [BattleStatus.ACTIVE]: new ActiveState(),
      [BattleStatus.WAITING_SWITCH]: new WaitingSwitchState(),

    };
  }

  async processAction(
    action: string,
    session: BattleSession,
    trainerSave: TrainerSave,
    tx: Prisma.TransactionClient,
    services: StateMachineServices
  ): Promise<any> {
    const currentStateHandler = this.states[session.status];
    
    if (!currentStateHandler) {
      throw new ValidationError(`Cannot process action in current battle state: ${session.status}`);
    }

    return currentStateHandler.handleAction(action, session, trainerSave, tx, services);
  }
}
