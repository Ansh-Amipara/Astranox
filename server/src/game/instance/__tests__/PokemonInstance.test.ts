import { describe, it, expect } from 'vitest';
import { createPokemonInstance } from '../PokemonInstance';
import { PokemonInstancePayload } from '../types';

describe('PokemonInstance Factory', () => {
  const garchompPayload: PokemonInstancePayload = {
    id: 'uuid-1234',
    nickname: 'Chomper',
    level: 50,
    potential: 'LEGENDARY',
    ivs: {
      hp: 31,
      attack: 31,
      defense: 31,
      spAtk: 31,
      spDef: 31,
      speed: 31
    },
    species: {
      id: 445,
      name: 'garchomp',
      types: ['dragon', 'ground'],
      baseStats: { hp: 108, attack: 130, defense: 95, spAtk: 80, spDef: 85, speed: 102 }
    },
    moves: [
      { moveId: 33, currentSlot: 0, name: 'tackle', type: 'normal' },
      { moveId: 89, currentSlot: 1, name: 'earthquake', type: 'ground' }
    ]
  };

  it('hydrates stats correctly using the Gen V engine', () => {
    const instance = createPokemonInstance(garchompPayload);

    expect(instance.id).toBe('uuid-1234');
    expect(instance.name).toBe('Chomper');
    expect(instance.level).toBe(50);
    expect(instance.types).toEqual(['dragon', 'ground']);

    // hp = floor(((2*108 + 31) * 50) / 100) + 50 + 10 = floor((247 * 50) / 100) + 60 = 123 + 60 = 183
    expect(instance.maxHp).toBe(183);
    expect(instance.currentHp).toBe(183); // fresh instance
    
    // attack = floor(((2*130 + 31) * 50) / 100) + 5 = floor((291 * 50) / 100) + 5 = 145 + 5 = 150
    expect(instance.stats.attack).toBe(150);
    // defense = floor(((2*95 + 31) * 50) / 100) + 5 = floor((221 * 50) / 100) + 5 = 110 + 5 = 115
    expect(instance.stats.defense).toBe(115);
    // spAtk = floor(((2*80 + 31) * 50) / 100) + 5 = floor((191 * 50) / 100) + 5 = 95 + 5 = 100
    expect(instance.stats.spAtk).toBe(100);
    // spDef = floor(((2*85 + 31) * 50) / 100) + 5 = floor((201 * 50) / 100) + 5 = 100 + 5 = 105
    expect(instance.stats.spDef).toBe(105);
    // speed = floor(((2*102 + 31) * 50) / 100) + 5 = floor((235 * 50) / 100) + 5 = 117 + 5 = 122
    expect(instance.stats.speed).toBe(122);
  });

  it('falls back to species name if nickname is null', () => {
    const payload = { ...garchompPayload, nickname: null };
    const instance = createPokemonInstance(payload);
    expect(instance.name).toBe('garchomp');
  });

  it('throws an error if level is out of bounds', () => {
    const payload = { ...garchompPayload, level: 201 };
    expect(() => createPokemonInstance(payload)).toThrowError(/Invalid Level/);
  });
});
