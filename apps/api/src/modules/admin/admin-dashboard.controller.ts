import { injectable } from 'tsyringe';
import { Request, Response, NextFunction } from 'express';
import { AdminDashboardService } from './admin-dashboard.service';

@injectable()
export class AdminDashboardController {
  constructor(private dashboardService: AdminDashboardService) {}

  getStats = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const stats = await this.dashboardService.getStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  };

  getEconomy = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const report = await this.dashboardService.getEconomyReport();
      res.json({ success: true, data: report });
    } catch (error) {
      next(error);
    }
  };
}
