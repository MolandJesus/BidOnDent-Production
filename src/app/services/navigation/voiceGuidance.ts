import type {
  NavigationVoiceMode,
  NavigationVoicePersona,
  NavigationVoiceSettings,
  NavigationVoiceVolumePreset,
} from "../../types/navigation";

/**
 * Voice Guidance — Speech Synthesis Service
 *
 * Wraps the Web Speech API with BidOnDent navigation-specific
 * voice selection, volume presets, and cross-browser guardrails.
 *
 * Cross-browser notes:
 *   Chrome/Edge: getVoices() is async — first call returns [].
 *                Listen for 'voiceschanged' to get real list.
 *   Safari:      First speak() must originate from user gesture.
 *                Use primeVoiceEngine() from voiceSupport.ts.
 *   Firefox:     Limited voice selection; en-GB may be unavailable.
 *   All:         cancel() before speak() prevents queue buildup.
 */

const britishVoiceNameHints = [
  /google uk english female/i,
  /libby/i,
  /serena/i,
  /kate/i,
  /susan/i,
  /hazel/i,
  /en-gb/i,
];

/** Track recent speech errors for diagnostics (not persisted). */
let lastSpeechError: string | null = null;

function getSpeechSynthesisController() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return null;
  }

  return window.speechSynthesis;
}

export function supportsVoiceGuidance() {
  return Boolean(getSpeechSynthesisController());
}

/**
 * Get the last speech error message, if any.
 * Resets after being read. Useful for diagnostics.
 */
export function consumeLastSpeechError(): string | null {
  const error = lastSpeechError;
  lastSpeechError = null;
  return error;
}

export function getPreferredVoice(voicePersona: NavigationVoicePersona) {
  const speechSynthesis = getSpeechSynthesisController();

  if (!speechSynthesis) {
    return null;
  }

  const voices = speechSynthesis.getVoices();

  // Chrome/Edge: voices load asynchronously. First call may return [].
  // The 'voiceschanged' event handler in useCoverageNavigationExperience
  // refreshes the voice label once voices are available.
  if (voices.length === 0) {
    return null;
  }

  if (voicePersona === "british-smooth") {
    return (
      voices.find(
        (voice) =>
          voice.lang.toLowerCase().startsWith("en-gb") &&
          britishVoiceNameHints.some((pattern) => pattern.test(voice.name))
      ) ||
      voices.find((voice) => voice.lang.toLowerCase().startsWith("en-gb")) ||
      voices.find((voice) => voice.default) ||
      voices[0]
    );
  }

  return voices[0];
}

export function getPreferredVoiceLabel(voicePersona: NavigationVoicePersona) {
  return getPreferredVoice(voicePersona)?.name || null;
}

export function cancelVoiceGuidance() {
  const speechSynthesis = getSpeechSynthesisController();
  speechSynthesis?.cancel();
}

/**
 * Result of a speak attempt — more honest than a plain boolean.
 *
 * "spoken"    → utterance was dispatched to the speech engine
 * "muted"     → voice mode is muted, nothing to do
 * "no-api"    → speechSynthesis API is not available
 * "no-text"   → text was empty after trimming
 */
export type SpeakResult = "spoken" | "muted" | "no-api" | "no-text";

/** Arguments for a single speak dispatch. */
export type SpeakInstructionArgs = NavigationVoiceSettings & { text: string };

export function speakNavigationInstruction(args: SpeakInstructionArgs): SpeakResult {
  if (args.voiceMode === "muted") {
    return "muted";
  }

  if (!args.text.trim()) {
    return "no-text";
  }

  const speechSynthesis = getSpeechSynthesisController();

  if (!speechSynthesis) {
    return "no-api";
  }

  const utterance = new SpeechSynthesisUtterance(args.text);
  const voice = getPreferredVoice(args.voicePersona);

  if (voice) {
    utterance.voice = voice;
    utterance.lang = voice.lang;
  } else {
    utterance.lang = "en-GB";
  }

  utterance.rate = 0.94;
  utterance.pitch = 1.02;
  utterance.volume =
    args.voiceVolumePreset === "louder" ? 1 : args.voiceVolumePreset === "softer" ? 0.62 : 0.82;

  // Track errors so consumers can surface truthful status.
  // Safari gesture-blocked calls fail silently without firing onerror,
  // so this only catches real engine errors (audio device issues, etc.).
  utterance.onerror = (event) => {
    // "interrupted" and "canceled" are normal — we cancel() before each speak()
    if (event.error === "interrupted" || event.error === "canceled") return;
    lastSpeechError = `Speech error: ${event.error}`;
  };

  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
  return "spoken";
}
