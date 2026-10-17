import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodTypeAny } from 'zod';
import { ValidationError } from '../errors/AppError';

export interface ValidationSchema {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
}

function extractIssues(issues: any[]): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const issue of issues) {
    const pathSegments = issue.path.map(String);
    let fieldName = pathSegments.join('.');
    if (pathSegments.length > 1 && ['body', 'query', 'params'].includes(pathSegments[0])) {
      fieldName = pathSegments.slice(1).join('.');
    } else if (pathSegments.length === 1 && ['body', 'query', 'params'].includes(pathSegments[0])) {
      fieldName = pathSegments[0];
    } else if (pathSegments.length === 0) {
      fieldName = 'root';
    }

    if (!fields[fieldName]) {
      fields[fieldName] = issue.message;
    }
  }
  return fields;
}

export const validate = (schema: ValidationSchema | ZodTypeAny) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if ('parseAsync' in schema) {
        const objSchema = schema as any;
        const shape = typeof objSchema.shape === 'object' && objSchema.shape !== null
          ? objSchema.shape
          : (typeof objSchema._def?.shape === 'function' ? objSchema._def.shape() : objSchema._def?.shape);

        if (shape && ('body' in shape || 'query' in shape || 'params' in shape)) {
          const result = await schema.safeParseAsync({
            body: req.body,
            query: req.query,
            params: req.params,
          });

          if (!result.success) {
            return next(new ValidationError('Invalid input', extractIssues(result.error.issues)));
          }

          if (result.data && typeof result.data === 'object') {
            if ('body' in result.data) req.body = result.data.body;
            if ('query' in result.data) req.query = result.data.query;
            if ('params' in result.data) req.params = result.data.params;
          }
        } else {
          const result = await schema.safeParseAsync(req.body);
          if (!result.success) {
            return next(new ValidationError('Invalid input', extractIssues(result.error.issues)));
          }
          req.body = result.data;
        }
      } else {
        const issues: any[] = [];
        if (schema.body) {
          const res = await schema.body.safeParseAsync(req.body);
          if (!res.success) {
            issues.push(...res.error.issues.map((iss: any) => ({ ...iss, path: ['body', ...iss.path] })));
          } else {
            req.body = res.data;
          }
        }
        if (schema.query) {
          const res = await schema.query.safeParseAsync(req.query);
          if (!res.success) {
            issues.push(...res.error.issues.map((iss: any) => ({ ...iss, path: ['query', ...iss.path] })));
          } else {
            req.query = res.data;
          }
        }
        if (schema.params) {
          const res = await schema.params.safeParseAsync(req.params);
          if (!res.success) {
            issues.push(...res.error.issues.map((iss: any) => ({ ...iss, path: ['params', ...iss.path] })));
          } else {
            req.params = res.data;
          }
        }

        if (issues.length > 0) {
          return next(new ValidationError('Invalid input', extractIssues(issues)));
        }
      }
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        return next(new ValidationError('Invalid input', extractIssues(error.issues)));
      }
      return next(error);
    }
  };
};

