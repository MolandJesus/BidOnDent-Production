import { lazy, type ComponentType } from "react";

/**
 * Wraps React.lazy with a single retry on chunk load failure.
 * When a dynamic import fails (e.g. network error during code-splitting),
 * it retries once after a brief delay before propagating the error
 * to the nearest error boundary.
 */
export function lazyWithRetry<T extends ComponentType<unknown>>(
  importFn: () => Promise<{ default: T }>
) {
  return lazy(() =>
    importFn().catch(
      () =>
        new Promise<{ default: T }>((resolve, reject) => {
          setTimeout(() => {
            importFn().then(resolve).catch(reject);
          }, 1500);
        })
    )
  );
}
