                                                                                                                                    /**
 * Sentry initialization — centralized, environment-safe.
 *
 * Call `initSentry()` once at app startup (before React renders).
 * Does nothing if:
 *   - DSN is not provided (local dev without .env)
 *   - `import.meta.env.DEV` is true and DSN is missing
 *
 * Configuration:
 *   Set VITE_SENTRY_DSN in your .env for production/staging.
 *   Set VITE_SENTRY_ENVIRONMENT for "production" | "staging" | "development".
 */
import * as Sentry from "@sentry/react";

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN as string | undefined;
const SENTRY_ENVIRONMENT = (import.meta.env.VITE_SENTRY_ENVIRONMENT as string) || "development";

let initialized = false;

export function initSentry(): void {
  if (initialized) return;

  // Guard: skip initialization without a valid DSN
  if (!SENTRY_DSN || SENTRY_DSN === "YOUR_SENTRY_DSN_HERE") {
    if (import.meta.env.DEV) {
      console.info("[Sentry] No DSN configured — skipping initialization (dev mode).");
    }
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: SENTRY_ENVIRONMENT,
    // Only send in production/staging — silent in dev
    enabled: !import.meta.env.DEV,
    // Capture 10% of transactions for performance monitoring
    tracesSampleRate: SENTRY_ENVIRONMENT === "production" ? 0.1 : 1.0,
    // Session replay — disabled by default, enable when ready
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    // Filter out noisy browser extension errors
    beforeSend(event) {
      const frames = event.exception?.values?.[0]?.stacktrace?.frames;
      if (frames?.some((f) => f.filename?.includes("chrome-extension://"))) {
        return null;
      }
      return event;
    },
  });

  initialized = true;
}

/**
 * Returns true if Sentry is initialized and ready to receive events.
 */
export function isSentryReady(): boolean {
  return initialized;
}
