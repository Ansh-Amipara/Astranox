import { Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';
import { FeatureFlagService } from '../services/feature-flag.service';
import { FeatureDisabledError } from '../errors/AppError';

export const requireFeatureFlag = (flagKey: string) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const service = container.resolve(FeatureFlagService);

      // Global maintenance mode check (unless user is ADMIN)
      if (flagKey !== 'maintenanceMode') {
        const isMaintenance = await service.isEnabled('maintenanceMode');
        if (isMaintenance && req.user?.role !== 'ADMIN') {
          return next(
            new FeatureDisabledError(
              'The game is currently in maintenance mode. Please check back later.'
            )
          );
        }
      }

      const isEnabled = await service.isEnabled(flagKey, req.user?.id);
      if (!isEnabled) {
        return next(
          new FeatureDisabledError(`The '${flagKey}' feature is currently disabled.`)
        );
      }
      next();
    } catch (err) {
      next(err);
    }
  };
};

export const requireFlag = requireFeatureFlag;
