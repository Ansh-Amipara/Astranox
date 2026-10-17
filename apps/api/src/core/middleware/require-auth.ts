import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError, ForbiddenError } from '../errors/AppError';
import { verifyAccessToken } from '../utils/jwt';
import type { UserPayload } from '@astranox/types';

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

export const requireAuth = (req: Request, _res: Response, next: NextFunction) => {
  const cookieToken = req.cookies?.accessToken;
  const authHeader = req.headers.authorization;
  const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  const token = cookieToken || headerToken;

  if (!token) {
    return next(new UnauthorizedError('Missing authentication token'));
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch {
    return next(new UnauthorizedError('Token expired or invalid'));
  }
};

export const requireRole = (allowedRoles: ('ADMIN' | 'MODERATOR' | 'USER')[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new ForbiddenError(`Access restricted to: ${allowedRoles.join(', ')}`));
    }

    next();
  };
};

export const requireAdmin = requireRole(['ADMIN']);
export const requireStaff = requireRole(['ADMIN', 'MODERATOR']);
