import { describe, it, expect } from 'vitest';
import { calculateCatchResult, getBallBonus } from '../catch-math';

describe('Catch Math (Gen V+)', () => {
  it('guarantees catch for Master Ball', () => {
    const result = calculateCatchResult({
      maxHp: 100,
      currentHp: 100,
      catchRate: 3, // very low catch rate
      ballBonus: getBallBonus('master-ball'),
      status: null
    });
    
    expect(result.caught).toBe(true);
    expect(result.shakes).toBe(3);
  });

  it('guarantees catch if a >= 255', () => {
    // Caterpie has catch rate 255
    const result = calculateCatchResult({
      maxHp: 100,
      currentHp: 1, // 1 HP
      catchRate: 255,
      ballBonus: getBallBonus('ultra-ball'), // 2x
      status: 'sleep' // 2.5x
    });
    
    expect(result.caught).toBe(true);
    expect(result.shakes).toBe(3);
  });

  it('breaks out instantly if b is low and rng is high', () => {
    const result = calculateCatchResult({
      maxHp: 100,
      currentHp: 100,
      catchRate: 3, // Beldum
      ballBonus: getBallBonus('poke-ball'),
      status: null
    }, [65000, 0, 0, 0]); // First roll fails
    
    expect(result.caught).toBe(false);
    expect(result.shakes).toBe(0);
  });

  it('breaks out on 3rd shake if 4th roll fails', () => {
    const result = calculateCatchResult({
      maxHp: 100,
      currentHp: 50,
      catchRate: 45, 
      ballBonus: getBallBonus('great-ball'),
      status: null
    }, [0, 0, 0, 65535]); // 4th roll fails
    
    expect(result.caught).toBe(false);
    expect(result.shakes).toBe(3);
  });

  it('catches if all 4 rolls succeed', () => {
    const result = calculateCatchResult({
      maxHp: 100,
      currentHp: 50,
      catchRate: 45, 
      ballBonus: getBallBonus('great-ball'),
      status: null
    }, [0, 0, 0, 0]); // All rolls pass
    
    expect(result.caught).toBe(true);
    expect(result.shakes).toBe(3);
  });
});
