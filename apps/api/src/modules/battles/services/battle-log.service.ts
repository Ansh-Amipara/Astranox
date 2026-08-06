import { injectable } from 'tsyringe';
@injectable()
export class BattleLogService {
  appendTurnLog(existingLog: any, turnNumber: number, events: any[]) {
    return [...(existingLog || []), { turn: turnNumber, events }];
  }
}
