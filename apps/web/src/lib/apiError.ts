import type { ApiErrorCode } from '@astranox/types';

export interface ParsedApiError {
  code: ApiErrorCode | string;
  message: string;
  status?: number;
  fields?: Record<string, string>;
  isValidationError: boolean;
}

export function parseApiError(error: unknown): ParsedApiError {
  if (!error) {
    return {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      isValidationError: false,
    };
  }

  const err = error as {
    response?: {
      status?: number;
      data?: {
        error?: {
          code?: string;
          message?: string;
          fields?: Record<string, string>;
        };
        message?: string;
      };
    };
    code?: string;
    message?: string;
    status?: number;
    data?: unknown;
  };

  const status = err.response?.status ?? err.status;
  const errorData = err.response?.data?.error;
  const rawMessage = err.response?.data?.message;

  const code = errorData?.code ?? err.code ?? (status ? `HTTP_${status}` : 'INTERNAL_ERROR');
  const message =
    errorData?.message ??
    rawMessage ??
    err.message ??
    (status && status >= 500 ? 'Something went wrong on our end' : 'Request failed');

  const fields = errorData?.fields;
  const isValidationError = code === 'VALIDATION_ERROR' || !!fields;

  return {
    code,
    message,
    status,
    fields,
    isValidationError,
  };
}
