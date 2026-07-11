import pinoHttp from 'pino-http';
import { logger } from '../../config/logger';

export const httpLogger = pinoHttp({
  logger: logger as any,
  autoLogging: {
    ignore: (req) => {
      // Ignore health checks
      return req.url === '/health';
    }
  }
});
