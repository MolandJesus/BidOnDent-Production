import { useEffect, useState } from "react";

/**
 * useParallaxOffset
 *
 * Returns a Y-axis pixel offset suitable for `transform: translateY(${y}px)`
 * on large decorative atmosphere pools. Drives the offset off window scroll
 * position, throttled to one update per animation frame.
 *
 * Pass 5 — premium scroll life. Used on landing-page large blur pools to
 * give the atmosphere a sense of depth as the user scrolls.
 *
 * Honors `prefers-reduced-motion: reduce` — returns 0 (no parallax) for
 * users who opt out.
 *
 * Args:
 *   speed — scroll-to-offset multiplier. 0.12 = element drifts at 12% of
 *           scroll speed (parallax depth). Mobile callers should pass a
 *           smaller value (e.g. 0.06) to reduce paint cost.
 */
export function useParallaxOffset(speed: number): number {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;

    let rafId: number | null = null;
    let pending = false;

    const handleScroll = () => {
      if (pending) return;
      pending = true;
      rafId = window.requestAnimationFrame(() => {
        // Pass 85 (2026-05-07) — KI-053 F.2 follow-up. Quantize to integer
        // pixels and skip state updates when the offset hasn't moved. Sub-
        // pixel scroll deltas were re-rendering the parallax consumers
        // (HeroSection + OperatingRegionsSection) on every animation frame
        // even when the visual transform was identical. Cheaper React work
        // = lower main-thread contention with MapLibre on the landing
        // surface (per `evidence/pass-48-2026-05-07/PERF_ANALYSIS.md`).
        const next = Math.round(window.scrollY * speed);
        setOffset((prev) => (prev === next ? prev : next));
        pending = false;
      });
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId !== null) window.cancelAnimationFrame(rafId);
    };
  }, [speed]);

  return offset;
}
