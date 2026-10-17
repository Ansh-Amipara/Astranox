import { Request, Response, NextFunction } from 'express';
import * as Sentry from '@sentry/node';
import { AppError, ValidationError } from '../errors/AppError';
import { logger } from '../../config/logger';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof AppError) {
    logger.warn({ code: err.code, message: err.message });
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err instanceof ValidationError && err.fields ? { fields: err.fields } : {}),
      },
    });
  }

  // Handle Prisma Known Request Errors
  const errWithCode = err as { code?: string; meta?: Record<string, unknown> };
  if (err.name === 'PrismaClientKnownRequestError' || (typeof errWithCode.code === 'string' && errWithCode.code.startsWith('P'))) {
    if (errWithCode.code === 'P2002') {
      logger.warn({ code: 'P2002', message: 'Prisma unique constraint failed' });
      return res.status(409).json({
        success: false,
        error: {
          code: 'CONFLICT',
          message: 'Resource already exists',
        },
      });
    }

    if (errWithCode.code === 'P2025') {
      logger.warn({ code: 'P2025', message: 'Prisma record not found' });
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Resource not found',
        },
      });
    }
  }

  // Handle express.json() payload errors (e.g., malformed JSON)
  if (err instanceof SyntaxError && 'status' in err && (err as any).status === 400 && 'body' in err) {
    logger.warn('Malformed JSON payload');
    return res.status(400).json({
      success: false,
      error: {
        code: 'BAD_REQUEST',
        message: 'Invalid JSON payload format',
      },
    });
  }

  // Unexpected errors
  logger.error(err);
  try {
    Sentry.captureException(err);
  } catch {
    // Ignore sentry capture failure
  }

  return res.status((err as any).status || 500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    },
  });
};

