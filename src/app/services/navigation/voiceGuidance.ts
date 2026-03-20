import type {
  NavigationVoiceMode,
  NavigationVoicePersona,
  NavigationVoiceVolumePreset,
} from "../../types/navigation";

const britishVoiceNameHints = [
  /google uk english female/i,
  /libby/i,
  /serena/i,
  /kate/i,
  /susan/i,
  /hazel/i,
  /en-gb/i,
];

function getSpeechSynthesisController() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return null;
  }

  return window.speechSynthesis;
}

export function supportsVoiceGuidance() {
  return Boolean(getSpeechSynthesisController());
}

export function getPreferredVoice(voicePersona: NavigationVoicePersona) {
  const speechSynthesis = getSpeechSynthesisController();

  if (!speechSynthesis) {
    return null;
  }

  const voices = speechSynthesis.getVoices();

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

export function speakNavigationInstruction(args: {
  text: string;
  voiceMode: NavigationVoiceMode;
  voicePersona: NavigationVoicePersona;
  voiceVolumePreset: NavigationVoiceVolumePreset;
}) {
  if (args.voiceMode === "muted" || !args.text.trim()) {
    return false;
  }

  const speechSynthesis = getSpeechSynthesisController();

  if (!speechSynthesis) {
    return false;
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
    args.voiceVolumePreset === "louder"
      ? 1
      : args.voiceVolumePreset === "softer"
        ? 0.62
        : 0.82;

  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
  return true;
}
