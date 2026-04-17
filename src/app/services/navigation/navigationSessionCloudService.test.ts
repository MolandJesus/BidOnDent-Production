import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { EdgeFunctionError } from "../supabase/runtime";

const { requestSupabaseEdgeMock } = vi.hoisted(() => ({
  requestSupabaseEdgeMock: vi.fn(),
}));

vi.mock("../supabase/runtime", async () => {
  const actual = await vi.importActual<typeof import("../supabase/runtime")>("../supabase/runtime");

  return {
    ...actual,
    requestSupabaseEdge: requestSupabaseEdgeMock,
  };
});

let store: Record<string, string> = {};

const mockLocalStorage = {
  getItem: vi.fn((key: string) => store[key] ?? null),
  setItem: vi.fn((key: string, value: string) => {
    store[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete store[key];
  }),
  clear: vi.fn(() => {
    store = {};
  }),
  get length() {
    return Object.keys(store).length;
  },
  key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
};

function createMissingTableError() {
  return new EdgeFunctionError(
    "Could not find the table 'public.navigation_sessions' in the schema cache",
    500
  );
}

function createSession(id = "nav-1") {
  return {
    id,
    status: "planning" as const,
    origin: {
      id: "origin-1",
      label: "Origin",
      coordinate: { lat: 40.7128, lng: -74.006 },
    },
    destination: {
      id: "destination-1",
      label: "Destination",
      coordinate: { lat: 40.758, lng: -73.9855 },
    },
    activeRouteId: null,
    startedAt: "2026-04-17T12:00:00.000Z",
    activatedAt: null,
    endedAt: null,
    activeSeconds: 0,
    pauses: [],
  };
}

async function loadModule() {
  vi.resetModules();
  requestSupabaseEdgeMock.mockReset();
  return import("./navigationSessionCloudService");
}

beforeEach(() => {
  store = {};
  vi.stubGlobal("localStorage", mockLocalStorage);
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-04-17T12:00:00.000Z"));
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("navigationSessionCloudService", () => {
  it("falls back to local storage and suppresses repeat fetches when navigation_sessions is unavailable", async () => {
    const mod = await loadModule();
    const ownerKey = "user_123";
    const session = createSession();

    await mod.saveNavigationSessionToCloud(ownerKey, session, { enableCloud: false });

    requestSupabaseEdgeMock.mockRejectedValueOnce(createMissingTableError());

    await expect(mod.fetchNavigationSession(ownerKey, { enableCloud: true })).resolves.toEqual(
      session
    );
    expect(requestSupabaseEdgeMock).toHaveBeenCalledTimes(1);

    await expect(mod.fetchNavigationSession(ownerKey, { enableCloud: true })).resolves.toEqual(
      session
    );
    expect(requestSupabaseEdgeMock).toHaveBeenCalledTimes(1);
  });

  it("treats missing-table save failures as local-only success and stops further cloud writes during cooldown", async () => {
    const mod = await loadModule();
    const ownerKey = "user_123";

    requestSupabaseEdgeMock.mockRejectedValueOnce(createMissingTableError());

    await expect(
      mod.saveNavigationSessionToCloud(ownerKey, createSession("nav-1"), { enableCloud: true })
    ).resolves.toBe(true);
    expect(requestSupabaseEdgeMock).toHaveBeenCalledTimes(1);

    await expect(
      mod.saveNavigationSessionToCloud(ownerKey, createSession("nav-2"), { enableCloud: true })
    ).resolves.toBe(true);
    expect(requestSupabaseEdgeMock).toHaveBeenCalledTimes(1);
  });

  it("retries cloud fetches after the unavailable cooldown expires", async () => {
    const mod = await loadModule();

    requestSupabaseEdgeMock.mockRejectedValueOnce(createMissingTableError());

    await expect(mod.fetchNavigationSession("user_123", { enableCloud: true })).resolves.toBeNull();
    expect(requestSupabaseEdgeMock).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(15 * 60 * 1000 + 1);

    requestSupabaseEdgeMock.mockResolvedValueOnce({
      session: null,
      sessionId: null,
      success: true,
    });

    await expect(mod.fetchNavigationSession("user_123", { enableCloud: true })).resolves.toBeNull();
    expect(requestSupabaseEdgeMock).toHaveBeenCalledTimes(2);
  });
});
