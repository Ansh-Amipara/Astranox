import { injectable } from 'tsyringe';
import { socketSubmitTurnSchema } from '@astranox/types';
import { BattlesService } from './battles.service';
import { getIO } from '../../socket';
import { logger } from '../../config/logger';

@injectable()
export class BattlesGateway {
  constructor(private battlesService: BattlesService) {}

  public initialize() {
    const io = getIO();

    io.on('connection', (socket: any) => {
      const user = socket.user;
      if (!user) return;

      let lastTurnTimestamp = 0;

      socket.on('battle:submit_turn', async (data: unknown) => {
        try {
          // Per-socket rate limiting (minimum 300ms between turn submissions)
          const now = Date.now();
          if (now - lastTurnTimestamp < 300) {
            socket.emit('error', {
              code: 'RATE_LIMIT_EXCEEDED',
              message: 'Turn actions submitted too quickly. Please wait a moment.',
            });
            return;
          }
          lastTurnTimestamp = now;

          // Validate payload with shared schema
          const parsed = socketSubmitTurnSchema.safeParse(data);
          if (!parsed.success) {
            const fields: Record<string, string> = {};
            for (const issue of parsed.error.issues) {
              const key = issue.path.join('.') || 'root';
              fields[key] = issue.message;
            }
            socket.emit('error:validation', {
              code: 'VALIDATION_ERROR',
              message: 'Invalid battle turn payload',
              fields,
            });
            return;
          }

          // Process the turn using the existing BattlesService
          const result = await this.battlesService.submitTurn(user.id, { action: parsed.data.action });
          
          // Emit the state update back to the specific user's room
          io.to(`user:${user.id}`).emit('battle:state_update', result);
        } catch (error: any) {
          logger.error(`Error processing turn for user ${user.id}:`, error);
          socket.emit('error', {
            code: error.code || 'BATTLE_ERROR',
            message: error.message || 'Failed to submit battle turn',
          });
        }
      });
      
      socket.on('battle:leave', async () => {
         logger.info(`User ${user.id} left the battle screen.`);
      });
    });

    logger.info('BattlesGateway initialized');
  }
}

