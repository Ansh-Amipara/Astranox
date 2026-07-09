import { Request, Response, NextFunction } from 'express';
import { MapService } from './map.service';
import { z } from 'zod';

const exploreSchema = z.object({
  zoneId: z.number().int().positive(),
});

export class MapController {
  private service: MapService;

  constructor() {
    this.service = new MapService();
  }

  getZones = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.getMapData();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  explore = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = exploreSchema.parse(req.body);
      const result = await this.service.exploreZone(parsed.zoneId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };
}
