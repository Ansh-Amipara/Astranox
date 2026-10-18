import { Request, Response, NextFunction } from 'express';
import * as Sentry from '@sentry/node';
import { AppError, ValidationError, PriceChangedError } from '../errors/AppError';
import { logger } from '../../config/logger';
import { getRequestId } from '../context/request-context';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const requestId = getRequestId() || (req.headers?.['x-request-id'] as string) || undefined;

  if (err instanceof AppError) {
    logger.warn({ code: err.code, message: err.message, requestId });
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(requestId ? { requestId } : {}),
        ...(err instanceof ValidationError && err.fields ? { fields: err.fields } : {}),
        ...(err instanceof PriceChangedError ? { newPrice: err.newPrice, itemKey: err.itemKey } : {}),
      },
    });
  }

  // Handle Prisma Known Request Errors
  const errWithCode = err as { code?: string; meta?: Record<string, unknown> };
  if (err.name === 'PrismaClientKnownRequestError' || (typeof errWithCode.code === 'string' && errWithCode.code.startsWith('P'))) {
    if (errWithCode.code === 'P2002') {
      logger.warn({ code: 'P2002', message: 'Prisma unique constraint failed', requestId });
      return res.status(409).json({
        success: false,
        error: {
          code: 'CONFLICT',
          message: 'Resource already exists',
          ...(requestId ? { requestId } : {}),
        },
      });
    }

    if (errWithCode.code === 'P2025') {
      logger.warn({ code: 'P2025', message: 'Prisma record not found', requestId });
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Resource not found',
          ...(requestId ? { requestId } : {}),
        },
      });
    }
  }

  // Handle express.json() payload errors (e.g., malformed JSON)
  if (err instanceof SyntaxError && 'status' in err && (err as any).status === 400 && 'body' in err) {
    logger.warn({ message: 'Malformed JSON payload', requestId });
    return res.status(400).json({
      success: false,
      error: {
        code: 'BAD_REQUEST',
        message: 'Invalid JSON payload format',
        ...(requestId ? { requestId } : {}),
      },
    });
  }

  // Unexpected errors
  logger.error({ err, requestId });
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
      ...(requestId ? { requestId } : {}),
    },
  });
};
