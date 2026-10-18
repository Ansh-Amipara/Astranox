import { Mulberry32 } from './prng/mulberry32';
import { calculateDamage } from './damage';
import { calculateCapture } from './capture';
import {
  BattleEngineState,
  BattlePokemon,
  MoveData,
  PlayerAction,
  TurnEvent,
} from './types';

export interface ResolveTurnResult {
  state: BattleEngineState;
  events: TurnEvent[];
}

function clonePokemon(p: BattlePokemon): BattlePokemon {
  return {
    ...p,
    types: [...p.types],
    moves: p.moves.map((m) => ({ ...m })),
  };
}

function cloneState(s: BattleEngineState): BattleEngineState {
  return {
    ...s,
    playerActive: clonePokemon(s.playerActive),
    playerParty: s.playerParty.map(clonePokemon),
    wildPokemon: clonePokemon(s.wildPokemon),
  };
}

function getEffectiveSpeed(p: BattlePokemon): number {
  let spd = p.speed;
  if (p.status === 'paralysis') {
    spd = Math.floor(spd / 2);
  }
  return spd;
}

function checkCanAttack(
  pokemon: BattlePokemon,
  rng: Mulberry32,
  events: TurnEvent[]
): boolean {
  if (pokemon.status === 'sleep') {
    const turns = (pokemon.sleepTurnsRemaining ?? 1) - 1;
    pokemon.sleepTurnsRemaining = turns;
    if (turns <= 0) {
      pokemon.status = 'none';
      events.push({
        type: 'text',
        text: `${pokemon.speciesName} woke up!`,
      });
      return true;
    } else {
      events.push({
        type: 'text',
        text: `${pokemon.speciesName} is fast asleep.`,
      });
      return false;
    }
  }

  if (pokemon.status === 'freeze') {
    // 20% chance to thaw each turn
    if (rng.next() < 0.2) {
      pokemon.status = 'none';
      events.push({
        type: 'text',
        text: `${pokemon.speciesName} thawed out!`,
      });
      return true;
    } else {
      events.push({
        type: 'text',
        text: `${pokemon.speciesName} is frozen solid!`,
      });
      return false;
    }
  }

  if (pokemon.status === 'paralysis') {
    // 25% chance of full paralysis
    if (rng.next() < 0.25) {
      events.push({
        type: 'text',
        text: `${pokemon.speciesName} is paralyzed! It can't move!`,
      });
      return false;
    }
  }

  return true;
}

function applyResiduals(
  pokemon: BattlePokemon,
  events: TurnEvent[],
  isPlayer: boolean
): boolean {
  if (pokemon.currentHp <= 0) return true;

  let residualRatio = 0;
  if (pokemon.status === 'burn') {
    residualRatio = 1 / 16;
  } else if (pokemon.status === 'poison') {
    residualRatio = 1 / 8;
  }

  if (residualRatio > 0) {
    const dmg = Math.max(1, Math.floor(pokemon.maxHp * residualRatio));
    pokemon.currentHp = Math.max(0, pokemon.currentHp - dmg);
    events.push({
      type: 'status_damage',
      targetId: pokemon.id,
      damage: dmg,
      currentHp: pokemon.currentHp,
      maxHp: pokemon.maxHp,
      status: pokemon.status,
    });
    if (pokemon.currentHp <= 0) {
      events.push({
        type: 'faint',
        targetId: pokemon.id,
        isPlayer,
      });
      return true;
    }
  }

  return false;
}

function selectWildMove(wild: BattlePokemon, rng: Mulberry32): MoveData {
  if (!wild.moves || wild.moves.length === 0) {
    return {
      id: 33, // Tackle
      name: 'Tackle',
      power: 40,
      accuracy: 100,
      type: 'normal',
      damageClass: 'physical',
    };
  }
  const idx = rng.nextInt(0, wild.moves.length - 1);
  return wild.moves[idx];
}

