import { Request, Response, NextFunction } from 'express';
import { TradesService } from './trades.service';
import { ValidationError } from '../../core/errors/AppError';
import type { RequestTradeDto } from './dto/request/RequestTradeDto';

export class TradesController {
  private service: TradesService;

  constructor() {
    this.service = new TradesService();
  }

  toggleForTrade = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const pokemonId = req.params.id;
      const userId = (req as any).user.id;

      const updated = await this.service.toggleForTrade(userId, pokemonId);
      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  };

  getTradeablePokemon = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const targetUserId = req.params.userId;
      const pokemon = await this.service.getTradeablePokemon(targetUserId);
      res.json({ success: true, data: pokemon });
    } catch (err) {
      next(err);
    }
  };

  requestTrade = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { targetUserId, offeredPokemonId, requestedPokemonId } = req.body;
      const userId = (req as any).user.id;

      const dto: RequestTradeDto = { targetUserId, offeredPokemonId, requestedPokemonId };
      const trade = await this.service.requestTrade(userId, dto);
      res.json({ success: true, data: trade });
    } catch (err) {
      next(err);
    }
  };

  acceptTrade = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tradeId = req.params.id;
      const userId = (req as any).user.id;

      const result = await this.service.acceptTrade(userId, tradeId);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  rejectTrade = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tradeId = req.params.id;
      const userId = (req as any).user.id;

      const result = await this.service.rejectTrade(userId, tradeId);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  getIncomingTrades = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;
      const trades = await this.service.getIncomingTrades(userId);
      res.json({ success: true, data: trades });
    } catch (err) {
      next(err);
    }
  };

  getOutgoingTrades = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;
      const trades = await this.service.getOutgoingTrades(userId);
      res.json({ success: true, data: trades });
    } catch (err) {
      next(err);
    }
  };
}
