import { ValidationError } from '../../../common/errors/AppError';
import { ActivePokemon, BattleAction } from '../../../game/battle-state/types';

export class BattleValidatorService {
  private BATTLE_ACTION_PATTERN = /^(run|move:[1-9]\d*|switch:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|item:(poke-ball|great-ball|ultra-ball|luxury-ball|master-ball)|learn_move:[0-3]|skip_move)$/;

  validateActionFormat(action: string) {
    if (!this.BATTLE_ACTION_PATTERN.test(action)) {
      throw new ValidationError('Invalid battle action.');
    }
  }

  validateSwitchTarget(targetId: string, playerPartyData: any[], currentActiveId: string): any {
    const targetData = playerPartyData.find(p => p.id === targetId);
    if (!targetData || targetData.currentHp <= 0 || targetId === currentActiveId) {
      throw new ValidationError('Invalid switch target.');
    }
    return targetData;
  }

  validateSwitchForFainted(targetId: string, playerPartyData: any[]): any {
    const targetData = playerPartyData.find(p => p.id === targetId);
    if (!targetData || targetData.currentHp <= 0) {
      throw new ValidationError('Invalid switch target.');
    }
    return targetData;
  }

  validateItem(itemId: string, inventory: any[], battleType: string) {
    if (battleType !== 'SECRET_REALM') {
      throw new ValidationError('Items can only be used to catch Pokemon in Secret Realms.');
    }

    const inventoryItem = inventory.find((i: any) => i.itemId === itemId);
    if (!inventoryItem || inventoryItem.quantity <= 0) {
      throw new ValidationError(`You don't have any ${itemId} left.`);
    }

    return inventoryItem;
  }

  validateMove(moveId: number, playerMoves: any[]) {
    if (!playerMoves.some((m: any) => m.moveId === moveId)) {
      throw new ValidationError(`Pokemon does not know this move.`);
    }
  }

  calculateTypeMultiplier(moveType: any, defenderTypes: string[]): number {
    let multiplier = 1;
    if (!moveType || !moveType.damageRelations) return 1;

    const rels = moveType.damageRelations as any;
    const double = (rels.double_damage_to || []).map((t: any) => t.name);
    const half = (rels.half_damage_to || []).map((t: any) => t.name);
    const zero = (rels.no_damage_to || []).map((t: any) => t.name);

    for (const dType of defenderTypes) {
      if (zero.includes(dType)) return 0;
      if (double.includes(dType)) multiplier *= 2;
      if (half.includes(dType)) multiplier *= 0.5;
    }
    return multiplier;
  }
}
