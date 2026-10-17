import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError, ForbiddenError } from '../errors/AppError';
import { verifyAccessToken } from '../utils/jwt';
import type { UserPayload } from '@astranox/types';;

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

export const requireAuth = (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Missing or invalid authorization header'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (err) {
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
