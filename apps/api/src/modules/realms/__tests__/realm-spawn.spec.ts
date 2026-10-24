import { describe, it, expect, vi, beforeEach } from 'vitest';
import { rollWeightedEntry, rollLevel } from '@astranox/utils';
import { RealmsService } from '../realms.service';
import { ValidationError } from '../../../core/errors/AppError';

describe('Realms Spawn & Search Logic', () => {
  describe('rollWeightedEntry Utility', () => {
    const mockEntries = [
      { speciesId: 1, speciesName: 'pidgey', weight: 800 },
      { speciesId: 2, speciesName: 'charizard', weight: 180 },
      { speciesId: 3, speciesName: 'mewtwo', weight: 20 },
    ]; // Total = 1000

    it('deterministically selects item based on injected RNG roll', () => {
      // roll = 0.1 * 1000 = 100 (< 800) -> pidgey
      const item1 = rollWeightedEntry(mockEntries, () => 0.1);
      expect(item1.speciesName).toBe('pidgey');

      // roll = 0.85 * 1000 = 850 (>= 800, < 980) -> charizard
      const item2 = rollWeightedEntry(mockEntries, () => 0.85);
      expect(item2.speciesName).toBe('charizard');

      // roll = 0.99 * 1000 = 990 (>= 980) -> mewtwo
      const item3 = rollWeightedEntry(mockEntries, () => 0.99);
      expect(item3.speciesName).toBe('mewtwo');
    });

    it('throws error when rolling from empty entries array', () => {
      expect(() => rollWeightedEntry([])).toThrow();
    });
  });

  describe('rollLevel Utility', () => {
    it('always generates level within inclusive bounds [minLevel, maxLevel]', () => {
      const min = 5;
      const max = 35;

      const lvlMin = rollLevel(min, max, () => 0.0);
      expect(lvlMin).toBe(5);

      const lvlMax = rollLevel(min, max, () => 0.9999);
      expect(lvlMax).toBe(35);

      const lvlMid = rollLevel(min, max, () => 0.5);
      expect(lvlMid).toBe(20);
    });
  });

  describe('RealmsService Search-to-Battle Handoff', () => {
    let realmsService: RealmsService;
    let mockRealmsRepo: any;
    let mockTrainersRepo: any;
    let mockBattlesRepo: any;
    let mockBattleSessionService: any;
    let mockFlagService: any;

    beforeEach(() => {
      mockRealmsRepo = {
        findByRealmId: vi.fn().mockResolvedValue({
          id: 'realm-1',
          realmId: 'volcano',
          name: 'Volcano Realm',
          enabled: true,
          spawnLevelMin: 5,
          spawnLevelMax: 35,
          spawns: [
            {
              speciesId: 4,
              speciesName: 'charmander',
              types: ['fire'],
              rank: 'A',
              weight: 180,
              minLevel: 5,
              maxLevel: 35,
              isApex: false,
            },
          ],
        }),
      };

      mockTrainersRepo = {
        findByUserId: vi.fn().mockResolvedValue({
          id: 'trainer-1',
          userId: 'user-1',
          party: [
            { id: 'poke-1', currentHp: 50, maxHp: 50 },
          ],
        }),
      };

      mockBattlesRepo = {
        getActiveBattleByTrainer: vi.fn().mockResolvedValue(null),
      };

      mockBattleSessionService = {
        startCustomEncounter: vi.fn().mockResolvedValue({
          battleSession: {
            id: 'battle-123',
            opponentPokemonData: {
              speciesId: 4,
              speciesName: 'charmander',
              level: 12,
              types: ['fire'],
              spriteUrl: 'https://img.test/charmander.png',
              rank: 'A',
            },
          },
          encounter: {
            species: {
              id: 4,
              name: 'charmander',
              spriteUrl: 'https://img.test/charmander.png',
            },
            level: 12,
          },
        }),
      };

      mockFlagService = {
        isEnabled: vi.fn().mockResolvedValue(true),
      };

      realmsService = new RealmsService(
        mockRealmsRepo,
        mockTrainersRepo,
        mockBattlesRepo,
        mockBattleSessionService,
        mockFlagService
      );
    });

    it('starts wild battle session and returns authoritative encounter DTO with redirect', async () => {
      const result = await realmsService.searchRealm('user-1', 'volcano', () => 0.2);

      expect(mockBattleSessionService.startCustomEncounter).toHaveBeenCalledWith(
        'user-1',
        4,
        expect.any(Number),
        'WILD'
      );

      expect(result.battleId).toBe('battle-123');
      expect(result.redirectTo).toBe('/battle?returnUrl=/realm/volcano');
      expect(result.encounter.speciesName).toBe('charmander');
    });

    it('rejects search if all Pokémon in party have fainted', async () => {
      mockTrainersRepo.findByUserId.mockResolvedValueOnce({
        id: 'trainer-1',
        party: [
          { id: 'poke-1', currentHp: 0, maxHp: 50 },
        ],
      });

      await expect(realmsService.searchRealm('user-1', 'volcano')).rejects.toThrow(ValidationError);
    });
  });
});
