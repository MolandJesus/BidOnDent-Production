/**
 * useNavigationVoicePriming — L3 hook over L4 primeVoiceEngine().
 *
 * Returns a stable callback that primes the speech-synthesis engine
 * for navigation voice guidance. **Must be invoked from a user-gesture
 * event handler** (click, tap, keydown) per browser autoplay
 * policies; otherwise speech may not initialize on Safari.
 *
 * Idempotent — subsequent calls after first successful prime
 * return early via the internal primedRef guard.
 *
 * Use this from L2 components instead of importing primeVoiceEngine
 * directly. Closes a slice of KI-108.
 */
import { useCallback, useRef } from "react";
import { primeVoiceEngine } from "../services/navigation/voiceSupport";

export type PrimeVoiceResult = "primed" | "already-primed" | "unsupported" | "deferred";

export function useNavigationVoicePriming(): () => PrimeVoiceResult {
  const primedRef = useRef(false);

  return useCallback((): PrimeVoiceResult => {
    if (primedRef.current) return "already-primed";

    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return "unsupported";
    }

    const ok = primeVoiceEngine();
    if (ok) {
      primedRef.current = true;
      return "primed";
    }
    return "deferred";
  }, []);
}
