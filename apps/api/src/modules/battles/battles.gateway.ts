import { injectable } from 'tsyringe';
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

      socket.on('battle:submit_turn', async (data: { action: string }) => {
        try {
          // Process the turn using the existing BattlesService
          const result = await this.battlesService.submitTurn(user.id, { action: data.action });
          
          // Emit the state update back to the specific user's room
          io.to(`user:${user.id}`).emit('battle:state_update', result);
        } catch (error: any) {
          logger.error(`Error processing turn for user ${user.id}:`, error);
          socket.emit('battle:error', { message: error.message });
        }
      });
      
      socket.on('battle:leave', async () => {
         // Logic to cleanly leave or forfeit a battle could go here
         logger.info(`User ${user.id} left the battle screen.`);
      });
    });

    logger.info('BattlesGateway initialized');
  }
}