export function resolveTurn(
  currentState: BattleEngineState,
  action: PlayerAction,
  balanceConfig?: { battle?: any; catch?: any }
): ResolveTurnResult {
  const events: TurnEvent[] = [];
  const state = cloneState(currentState);

  if (state.outcome !== null) {
    return { state, events };
  }

  const rng = new Mulberry32(state.seed);

  // Synchronize playerActive reference with party entry
  const syncPartyActive = () => {
    const idx = state.playerParty.findIndex((p) => p.id === state.playerActive.id);
    if (idx !== -1) {
      state.playerParty[idx] = clonePokemon(state.playerActive);
    }
  };

  // Check if player has any conscious Pokémon remaining
  const hasHealthyPartyMember = () => {
    return state.playerParty.some((p) => p.currentHp > 0);
  };

  // 1. RUN ACTION
  if (action.type === 'RUN') {
    events.push({ type: 'run_attempt', success: true });
    events.push({ type: 'text', text: 'Got away safely!' });
    state.outcome = 'FLED';
    state.seed = rng.getState();
    return { state, events };
  }

  // 2. THROW_BALL ACTION
  if (action.type === 'THROW_BALL') {
    const catchResult = calculateCapture({
      wild: state.wildPokemon,
      ball: action.ballType,
      rng: () => rng.next(),
      balanceConfig: balanceConfig?.catch,
    });

    events.push({
      type: 'catch_attempt',
      ballType: action.ballType,
      shakes: catchResult.shakes,
      shakeChecks: catchResult.shakeChecks,
      success: catchResult.success,
    });

    if (catchResult.success) {
      state.outcome = 'CAPTURED';
      events.push({
        type: 'text',
        text: `Gotcha! ${state.wildPokemon.speciesName} was caught!`,
      });
      syncPartyActive();
      state.seed = rng.getState();
      return { state, events };
    }

    events.push({
      type: 'text',
      text: `Oh no! The Pokémon broke free!`,
    });

    // Wild Pokemon counter-attacks on failed capture
    const wildMove = selectWildMove(state.wildPokemon, rng);
    executeAttack(state.wildPokemon, state.playerActive, wildMove, false);

    // End of turn residuals
    applyResiduals(state.playerActive, events, true);
    applyResiduals(state.wildPokemon, events, false);

    checkTurnFaints();
    finalizeTurn();
    return { state, events };
  }

  // 3. SWITCH_POKEMON ACTION
  if (action.type === 'SWITCH_POKEMON') {
    const target = state.playerParty.find(
      (p) => p.id === action.targetPokemonId && p.currentHp > 0
    );
    if (!target) {
      events.push({
        type: 'text',
        text: 'Cannot switch to this Pokémon.',
      });
      state.seed = rng.getState();
      return { state, events };
    }

    const previousId = state.playerActive.id;
    syncPartyActive();
    state.playerActive = clonePokemon(target);

    events.push({
      type: 'switch',
      previousPokemonId: previousId,
      newPokemon: clonePokemon(state.playerActive),
      isPlayer: true,
    });
    events.push({
      type: 'text',
      text: `Go! ${state.playerActive.speciesName}!`,
    });

    // Wild Pokémon attacks incoming Pokémon
    const wildMove = selectWildMove(state.wildPokemon, rng);
    executeAttack(state.wildPokemon, state.playerActive, wildMove, false);

    applyResiduals(state.playerActive, events, true);
    applyResiduals(state.wildPokemon, events, false);

    checkTurnFaints();
    finalizeTurn();
    return { state, events };
  }

  // 4. USE_ITEM ACTION
  if (action.type === 'USE_ITEM') {
    events.push({
      type: 'text',
      text: `Used ${action.itemId}!`,
    });
    // Wild attacks
    const wildMove = selectWildMove(state.wildPokemon, rng);
    executeAttack(state.wildPokemon, state.playerActive, wildMove, false);

    applyResiduals(state.playerActive, events, true);
    applyResiduals(state.wildPokemon, events, false);

    checkTurnFaints();
    finalizeTurn();
    return { state, events };
  }

  // 5. USE_MOVE ACTION
  if (action.type === 'USE_MOVE') {
    const playerMove =
      state.playerActive.moves.find((m) => m.id === action.moveId) ||
      state.playerActive.moves[0];

    const wildMove = selectWildMove(state.wildPokemon, rng);

    // Speed & Priority check
    const playerPriority = playerMove.priority ?? 0;
    const wildPriority = wildMove.priority ?? 0;

    let playerFirst = true;
    if (playerPriority !== wildPriority) {
      playerFirst = playerPriority > wildPriority;
    } else {
      const pSpeed = getEffectiveSpeed(state.playerActive);
      const wSpeed = getEffectiveSpeed(state.wildPokemon);
      if (pSpeed !== wSpeed) {
        playerFirst = pSpeed > wSpeed;
      } else {
        playerFirst = rng.next() < 0.5; // Speed tie
      }
    }

    const firstAttacker = playerFirst ? state.playerActive : state.wildPokemon;
    const secondAttacker = playerFirst ? state.wildPokemon : state.playerActive;
    const firstMove = playerFirst ? playerMove : wildMove;
    const secondMove = playerFirst ? wildMove : playerMove;
    const firstIsPlayer = playerFirst;

    // First attacker
    executeAttack(firstAttacker, secondAttacker, firstMove, firstIsPlayer);

    // If second attacker is still alive, counter-attack
    if (secondAttacker.currentHp > 0) {
      executeAttack(secondAttacker, firstAttacker, secondMove, !firstIsPlayer);
    }

    // Residuals
    applyResiduals(state.playerActive, events, true);
    applyResiduals(state.wildPokemon, events, false);

    checkTurnFaints();
    finalizeTurn();
    return { state, events };
  }

  return { state, events };

  // --- Helper closures ---
  function executeAttack(
    attacker: BattlePokemon,
    defender: BattlePokemon,
    move: MoveData,
    isPlayer: boolean
  ) {
    if (attacker.currentHp <= 0) return;

    events.push({
      type: 'move',
      attackerId: attacker.id,
      defenderId: defender.id,
      moveName: move.name,
      isPlayer,
    });

    const canAttack = checkCanAttack(attacker, rng, events);
    if (!canAttack) return;

    const dmgResult = calculateDamage(
      attacker,
      defender,
      move,
      () => rng.next(),
      balanceConfig?.battle
    );

    if (!dmgResult.hit) {
      events.push({ type: 'miss', attackerId: attacker.id });
      events.push({ type: 'text', text: `${attacker.speciesName}'s attack missed!` });
      return;
    }

    defender.currentHp = Math.max(0, defender.currentHp - dmgResult.damage);

    events.push({
      type: 'damage',
      targetId: defender.id,
      damage: dmgResult.damage,
      currentHp: defender.currentHp,
      maxHp: defender.maxHp,
      isCritical: dmgResult.isCritical,
      effectiveness: dmgResult.effectiveness,
    });

    if (dmgResult.isCritical) {
      events.push({ type: 'text', text: 'A critical hit!' });
    }
    if (dmgResult.effectiveness > 1) {
      events.push({ type: 'text', text: "It's super effective!" });
    } else if (dmgResult.effectiveness < 1 && dmgResult.effectiveness > 0) {
      events.push({ type: 'text', text: "It's not very effective..." });
    } else if (dmgResult.effectiveness === 0) {
      events.push({ type: 'text', text: `It doesn't affect ${defender.speciesName}...` });
    }

    if (defender.currentHp <= 0) {
      events.push({
        type: 'faint',
        targetId: defender.id,
        isPlayer: !isPlayer,
      });
      events.push({
        type: 'text',
        text: `${defender.speciesName} fainted!`,
      });
    }
  }

  function checkTurnFaints() {
    syncPartyActive();

    if (state.wildPokemon.currentHp <= 0) {
      state.outcome = 'WON';
    } else if (state.playerActive.currentHp <= 0) {
      if (!hasHealthyPartyMember()) {
        state.outcome = 'DEFEATED';
      }
    }
  }

  function finalizeTurn() {
    syncPartyActive();
    state.turnNumber += 1;
    state.seed = rng.getState();
  }
}
