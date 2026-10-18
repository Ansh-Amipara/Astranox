import { describe, it, expect } from 'vitest';
import {
  calculateDamage,
  getTypeEffectiveness,
  calculateCapture,
  resolveTurn,
  Mulberry32,
  BattleEngineState,
  BattlePokemon,
  MoveData,
} from '../src';

const tackle: MoveData = {
  id: 33,
  name: 'Tackle',
  power: 40,
  accuracy: 100,
  type: 'normal',
  damageClass: 'physical',
};

const ember: MoveData = {
  id: 52,
  name: 'Ember',
  power: 40,
  accuracy: 100,
  type: 'fire',
  damageClass: 'special',
};

const vineWhip: MoveData = {
  id: 22,
  name: 'Vine Whip',
  power: 45,
  accuracy: 100,
  type: 'grass',
  damageClass: 'physical',
};

const quickAttack: MoveData = {
  id: 98,
  name: 'Quick Attack',
  power: 40,
  accuracy: 100,
  type: 'normal',
  damageClass: 'physical',
  priority: 1,
};

function createMockPokemon(overrides?: Partial<BattlePokemon>): BattlePokemon {
  return {
    id: 'p1',
    speciesId: 1,
    speciesName: 'Bulbasaur',
    level: 5,
    types: ['grass', 'poison'],
    maxHp: 20,
    currentHp: 20,
    attack: 11,
    defense: 11,
    spAtk: 13,
    spDef: 13,
    speed: 10,
    status: 'none',
    moves: [tackle, vineWhip],
    catchRate: 45,
    ...overrides,
  };
}

function createInitialState(overrides?: Partial<BattleEngineState>): BattleEngineState {
  const player = createMockPokemon({ id: 'player-1', speciesName: 'Charmander', types: ['fire'], moves: [tackle, ember] });
  const wild = createMockPokemon({ id: 'wild-1', speciesName: 'Bulbasaur', types: ['grass', 'poison'], moves: [tackle, vineWhip] });

  return {
    battleId: 'test-battle-1',
    turnNumber: 1,
    playerActive: player,
    playerParty: [player],
    wildPokemon: wild,
    outcome: null,
    seed: 12345,
    ...overrides,
  };
}

