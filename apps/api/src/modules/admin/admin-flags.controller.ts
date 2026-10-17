import { injectable } from 'tsyringe';
import { Request, Response, NextFunction } from 'express';
import { FeatureFlagService } from '../../core/services/feature-flag.service';
import { prisma } from '../../core/db/prisma';

@injectable()
export class AdminFlagsController {
  constructor(private flagService: FeatureFlagService) {}

  getFlags = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const flags = await this.flagService.getAllFlags();
      res.json({ success: true, data: flags });
    } catch (error) {
      next(error);
    }
  };

  updateFlag = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { key } = req.params;
      const { enabled, reason } = req.body;
      const requestId = (req.headers['x-request-id'] as string) || undefined;

      const flag = await this.flagService.setFlag(key, enabled, req.user!.id);

      await prisma.auditLog.create({
        data: {
          adminId: req.user!.id,
          action: 'FEATURE_FLAG_TOGGLE',
          entityType: 'FEATURE_FLAG',
          entityId: key,
          reason,
          requestId: requestId || null,
          afterValues: { key, enabled },
        },
      });

      res.json({ success: true, data: flag });
    } catch (error) {
      next(error);
    }
  };
}
