import { Request, Response, NextFunction } from 'express';
import { MapService } from './map.service';
import { z } from 'zod';


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
}