describe('packages/battle-engine', () => {
  describe('Type effectiveness', () => {
    it('calculates 2x for fire against grass', () => {
      expect(getTypeEffectiveness('fire', ['grass'])).toBe(2);
    });

    it('calculates 0.5x for grass against fire', () => {
      expect(getTypeEffectiveness('grass', ['fire'])).toBe(0.5);
    });

    it('calculates 0x for electric against ground (immunity)', () => {
      expect(getTypeEffectiveness('electric', ['ground'])).toBe(0);
    });

    it('calculates 4x for fire against grass/bug dual type', () => {
      expect(getTypeEffectiveness('fire', ['grass', 'bug'])).toBe(4);
    });
  });

  describe('Damage calculation', () => {
    it('applies super-effective damage', () => {
      const attacker = createMockPokemon({ level: 10, attack: 20, spAtk: 20, types: ['fire'] });
      const defender = createMockPokemon({ level: 10, defense: 20, spDef: 20, types: ['grass'] });
      const rng = new Mulberry32(42);

      const res = calculateDamage(attacker, defender, ember, () => rng.next());
      expect(res.hit).toBe(true);
      expect(res.effectiveness).toBe(2);
      expect(res.damage).toBeGreaterThan(0);
    });

    it('deals 0 damage when immune', () => {
      const attacker = createMockPokemon({ types: ['normal'] });
      const defender = createMockPokemon({ types: ['ghost'] });
      const rng = new Mulberry32(42);

      const res = calculateDamage(attacker, defender, tackle, () => rng.next());
      expect(res.effectiveness).toBe(0);
      expect(res.damage).toBe(0);
    });
  });

  describe('Capture calculation', () => {
    it('Master Ball is guaranteed capture with 4 successful checks', () => {
      const wild = createMockPokemon({ currentHp: 20, maxHp: 20 });
      const rng = new Mulberry32(999);

      const res = calculateCapture({
        wild,
        ball: 'master-ball',
        rng: () => rng.next(),
      });

      expect(res.success).toBe(true);
      expect(res.shakes).toBe(3);
      expect(res.shakeChecks).toEqual([true, true, true, true]);
    });

    it('low HP increases capture odds compared to full HP', () => {
      const wildFull = createMockPokemon({ currentHp: 100, maxHp: 100, catchRate: 255 });
      const wildLow = createMockPokemon({ currentHp: 1, maxHp: 100, catchRate: 255 });

      // Run multiple deterministic trials
      let fullSuccesses = 0;
      let lowSuccesses = 0;

      for (let s = 1; s <= 20; s++) {
        const rng1 = new Mulberry32(s);
        const rng2 = new Mulberry32(s);

        if (calculateCapture({ wild: wildFull, ball: 'poke-ball', rng: () => rng1.next() }).success) {
          fullSuccesses++;
        }
        if (calculateCapture({ wild: wildLow, ball: 'poke-ball', rng: () => rng2.next() }).success) {
          lowSuccesses++;
        }
      }

      expect(lowSuccesses).toBeGreaterThanOrEqual(fullSuccesses);
    });
  });

  describe('Turn resolution', () => {
    it('resolves RUN action cleanly with FLED outcome', () => {
      const state = createInitialState();
      const res = resolveTurn(state, { type: 'RUN' });

      expect(res.state.outcome).toBe('FLED');
      expect(res.events.some((e) => e.type === 'run_attempt' && e.success)).toBe(true);
    });

    it('resolves successful THROW_BALL with CAPTURED outcome', () => {
      const state = createInitialState();
      const res = resolveTurn(state, { type: 'THROW_BALL', ballType: 'master-ball' });

      expect(res.state.outcome).toBe('CAPTURED');
      expect(res.events.some((e) => e.type === 'catch_attempt' && e.success)).toBe(true);
    });

    it('priority moves strike first regardless of lower speed', () => {
      // Player has Quick Attack (+1 priority) with lower speed (5 vs 20)
      const player = createMockPokemon({
        id: 'player-1',
        speed: 5,
        moves: [quickAttack],
      });
      const wild = createMockPokemon({
        id: 'wild-1',
        speed: 20,
        moves: [tackle],
      });

      const state = createInitialState({ playerActive: player, playerParty: [player], wildPokemon: wild });
      const res = resolveTurn(state, { type: 'USE_MOVE', moveId: quickAttack.id });

      const moveEvents = res.events.filter((e) => e.type === 'move');
      expect(moveEvents.length).toBeGreaterThanOrEqual(1);
      expect((moveEvents[0] as any).moveName).toBe('Quick Attack');
    });

    it('sets WON when wild Pokémon faints', () => {
      const wild = createMockPokemon({ currentHp: 1, maxHp: 20 });
      const state = createInitialState({ wildPokemon: wild });

      const res = resolveTurn(state, { type: 'USE_MOVE', moveId: tackle.id });
      expect(res.state.outcome).toBe('WON');
      expect(res.events.some((e) => e.type === 'faint' && (e as any).targetId === wild.id)).toBe(true);
    });

    it('sets DEFEATED when player party is wiped out', () => {
      const player = createMockPokemon({ currentHp: 1, maxHp: 20, speed: 1 });
      const wild = createMockPokemon({ attack: 100, speed: 100 });
      const state = createInitialState({
        playerActive: player,
        playerParty: [player],
        wildPokemon: wild,
      });

      const res = resolveTurn(state, { type: 'USE_MOVE', moveId: tackle.id });
      expect(res.state.outcome).toBe('DEFEATED');
    });

    it('switches player active Pokémon correctly', () => {
      const p1 = createMockPokemon({ id: 'p1', speciesName: 'Charmander' });
      const p2 = createMockPokemon({ id: 'p2', speciesName: 'Squirtle' });
      const state = createInitialState({
        playerActive: p1,
        playerParty: [p1, p2],
      });

      const res = resolveTurn(state, { type: 'SWITCH_POKEMON', targetPokemonId: 'p2' });
      expect(res.state.playerActive.id).toBe('p2');
      expect(res.events.some((e) => e.type === 'switch')).toBe(true);
    });

    it('applies burn residual damage at end of turn', () => {
      const player = createMockPokemon({ status: 'burn', maxHp: 32, currentHp: 32 });
      const state = createInitialState({ playerActive: player, playerParty: [player] });

      const res = resolveTurn(state, { type: 'USE_MOVE', moveId: tackle.id });
      expect(res.events.some((e) => e.type === 'status_damage' && (e as any).status === 'burn')).toBe(true);
      expect(res.state.playerActive.currentHp).toBeLessThan(32);
    });
  });
});
