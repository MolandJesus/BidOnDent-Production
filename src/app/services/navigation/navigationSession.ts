import type { ExternalNavigationSession } from "../../types/navigation";
import { clearPersistedState, readPersistedState, writePersistedState } from "./persistedState";

export const NAVIGATION_SESSION_STORAGE_KEY = "bidondent_navigation_session";
const navigationSessionStorageVersion = 2;

function normalizeCoordinate(value: unknown) {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as { lat?: unknown; lng?: unknown };

  if (
    typeof candidate.lat !== "number" ||
    !Number.isFinite(candidate.lat) ||
    typeof candidate.lng !== "number" ||
    !Number.isFinite(candidate.lng)
  ) {
    return null;
  }

  return {
    lat: Number(candidate.lat.toFixed(6)),
    lng: Number(candidate.lng.toFixed(6)),
  };
}

function normalizeIsoDate(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const timestampMs = Date.parse(value);

  if (Number.isNaN(timestampMs)) {
    return null;
  }

  return new Date(timestampMs).toISOString();
}

function toValidatedNavigationSession(raw: unknown): ExternalNavigationSession | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const candidate = raw as Record<string, unknown>;
  const destinationCoordinates = normalizeCoordinate(candidate.destinationCoordinates);
  const originCoordinates =
    candidate.originCoordinates === undefined
      ? undefined
      : normalizeCoordinate(candidate.originCoordinates) || undefined;
  const launchedAt = normalizeIsoDate(candidate.launchedAt);

  if (
    (candidate.provider !== "apple" &&
      candidate.provider !== "google" &&
      candidate.provider !== "waze") ||
    typeof candidate.destinationName !== "string" ||
    candidate.destinationName.trim().length === 0 ||
    !destinationCoordinates ||
    launchedAt === null
  ) {
    return null;
  }

  return {
    provider: candidate.provider,
    destinationId:
      typeof candidate.destinationId === "string" && candidate.destinationId.trim().length > 0
        ? candidate.destinationId
        : undefined,
    destinationName: candidate.destinationName.trim(),
    destinationAddress:
      typeof candidate.destinationAddress === "string" &&
      candidate.destinationAddress.trim().length > 0
        ? candidate.destinationAddress.trim()
        : undefined,
    destinationCoordinates,
    originLabel:
      typeof candidate.originLabel === "string" && candidate.originLabel.trim().length > 0
        ? candidate.originLabel.trim()
        : undefined,
    originCoordinates,
    launchedAt,
  };
}

export function loadNavigationSession(): ExternalNavigationSession | null {
  return readPersistedState<ExternalNavigationSession | null>({
    storageKey: NAVIGATION_SESSION_STORAGE_KEY,
    storageVersion: navigationSessionStorageVersion,
    fallback: null,
    validate: (value): value is ExternalNavigationSession | null =>
      value === null || toValidatedNavigationSession(value) !== null,
    normalize: (value) => {
      if (value === null) {
        return null;
      }

      return toValidatedNavigationSession(value);
    },
    migrateLegacy: (legacyValue) => toValidatedNavigationSession(legacyValue),
  });
}

export function saveNavigationSession(session: ExternalNavigationSession) {
  const validated = toValidatedNavigationSession(session);

  if (!validated) {
    return;
  }

  writePersistedState(NAVIGATION_SESSION_STORAGE_KEY, navigationSessionStorageVersion, validated);
}

export function clearNavigationSession() {
  clearPersistedState(NAVIGATION_SESSION_STORAGE_KEY);
}
