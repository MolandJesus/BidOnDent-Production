type PersistedEnvelope<T> = {
  version: number;
  value: T;
};

type ReadPersistedStateOptions<T> = {
  storageKey: string;
  storageVersion: number;
  fallback: T;
  validate: (value: unknown) => value is T;
  normalize?: (value: T) => T;
  migrateLegacy?: (legacyValue: unknown) => T | null;
};

function getLocalStorageSafely(): Storage | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function tryParseJson(raw: string): unknown {
  return JSON.parse(raw) as unknown;
}

function isPersistedEnvelope(value: unknown): value is PersistedEnvelope<unknown> {
  if (!isRecord(value)) {
    return false;
  }

  return typeof value.version === "number" && Object.prototype.hasOwnProperty.call(value, "value");
}

function writeRaw(storage: Storage, storageKey: string, value: unknown) {
  try {
    storage.setItem(storageKey, JSON.stringify(value));
  } catch {
    // Ignore storage write failures (quota/private mode/security policy).
  }
}

function removeRaw(storage: Storage, storageKey: string) {
  try {
    storage.removeItem(storageKey);
  } catch {
    // Ignore storage removal failures to keep runtime resilient.
  }
}

export function readPersistedState<T>({
  storageKey,
  storageVersion,
  fallback,
  validate,
  normalize,
  migrateLegacy,
}: ReadPersistedStateOptions<T>): T {
  const storage = getLocalStorageSafely();

  if (!storage) {
    return fallback;
  }

  const raw = storage.getItem(storageKey);

  if (!raw) {
    return fallback;
  }

  try {
    const parsed = tryParseJson(raw);
    let candidate: unknown = null;
    let shouldRewrite = false;

    if (isPersistedEnvelope(parsed)) {
      if (parsed.version > storageVersion) {
        return fallback;
      }

      if (parsed.version < storageVersion) {
        shouldRewrite = true;
      }

      candidate = parsed.value;
    } else {
      shouldRewrite = true;
      candidate = migrateLegacy ? migrateLegacy(parsed) : null;
    }

    if (candidate === null || candidate === undefined) {
      removeRaw(storage, storageKey);
      return fallback;
    }

    if (!validate(candidate)) {
      if (migrateLegacy) {
        const migrated = migrateLegacy(candidate);
        if (migrated && validate(migrated)) {
          const normalizedMigrated = normalize ? normalize(migrated) : migrated;
          writeRaw(storage, storageKey, {
            version: storageVersion,
            value: normalizedMigrated,
          } satisfies PersistedEnvelope<T>);
          return normalizedMigrated;
        }
      }

      removeRaw(storage, storageKey);
      return fallback;
    }

    const normalized = normalize ? normalize(candidate) : candidate;

    if (shouldRewrite) {
      writeRaw(storage, storageKey, {
        version: storageVersion,
        value: normalized,
      } satisfies PersistedEnvelope<T>);
      return normalized;
    }

    const expectedRaw = JSON.stringify({
      version: storageVersion,
      value: normalized,
    } satisfies PersistedEnvelope<T>);

    if (raw !== expectedRaw) {
      writeRaw(storage, storageKey, {
        version: storageVersion,
        value: normalized,
      } satisfies PersistedEnvelope<T>);
    }

    return normalized;
  } catch {
    removeRaw(storage, storageKey);
    return fallback;
  }
}

export function writePersistedState<T>(storageKey: string, storageVersion: number, value: T): void {
  const storage = getLocalStorageSafely();

  if (!storage) {
    return;
  }

  writeRaw(storage, storageKey, {
    version: storageVersion,
    value,
  } satisfies PersistedEnvelope<T>);
}

export function clearPersistedState(storageKey: string): void {
  const storage = getLocalStorageSafely();

  if (!storage) {
    return;
  }

  removeRaw(storage, storageKey);
}
