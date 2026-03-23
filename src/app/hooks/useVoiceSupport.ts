/**
 * Voice Support — Reactive Hook
 *
 * Provides a reactive snapshot of browser voice support status.
 * Listens for the 'voiceschanged' event so the UI automatically
 * updates when voices become available (Chrome async loading).
 *
 * Rules:
 *   - NEVER block navigation if voice fails
 *   - NEVER assume voice is available
 *   - Provide honest, granular status for UI display
 */

import { useCallback, useEffect, useState } from "react";
import {
  detectVoiceSupport,
  primeVoiceEngine,
  type VoiceSupportSnapshot,
} from "../services/navigation/voiceSupport";

export interface VoiceSupportState extends VoiceSupportSnapshot {
  /** Attempt to prime the voice engine (call from user gesture). */
  prime: () => boolean;
  /** Re-detect voice support status. */
  refresh: () => void;
  /** Whether voice is usable right now. */
  isAvailable: boolean;
  /** Human-readable status label for UI display. */
  statusLabel: string;
}

function getStatusLabel(status: VoiceSupportSnapshot["status"]): string {
  switch (status) {
    case "available":
      return "Voice ready";
    case "no-api":
      return "Voice not supported";
    case "no-voices":
      return "Loading voices\u2026";
    case "gesture-blocked":
      return "Tap to enable voice";
    default:
      return "Unknown";
  }
}

export function useVoiceSupport(): VoiceSupportState {
  const [snapshot, setSnapshot] = useState<VoiceSupportSnapshot>(detectVoiceSupport);

  const refresh = useCallback(() => {
    setSnapshot(detectVoiceSupport());
  }, []);

  const prime = useCallback(() => {
    const result = primeVoiceEngine();
    // Re-detect after priming
    setSnapshot(detectVoiceSupport());
    return result;
  }, []);

  // Listen for voiceschanged (Chrome async voice loading)
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const handler = () => setSnapshot(detectVoiceSupport());
    window.speechSynthesis.addEventListener("voiceschanged", handler);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", handler);
  }, []);

  return {
    ...snapshot,
    prime,
    refresh,
    isAvailable: snapshot.status === "available",
    statusLabel: getStatusLabel(snapshot.status),
  };
}
