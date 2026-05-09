/**
 * Dev/test-only MapLibre engine instance counter.
 *
 * Phase 0 of the PMS preparation lane (Pass 262). Subscribes to
 * `bd:engine:mount` / `bd:engine:dispose` Performance marks (emitted
 * by `perfMarks` helpers from each engine's mount lifecycle) and
 * tracks active engine count on `window.__bdMapInstanceCount` for
 * Playwright assertion.
 *
 * Production builds tree-shake the entire body via the
 * `import.meta.env.DEV` / `MODE` guard.
 *
 * One MapLibre instance ≈ one engine-mount mark, because every
 * MapLibre Map construction in src/ flows through one of the three
 * engines (REF_MAP_RENDERER_INVENTORY §1).
 *
 * Refs:
 *   - docs/REF_PMS_PERFORMANCE_BASELINE_2026-05-09.md §7.2 (G2 methodology)
 *   - docs/PLAN_PMS_EXECUTION_SEQUENCING_2026-05-09.md §3 (Phase 0 spec)
 */

import { PERF_MARK_PREFIXES } from "./perfMarks";

declare global {
  interface Window {
    __bdMapInstanceCount?: {
      created: number;
      destroyed: number;
      active: number;
    };
  }
}

if (import.meta.env.DEV || import.meta.env.MODE === "test") {
  if (typeof window !== "undefined" && typeof PerformanceObserver !== "undefined") {
    const flag = "__bdMapInstanceCounterPatched";
    const w = window as unknown as Record<string, unknown>;
    if (!w[flag]) {
      w[flag] = true;

      if (!window.__bdMapInstanceCount) {
        window.__bdMapInstanceCount = { created: 0, destroyed: 0, active: 0 };
      }

      const mountPrefix = `${PERF_MARK_PREFIXES.engineMount}:`;
      const disposePrefix = `${PERF_MARK_PREFIXES.engineDispose}:`;

      try {
        const observer = new PerformanceObserver((list) => {
          const counts = window.__bdMapInstanceCount;
          if (!counts) return;
          for (const entry of list.getEntries()) {
            if (entry.name.startsWith(mountPrefix)) {
              counts.created += 1;
              counts.active += 1;
            } else if (entry.name.startsWith(disposePrefix)) {
              counts.destroyed += 1;
              counts.active = Math.max(0, counts.active - 1);
            }
          }
        });
        observer.observe({ type: "mark", buffered: true });
      } catch {
        // PerformanceObserver not available; counter is dev-only so
        // a silent skip is fine.
      }
    }
  }
}

export {};
