/**
 * Navigation Voice Alerts — Orchestration Hook
 *
 * Bridges the deviation/reroute system with the voice engine.
 * Listens to deviation events and reroute lifecycle transitions,
 * then dispatches spoken announcements through the single voice
 * entry point (speakNavigationInstruction).
 *
 * Responsibilities:
 *   - React to deviation events and speak appropriate alerts
 *   - React to reroute status transitions and speak confirmations
 *   - Deduplicate: never announce the same event ID twice
 *   - Respect voice mode (muted → no speech)
 *   - Filter by severity (low events are silent)
 *   - Provide last-spoken diagnostic for UI or debugging
 *
 * Does NOT own:
 *   - Deviation detection (that's useNavigationIntelligence)
 *   - Reroute lifecycle (that's useNavigationReroute)
 *   - Speech synthesis (that's voiceGuidance.ts)
 *   - Voice mode UI (that's NavigationVoiceControlsSheet)
 */

import { useEffect, useRef } from "react";
import type { DeviationEvent } from "./deviationTypes";
import type { RerouteStatus } from "./rerouteTypes";
import { getDeviationPhrase, getReroutePhrase } from "./deviationVoicePhrases";
import {
  speakNavigationInstruction,
  type SpeakResult,
} from "../../services/navigation/voiceGuidance";
import type { NavigationVoiceMode, NavigationVoiceSettings } from "../../types/navigation";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

/** Diagnostic info about the last alert attempt. */
export interface VoiceAlertSnapshot {
  /** The phrase that was last spoken (or attempted). */
  lastPhrase: string | null;
  /** The result from the voice engine. */
  lastResult: SpeakResult | null;
  /** Total number of deviation alerts spoken this session. */
  deviationAlertCount: number;
  /** Total number of reroute announcements spoken this session. */
  rerouteAnnouncementCount: number;
}

/** What the hook exposes to consumers. */
export interface NavigationVoiceAlerts {
  /** Diagnostic snapshot of voice alert activity. */
  snapshot: VoiceAlertSnapshot;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

/**
 * Delay-increase alerts only fire in "full" voice mode.
 * Off-route alerts fire in both "full" and "alerts-only".
 */
const DELAY_ALERT_MODES: ReadonlySet<NavigationVoiceMode> = new Set(["full"]);
const DEVIATION_ALERT_MODES: ReadonlySet<NavigationVoiceMode> = new Set(["full", "alerts-only"]);

/* ------------------------------------------------------------------ */
/*  Hook                                                               */
/* ------------------------------------------------------------------ */

/**
 * Orchestrate voice alerts for deviation events and reroute transitions.
 *
 * @param latestEvent   - Most recent deviation event (from useNavigationIntelligence)
 * @param rerouteStatus - Current reroute lifecycle status (from useNavigationReroute)
 * @param settings      - Current voice settings (mode, persona, volume)
 */
export function useNavigationVoiceAlerts(
  latestEvent: DeviationEvent | null,
  rerouteStatus: RerouteStatus,
  settings: NavigationVoiceSettings,
  enabled = true
): NavigationVoiceAlerts {
  // Track which event IDs we've already announced
  const announcedEventIdsRef = useRef<Set<string>>(new Set());
  // Track recent (type,severity) to suppress semantically-duplicate alerts
  const recentAlertKeyRef = useRef<{ key: string; at: number } | null>(null);
  // Track the last reroute status we announced
  const lastAnnouncedRerouteStatusRef = useRef<RerouteStatus>("idle");
  // Diagnostic counters
  const deviationCountRef = useRef(0);
  const rerouteCountRef = useRef(0);
  // Last spoken phrase and result
  const lastPhraseRef = useRef<string | null>(null);
  const lastResultRef = useRef<SpeakResult | null>(null);

  /* ------ Deviation event alerts ------ */
  useEffect(() => {
    if (!latestEvent) return;
    if (!enabled || settings.voiceMode === "muted") {
      announcedEventIdsRef.current.add(latestEvent.id);
      return;
    }

    // Already announced this exact event
    if (announcedEventIdsRef.current.has(latestEvent.id)) return;

    // Check if this event type is allowed in the current voice mode
    const allowedModes =
      latestEvent.type === "delay_increase" ? DELAY_ALERT_MODES : DEVIATION_ALERT_MODES;
    if (!allowedModes.has(settings.voiceMode)) return;

    const phrase = getDeviationPhrase(latestEvent.type, latestEvent.severity);
    if (!phrase) return;

    // Suppress semantically-duplicate alerts within 10 seconds
    const alertKey = `${latestEvent.type}:${latestEvent.severity}`;
    const now = Date.now();
    if (
      recentAlertKeyRef.current &&
      recentAlertKeyRef.current.key === alertKey &&
      now - recentAlertKeyRef.current.at < 10_000
    ) {
      announcedEventIdsRef.current.add(latestEvent.id);
      return;
    }

    const result = speakNavigationInstruction({
      text: phrase,
      voiceMode: settings.voiceMode,
      voicePersona: settings.voicePersona,
      voiceVolumePreset: settings.voiceVolumePreset,
    });

    announcedEventIdsRef.current.add(latestEvent.id);
    recentAlertKeyRef.current = { key: alertKey, at: now };
    deviationCountRef.current += 1;
    lastPhraseRef.current = phrase;
    lastResultRef.current = result;
  }, [enabled, latestEvent, settings.voiceMode, settings.voicePersona, settings.voiceVolumePreset]);

  /* ------ Reroute lifecycle announcements ------ */
  useEffect(() => {
    if (!enabled || settings.voiceMode === "muted") {
      lastAnnouncedRerouteStatusRef.current = rerouteStatus;
      return;
    }

    // Only announce transitions, not repeat of same status
    if (rerouteStatus === lastAnnouncedRerouteStatusRef.current) return;

    const phrase = getReroutePhrase(rerouteStatus);

    // Update the tracked status even if no phrase (e.g. idle → eligible has no phrase)
    lastAnnouncedRerouteStatusRef.current = rerouteStatus;

    if (!phrase) return;

    const result = speakNavigationInstruction({
      text: phrase,
      voiceMode: settings.voiceMode,
      voicePersona: settings.voicePersona,
      voiceVolumePreset: settings.voiceVolumePreset,
    });

    rerouteCountRef.current += 1;
    lastPhraseRef.current = phrase;
    lastResultRef.current = result;
  }, [
    enabled,
    rerouteStatus,
    settings.voiceMode,
    settings.voicePersona,
    settings.voiceVolumePreset,
  ]);

  return {
    snapshot: {
      lastPhrase: lastPhraseRef.current,
      lastResult: lastResultRef.current,
      deviationAlertCount: deviationCountRef.current,
      rerouteAnnouncementCount: rerouteCountRef.current,
    },
  };
}
