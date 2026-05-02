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
        setOffset(window.scrollY * speed);
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
