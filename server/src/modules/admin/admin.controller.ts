import { injectable } from 'tsyringe';
import { Request, Response, NextFunction } from 'express';
import { AdminService } from './admin.service';

@injectable()
export class AdminController {
  constructor(private service: AdminService) {}

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
      const { amount, currencyType } = req.body;

      const save = await this.service.addMoney(req.user!.id, id, { amount, currencyType });
      res.json({ success: true, data: save });
    } catch (err) {
      next(err);
    }
  };

  addPokemon = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { speciesId, level, potential, ivs } = req.body;

      const pokemon = await this.service.addPokemon(req.user!.id, id, { speciesId, level, potential, ivs });
      res.json({ success: true, data: pokemon });
    } catch (err) {
      next(err);
    }
  };

  editPokemon = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id, pokemonId } = req.params;
      const { potential, addXp, ivs } = req.body;

      const pokemon = await this.service.editPokemon(req.user!.id, pokemonId, { potential, addXp, ivs });
      res.json({ success: true, data: pokemon });
    } catch (err) {
      next(err);
    }
  };

  clearCache = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.clearCache(req.user!.id);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };
}
