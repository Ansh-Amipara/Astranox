import { describe, it, expect } from 'vitest';
import { parseApiError } from './apiError';

describe('parseApiError', () => {
  it('returns default error structure for null or undefined error', () => {
    const res1 = parseApiError(null);
    expect(res1.code).toBe('INTERNAL_ERROR');
    expect(res1.message).toBe('An unexpected error occurred');
    expect(res1.isValidationError).toBe(false);

    const res2 = parseApiError(undefined);
    expect(res2.code).toBe('INTERNAL_ERROR');
  });

  it('correctly parses structured API error with fields', () => {
    const apiError = {
      response: {
        status: 400,
        data: {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input',
            fields: {
              username: 'Username is required',
              password: 'Password too short',
            },
          },
        },
      },
    };

    const parsed = parseApiError(apiError);
    expect(parsed.code).toBe('VALIDATION_ERROR');
    expect(parsed.message).toBe('Invalid input');
    expect(parsed.status).toBe(400);
    expect(parsed.isValidationError).toBe(true);
    expect(parsed.fields).toEqual({
      username: 'Username is required',
      password: 'Password too short',
    });
  });

  it('extracts error from response.data.message or plain Error', () => {
    const simpleHttpErr = {
      response: {
        status: 404,
        data: {
          error: {
            code: 'NOT_FOUND',
            message: 'Pokemon not found',
          },
        },
      },
    };
    const parsed1 = parseApiError(simpleHttpErr);
    expect(parsed1.code).toBe('NOT_FOUND');
    expect(parsed1.message).toBe('Pokemon not found');
    expect(parsed1.isValidationError).toBe(false);

    const jsErr = new Error('Network timeout');
    const parsed2 = parseApiError(jsErr);
    expect(parsed2.message).toBe('Network timeout');
    expect(parsed2.code).toBe('INTERNAL_ERROR');
  });
});
