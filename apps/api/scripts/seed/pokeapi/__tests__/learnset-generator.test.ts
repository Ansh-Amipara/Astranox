import { describe, it, expect } from 'vitest';
import { determineBattleRank, generateLearnset } from '../learnset-generator';

describe('Battle Rank Determination', () => {
  const mockSpeciesMap = new Map<number, any>();

  // Set up mock evolution chain: bulbasaur (1) -> ivysaur (2) -> venusaur (3)
  const bulbasaur = { id: 1, name: 'bulbasaur', hp: 45, attack: 49, defense: 49, spAtk: 65, spDef: 65, speed: 45, category: 'Normal', evolvesToId: 2 };
  const ivysaur = { id: 2, name: 'ivysaur', hp: 60, attack: 62, defense: 63, spAtk: 80, spDef: 80, speed: 60, category: 'Normal', evolvesToId: 3 };
  const venusaur = { id: 3, name: 'venusaur', hp: 80, attack: 82, defense: 83, spAtk: 100, spDef: 100, speed: 80, category: 'Normal', evolvesToId: null };

  // Mewtwo (EX)
  const mewtwo = { id: 150, name: 'mewtwo', hp: 106, attack: 110, defense: 90, spAtk: 154, spDef: 90, speed: 130, category: 'Legendary', evolvesToId: null };
  // Mewtwo-Mega-Y (inherits EX)
  const mewtwoMegaY = { id: 10043, name: 'mewtwo-mega-y', hp: 106, attack: 150, defense: 70, spAtk: 194, spDef: 120, speed: 140, category: 'Legendary', baseSpeciesId: 150 };

  // Dragonite (S, Pseudo-Legendary)
  const dragonite = { id: 149, name: 'dragonite', hp: 91, attack: 134, defense: 95, spAtk: 100, spDef: 100, speed: 80, category: 'Pseudo Legendary' };

  mockSpeciesMap.set(1, bulbasaur);
  mockSpeciesMap.set(2, ivysaur);
  mockSpeciesMap.set(3, venusaur);
  mockSpeciesMap.set(150, mewtwo);
  mockSpeciesMap.set(10043, mewtwoMegaY);
  mockSpeciesMap.set(149, dragonite);

  it('correctly assigns EX rank to Mewtwo and its Mega form', () => {
    expect(determineBattleRank(mewtwo, mockSpeciesMap)).toBe('EX');
    expect(determineBattleRank(mewtwoMegaY, mockSpeciesMap)).toBe('EX');
  });

  it('correctly assigns S rank to Pseudo-Legendaries', () => {
    expect(determineBattleRank(dragonite, mockSpeciesMap)).toBe('S');
  });

  it('correctly assigns evolution-stage based ranks for Normal category', () => {
    // Bulbasaur (Stage 1 of 3, BST = 318) -> E
    expect(determineBattleRank(bulbasaur, mockSpeciesMap)).toBe('E');
    // Ivysaur (Stage 2 of 3, BST = 405) -> C
    expect(determineBattleRank(ivysaur, mockSpeciesMap)).toBe('C');
    // Venusaur (Stage 3 of 3, BST = 525) -> A
    expect(determineBattleRank(venusaur, mockSpeciesMap)).toBe('A');
  });
});

describe('Learnset Generation', () => {
  const allMoves = [
    { id: 1, name: 'tackle', power: 40, typeId: 1 }, // Normal
    { id: 2, name: 'scratch', power: 40, typeId: 1 }, // Normal
    { id: 3, name: 'vine-whip', power: 45, typeId: 12 }, // Grass
    { id: 4, name: 'mega-drain', power: 40, typeId: 12 },
    { id: 5, name: 'seed-bomb', power: 80, typeId: 12 },
    { id: 6, name: 'giga-drain', power: 75, typeId: 12 },
    { id: 7, name: 'solar-beam', power: 120, typeId: 12 },
    { id: 8, name: 'frenzy-plant', power: 150, typeId: 12 },
    { id: 9, name: 'leaf-storm', power: 130, typeId: 12 },
    { id: 10, name: 'hyper-beam', power: 150, typeId: 1 },
    { id: 11, name: 'judgment', power: 100, typeId: 1 }, // Arceus signature
  ];

  const bulbasaur = { id: 1, name: 'bulbasaur', type1Id: 12, type2Id: 4 }; // Grass/Poison

  it('generates a clean learnset capped by rank max power and excludes signatures', () => {
    // Rank E has max power 80
    const learnset = generateLearnset(bulbasaur, 'E', allMoves);
    
    // Check that we got moves
    expect(learnset.length).toBeGreaterThan(0);
    
    // Check that all moves are power <= 80
    for (const item of learnset) {
      const move = allMoves.find(m => m.id === item.moveId);
      expect(move?.power).toBeLessThanOrEqual(80);
      expect(move?.name).not.toBe('judgment'); // Should exclude arceus signature
    }

    // Verify level progression
    expect(learnset[0].unlockLevel).toBe(1);
    expect(learnset[learnset.length - 1].unlockLevel).toBeLessThanOrEqual(85);
  });
});
