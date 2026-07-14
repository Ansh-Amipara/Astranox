import { describe, it, expect } from 'vitest';
import { BattleValidatorService } from '../battle-validator.service';
import { ValidationError } from '../../../../common/errors/AppError';

describe('BattleValidatorService', () => {
  const validator = new BattleValidatorService();

  describe('validateActionFormat', () => {
    it('validates correct action formats', () => {
      expect(() => validator.validateActionFormat('run')).not.toThrow();
      expect(() => validator.validateActionFormat('move:123')).not.toThrow();
      expect(() => validator.validateActionFormat('item:poke-ball')).not.toThrow();
      expect(() => validator.validateActionFormat('switch:123e4567-e89b-12d3-a456-426614174000')).not.toThrow();
      expect(() => validator.validateActionFormat('learn_move:1')).not.toThrow();
      expect(() => validator.validateActionFormat('skip_move')).not.toThrow();
    });

    it('throws ValidationError on invalid action formats', () => {
      expect(() => validator.validateActionFormat('jump')).toThrow(ValidationError);
      expect(() => validator.validateActionFormat('move:')).toThrow(ValidationError);
      expect(() => validator.validateActionFormat('item:unknown-ball')).toThrow(ValidationError);
    });
  });

  describe('validateSwitchTarget', () => {
    it('validates a correct switch target', () => {
      const party = [{ id: 'target-id', currentHp: 10 }];
      const result = validator.validateSwitchTarget('target-id', party, 'active-id');
      expect(result).toBeDefined();
    });

    it('throws ValidationError if target is already active', () => {
      const party = [{ id: 'active-id', currentHp: 10 }];
      expect(() => validator.validateSwitchTarget('active-id', party, 'active-id')).toThrow(ValidationError);
    });

    it('throws ValidationError if target is fainted or not found', () => {
      const party = [{ id: 'target-id', currentHp: 0 }];
      expect(() => validator.validateSwitchTarget('target-id', party, 'active-id')).toThrow(ValidationError);
      expect(() => validator.validateSwitchTarget('missing-id', party, 'active-id')).toThrow(ValidationError);
    });
  });

  describe('validateSwitchForFainted', () => {
    it('validates a correct switch target for fainted active', () => {
      const party = [{ id: 'target-id', currentHp: 10 }];
      const result = validator.validateSwitchForFainted('target-id', party);
      expect(result).toBeDefined();
    });

    it('throws ValidationError if target is fainted or not found', () => {
      const party = [{ id: 'target-id', currentHp: 0 }];
      expect(() => validator.validateSwitchForFainted('target-id', party)).toThrow(ValidationError);
    });
  });

  describe('validateItem', () => {
    it('throws ValidationError if not a WILD battle', () => {
      expect(() => validator.validateItem('poke-ball', [], 'NPC')).toThrow(ValidationError);
    });

    it('validates item if present in inventory with quantity > 0', () => {
      const inventory = [{ itemId: 'poke-ball', quantity: 5 }];
      const result = validator.validateItem('poke-ball', inventory, 'WILD');
      expect(result).toBeDefined();
    });

    it('throws ValidationError if item is missing or quantity is 0', () => {
      const inventory = [{ itemId: 'poke-ball', quantity: 0 }];
      expect(() => validator.validateItem('poke-ball', inventory, 'WILD')).toThrow(ValidationError);
      expect(() => validator.validateItem('great-ball', inventory, 'WILD')).toThrow(ValidationError);
    });
  });

  describe('validateMove', () => {
    it('validates if move is present', () => {
      expect(() => validator.validateMove(1, [{ moveId: 1 }])).not.toThrow();
    });

    it('throws ValidationError if move is not present', () => {
      expect(() => validator.validateMove(2, [{ moveId: 1 }])).toThrow(ValidationError);
    });
  });

  describe('calculateTypeMultiplier', () => {
    it('calculates correct multiplier based on type advantages', () => {
      const moveType = {
        damageRelations: {
          double_damage_to: [{ name: 'grass' }],
          half_damage_to: [{ name: 'water' }],
          no_damage_to: [{ name: 'ground' }]
        }
      };

      expect(validator.calculateTypeMultiplier(moveType, ['grass'])).toBe(2);
      expect(validator.calculateTypeMultiplier(moveType, ['water'])).toBe(0.5);
      expect(validator.calculateTypeMultiplier(moveType, ['grass', 'water'])).toBe(1); // 2 * 0.5
      expect(validator.calculateTypeMultiplier(moveType, ['ground'])).toBe(0);
      expect(validator.calculateTypeMultiplier(moveType, ['grass', 'ground'])).toBe(0);
      expect(validator.calculateTypeMultiplier(null, ['grass'])).toBe(1);
    });
  });
});
