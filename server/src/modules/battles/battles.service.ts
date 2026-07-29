import { BattleSessionService } from './services/battle-session.service';
import { BattleValidatorService } from './services/battle-validator.service';
import { BattleTurnService } from './services/battle-turn.service';
import { BattleRewardService } from './services/battle-reward.service';
import { BattlePersistenceService } from './services/battle-persistence.service';
import { BattleEventService } from './services/battle-event.service';
import { BattleLogService } from './services/battle-log.service';
import { BattleStateMachine } from './services/state-machine/battle-state-machine';
import { StateMachineServices } from './services/state-machine/battle-state.interface';
import { NotFoundError } from '../../core/errors/AppError';
import { Prisma } from '@prisma/client';
import { BattleMapper } from './dto/mapper';
import type { StartCustomEncounterDto } from './dto/request/StartCustomEncounterDto';
import type { SubmitTurnDto } from './dto/request/SubmitTurnDto';
import type { AvailableSpeciesDto } from './dto/response/AvailableSpeciesDto';
import type { BattleSessionDto } from './dto/response/BattleSessionDto';
import type { StartEncounterResultDto } from './dto/response/StartEncounterResultDto';
import type { TurnResultDto } from './dto/response/TurnResultDto';

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

  async getAvailableSpecies(): Promise<AvailableSpeciesDto[]> {
    const species = await this.sessionService.getAvailableSpecies();
    return BattleMapper.toAvailableSpeciesDtoList(species);
  }

  async getArenaTrainers() {
    return this.sessionService.getArenaTrainers();
  }

  async startArenaEncounter(userId: string, trainerId: string): Promise<StartEncounterResultDto> {
    const result = await this.sessionService.startArenaEncounter(userId, trainerId);
    return BattleMapper.toStartEncounterResultDto({ encounter: { species: { name: 'Arena Trainer' } as any, level: 0, potential: '' }, battleSession: result } as any);
  }

  async startCustomEncounter(userId: string, dto: StartCustomEncounterDto): Promise<StartEncounterResultDto> {
    const result = await this.sessionService.startCustomEncounter(userId, dto.speciesId, dto.level);
    return BattleMapper.toStartEncounterResultDto(result);
  }

  async startRealmEncounter(userId: string, realmId: string): Promise<StartEncounterResultDto> {
    const result = await this.sessionService.startRealmEncounter(userId, realmId);
    return BattleMapper.toStartEncounterResultDto(result);
  }

  async getActiveSession(userId: string): Promise<BattleSessionDto> {
    const session = await this.sessionService.getActiveSession(userId);
    return BattleMapper.toBattleSessionDto(session);
  }

  async submitTurn(userId: string, dto: SubmitTurnDto): Promise<TurnResultDto> {
    this.stateMachineServices.validator.validateActionFormat(dto.action);
    const result = await this.stateMachineServices.persistence.runTurnTransaction((tx) => this.submitTurnInTransaction(userId, dto.action, tx));
    return BattleMapper.toTurnResultDto(result);
  }

  private async submitTurnInTransaction(userId: string, action: string, tx: Prisma.TransactionClient) {
    const trainerSave = await this.stateMachineServices.persistence.getTrainerForTurn(tx, userId);
    if (!trainerSave) throw new NotFoundError('Trainer profile not found.');
    
    const session = await this.stateMachineServices.persistence.getActiveBattleForUpdate(tx, trainerSave.id);
    if (!session) throw new NotFoundError('No active battle session found.');
    
    return this.stateMachine.processAction(action, session, trainerSave, tx, this.stateMachineServices);
  }
}
