import { useEffect, useRef, useState } from "react";

/**
 * Hook that triggers animation when element scrolls into view
 */
export function useScrollAnimation(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element);
        }
      },
      { threshold, rootMargin: "0px 0px -50px 0px" }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold]);

  return { ref, isVisible };
}

// Pass 25 (audit AI) — `useCountUp` removed as dead code. Independent
// grep confirmed zero source-tree consumers (co-worker AI also flagged in
// dormant-exports sweep). The hook used `useCallback` which the import
// list also drops above; remaining `useEffect`/`useRef`/`useState` still
// power the live `useScrollAnimation` hook.
