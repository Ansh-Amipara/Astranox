import { injectable } from 'tsyringe';
import { Request, Response, NextFunction } from 'express';
import { TrainersService } from './trainers.service';
import { ValidationError } from '../../core/errors/AppError';
import type { PickStarterDto } from './dto/request/PickStarterDto';
import type { SwapSlotsDto } from './dto/request/SwapSlotsDto';
import type { ChangeMovesDto } from './dto/request/ChangeMovesDto';
import type { BoostPotentialDto } from './dto/request/BoostPotentialDto';
import type { BoostIvDto } from './dto/request/BoostIvDto';

@injectable()
export class TrainersController {
  constructor(private service: TrainersService) {}

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
      const dto: PickStarterDto = { speciesId };
      const save = await this.service.pickStarter(userId, dto);
      res.json({ success: true, data: save });
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

  getPokemonById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) throw new ValidationError('User ID missing from request');
      
      const pokemonId = req.params.pokemonId;
      const pokemon = await this.service.getPokemonById(userId, pokemonId);
      res.json({ success: true, data: pokemon });
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

      const evolvedPokemon = await this.service.evolvePokemon(userId, pokemonId, targetSpeciesId);
      res.json({ success: true, data: evolvedPokemon });
    } catch (err) {
      next(err);
    }
  };

  devolvePokemon = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) throw new ValidationError('User ID missing from request');

      const { pokemonId } = req.params;

      const devolvedPokemon = await this.service.devolvePokemon(userId, pokemonId);
      res.json({ success: true, data: devolvedPokemon });
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
      const parsedAmount = Number(amount);

      const result = await this.service.distributeXp(userId, pokemonId, parsedAmount);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };
}

