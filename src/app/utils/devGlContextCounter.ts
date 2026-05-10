/**
 * Dev/test-only WebGL context creation counter.
 *
 * Phase 0 of the PMS preparation lane (Pass 262). Patches
 * `HTMLCanvasElement.prototype.getContext` at module load to record
 * each `webgl` / `webgl2` / `experimental-webgl` request. The pre-patch
 * function is delegated to so canvas behavior is byte-identical;
 * only an external observation log is added.
 *
 * Production builds tree-shake the entire body via the
 * `import.meta.env.DEV` / `MODE` guard.
 *
 * Counts are exposed on `window.__bdGlContextLog` for Playwright
 * assertion against G3 (≤ 1 GL context per session).
 *
 * Refs:
 *   - docs/REF_PMS_PERFORMANCE_BASELINE_2026-05-09.md §7.3 (G3 methodology)
 *   - docs/PLAN_PMS_EXECUTION_SEQUENCING_2026-05-09.md §3 (Phase 0 spec)
 */

declare global {
  interface Window {
    __bdGlContextLog?: Array<{
      contextType: string;
      timestamp: number;
    }>;
  }
}

if (import.meta.env.DEV || import.meta.env.MODE === "test") {
  if (typeof window !== "undefined" && typeof HTMLCanvasElement !== "undefined") {
    const flag = "__bdGlContextCounterPatched";
    const w = window as unknown as Record<string, unknown>;
    if (!w[flag]) {
      w[flag] = true;

      if (!window.__bdGlContextLog) {
        window.__bdGlContextLog = [];
      }

      const original = HTMLCanvasElement.prototype.getContext;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      HTMLCanvasElement.prototype.getContext = function patchedGetContext(
        this: HTMLCanvasElement,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        contextType: any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        options?: any
      ) {
        if (
          typeof contextType === "string" &&
          (contextType === "webgl" ||
            contextType === "webgl2" ||
            contextType === "experimental-webgl")
        ) {
          window.__bdGlContextLog?.push({
            contextType,
            timestamp: Date.now(),
          });
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (original as any).call(this, contextType, options);
      } as typeof HTMLCanvasElement.prototype.getContext;
    }
  }
}

export {};
