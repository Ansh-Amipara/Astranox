import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message: { success: false, error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many authentication attempts, please try again later.' } },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

export const gameplayLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 120, // Limit each IP to 120 requests per minute
  message: { success: false, error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many actions, please slow down.' } },
  standardHeaders: true,
  legacyHeaders: false,
});
