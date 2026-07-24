import { Prisma, BattleSession, TrainerSave, BattleStatus } from '@prisma/client';
import { IBattleState, StateMachineServices } from '../battle-state.interface';
import { ValidationError } from '../../../../../common/errors/AppError';
import { BattleAction } from '../../../../../game/battle-state/types';
import { getBallBonus } from '../../../../../game/battle/catch-math';

export class ActiveState implements IBattleState {
  async handleAction(
    action: string,
    session: BattleSession,
    trainerSave: TrainerSave,
    tx: Prisma.TransactionClient,
    services: StateMachineServices
  ): Promise<any> {
    const { validator, turn, reward, persistence, event, log } = services;

    if (action === 'run') {
      const fledEvent = event.createFledEvent(session.playerActivePokemonId);
      const updatedLog = log.appendTurnLog(session.log, session.turnNumber, [fledEvent]);

      const updated = await persistence.updateTurnIfCurrent(tx, session.id, session.turnNumber, {
        status: BattleStatus.FLED,
        turnNumber: session.turnNumber + 1,
        playerPokemonData: session.playerPokemonData as Prisma.InputJsonValue,
        opponentPokemonData: session.opponentPokemonData as Prisma.InputJsonValue,
        log: updatedLog,
      });
      if (!updated) throw new ValidationError('Battle action was already processed. Refresh the battle state.');
      return { status: BattleStatus.FLED, events: [fledEvent] };
    }

    let playerAction: BattleAction;
    const wildPokemon = session.opponentPokemonData as any;
    let playerPokemon = session.playerPokemonData as any;
    let playerPartyData = (session.playerPartyData as any[]) || [];

    // --- PARSE ACTION ---
    if (action.startsWith('switch:')) {
      const targetId = action.split(':')[1];
      const targetData = validator.validateSwitchTarget(targetId, playerPartyData, session.playerActivePokemonId);

      const oldIndex = playerPartyData.findIndex(p => p.id === playerPokemon.id);
      if (oldIndex !== -1) playerPartyData[oldIndex] = playerPokemon;

      playerPokemon = targetData;
      session.playerActivePokemonId = targetId;

      playerAction = {
        type: 'switch',
        pokemonId: targetId,
        targetPokemonId: targetId
      };
    } else if (action.startsWith('item:')) {
      const itemId = action.split(':')[1];
      const inventoryItem = validator.validateItem(itemId, (trainerSave as any).inventory as any[], session.battleType);
      
      await persistence.useItem(inventoryItem.id, inventoryItem.quantity, tx);

      playerAction = {
        type: 'item',
        pokemonId: session.playerActivePokemonId,
        itemId,
        ballBonus: getBallBonus(itemId)
      };
    } else {
      const moveId = parseInt(action.split(':')[1]);
      validator.validateMove(moveId, playerPokemon.moves || []);

      const playerMoveData = await tx.move.findUnique({
        where: { id: moveId },
        include: { type: true }
      });

      if (!playerMoveData) {
        throw new ValidationError(`Move not found in database.`);
      }

      playerAction = {
        type: 'move',
        pokemonId: session.playerActivePokemonId,
        typeEffectivenessMultiplier: validator.calculateTypeMultiplier(playerMoveData.type, wildPokemon.types),
        move: {
          name: playerMoveData.name,
          power: playerMoveData.power,
          accuracy: playerMoveData.accuracy,
          type: playerMoveData.type.name,
          priority: playerMoveData.priority,
          damageClass: playerMoveData.damageClass as any,
          ailment: playerMoveData.ailment,
          ailmentChance: playerMoveData.ailmentChance,
          flinchChance: playerMoveData.flinchChance
        }
      };
    }

    // --- OPPONENT ACTION & EXECUTE TURN ---
    const wildAction = await turn.getOpponentAction(wildPokemon, playerPokemon, tx);
    const result = turn.executeTurn(playerPokemon, playerAction, wildPokemon, wildAction);

    // Sync p1 state back to party data
    const p1Index = playerPartyData.findIndex(p => p.id === result.p1State.id);
    if (p1Index !== -1) playerPartyData[p1Index] = result.p1State;

    let opponentPartyData = (session.opponentPartyData as any[]) || [];
    const p2Index = opponentPartyData.findIndex(p => p.id === result.p2State.id);
    if (p2Index !== -1) opponentPartyData[p2Index] = result.p2State;

    // --- CHECK RESULTS ---
    const catchEvent = result.events.find(e => e.type === 'catch_attempt') as any;
    const isCaught = catchEvent && catchEvent.success;

    let newStatus: BattleStatus = BattleStatus.ACTIVE;

    if (isCaught) {
      newStatus = BattleStatus.CAUGHT;
    } else if (result.p1State.currentHp <= 0) {
      const hasHealthy = playerPartyData.some(p => p.currentHp > 0);
      newStatus = hasHealthy ? BattleStatus.WAITING_SWITCH : BattleStatus.LOST;
    } else if (result.p2State.currentHp <= 0) {
      const faintResult = await reward.processFaintRewards(result, wildPokemon, tx, session.battleType, session.trainerId);
      if (faintResult.newStatus) {
         newStatus = faintResult.newStatus;
      }
      await persistence.syncPartyExperience(playerPartyData, result.p1State, tx);

      if (newStatus === BattleStatus.ACTIVE) {
        const nextOpponent = opponentPartyData.find((p: any) => p.currentHp > 0);
        if (nextOpponent) {
          result.p2State = nextOpponent;
          result.events.push({
            type: 'opponent_switch',
            pokemonId: nextOpponent.id,
            pokemonName: nextOpponent.speciesName || nextOpponent.name
          });
        } else {
          newStatus = BattleStatus.WON;
          
          let coinsToGive = 0;
          let storedXpToGive = 0;
          const baseLevel = wildPokemon.level || 5;

          if (wildPokemon.isRankExam) {
            coinsToGive = wildPokemon.examinerCoins ? Number(wildPokemon.examinerCoins) : 0;
            storedXpToGive = wildPokemon.examinerXp ? Number(wildPokemon.examinerXp) : 0;
          } else {
            coinsToGive = session.battleType === 'NPC' ? baseLevel * 30 : baseLevel * 10;
            if (session.battleType === 'NPC') {
              const { getExpYield } = require('../../../../../game/battle/level-math');
              storedXpToGive = opponentPartyData.reduce((sum: number, p: any) => sum + getExpYield(p.baseExp || 100, p.level || 5), 0);
            }
          }

          if (coinsToGive > 0 || storedXpToGive > 0 || (wildPokemon.isRankExam && wildPokemon.targetRank)) {
             const currentSave = await tx.trainerSave.findUnique({ where: { id: session.trainerId } });
             
             await tx.trainerSave.update({
               where: { id: session.trainerId },
               data: {
                 ...(wildPokemon.isRankExam && wildPokemon.targetRank ? { rank: wildPokemon.targetRank as any } : {}),
                 ...(coinsToGive > 0 ? { astralCoins: (currentSave?.astralCoins || 0) + coinsToGive } : {}),
                 ...(storedXpToGive > 0 ? { storedXp: (currentSave?.storedXp || 0) + storedXpToGive } : {})
               }
             });

             if (coinsToGive > 0) {
                result.events.push({
                  type: 'coin_reward',
                  amount: coinsToGive,
                  message: `Battle Won! Reward: +${coinsToGive} Astral Coins!`
                });
             }
             if (storedXpToGive > 0) {
                result.events.push({
                  type: 'stored_xp_gain',
                  amount: storedXpToGive,
                  message: `Battle Won! Reward: +${storedXpToGive} Stored XP!`
                });
             }
          }

          if (wildPokemon.isRankExam && wildPokemon.targetRank) {

            if (wildPokemon.examinerItems && Array.isArray(wildPokemon.examinerItems)) {
              for (const rawItemName of wildPokemon.examinerItems) {
                try {
                  const itemId = rawItemName.toLowerCase().replace(/\s+/g, '-');
                  const dbItem = await tx.item.findUnique({ where: { id: itemId } });
                  if (dbItem) {
                    await tx.inventoryItem.upsert({
                      where: {
                        trainerId_itemId: {
                          trainerId: session.trainerId,
                          itemId: dbItem.id
                        }
                      },
                      update: { quantity: { increment: 1 } },
                      create: {
                        trainerId: session.trainerId,
                        itemId: dbItem.id,
                        quantity: 1
                      }
                    });
                    result.events.push({
                      type: 'item_received',
                      item: dbItem.name,
                      message: `Rank Examiner Item: Received 1x ${dbItem.name}!`
                    });
                  }
                } catch (itemErr) {
                  console.error('Failed to grant examiner item reward:', itemErr);
                }
              }
            }

            result.events.push({
              type: 'rank_promotion',
              rank: wildPokemon.targetRank,
              message: `Rank Exam Passed! Promoted to ${wildPokemon.targetRank.replace('_', ' ')}!`
            });
          }
        }
      }
    }

    // --- MOVE LEARNING INTERCEPTION ---
    // If the battle is effectively over (WON or LOST), check if we have any queued moves to learn.
    // The user requested move learning to happen strictly at the end of the battle.
    if (newStatus === BattleStatus.WON || newStatus === BattleStatus.LOST) {
      const pendingLearns = (result.p1State as any).pendingMoveLearns || [];
      if (pendingLearns.length > 0) {
        // Store the actual final status we want to reach after learning moves
        (result.p1State as any).finalStatusAfterMoveLearn = newStatus;
        newStatus = BattleStatus.WAITING_MOVE_LEARN;
        const nextLearn = pendingLearns[0];
        result.events.push({ 
          type: 'prompt_learn_move', 
          pokemonId: result.p1State.id, 
          moveId: nextLearn.moveId, 
          moveName: nextLearn.moveName 
        });
      }
    }

    // --- POST-BATTLE PROCESSING ---
    if (isCaught) {
      await persistence.saveCaughtPokemon(trainerSave, wildPokemon, tx);
    }

    const updatedLog = log.appendTurnLog(session.log, session.turnNumber, result.events);

    const updated = await persistence.updateTurnIfCurrent(tx, session.id, session.turnNumber, {
      status: newStatus,
      turnNumber: session.turnNumber + 1,
      playerActivePokemonId: session.playerActivePokemonId,
      playerPokemonData: result.p1State as any,
      playerPartyData: playerPartyData as any,
      opponentPokemonData: result.p2State as any,
      opponentPartyData: opponentPartyData as any,
      log: updatedLog,
    });
    if (!updated) throw new ValidationError('Battle action was already processed. Refresh the battle state.');

    return {
      status: newStatus,
      turnNumber: session.turnNumber,
      events: result.events,
      p1State: result.p1State,
      p2State: result.p2State
    };
  }
}
