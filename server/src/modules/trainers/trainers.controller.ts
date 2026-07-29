import { Request, Response, NextFunction } from 'express';
import { TrainersService } from './trainers.service';
import { ValidationError } from '../../core/errors/AppError';
import type { PickStarterDto } from './dto/request/PickStarterDto';
import type { SwapSlotsDto } from './dto/request/SwapSlotsDto';
import type { ChangeMovesDto } from './dto/request/ChangeMovesDto';
import type { BoostPotentialDto } from './dto/request/BoostPotentialDto';
import type { BoostIvDto } from './dto/request/BoostIvDto';

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

  getAllPokemon = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) throw new ValidationError('User ID missing from request');
      
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 20;

      const result = await this.service.getAllPokemon(userId, page, limit);
      res.json({ success: true, data: result.data, meta: { total: result.total, page, limit } });
    } catch (err) {
      next(err);
    }
  };

  removeFromParty = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) throw new ValidationError('User ID missing from request');
      
      const pokemonId = req.params.pokemonId;
      await this.service.removeFromParty(userId, pokemonId);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  };

  addToParty = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) throw new ValidationError('User ID missing from request');
      
      const pokemonId = req.params.pokemonId;
      const position = req.body.position;
      
      if (typeof position !== 'number' || position < 0 || position > 5) {
        throw new ValidationError('Valid party position (0-5) is required');
      }

      await this.service.addToParty(userId, pokemonId, position);
      res.json({ success: true });
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

  smeltPokemon = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) throw new ValidationError('User ID missing from request');

      const { pokemonId } = req.params;
      if (!pokemonId) throw new ValidationError('Pokemon ID is required');

      const rewards = await this.service.smeltPokemon(userId, pokemonId);
      res.json({ success: true, data: rewards });
    } catch (err) {
      next(err);
    }
  };

  evolvePokemon = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) throw new ValidationError('User ID missing from request');

      const { pokemonId } = req.params;
      const { targetSpeciesId } = req.body;
      if (!pokemonId) throw new ValidationError('Pokemon ID is required');

      const evolvedPokemon = await this.service.evolvePokemon(userId, pokemonId, targetSpeciesId);
      res.json({ success: true, data: evolvedPokemon });
    } catch (err) {
      next(err);
    }
  };

  boostPotential = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) throw new ValidationError('User ID missing from request');

      const { pokemonId } = req.params;
      const { itemId } = req.body;
      
      if (!pokemonId || !itemId) {
        throw new ValidationError('Pokemon ID and Item ID are required');
      }

      const dto: BoostPotentialDto = { itemId };
      const boostedPokemon = await this.service.boostPotential(userId, pokemonId, dto);
      res.json({ success: true, data: boostedPokemon });
    } catch (err) {
      next(err);
    }
  };

  boostIv = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) throw new ValidationError('User ID missing from request');

      const { pokemonId } = req.params;
      const { itemId, stat } = req.body;
      
      if (!pokemonId || !itemId || !stat) {
        throw new ValidationError('Pokemon ID, Item ID, and Stat are required');
      }

      const dto: BoostIvDto = { itemId, stat };
      const boostedPokemon = await this.service.boostIv(userId, pokemonId, dto);
      res.json({ success: true, data: boostedPokemon });
    } catch (err) {
      next(err);
    }
  };

  distributeXp = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) throw new ValidationError('User ID missing from request');

      const { pokemonId, amount } = req.body;
      if (!pokemonId || !amount) {
        throw new ValidationError('Pokemon ID and amount are required');
      }

      const parsedAmount = parseInt(amount, 10);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        throw new ValidationError('Amount must be a positive number');
      }

      const result = await this.service.distributeXp(userId, pokemonId, parsedAmount);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };
}

