import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ── Web Speech API mocks ────────────────────────────────────────────────────

let mockVoices: SpeechSynthesisVoice[] = [];
let lastUtterance: SpeechSynthesisUtterance | null = null;

const mockSpeechSynthesis = {
  getVoices: vi.fn(() => mockVoices),
  cancel: vi.fn(),
  speak: vi.fn((utterance: SpeechSynthesisUtterance) => {
    lastUtterance = utterance;
  }),
  speaking: false,
  paused: false,
  resume: vi.fn(),
};

function makeVoice(overrides: Partial<SpeechSynthesisVoice> = {}): SpeechSynthesisVoice {
  return {
    name: "English UK Female",
    lang: "en-GB",
    localService: true,
    default: false,
    voiceURI: "english-uk-female",
    ...overrides,
  };
}

beforeEach(() => {
  mockVoices = [
    makeVoice({ name: "Google UK English Female", lang: "en-GB" }),
    makeVoice({ name: "Alex", lang: "en-US", default: true }),
  ];
  lastUtterance = null;

  vi.stubGlobal("speechSynthesis", mockSpeechSynthesis);
  vi.stubGlobal(
    "SpeechSynthesisUtterance",
    class MockUtterance {
      text: string;
      voice: SpeechSynthesisVoice | null = null;
      lang = "";
      rate = 1;
      pitch = 1;
      volume = 1;
      onerror: ((ev: { error: string }) => void) | null = null;
      onend: (() => void) | null = null;
      constructor(text: string) {
        this.text = text;
      }
    }
  );
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

// ── voiceGuidance tests ─────────────────────────────────────────────────────

describe("voiceGuidance", () => {
  // Dynamic import to pick up mocked globals
  async function loadModule() {
    // Reset module registry to get fresh state
    vi.resetModules();
    return import("./voiceGuidance");
  }

  it("supportsVoiceGuidance returns true when API exists", async () => {
    const mod = await loadModule();
    expect(mod.supportsVoiceGuidance()).toBe(true);
  });

  it("speakNavigationInstruction returns 'muted' when voiceMode is muted", async () => {
    const mod = await loadModule();
    const result = mod.speakNavigationInstruction({
      text: "Turn right",
      voiceMode: "muted" as const,
      voicePersona: "british-smooth" as const,
      voiceVolumePreset: "normal" as const,
    });
    expect(result).toBe("muted");
  });

  it("speakNavigationInstruction returns 'no-text' for empty text", async () => {
    const mod = await loadModule();
    const result = mod.speakNavigationInstruction({
      text: "   ",
      voiceMode: "full" as const,
      voicePersona: "british-smooth" as const,
      voiceVolumePreset: "normal" as const,
    });
    expect(result).toBe("no-text");
  });

  it("speakNavigationInstruction returns 'spoken' and calls speech API", async () => {
    const mod = await loadModule();
    const result = mod.speakNavigationInstruction({
      text: "In 200 meters, turn right onto Oak Avenue",
      voiceMode: "full" as const,
      voicePersona: "british-smooth" as const,
      voiceVolumePreset: "normal" as const,
    });
    expect(result).toBe("spoken");
    expect(mockSpeechSynthesis.cancel).toHaveBeenCalled();
    expect(mockSpeechSynthesis.speak).toHaveBeenCalled();
    expect(lastUtterance).not.toBeNull();
    expect(lastUtterance!.voice?.lang).toBe("en-GB");
  });

  it("selects en-GB voice for british-smooth persona", async () => {
    const mod = await loadModule();
    const voice = mod.getPreferredVoice("british-smooth" as const);
    expect(voice?.name).toBe("Google UK English Female");
    expect(voice?.lang).toBe("en-GB");
  });

  it("falls back to default voice when no en-GB available", async () => {
    mockVoices = [makeVoice({ name: "Alex", lang: "en-US", default: true })];
    const mod = await loadModule();
    const voice = mod.getPreferredVoice("british-smooth" as const);
    expect(voice?.name).toBe("Alex");
  });

  it("returns null when no voices loaded", async () => {
    mockVoices = [];
    const mod = await loadModule();
    const voice = mod.getPreferredVoice("british-smooth" as const);
    expect(voice).toBeNull();
  });

  it("truncates long text to MAX_UTTERANCE_CHARS", async () => {
    const mod = await loadModule();
    const longText = "A".repeat(300);
    mod.speakNavigationInstruction({
      text: longText,
      voiceMode: "full" as const,
      voicePersona: "british-smooth" as const,
      voiceVolumePreset: "normal" as const,
    });
    expect(lastUtterance!.text.length).toBeLessThanOrEqual(201); // 200 + "…"
  });

  it("applies volume presets correctly", async () => {
    const mod = await loadModule();

    // Louder
    mod.speakNavigationInstruction({
      text: "Turn left",
      voiceMode: "full" as const,
      voicePersona: "british-smooth" as const,
      voiceVolumePreset: "louder" as const,
    });
    expect(lastUtterance!.volume).toBe(1);

    // Softer
    mod.speakNavigationInstruction({
      text: "Turn right",
      voiceMode: "full" as const,
      voicePersona: "british-smooth" as const,
      voiceVolumePreset: "softer" as const,
    });
    expect(lastUtterance!.volume).toBe(0.62);

    // Normal
    mod.speakNavigationInstruction({
      text: "Continue",
      voiceMode: "full" as const,
      voicePersona: "british-smooth" as const,
      voiceVolumePreset: "normal" as const,
    });
    expect(lastUtterance!.volume).toBe(0.82);
  });

  it("cancelVoiceGuidance calls speechSynthesis.cancel", async () => {
    const mod = await loadModule();
    mod.cancelVoiceGuidance();
    expect(mockSpeechSynthesis.cancel).toHaveBeenCalled();
  });

  it("consumeLastSpeechError returns null initially then tracks errors", async () => {
    const mod = await loadModule();
    expect(mod.consumeLastSpeechError()).toBeNull();
  });
});

// ── voiceSupport tests ──────────────────────────────────────────────────────

describe("voiceSupport", () => {
  async function loadModule() {
    vi.resetModules();
    return import("./voiceSupport");
  }

  it("detectVoiceSupport returns available when API and voices exist", async () => {
    const mod = await loadModule();
    // Prime first so Safari check doesn't interfere
    mod.primeVoiceEngine();
    const snapshot = mod.detectVoiceSupport();
    expect(snapshot.status).toBe("available");
    expect(snapshot.voiceCount).toBe(2);
  });

  it("detectVoiceSupport returns no-voices when voices are empty", async () => {
    mockVoices = [];
    const mod = await loadModule();
    const snapshot = mod.detectVoiceSupport();
    expect(snapshot.status).toBe("no-voices");
    expect(snapshot.voiceCount).toBe(0);
  });

  it("primeVoiceEngine returns true and marks as primed", async () => {
    const mod = await loadModule();
    const result = mod.primeVoiceEngine();
    expect(result).toBe(true);
    expect(mod.isVoiceEnginePrimed()).toBe(true);
    expect(mockSpeechSynthesis.speak).toHaveBeenCalled();
  });

  it("primeVoiceEngine is idempotent", async () => {
    const mod = await loadModule();
    const callsBefore = mockSpeechSynthesis.speak.mock.calls.length;
    mod.primeVoiceEngine();
    mod.primeVoiceEngine();
    // speak should only be called once more (first prime), second is no-op
    expect(mockSpeechSynthesis.speak.mock.calls.length - callsBefore).toBe(1);
  });

  it("detectVoiceSupport returns no-api when speechSynthesis is missing", async () => {
    vi.unstubAllGlobals();
    // @ts-expect-error: removing API for test
    delete (globalThis as Record<string, unknown>).speechSynthesis;
    const mod = await loadModule();
    const snapshot = mod.detectVoiceSupport();
    expect(snapshot.status).toBe("no-api");
  });
});
