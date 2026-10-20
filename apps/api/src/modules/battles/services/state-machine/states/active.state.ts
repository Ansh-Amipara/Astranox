import { Prisma, BattleSession, TrainerSave, BattleStatus } from '@prisma/client';
import { IBattleState, StateMachineServices } from '../battle-state.interface';
import { ValidationError } from '../../../../../core/errors/AppError';
import { BattleAction } from '../../../../../game/battle-state/types';
import { getBallBonus } from '../../../../../game/battle/catch-math';
import { EventsService } from '../../../../events/events.service';
import { logger } from '../../../../../config/logger';

import { container } from 'tsyringe';

const eventsService = container.resolve(EventsService);

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

      const updated = await persistence.updateTurnIfCurrent(session.trainerId, session.turnNumber, {
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
          type: playerMoveData.type.name,
          damageClass: playerMoveData.damageClass as any
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
      const faintResult = await reward.processFaintRewards(result, wildPokemon, tx, session.battleType, session.trainerId, session.balanceVersion);
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
          
          // Mega / G-Max unlock logic
          const defeatedSpeciesIds = opponentPartyData.map((p: any) => p.speciesId);
          if (!defeatedSpeciesIds.includes(wildPokemon.speciesId)) {
            defeatedSpeciesIds.push(wildPokemon.speciesId);
          }
          const unlockableSpecies = await tx.species.findMany({
            where: {
              id: { in: defeatedSpeciesIds },
              OR: [ 
                { isMega: true }, 
                { isGmax: true },
                { evolvesFrom: { evolveByBattle: true } }
              ]
            },
            select: { id: true, name: true, isMega: true, isGmax: true }
          });

          let unlockedFormsUpdate = {};
          if (unlockableSpecies.length > 0) {
            const currentSaveForForms = await tx.trainerSave.findUnique({ where: { id: session.trainerId } });
            const currentUnlocked = (currentSaveForForms as any)?.unlockedForms || [];
            
            const newUnlocked = Array.from(new Set([...currentUnlocked, ...unlockableSpecies.map((s: any) => s.id)]));
            unlockedFormsUpdate = { unlockedForms: newUnlocked };

            for (const s of unlockableSpecies) {
              if (!currentUnlocked.includes(s.id)) {
                result.events.push({
                  type: 'text',
                  text: `Unlocked ${s.isMega ? 'Mega' : s.isGmax ? 'G-Max' : 'Evolution'} Form for ${s.name.split('-')[0].toUpperCase()}!`
                });
              }
            }
          }
          
          let coinsToGive = 0;
          let storedXpToGive = 0;
          const baseLevel = wildPokemon.level || 5;

          if (wildPokemon.isRankExam) {
            coinsToGive = wildPokemon.examinerCoins ? Number(wildPokemon.examinerCoins) : 0;
            storedXpToGive = wildPokemon.examinerXp ? Number(wildPokemon.examinerXp) : 0;
          } else if (session.battleType !== 'TOWER' && session.battleType !== 'RIFT') {
            coinsToGive = session.battleType === 'NPC' ? baseLevel * 30 : baseLevel * 10;
            if (session.battleType === 'NPC') {
              const { getExpYield } = require('../../../../../game/battle/level-math');
              storedXpToGive = opponentPartyData.reduce((sum: number, p: any) => sum + getExpYield(p.baseExp || 100, p.level || 5), 0);
            }
          }

          if (coinsToGive > 0 || storedXpToGive > 0 || (wildPokemon.isRankExam && wildPokemon.targetRank) || Object.keys(unlockedFormsUpdate).length > 0) {
             const currentSave = await tx.trainerSave.findUnique({ where: { id: session.trainerId } });
             
             await tx.trainerSave.update({
               where: { id: session.trainerId },
               data: {
                 ...(wildPokemon.isRankExam && wildPokemon.targetRank ? { rank: wildPokemon.targetRank as any } : {}),
                 ...(coinsToGive > 0 ? { astralCoins: (currentSave?.astralCoins || 0) + coinsToGive } : {}),
                 ...(storedXpToGive > 0 ? { storedXp: (currentSave?.storedXp || 0) + storedXpToGive } : {}),
                 ...unlockedFormsUpdate
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

          if (session.battleType === 'TOWER') {
             result.events.push({
               type: 'tower_cleared',
               message: `Floor Cleared! Click Return to claim Infinity Coins.`
             });
          } else if (session.battleType === 'RIFT') {
            const riftState = await tx.riftDungeonState.findFirst({ where: { trainerId: session.trainerId, currentRunStartedAt: { not: null } } });
            if (riftState && riftState.currentEncounterId) {
              const encounter = await tx.riftEncounter.findUnique({ where: { id: riftState.currentEncounterId } });
              const infinityCoins = encounter && (encounter.reward as any)?.infinityCoins ? (encounter.reward as any).infinityCoins : 0;
              if (infinityCoins > 0) {
                result.events.push({
                  type: 'text',
                  text: `Battle Won! Reward: +${infinityCoins} Infinity Coins!`
                });
              }
            }
            result.events.push({
               type: 'text',
               text: `Rift Floor Cleared! Click Return to proceed.`
             });
          }

          if (wildPokemon.isRankExam && wildPokemon.targetRank) {

            if (wildPokemon.examinerItems && Array.isArray(wildPokemon.examinerItems)) {
              for (const rawItemName of wildPokemon.examinerItems) {
                try {
                  const normalizedId = rawItemName
                    .toLowerCase()
                    .replace(/\+/g, '-plus')
                    .replace(/-\s*/g, '-minus-')
                    .replace(/--+/g, '-')
                    .replace(/\s+/g, '-');
                  let dbItem = await tx.item.findUnique({ where: { id: normalizedId } });
                  if (!dbItem) {
                    dbItem = await tx.item.findFirst({ where: { name: { equals: rawItemName, mode: 'insensitive' } } });
                  }
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
                  logger.error({ err: itemErr }, 'Failed to grant examiner item reward');
                }
              }
            }

            result.events.push({
              type: 'rank_promotion',
              rank: wildPokemon.targetRank,
              message: `Rank Exam Passed! Promoted to ${wildPokemon.targetRank.replace('_MINUS_RANK', '-').replace('_PLUS_RANK', '+').replace('_RANK', '')} Rank!`
            });
          }
        }
      }
    }



    // --- POST-BATTLE PROCESSING ---
    if (isCaught) {
      await persistence.saveCaughtPokemon(trainerSave, wildPokemon, tx);
      await eventsService.emitEvent(session.trainerId, 'CAPTURE_POKEMON', { 
        types: wildPokemon.types || (wildPokemon.species && wildPokemon.species.types) || [] 
      }).catch(e => logger.error({ err: e }, 'Failed to emit CAPTURE_POKEMON event'));
    } else if (newStatus === BattleStatus.WON && session.battleType === 'WILD') {
      await eventsService.emitEvent(session.trainerId, 'DEFEAT_WILD_POKEMON', { 
        types: wildPokemon.types || (wildPokemon.species && wildPokemon.species.types) || [] 
      }).catch(e => logger.error({ err: e }, 'Failed to emit DEFEAT_WILD_POKEMON event'));
    }

    const updatedLog = log.appendTurnLog(session.log, session.turnNumber, result.events);

    const updated = await persistence.updateTurnIfCurrent(session.trainerId, session.turnNumber, {
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
      p2State: result.p2State,
      playerPartyData,
      opponentPartyData
    };
  }
}
