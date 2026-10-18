import { describe, it, expect } from 'vitest';
import { palletTownMap, route1Map, canMove, rollEncounter } from '../src';

describe('packages/game-map', () => {
  describe('canMove collision checks', () => {
    it('allows valid move on walkable ground', () => {
      const res = canMove(palletTownMap, { x: 5, y: 5, facing: 'DOWN' }, 'UP');
      expect(res.allowed).toBe(true);
      expect(res.nextPosition).toEqual({ x: 5, y: 4, facing: 'UP' });
      expect(res.tile).toBe('WALKABLE');
    });

    it('blocks movement into WALL tiles', () => {
      // Wall at y=2, x=2
      const res = canMove(palletTownMap, { x: 1, y: 2, facing: 'DOWN' }, 'RIGHT');
      expect(res.allowed).toBe(false);
      expect(res.reason).toBe('TILE_BLOCKED');
      expect(res.nextPosition.facing).toBe('RIGHT');
    });

    it('blocks movement into WATER tiles', () => {
      // Water at y=7, x=7
      const res = canMove(palletTownMap, { x: 6, y: 7, facing: 'DOWN' }, 'RIGHT');
      expect(res.allowed).toBe(false);
      expect(res.reason).toBe('TILE_WATER');
    });

    it('blocks out of bounds movement', () => {
      const res = canMove(palletTownMap, { x: 0, y: 0, facing: 'UP' }, 'UP');
      expect(res.allowed).toBe(false);
      expect(res.reason).toBe('OUT_OF_BOUNDS');
    });

    it('handles WARP points correctly', () => {
      // Warp at (5, 0) on pallet town leading to route-1 (5, 14)
      const res = canMove(palletTownMap, { x: 5, y: 1, facing: 'UP' }, 'UP');
      expect(res.allowed).toBe(true);
      expect(res.warp).toBeDefined();
      expect(res.warp?.targetMapId).toBe('route-1');
      expect(res.nextPosition.x).toBe(5);
      expect(res.nextPosition.y).toBe(14);
      expect(res.nextPosition.facing).toBe('UP');
    });
  });

  describe('rollEncounter checks', () => {
    it('returns triggered: false when tile is not GRASS', () => {
      const res = rollEncounter(route1Map, 5, 5, () => 0.01);
      expect(res.triggered).toBe(false);
    });

    it('returns triggered: false when rng roll > encounterRate', () => {
      // Grass at (2, 2)
      const res = rollEncounter(route1Map, 2, 2, () => 0.5, 0.12);
      expect(res.triggered).toBe(false);
    });

    it('triggers encounter on GRASS when rng roll <= encounterRate', () => {
      let callCount = 0;
      // Fixed sequence: roll (0.05 <= 0.12), weight (0.2 -> Pidgey), level (0.5 -> level 3 or 4)
      const mockRng = () => {
        callCount++;
        if (callCount === 1) return 0.05; // Trigger
        if (callCount === 2) return 10;   // Weight check
        return 0.5;                       // Level check
      };

      const res = rollEncounter(route1Map, 2, 2, mockRng, 0.12);
      expect(res.triggered).toBe(true);
      expect(res.encounter).toBeDefined();
      expect([16, 19, 25]).toContain(res.encounter?.speciesId);
      expect(res.encounter?.level).toBeGreaterThanOrEqual(2);
      expect(res.encounter?.level).toBeLessThanOrEqual(5);
    });
  });
});
