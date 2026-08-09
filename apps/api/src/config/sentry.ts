import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { env } from './env';
import { ASTRANOX_VERSION } from '@astranox/constants';;

export function initSentry() {
  if (!env.SENTRY_DSN) {
    console.log('⚠️ SENTRY_DSN not provided. Sentry APM is disabled.');
    return;
  }

  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,
    release: `astranox-backend@${ASTRANOX_VERSION}`,
    integrations: [
      nodeProfilingIntegration(),
    ],
    // Tracing
    tracesSampleRate: env.NODE_ENV === 'production' ? 0.2 : 1.0, 
    // Profiling
    profilesSampleRate: env.NODE_ENV === 'production' ? 0.2 : 1.0, 
  });

  console.log('✅ Sentry APM Initialized');
}
