/**
 * Voice Support — Browser Compatibility Detection
 *
 * Cross-browser voice support is not binary. The Web Speech API
 * exists in most modern browsers, but actual speech capability
 * depends on voice availability, gesture gating, and platform quirks.
 *
 * This module gives consumers a truthful, granular view of voice
 * support status — not just "does the API exist?"
 *
 * ┌──────────────────────────────────────────────────────────────────┐
 * │ BROWSER COMPATIBILITY NOTES                                     │
 * ├──────────────────────────────────────────────────────────────────┤
 * │ Chrome/Edge (desktop + Android)                                 │
 * │   - speechSynthesis API: ✅ supported                          │
 * │   - getVoices() is async — returns [] on first call.            │
 * │     Listen for 'voiceschanged' event to get real list.          │
 * │   - No user-gesture requirement for speak().                    │
 * │   - Known bug: utterances >15s can pause and get stuck.         │
 * │     Workaround: resume() timer. Not needed for short nav text.  │
 * │   - Voices vary by OS (Windows Narrator voices, macOS system).  │
 * ├──────────────────────────────────────────────────────────────────┤
 * │ Safari (desktop + iOS)                                          │
 * │   - speechSynthesis API: ✅ supported                          │
 * │   - First speak() call MUST originate from a user gesture       │
 * │     (click/tap). Subsequent calls can be programmatic.          │
 * │   - iOS: speech is canceled when screen locks.                  │
 * │   - Good en-GB voice selection (Kate, Serena, Daniel).          │
 * │   - If speak() is called without prior gesture, it silently     │
 * │     does nothing — no error thrown, no audio produced.           │
 * ├──────────────────────────────────────────────────────────────────┤
 * │ Firefox (desktop)                                               │
 * │   - speechSynthesis API: ✅ supported                          │
 * │   - Very limited voice selection on many platforms.             │
 * │   - en-GB voices may not be available at all.                   │
 * │   - No user-gesture requirement.                                │
 * │   - getVoices() is synchronous (returns immediately).           │
 * ├──────────────────────────────────────────────────────────────────┤
 * │ Mobile general                                                  │
 * │   - Background tabs may throttle or stop speech.                │
 * │   - Audio focus can be stolen by other apps.                    │
 * │   - Screen lock cancels ongoing speech on iOS.                  │
 * └──────────────────────────────────────────────────────────────────┘
 */

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

/**
 * Granular voice support status.
 *
 * available       → API exists and at least one voice is loaded
 * no-api          → window.speechSynthesis does not exist
 * no-voices       → API exists but getVoices() returned empty (may be loading)
 * gesture-blocked → Safari: speak() has not been primed by a user gesture yet
 */
export type VoiceSupportStatus = "available" | "no-api" | "no-voices" | "gesture-blocked";

/**
 * Full voice support snapshot — consumed by UI and orchestration hooks.
 */
export interface VoiceSupportSnapshot {
  /** Current support status. */
  status: VoiceSupportStatus;
  /** Number of voices currently loaded. */
  voiceCount: number;
  /** Whether the engine has been primed by a user gesture. */
  primed: boolean;
  /** Whether the browser likely requires gesture priming (Safari). */
  gestureRequired: boolean;
}

/* ------------------------------------------------------------------ */
/*  Detection                                                          */
/* ------------------------------------------------------------------ */

/** Track whether we've successfully primed the speech engine. */
let enginePrimed = false;

/**
 * Detect whether the current browser is WebKit/Safari-based.
 * Safari requires a user-gesture context for the first speak() call.
 */
function isSafariLikely(): boolean {
  if (typeof navigator === "undefined") return false;

  const ua = navigator.userAgent;
  // Safari on macOS/iOS but not Chrome/Edge (which also contain "Safari")
  return /Safari/i.test(ua) && !/Chrome|CriOS|Edg/i.test(ua);
}

/**
 * Get a truthful snapshot of voice support for the current browser.
 */
export function detectVoiceSupport(): VoiceSupportSnapshot {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return { status: "no-api", voiceCount: 0, primed: false, gestureRequired: false };
  }

  const voices = window.speechSynthesis.getVoices();
  const gestureRequired = isSafariLikely();

  if (voices.length === 0) {
    return {
      status: "no-voices",
      voiceCount: 0,
      primed: enginePrimed,
      gestureRequired,
    };
  }

  if (gestureRequired && !enginePrimed) {
    return {
      status: "gesture-blocked",
      voiceCount: voices.length,
      primed: false,
      gestureRequired: true,
    };
  }

  return {
    status: "available",
    voiceCount: voices.length,
    primed: enginePrimed,
    gestureRequired,
  };
}

/* ------------------------------------------------------------------ */
/*  Gesture priming                                                    */
/* ------------------------------------------------------------------ */

/**
 * Prime the speech engine with a silent utterance.
 *
 * Safari requires the first speak() call to originate from a user
 * gesture (click/tap). After that, programmatic calls work.
 *
 * Call this when the user first enables voice (e.g. switches from
 * "muted" to "alerts-only" or "full" in voice controls).
 *
 * Safe to call on non-Safari browsers — it's a no-op if already primed.
 */
export function primeVoiceEngine(): boolean {
  if (enginePrimed) return true;

  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return false;
  }

  // Create a silent utterance — empty string with zero volume
  const primer = new SpeechSynthesisUtterance("");
  primer.volume = 0;

  primer.onend = () => {
    enginePrimed = true;
  };

  primer.onerror = () => {
    // Priming failed — speech may not work. Don't mark as primed.
  };

  window.speechSynthesis.speak(primer);
  // Optimistically mark as primed — the gesture context is what matters,
  // and we're inside a user event handler.
  enginePrimed = true;
  return true;
}

/**
 * Check whether the engine has been primed.
 * Useful for diagnostics and status display.
 */
export function isVoiceEnginePrimed(): boolean {
  return enginePrimed;
}
