import { Request, Response, NextFunction } from 'express';
import { TrainersService } from './trainers.service';
import { ValidationError } from '../../common/errors/AppError';
import type { PickStarterDto } from './dto/request/PickStarterDto';
import type { SwapSlotsDto } from './dto/request/SwapSlotsDto';
import type { ChangeMovesDto } from './dto/request/ChangeMovesDto';

export class TrainersController {
  private service: TrainersService;

  constructor() {
    this.service = new TrainersService();
  }

  getMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) throw new ValidationError('User ID missing from request');

      const save = await this.service.getMySave(userId);
      res.json({ success: true, data: save });
    } catch (err) {
      next(err);
    }
  };

  pickStarter = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) throw new ValidationError('User ID missing from request');

      const { speciesId } = req.body;
      if (!speciesId || typeof speciesId !== 'number') {
        throw new ValidationError('speciesId must be a valid number');
      }

      const dto: PickStarterDto = { speciesId };
      const save = await this.service.pickStarter(userId, dto);
      res.json({ success: true, data: save });
    } catch (err) {
      next(err);
    }
  };

  getBox = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) throw new ValidationError('User ID missing from request');
      
      const boxNumber = parseInt(req.params.boxNumber, 10);
      if (isNaN(boxNumber) || boxNumber < 0 || boxNumber > 31) {
        throw new ValidationError('Invalid box number');
      }

      const box = await this.service.getBox(userId, boxNumber);
      res.json({ success: true, data: box });
    } catch (err) {
      next(err);
    }
  };

  swapSlots = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) throw new ValidationError('User ID missing from request');
      
      const { from, to } = req.body;
      if (!from || !to) {
        throw new ValidationError('from and to slots are required');
      }

      const dto: SwapSlotsDto = { from, to };
      await this.service.swapSlots(userId, dto);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  };

  getAllMoves = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const moves = await this.service.getAllMoves();
      res.json({ success: true, data: moves });
    } catch (err) {
      next(err);
    }
  };

  changeMoves = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) throw new ValidationError('User ID missing from request');
      
      const { pokemonId } = req.params;
      const { moves } = req.body;
      
      if (!pokemonId || !moves) {
        throw new ValidationError('pokemonId and moves array are required');
      }

      const dto: ChangeMovesDto = { moves };
      await this.service.changeMoves(userId, pokemonId, dto);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  };

  releasePokemon = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) throw new ValidationError('User ID missing from request');

      const { pokemonId } = req.params;
      if (!pokemonId) throw new ValidationError('Pokemon ID is required');

      await this.service.releasePokemon(userId, pokemonId);
      res.json({ success: true, data: { released: true } });
    } catch (err) {
      next(err);
    }
  };

  evolvePokemon = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) throw new ValidationError('User ID missing from request');

      const { pokemonId } = req.params;
      if (!pokemonId) throw new ValidationError('Pokemon ID is required');

      const result = await this.service.evolvePokemon(userId, pokemonId);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };
  equipItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) throw new ValidationError('User ID missing from request');

      const { pokemonId } = req.params;
      const { itemId } = req.body;
      if (!pokemonId || !itemId) throw new ValidationError('Pokemon ID and Item ID are required');

      const result = await this.service.equipItem(userId, pokemonId, itemId);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  unequipItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) throw new ValidationError('User ID missing from request');

      const { pokemonId } = req.params;
      if (!pokemonId) throw new ValidationError('Pokemon ID is required');

      const result = await this.service.unequipItem(userId, pokemonId);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };
}
