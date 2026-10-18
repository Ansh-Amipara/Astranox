import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import * as Sentry from '@sentry/node';
import { requestContext } from '../context/request-context';

const REQUEST_ID_REGEX = /^[a-zA-Z0-9_-]{1,64}$/;

export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const incoming = req.headers['x-request-id'];
  let requestId: string;

  if (typeof incoming === 'string' && REQUEST_ID_REGEX.test(incoming)) {
    requestId = incoming;
  } else {
    requestId = randomUUID();
  }

  req.headers['x-request-id'] = requestId;
  res.setHeader('X-Request-Id', requestId);

  try {
    Sentry.setTag('requestId', requestId);
  } catch {
    // Ignore sentry setup failure in test/offline env
  }

  requestContext.run(
    {
      requestId,
      ip: req.ip,
      userId: req.user?.id,
    },
    () => {
      next();
    }
  );
};
