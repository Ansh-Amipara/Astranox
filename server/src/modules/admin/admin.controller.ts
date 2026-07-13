import { Request, Response, NextFunction } from 'express';
import { AdminService } from './admin.service';
import { ValidationError } from '../../common/errors/AppError';

export class AdminController {
  private service: AdminService;

  constructor() {
    this.service = new AdminService();
  }

  getAllUsers = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await this.service.getAllUsers();
      res.json({ success: true, data: users });
    } catch (err) {
      next(err);
    }
  };

  getAllSpecies = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const species = await this.service.getAllSpecies();
      res.json({ success: true, data: species });
    } catch (err) {
      next(err);
    }
  };

  getUserPokemon = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const pokemon = await this.service.getUserPokemon(id);
      res.json({ success: true, data: pokemon });
    } catch (err) {
      next(err);
    }
  };

  addMoney = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { amount } = req.body;

      if (!amount || typeof amount !== 'number') {
        throw new ValidationError('Amount must be a valid number');
      }

      const save = await this.service.addMoney(req.user!.id, id, amount);
      res.json({ success: true, data: save });
    } catch (err) {
      next(err);
    }
  };

  addPokemon = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { speciesId, level, ivs } = req.body;

      if (!speciesId || typeof speciesId !== 'number') {
        throw new ValidationError('Valid speciesId is required');
      }

      if (!level || typeof level !== 'number' || level < 1 || level > 100) {
        throw new ValidationError('Valid level between 1 and 100 is required');
      }

      // Basic validation for custom IVs if provided
      if (ivs) {
        const ivKeys = ['ivHp', 'ivAttack', 'ivDefense', 'ivSpAtk', 'ivSpDef', 'ivSpeed'];
        for (const key of ivKeys) {
          if (ivs[key] !== undefined) {
            if (typeof ivs[key] !== 'number' || ivs[key] < 0 || ivs[key] > 31) {
              throw new ValidationError(`If provided, ${key} must be a number between 0 and 31`);
            }
          }
        }
      }

      const pokemon = await this.service.addPokemon(req.user!.id, id, speciesId, level, ivs);
      res.json({ success: true, data: pokemon });
    } catch (err) {
      next(err);
    }
  };
}
