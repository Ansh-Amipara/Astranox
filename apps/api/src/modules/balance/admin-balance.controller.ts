import { injectable } from 'tsyringe';
import { Request, Response, NextFunction } from 'express';
import { BalanceService } from './balance.service';
import { BalanceSection } from '@astranox/constants';

@injectable()
export class AdminBalanceController {
  constructor(private balanceService: BalanceService) {}

  getAllSections = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const overview = await this.balanceService.getAllSectionsOverview();
      res.json({ success: true, data: overview });
    } catch (err) {
      next(err);
    }
  };

  getSection = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const section = req.params.section as BalanceSection;
      const overview = await this.balanceService.getSectionOverview(section);
      res.json({ success: true, data: overview });
    } catch (err) {
      next(err);
    }
  };

  saveDraft = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const section = req.params.section as BalanceSection;
      const adminId = (req as any).user?.id || 'admin';
      const { values } = req.body;

      const result = await this.balanceService.saveDraft(adminId, section, values);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  previewDraft = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const section = req.params.section as BalanceSection;
      const preview = await this.balanceService.previewDraft(section);
      res.json({ success: true, data: preview });
    } catch (err) {
      next(err);
    }
  };

  publishDraft = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const section = req.params.section as BalanceSection;
      const adminId = (req as any).user?.id || 'admin';
      const { reason, confirmExtreme } = req.body;
      const requestId = (req as any).id;

      const result = await this.balanceService.publishDraft(
        adminId,
        section,
        reason,
        confirmExtreme,
        requestId
      );
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  rollback = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const section = req.params.section as BalanceSection;
      const adminId = (req as any).user?.id || 'admin';
      const { targetVersion, reason } = req.body;
      const requestId = (req as any).id;

      const result = await this.balanceService.rollback(
        adminId,
        section,
        targetVersion,
        reason,
        requestId
      );
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  resetToDefaults = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const section = req.params.section as BalanceSection;
      const adminId = (req as any).user?.id || 'admin';
      const { reason } = req.body;
      const requestId = (req as any).id;

      const result = await this.balanceService.resetToDefaults(
        adminId,
        section,
        reason,
        requestId
      );
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  getHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const section = req.params.section as BalanceSection;
      const history = await this.balanceService.getHistory(section);
      res.json({ success: true, data: history });
    } catch (err) {
      next(err);
    }
  };
}
