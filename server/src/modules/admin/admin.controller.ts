import { Request, Response, NextFunction } from 'express';
import { AdminService } from './admin.service';
import { ValidationError } from '../../common/errors/AppError';

export class AdminController {
  private service: AdminService;

  constructor() {
    this.service = new AdminService();
  }

  getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await this.service.getAllUsers();
      res.json({ success: true, data: users });
    } catch (err) {
      next(err);
    }
  };

  getAllSpecies = async (req: Request, res: Response, next: NextFunction) => {
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

      const save = await this.service.addMoney(id, amount);
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
        throw new ValidationError('speciesId must be a valid number');
      }

      const pokemonLevel = level || 5;

      const pokemon = await this.service.addPokemon(id, speciesId, pokemonLevel, ivs);
      res.json({ success: true, data: pokemon });
    } catch (err) {
      next(err);
    }
  };

  getAllZones = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const zones = await this.service.getAllZones();
      res.json({ success: true, data: zones });
    } catch (err) {
      next(err);
    }
  };

  addZoneEncounter = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const zoneId = parseInt(req.params.zoneId, 10);
      const { speciesId, encounterRate, minIv, maxIv } = req.body;
      
      const encounter = await this.service.addZoneEncounter(zoneId, speciesId, encounterRate, minIv || 0, maxIv || 31);
      res.json({ success: true, data: encounter });
    } catch (err) {
      next(err);
    }
  };

  deleteZoneEncounter = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const encounterId = parseInt(req.params.encounterId, 10);
      await this.service.deleteZoneEncounter(encounterId);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  };
}
