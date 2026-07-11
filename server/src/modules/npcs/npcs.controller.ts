import { Request, Response, NextFunction } from 'express';
import { NpcsService } from './npcs.service';
import { BattlesService } from '../battles/battles.service';

export class NpcsController {
  private service: NpcsService;
  private battlesService: BattlesService;

  constructor() {
    this.service = new NpcsService();
    this.battlesService = new BattlesService();
  }

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const npcs = await this.service.listNpcs(req.user!.id);
      res.json({ success: true, data: npcs });
    } catch (e) {
      next(e);
    }
  };

  challenge = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const result = await this.battlesService.engageNpc(req.user!.id, id);
      res.json({ success: true, data: result });
    } catch (e) {
      next(e);
    }
  };
}
