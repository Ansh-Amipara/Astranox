/**
 * 32-bit Mulberry32 Seeded Pseudo-Random Number Generator.
 * Provides deterministic randomness for all battle engine calculations.
 */
export class Mulberry32 {
  private state: number;

  constructor(seed: number) {
    this.state = seed >>> 0;
  }

  /**
   * Returns a deterministic pseudo-random float in [0, 1).
   */
  public next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Returns a deterministic integer in [min, max] inclusive.
   */
  public nextInt(min: number, max: number): number {
    if (min >= max) return min;
    const r = this.next();
    return min + Math.floor(r * (max - min + 1));
  }

  /**
   * Returns current seed state for checkpointing.
   */
  public getState(): number {
    return this.state;
  }
}

export function createRng(seed: number): () => number {
  const prng = new Mulberry32(seed);
  return () => prng.next();
}
