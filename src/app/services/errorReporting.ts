/**
 * Centralized error reporting service.
 * All error boundaries and global handlers funnel through here.
 * Routes to Sentry when initialized, logs to console in dev.
 */
import * as Sentry from "@sentry/react";
import { isSentryReady } from "./sentryInit";

interface ErrorContext {
  boundary: string;
  componentStack?: string;
  extra?: Record<string, unknown>;
}

/**
 * Report an error from any error boundary or catch handler.
 * Safe to call in any environment.
 */
export function captureException(error: Error, context: ErrorContext): void {
  if (import.meta.env.DEV) {
    console.error(`[${context.boundary}]`, error, context.componentStack ?? "");
  }

  if (isSentryReady()) {
    Sentry.captureException(error, {
      tags: { boundary: context.boundary },
      extra: {
        componentStack: context.componentStack,
        ...context.extra,
      },
    });
  }
}

/**
 * Report a non-fatal warning or context message.
 */
export function captureMessage(message: string, context?: Partial<ErrorContext>): void {
  if (import.meta.env.DEV) {
    console.warn(`[${context?.boundary ?? "app"}]`, message);
  }

  if (isSentryReady()) {
    Sentry.captureMessage(message, {
      level: "warning",
      tags: { boundary: context?.boundary },
    });
  }
}
