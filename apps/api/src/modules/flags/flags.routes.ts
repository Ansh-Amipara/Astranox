import { Router, Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';
import { FeatureFlagService } from '../../core/services/feature-flag.service';

const router = Router();

router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const service = container.resolve(FeatureFlagService);
    const flags = await service.getAllFlags();
    res.json({
      success: true,
      data: flags,
    });
  } catch (err) {
    next(err);
  }
});

export const flagsRoutes = router;
