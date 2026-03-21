import { readPersistedState, writePersistedState } from "./persistedState";

export type NavigationProviderHealthId =
  | "osrm-route"
  | "overpass-speed-limit"
  | "overpass-discovery"
  | "nominatim-search";

type ProviderHealthEvent = {
  provider: NavigationProviderHealthId;
  ok: boolean;
  latencyMs: number;
  timestamp: string;
  errorMessage?: string;
};

export type ProviderHealthSummary = {
  provider: NavigationProviderHealthId;
  totalChecks: number;
  successCount: number;
  failureCount: number;
  successRate: number;
  averageLatencyMs: number;
  lastCheckedAt: string | null;
  lastCheckedAgeMs: number | null;
  lastErrorMessage: string | null;
};

const providerHealthStorageKey = "bidondent.navigation.providerHealth.v1";
const providerHealthStorageVersion = 2;
const maxStoredEvents = 120;
const providers: NavigationProviderHealthId[] = [
  "osrm-route",
  "overpass-speed-limit",
  "overpass-discovery",
  "nominatim-search",
];

function isProvider(value: unknown): value is NavigationProviderHealthId {
  return typeof value === "string" && providers.includes(value as NavigationProviderHealthId);
}

function normalizeLatencyMs(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  return Math.max(0, Math.round(value));
}

function normalizeTimestamp(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const timestampMs = Date.parse(value);

  if (Number.isNaN(timestampMs)) {
    return null;
  }

  return new Date(timestampMs).toISOString();
}

function toValidatedProviderHealthEvent(raw: unknown): ProviderHealthEvent | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const candidate = raw as {
    provider?: unknown;
    ok?: unknown;
    latencyMs?: unknown;
    timestamp?: unknown;
    errorMessage?: unknown;
  };
  const provider = candidate.provider;
  const latencyMs = normalizeLatencyMs(candidate.latencyMs);
  const timestamp = normalizeTimestamp(candidate.timestamp);

  if (
    !isProvider(provider) ||
    typeof candidate.ok !== "boolean" ||
    latencyMs === null ||
    !timestamp
  ) {
    return null;
  }

  return {
    provider,
    ok: candidate.ok,
    latencyMs,
    timestamp,
    errorMessage: typeof candidate.errorMessage === "string" ? candidate.errorMessage : undefined,
  };
}

export function sanitizeProviderHealthEventsFromRaw(rawEvents: unknown): ProviderHealthEvent[] {
  if (!Array.isArray(rawEvents)) {
    return [];
  }

  return rawEvents
    .map((event) => toValidatedProviderHealthEvent(event))
    .filter((event): event is ProviderHealthEvent => Boolean(event))
    .slice(-maxStoredEvents);
}

function readProviderHealthEvents() {
  return readPersistedState<ProviderHealthEvent[]>({
    storageKey: providerHealthStorageKey,
    storageVersion: providerHealthStorageVersion,
    fallback: [],
    validate: (value): value is ProviderHealthEvent[] => Array.isArray(value),
    normalize: (value) => sanitizeProviderHealthEventsFromRaw(value),
    migrateLegacy: (legacyValue) =>
      Array.isArray(legacyValue) ? sanitizeProviderHealthEventsFromRaw(legacyValue) : null,
  });
}

function writeProviderHealthEvents(events: ProviderHealthEvent[]) {
  writePersistedState(
    providerHealthStorageKey,
    providerHealthStorageVersion,
    events.slice(-maxStoredEvents)
  );
}

export function recordProviderHealthEvent(event: ProviderHealthEvent) {
  const current = readProviderHealthEvents();
  current.push(event);
  writeProviderHealthEvents(current);
}

export async function runWithProviderHealth<T>(
  provider: NavigationProviderHealthId,
  operation: () => Promise<T>
): Promise<T> {
  const startedAt = Date.now();

  try {
    const result = await operation();
    recordProviderHealthEvent({
      provider,
      ok: true,
      latencyMs: Date.now() - startedAt,
      timestamp: new Date().toISOString(),
    });
    return result;
  } catch (error) {
    recordProviderHealthEvent({
      provider,
      ok: false,
      latencyMs: Date.now() - startedAt,
      timestamp: new Date().toISOString(),
      errorMessage: error instanceof Error ? error.message : "Unknown provider failure",
    });
    throw error;
  }
}

export function buildProviderHealthSummary(
  events: ProviderHealthEvent[],
  now = Date.now()
): ProviderHealthSummary[] {
  const accumulators: Record<
    NavigationProviderHealthId,
    {
      totalChecks: number;
      successCount: number;
      latencySum: number;
      lastCheckedAt: string | null;
      lastErrorMessage: string | null;
    }
  > = {
    "osrm-route": {
      totalChecks: 0,
      successCount: 0,
      latencySum: 0,
      lastCheckedAt: null,
      lastErrorMessage: null,
    },
    "overpass-speed-limit": {
      totalChecks: 0,
      successCount: 0,
      latencySum: 0,
      lastCheckedAt: null,
      lastErrorMessage: null,
    },
    "overpass-discovery": {
      totalChecks: 0,
      successCount: 0,
      latencySum: 0,
      lastCheckedAt: null,
      lastErrorMessage: null,
    },
    "nominatim-search": {
      totalChecks: 0,
      successCount: 0,
      latencySum: 0,
      lastCheckedAt: null,
      lastErrorMessage: null,
    },
  };

  for (const event of events) {
    const accumulator = accumulators[event.provider];
    accumulator.totalChecks += 1;
    accumulator.latencySum += event.latencyMs;
    accumulator.lastCheckedAt = event.timestamp;

    if (event.ok) {
      accumulator.successCount += 1;
    } else if (event.errorMessage) {
      accumulator.lastErrorMessage = event.errorMessage;
    }
  }

  return providers.map((provider) => {
    const accumulator = accumulators[provider];
    const failureCount = accumulator.totalChecks - accumulator.successCount;
    const lastCheckedAtMs = accumulator.lastCheckedAt ? Date.parse(accumulator.lastCheckedAt) : NaN;

    return {
      provider,
      totalChecks: accumulator.totalChecks,
      successCount: accumulator.successCount,
      failureCount,
      successRate:
        accumulator.totalChecks > 0
          ? Math.round((accumulator.successCount / accumulator.totalChecks) * 100)
          : 0,
      averageLatencyMs:
        accumulator.totalChecks > 0
          ? Math.round(accumulator.latencySum / accumulator.totalChecks)
          : 0,
      lastCheckedAt: accumulator.lastCheckedAt,
      lastCheckedAgeMs:
        Number.isNaN(lastCheckedAtMs) || !accumulator.lastCheckedAt
          ? null
          : Math.max(0, Math.round(now - lastCheckedAtMs)),
      lastErrorMessage: accumulator.lastErrorMessage,
    };
  });
}

export function getProviderHealthSummary(): ProviderHealthSummary[] {
  return buildProviderHealthSummary(readProviderHealthEvents());
}

export function buildProviderHealthSummaryFromRaw(
  rawEvents: unknown,
  now = Date.now()
): ProviderHealthSummary[] {
  return buildProviderHealthSummary(sanitizeProviderHealthEventsFromRaw(rawEvents), now);
}
