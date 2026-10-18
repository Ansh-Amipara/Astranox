import { injectable } from 'tsyringe';
import {
  exploreJoinSchema,
  exploreMoveSchema,
  battleActionIntentSchema,
} from '@astranox/types';
import { ExplorationService } from './exploration.service';
import { WildBattleService } from '../battles/services/wild-battle.service';
import { getIO, verifySocketOwnership } from '../../socket';
import { logger } from '../../config/logger';

@injectable()
export class ExploreGateway {
  constructor(
    private exploreService: ExplorationService,
    private wildBattleService: WildBattleService
  ) {}

  public initialize() {
    const io = getIO();

    io.on('connection', (socket: any) => {
      const user = socket.data?.user || socket.user;
      if (!user) return;

      let lastActionTimestamp = 0;

      // Rate limit helper
      const checkRateLimit = (minMs: number = 150): boolean => {
        const now = Date.now();
        if (now - lastActionTimestamp < minMs) {
          socket.emit('error', {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Actions submitted too quickly. Please wait a moment.',
          });
          return false;
        }
        lastActionTimestamp = now;
        return true;
      };

      // 1. explore:join
      socket.on('explore:join', async (data: unknown) => {
        try {
          if (!verifySocketOwnership(socket, user.id)) return;

          const parsed = exploreJoinSchema.safeParse(data ?? {});
          if (!parsed.success) {
            socket.emit('error:validation', {
              code: 'VALIDATION_ERROR',
              message: 'Invalid explore join parameters',
              fields: this.formatZodIssues(parsed.error.issues),
            });
            return;
          }

          const state = await this.exploreService.getOrInitState(user.id, parsed.data.mapId);
          socket.emit('explore:state', state);
        } catch (err: any) {
          logger.error(`[ExploreGateway] Error in explore:join for user ${user.id}:`, err);
          socket.emit('error', {
            code: err.code || 'EXPLORE_ERROR',
            message: err.message || 'Failed to join map.',
          });
        }
      });

      // 2. explore:move
      socket.on('explore:move', async (data: unknown) => {
        try {
          if (!verifySocketOwnership(socket, user.id)) return;
          if (!checkRateLimit(120)) return;

          const parsed = exploreMoveSchema.safeParse(data);
          if (!parsed.success) {
            socket.emit('error:validation', {
              code: 'VALIDATION_ERROR',
              message: 'Invalid explore move parameters',
              fields: this.formatZodIssues(parsed.error.issues),
            });
            return;
          }

          const result = await this.exploreService.move(
            user.id,
            parsed.data.direction,
            parsed.data.seq
          );

          if (result.rejected) {
            socket.emit('explore:rejected', {
              seq: result.seq,
              position: result.position,
              reason: result.reason,
            });
            return;
          }

          socket.emit('explore:moved', {
            seq: result.seq,
            position: result.position,
            mapId: result.mapId,
          });

          // If an encounter was triggered on server, emit encounter:start
          if (result.encounter) {
            socket.emit('encounter:start', result.encounter);
          }
        } catch (err: any) {
          logger.error(`[ExploreGateway] Error in explore:move for user ${user.id}:`, err);
          socket.emit('error', {
            code: err.code || 'EXPLORE_MOVE_ERROR',
            message: err.message || 'Failed to process move.',
          });
        }
      });

      // 3. battle:action
      socket.on('battle:action', async (data: unknown) => {
        try {
          if (!verifySocketOwnership(socket, user.id)) return;
          if (!checkRateLimit(250)) return;

          const parsed = battleActionIntentSchema.safeParse(data);
          if (!parsed.success) {
            socket.emit('error:validation', {
              code: 'VALIDATION_ERROR',
              message: 'Invalid battle action parameters',
              fields: this.formatZodIssues(parsed.error.issues),
            });
            return;
          }

          const res = await this.wildBattleService.submitAction(
            user.id,
            parsed.data.battleId,
            parsed.data.action
          );

          socket.emit('battle:update', {
            battleId: parsed.data.battleId,
            events: res.events,
            state: res.state,
          });

          if (res.outcome && res.finalResult) {
            socket.emit('battle:end', {
              outcome: res.outcome,
              rewards: res.finalResult.rewards,
              capturedPokemon: res.finalResult.capturedPokemon,
              respawnPosition: res.finalResult.respawnPosition,
            });
          }
        } catch (err: any) {
          logger.error(`[ExploreGateway] Error in battle:action for user ${user.id}:`, err);
          socket.emit('error', {
            code: err.code || 'BATTLE_ACTION_ERROR',
            message: err.message || 'Failed to submit battle action.',
          });
        }
      });
    });

    logger.info('ExploreGateway initialized');
  }

  private formatZodIssues(issues: any[]): Record<string, string> {
    const fields: Record<string, string> = {};
    for (const issue of issues) {
      const key = issue.path.join('.') || 'root';
      fields[key] = issue.message;
    }
    return fields;
  }
}
