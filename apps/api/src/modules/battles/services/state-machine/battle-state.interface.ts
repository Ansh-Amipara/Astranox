import { Prisma, BattleSession, TrainerSave } from '@prisma/client';
import { BattleValidatorService } from '../battle-validator.service';
import { BattleTurnService } from '../battle-turn.service';
import { BattleRewardService } from '../battle-reward.service';
import { BattlePersistenceService } from '../battle-persistence.service';
import { BattleEventService } from '../battle-event.service';
import { BattleLogService } from '../battle-log.service';

export interface StateMachineServices {
  validator: BattleValidatorService;
  turn: BattleTurnService;
  reward: BattleRewardService;
  persistence: BattlePersistenceService;
  event: BattleEventService;
  log: BattleLogService;
}

export interface IBattleState {
  handleAction(
    action: string,
    session: BattleSession,
    trainerSave: TrainerSave,
    tx: Prisma.TransactionClient,
    services: StateMachineServices
  ): Promise<any>;
}
