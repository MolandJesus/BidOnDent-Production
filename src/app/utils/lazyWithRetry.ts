import { lazy, type ComponentType, type LazyExoticComponent } from "react";

type LazyModule<T extends ComponentType<any>> = { default: T };

/**
 * Wraps React.lazy with a single retry on chunk load failure.
 * When a dynamic import fails (e.g. network error during code-splitting),
 * it retries once after a brief delay before propagating the error
 * to the nearest error boundary.
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  importFn: () => Promise<LazyModule<T>>
): LazyExoticComponent<T> {
  return lazy(() =>
    importFn().catch(
      () =>
        new Promise<LazyModule<T>>((resolve, reject) => {
          setTimeout(() => {
            importFn().then(resolve).catch(reject);
          }, 1500);
        })
    )
  );
}
