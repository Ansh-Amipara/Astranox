import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  API_PORT: z.string().default('4005'),
  DATABASE_URL: z.string().url(),
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  REDIS_URL: z.string().url().default('redis://localhost:6379'),
  CORS_ORIGIN: z.string().url().or(z.literal('true')).optional(),
  WEB_ORIGINS: z.string().default('http://localhost:5173,http://localhost:4001'),
  COOKIE_DOMAIN: z.string().optional(),
  TRUST_PROXY: z.string().default('1'),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  SENTRY_DSN: z.string().url().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment configuration:');
  for (const issue of parsed.error.issues) {
    const field = issue.path.join('.') || 'root';
    console.error(`   - ${field}: ${issue.message}`);
  }
  process.exit(1);
}

const rawOrigins = parsed.data.WEB_ORIGINS 
  ? parsed.data.WEB_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean)
  : [];
if (parsed.data.CORS_ORIGIN && parsed.data.CORS_ORIGIN !== 'true' && !rawOrigins.includes(parsed.data.CORS_ORIGIN)) {
  rawOrigins.push(parsed.data.CORS_ORIGIN);
}

export const env = {
  ...parsed.data,
  allowedOrigins: rawOrigins,
};
