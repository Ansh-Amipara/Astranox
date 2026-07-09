import { ActivePokemon, BattleAction, TurnEvent, TurnResult, StatusAilment } from './types';
import { applyLevelScaling } from './level-scaling';
import { determineFirstStriker } from './turn-order';
import { checkCanAttack, applyResidualDamage } from './status-effects';
import { calculateDamage, checkAccuracy } from '../battle/damage';

interface TurnContext {
  rngAccuracyOverride?: number;
  rngStatusOverride?: number;
  rngFlinchOverride?: number;
  rngTurnOrderOverride?: number;
}

export function resolveTurn(
  p1: ActivePokemon,
  p1Action: BattleAction,
  p2: ActivePokemon,
  p2Action: BattleAction,
  context: TurnContext = {}
): TurnResult {
  const events: TurnEvent[] = [];
  
  // 1. Level Scaling
  let { p1: state1, p2: state2 } = applyLevelScaling(p1, p2);
  
  // Keep track of original ids so we can correctly assign events
  const isP1 = (p: ActivePokemon) => p.id === state1.id;

  // 2. Turn Order
  const firstStriker = determineFirstStriker(state1, p1Action, state2, p2Action, context.rngTurnOrderOverride);
  
  let firstAttacker = firstStriker === 'p1' ? state1 : state2;
  let firstAction = firstStriker === 'p1' ? p1Action : p2Action;
  
  let secondAttacker = firstStriker === 'p1' ? state2 : state1;
  let secondAction = firstStriker === 'p1' ? p2Action : p1Action;

  // State flag for flinching
  let secondAttackerFlinched = false;

  // 3. Process First Attacker
  if (firstAttacker.currentHp > 0) {
    const { fainted, flinched } = executeAction(firstAttacker, firstAction, secondAttacker, events, context);
    if (flinched) secondAttackerFlinched = true;
    if (fainted) return finishTurn(state1, state2, events); // End turn early
  }

  // 4. Process Second Attacker
  if (secondAttacker.currentHp > 0) {
    if (secondAttackerFlinched) {
      events.push({ type: 'flinch', pokemonId: secondAttacker.id });
    } else {
      const { fainted } = executeAction(secondAttacker, secondAction, firstAttacker, events, context);
      if (fainted) return finishTurn(state1, state2, events);
    }
  }

  // 5. End of Turn Residuals
  if (state1.currentHp > 0) {
    const ev = applyResidualDamage(state1);
    if (ev) events.push(ev);
    if (state1.currentHp <= 0) events.push({ type: 'faint', pokemonId: state1.id });
  }

  if (state2.currentHp > 0) {
    const ev = applyResidualDamage(state2);
    if (ev) events.push(ev);
    if (state2.currentHp <= 0) events.push({ type: 'faint', pokemonId: state2.id });
  }

  return finishTurn(state1, state2, events);
}

function executeAction(
  attacker: ActivePokemon,
  action: BattleAction,
  defender: ActivePokemon,
  events: TurnEvent[],
  ctx: TurnContext
): { fainted: boolean; flinched: boolean } {
  
  // A. Check Pre-Turn Status (Paralysis, Sleep, Freeze)
  const statusCheck = checkCanAttack(attacker, ctx.rngStatusOverride);
  if (statusCheck.event) events.push(statusCheck.event);
  
  if (!statusCheck.canAttack) {
    return { fainted: false, flinched: false };
  }

  // B. Announce Move
  events.push({ type: 'move', pokemonId: attacker.id, moveName: action.move.name });

  // C. Accuracy Check
  if (!checkAccuracy(action.move.accuracy, ctx.rngAccuracyOverride)) {
    events.push({ type: 'miss', pokemonId: attacker.id });
    return { fainted: false, flinched: false };
  }

  // D. Damage Calculation
  if (action.move.power && action.move.power > 0) {
    // Burn reduces physical damage by 50%
    let atkStat = action.move.damageClass === 'physical' ? attacker.attack : attacker.spAtk;
    if (action.move.damageClass === 'physical' && attacker.status === 'burn') {
      atkStat = Math.floor(atkStat * 0.5);
    }

    const defStat = action.move.damageClass === 'physical' ? defender.defense : defender.spDef;

    // We omit critical hits for now in the pure engine per house rules unless requested
    const damage = calculateDamage({
      attackerLevel: attacker.level,
      attackerAttack: atkStat,
      defenderDefense: defStat,
      movePower: action.move.power,
      moveType: action.move.type,
      attackerTypes: attacker.types,
      typeEffectivenessMultiplier: action.typeEffectivenessMultiplier,
      isCriticalHit: false 
    });

    defender.currentHp = Math.max(0, defender.currentHp - damage);
    events.push({ 
      type: 'damage', 
      pokemonId: defender.id, 
      amount: damage, 
      isCritical: false, 
      effectiveness: action.typeEffectivenessMultiplier 
    });

    if (defender.currentHp <= 0) {
      events.push({ type: 'faint', pokemonId: defender.id });
      return { fainted: true, flinched: false };
    }
  }

  // E. Secondary Effects (Status Ailment)
  let flinched = false;

  if (action.move.ailment && action.move.ailment !== 'none' && !defender.status) {
    const chance = action.move.ailmentChance || 100;
    const roll = ctx.rngStatusOverride ?? Math.floor(Math.random() * 100) + 1;
    
    if (roll <= chance) {
      // Very basic type immunity logic for ailments (e.g. fire types can't be burned)
      const isImmune = 
        (action.move.ailment === 'burn' && defender.types.includes('fire')) ||
        (action.move.ailment === 'poison' && (defender.types.includes('poison') || defender.types.includes('steel'))) ||
        (action.move.ailment === 'paralysis' && defender.types.includes('electric')) ||
        (action.move.ailment === 'freeze' && defender.types.includes('ice'));

      if (!isImmune) {
        defender.status = action.move.ailment as StatusAilment;
        
        if (defender.status === 'sleep') {
          defender.sleepTurns = Math.floor(Math.random() * 3) + 1; // 1 to 3 turns
        }
        
        events.push({ 
          type: 'status_inflicted', 
          pokemonId: defender.id, 
          status: defender.status 
        });
      }
    }
  }

  // F. Flinch Chance
  if (action.move.flinchChance) {
    const roll = ctx.rngFlinchOverride ?? Math.floor(Math.random() * 100) + 1;
    if (roll <= action.move.flinchChance) {
      flinched = true;
    }
  }

  return { fainted: false, flinched };
}

function finishTurn(p1State: ActivePokemon, p2State: ActivePokemon, events: TurnEvent[]): TurnResult {
  return { p1State, p2State, events };
}
