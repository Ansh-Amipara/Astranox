import { Request, Response, NextFunction } from 'express';
import pinoHttp from 'pino-http';
import { logger } from '../../config/logger';
import { env } from '../../config/env';

const pinoMiddleware = pinoHttp({
  logger: logger as any,
  genReqId: (req) => (req.headers['x-request-id'] as string) || (req as any).id,
  customProps: (req) => ({
    requestId: req.headers['x-request-id'],
    userId: (req as any).user?.id,
  }),
  autoLogging: {
    ignore: (req) => {
      // Ignore health checks
      return req.url === '/health';
    },
  },
});

export const httpLogger = (req: Request, res: Response, next: NextFunction) => {
  if (env.NODE_ENV === 'test') {
    return next();
  }
  return pinoMiddleware(req, res, next);
};
