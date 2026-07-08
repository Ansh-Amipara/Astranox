import { describe, it, expect } from 'vitest';
import { createPokemonInstance } from '../PokemonInstance';
import { PokemonInstancePayload } from '../types';

describe('PokemonInstance Factory', () => {
  const garchompPayload: PokemonInstancePayload = {
    id: 'uuid-1234',
    nickname: 'Chomper',
    level: 50,
    ivs: { hp: 31, attack: 31, defense: 31, spAtk: 31, spDef: 31, speed: 31 },
    species: {
      id: 445,
      name: 'garchomp',
      types: ['dragon', 'ground'],
      baseStats: { hp: 108, attack: 130, defense: 95, spAtk: 80, spDef: 85, speed: 102 }
    }
  };

  it('hydrates stats correctly using Gen 5 exact formulas (no EVs)', () => {
    const instance = createPokemonInstance(garchompPayload);

    expect(instance.id).toBe('uuid-1234');
    expect(instance.name).toBe('Chomper');
    expect(instance.level).toBe(50);
    expect(instance.types).toEqual(['dragon', 'ground']);

    // Mathematically verified stats from stats.test.ts
    expect(instance.maxHp).toBe(183);
    expect(instance.currentHp).toBe(183); // fresh instance
    expect(instance.stats.attack).toBe(150);
    expect(instance.stats.defense).toBe(115);
    expect(instance.stats.spAtk).toBe(100);
    expect(instance.stats.spDef).toBe(105);
    expect(instance.stats.speed).toBe(122);
  });

  it('falls back to species name if nickname is null', () => {
    const payload = { ...garchompPayload, nickname: null };
    const instance = createPokemonInstance(payload);
    expect(instance.name).toBe('garchomp');
  });

  it('throws an error if IVs are out of bounds', () => {
    const payload = { 
      ...garchompPayload, 
      ivs: { ...garchompPayload.ivs, attack: 32 } // Invalid! Max is 31.
    };

    expect(() => createPokemonInstance(payload)).toThrowError(/Invalid IV/);
  });

  it('throws an error if level is out of bounds', () => {
    const payload = { ...garchompPayload, level: 101 };
    expect(() => createPokemonInstance(payload)).toThrowError(/Invalid Level/);
  });
});
