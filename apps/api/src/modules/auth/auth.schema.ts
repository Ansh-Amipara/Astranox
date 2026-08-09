import { z } from 'zod';
import { registerSchema, loginSchema, updateProfileSchema } from '@astranox/types';;

export const registerRouteSchema = z.object({
  body: registerSchema
});

export const loginRouteSchema = z.object({
  body: loginSchema
});

export const updateProfileRouteSchema = z.object({
  body: updateProfileSchema
});
