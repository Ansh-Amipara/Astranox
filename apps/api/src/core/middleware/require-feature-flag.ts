import { Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';
import { FeatureFlagService } from '../services/feature-flag.service';
import { ForbiddenError } from '../errors/AppError';

export const requireFeatureFlag = (flagKey: string) => {
  return async (_req: Request, _res: Response, next: NextFunction) => {
    try {
      const service = container.resolve(FeatureFlagService);
      const isEnabled = await service.isEnabled(flagKey);
      if (!isEnabled) {
        return next(new ForbiddenError(`The '${flagKey}' feature is currently disabled.`));
      }
      next();
    } catch (err) {
      next(err);
    }
  };
};
