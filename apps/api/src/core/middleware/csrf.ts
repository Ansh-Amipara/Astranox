import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../errors/AppError';
import { env } from '../../config/env';

/**
 * CSRF Protection Middleware
 *
 * Combines SameSite=Lax/Strict cookies with strict Origin/Referer header verification
 * for state-changing HTTP methods (POST, PUT, PATCH, DELETE).
 *
 * Rationale:
 * - SameSite=Lax prevents cross-site requests from sending cookies on cross-origin POSTs.
 * - Origin header validation verifies that state-changing requests originate strictly
 *   from authorized frontend domains (WEB_ORIGINS), defeating CSRF attacks without
 *   requiring synchronized session tokens.
 */
export const verifyCsrf = (req: Request, _res: Response, next: NextFunction) => {
  // Safe HTTP methods do not change state
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const origin = req.headers.origin;
  const referer = req.headers.referer;

  // If no origin or referer (e.g. CLI, server-to-server, or test runner), allow
  if (!origin && !referer) {
    return next();
  }

  const requestOrigin = origin || (referer ? new URL(referer).origin : null);

  if (requestOrigin) {
    const isAllowed = env.allowedOrigins.some(
      (allowed) => allowed === requestOrigin || allowed === '*'
    );

    if (!isAllowed) {
      return next(
        new ForbiddenError(
          `CSRF check failed: Origin '${requestOrigin}' is not authorized`
        )
      );
    }
  }

  next();
};
