import { describe, it, expect } from 'vitest';
import { resolveTurn } from '../turn-resolver';
import { ActivePokemon, BattleAction } from '../types';

describe('Turn Resolver Engine', () => {
  const createMockPokemon = (id: string, level: number, speed: number, types: string[]): ActivePokemon => ({
    id,
    speciesId: 1,
    speciesName: 'MockMon',
    level,
    types,
    maxHp: 100,
    currentHp: 100,
    attack: 50,
    defense: 50,
    spAtk: 50,
    spDef: 50,
    speed,
    catchRate: 255,
    baseExp: 100,
    currentXp: 0,
    moves: [{ moveId: 33, currentSlot: 0, name: 'tackle' }],
    status: null,
    stages: { attack: 0, defense: 0, spAtk: 0, spDef: 0, speed: 0, accuracy: 0, evasion: 0 }
  });

  const createMockAction = (pokemonId: string, priority: number = 0, power: number = 40): BattleAction => ({
    type: 'move',
    pokemonId,
    typeEffectivenessMultiplier: 1,
    move: {
      name: 'Tackle',
      power,
      accuracy: 100,
      type: 'normal',
      priority,
      damageClass: 'physical'
    }
  });

  it('determines first striker by speed when priorities are equal', () => {
    const p1 = createMockPokemon('p1', 5, 20, ['normal']);
    const p2 = createMockPokemon('p2', 5, 10, ['normal']);
    
    const result = resolveTurn(p1, createMockAction('p1'), p2, createMockAction('p2'));
    
    expect(result.events[0].pokemonId).toBe('p1'); // p1 moves first
    expect(result.events[0].type).toBe('move');
  });

  it('determines first striker by priority over speed', () => {
    const p1 = createMockPokemon('p1', 5, 20, ['normal']);
    const p2 = createMockPokemon('p2', 5, 10, ['normal']);
    
    // p2 uses Quick Attack (priority 1)
    const result = resolveTurn(p1, createMockAction('p1', 0), p2, createMockAction('p2', 1));
    
    expect(result.events[0].pokemonId).toBe('p2'); // p2 moves first despite being slower
  });

  it('applies scaling only to a turn and does not persist the penalty', () => {
    // p1 is level 20, p2 is level 10 (gap of 10)
    // p2 should suffer 50% stat reduction (5 levels * 10%)
    const p1 = createMockPokemon('p1', 20, 50, ['normal']);
    const p2 = createMockPokemon('p2', 10, 50, ['normal']);
    p2.defense = 40; // Base 40
    
    const result = resolveTurn(p1, createMockAction('p1', 0, 0), p2, createMockAction('p2', 0, 0));
    
    // The 50% penalty is used while resolving the turn, but stored battle state
    // retains its base stats for the next turn.
    expect(result.p2State.defense).toBe(40);
    expect(result.p1State.defense).toBe(50); // No penalty for p1

    const nextTurn = resolveTurn(
      result.p1State,
      createMockAction('p1', 0, 0),
      result.p2State,
      createMockAction('p2', 0, 0)
    );
    expect(nextTurn.p2State.defense).toBe(40);
  });

  it('does not apply level scaling penalty when gap is <= 5', () => {
    const p1 = createMockPokemon('p1', 15, 50, ['normal']);
    const p2 = createMockPokemon('p2', 10, 50, ['normal']);
    p2.defense = 40;
    
    const result = resolveTurn(p1, createMockAction('p1'), p2, createMockAction('p2'));
    
    expect(result.p2State.defense).toBe(40); // Unchanged
  });

  it('ends turn early if first attacker faints the defender', () => {
    const p1 = createMockPokemon('p1', 50, 100, ['normal']);
    const p2 = createMockPokemon('p2', 50, 10, ['normal']);
    p2.currentHp = 5; // Low HP

    const result = resolveTurn(p1, createMockAction('p1', 0, 150), p2, createMockAction('p2'));
    
    // p1 goes first and kills p2. p2 never attacks.
    const hasP2Move = result.events.some(e => e.type === 'move' && e.pokemonId === 'p2');
    expect(hasP2Move).toBe(false);
    
    const hasFaint = result.events.some(e => e.type === 'faint' && e.pokemonId === 'p2');
    expect(hasFaint).toBe(true);
    expect(result.p2State.currentHp).toBe(0);
  });

  it('applies status ailment on hit', () => {
    const p1 = createMockPokemon('p1', 5, 20, ['normal']);
    const p2 = createMockPokemon('p2', 5, 10, ['normal']);
    
    const p1Action = createMockAction('p1') as any;
    p1Action.move.ailment = 'burn';
    p1Action.move.ailmentChance = 100;

    const result = resolveTurn(p1, p1Action, p2, createMockAction('p2'), { rngStatusOverride: 50 });
    
    expect(result.p2State.status).toBe('burn');
    const hasStatusEvent = result.events.some(e => e.type === 'status_inflicted' && (e as any).status === 'burn');
    expect(hasStatusEvent).toBe(true);
  });
});
