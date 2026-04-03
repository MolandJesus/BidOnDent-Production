import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ── localStorage mock ───────────────────────────────────────────────────────

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

beforeEach(() => {
  store = {};
  vi.stubGlobal("localStorage", mockLocalStorage);
  vi.useFakeTimers();
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

// ── savedLocations ──────────────────────────────────────────────────────────

describe("savedLocations", () => {
  async function loadModule() {
    vi.resetModules();
    return import("./savedLocations");
  }

  it("loadSavedNavigationLocations returns empty array when no data", async () => {
    const mod = await loadModule();
    expect(mod.loadSavedNavigationLocations()).toEqual([]);
  });

  it("createNavigationSavedLocation generates correct shape", async () => {
    vi.setSystemTime(new Date("2026-04-03T12:00:00Z"));
    const mod = await loadModule();

    const location = mod.createNavigationSavedLocation({
      label: "Home",
      category: "home",
      coordinate: { lat: 30.267, lng: -97.743 },
    });

    expect(location.label).toBe("Home");
    expect(location.category).toBe("home");
    expect(location.coordinate.lat).toBe(30.267);
    expect(location.id).toMatch(/^home-/);
    expect(location.createdAt).toBe("2026-04-03T12:00:00.000Z");
  });

  it("addSavedNavigationLocation persists and loads back", async () => {
    vi.setSystemTime(new Date("2026-04-03T12:00:00Z"));
    const mod = await loadModule();

    mod.addSavedNavigationLocation({
      label: "Work",
      category: "work",
      coordinate: { lat: 30.5, lng: -97.7 },
    });

    const loaded = mod.loadSavedNavigationLocations();
    expect(loaded).toHaveLength(1);
    expect(loaded[0].label).toBe("Work");
  });

  it("upsertSavedNavigationLocation replaces existing by id", async () => {
    vi.setSystemTime(new Date("2026-04-03T12:00:00Z"));
    const mod = await loadModule();

    const loc = mod.createNavigationSavedLocation({
      label: "Gym",
      category: "saved",
      coordinate: { lat: 30.3, lng: -97.8 },
    });

    mod.upsertSavedNavigationLocation(loc);
    mod.upsertSavedNavigationLocation({ ...loc, label: "Updated Gym" });

    const loaded = mod.loadSavedNavigationLocations();
    expect(loaded).toHaveLength(1);
    expect(loaded[0].label).toBe("Updated Gym");
  });

  it("removeSavedNavigationLocation removes by id", async () => {
    vi.setSystemTime(new Date("2026-04-03T12:00:00Z"));
    const mod = await loadModule();

    const loc = mod.addSavedNavigationLocation({
      label: "Coffee",
      category: "saved",
      coordinate: { lat: 30.4, lng: -97.6 },
    });

    mod.removeSavedNavigationLocation(loc.id);
    expect(mod.loadSavedNavigationLocations()).toHaveLength(0);
  });

  it("markRecentNavigationLocation creates a recent entry", async () => {
    vi.setSystemTime(new Date("2026-04-03T12:00:00Z"));
    const mod = await loadModule();

    mod.markRecentNavigationLocation({
      label: "Shop Visit",
      coordinate: { lat: 30.35, lng: -97.75 },
    });

    const loaded = mod.loadSavedNavigationLocations();
    expect(loaded).toHaveLength(1);
    expect(loaded[0].category).toBe("recent");
  });

  it("markRecentNavigationLocation updates existing recent instead of duplicating", async () => {
    vi.setSystemTime(new Date("2026-04-03T12:00:00Z"));
    const mod = await loadModule();

    const coord = { lat: 30.35, lng: -97.75 };
    mod.markRecentNavigationLocation({ label: "Repeat Place", coordinate: coord });

    vi.setSystemTime(new Date("2026-04-03T13:00:00Z"));
    mod.markRecentNavigationLocation({ label: "Repeat Place", coordinate: coord });

    const loaded = mod.loadSavedNavigationLocations();
    const recents = loaded.filter((l) => l.category === "recent");
    expect(recents).toHaveLength(1);
  });

  it("normalization caps recent locations at MAX_RECENT_LOCATIONS (6)", async () => {
    vi.setSystemTime(new Date("2026-04-03T12:00:00Z"));
    const mod = await loadModule();

    for (let i = 0; i < 8; i++) {
      vi.setSystemTime(new Date(Date.now() + i * 1000));
      mod.markRecentNavigationLocation({
        label: `Place ${i}`,
        coordinate: { lat: 30 + i * 0.01, lng: -97 - i * 0.01 },
      });
    }

    const loaded = mod.loadSavedNavigationLocations();
    const recents = loaded.filter((l) => l.category === "recent");
    expect(recents.length).toBeLessThanOrEqual(6);
  });

  it("touchSavedNavigationLocation updates lastUsedAt", async () => {
    vi.setSystemTime(new Date("2026-04-03T12:00:00Z"));
    const mod = await loadModule();

    const loc = mod.addSavedNavigationLocation({
      label: "Touch Test",
      category: "saved",
      coordinate: { lat: 30.1, lng: -97.1 },
    });

    vi.setSystemTime(new Date("2026-04-03T15:00:00Z"));
    mod.touchSavedNavigationLocation(loc.id);

    const loaded = mod.loadSavedNavigationLocations();
    expect(loaded[0].lastUsedAt).toBe("2026-04-03T15:00:00.000Z");
  });
});

// ── parkedCarLocation ───────────────────────────────────────────────────────

describe("parkedCarLocation", () => {
  async function loadModule() {
    vi.resetModules();
    return import("./parkedCarLocation");
  }

  it("loadParkedCarLocation returns null when no data", async () => {
    const mod = await loadModule();
    expect(mod.loadParkedCarLocation()).toBeNull();
  });

  it("saveParkedCarLocation persists and loadParkedCarLocation reads back", async () => {
    vi.setSystemTime(new Date("2026-04-03T12:00:00Z"));
    const mod = await loadModule();

    const saved = mod.saveParkedCarLocation({
      coordinate: { lat: 30.267, lng: -97.743 },
      accuracyMeters: 15,
      roadName: "Main St",
    });

    expect(saved.coordinate.lat).toBe(30.267);
    expect(saved.label).toBe("Parked Car");
    expect(saved.roadName).toBe("Main St");
    expect(saved.accuracyMeters).toBe(15);

    const loaded = mod.loadParkedCarLocation();
    expect(loaded).not.toBeNull();
    expect(loaded!.coordinate.lat).toBeCloseTo(30.267, 4);
    expect(loaded!.roadName).toBe("Main St");
  });

  it("clearParkedCarLocation removes persisted data", async () => {
    vi.setSystemTime(new Date("2026-04-03T12:00:00Z"));
    const mod = await loadModule();

    mod.saveParkedCarLocation({
      coordinate: { lat: 30.267, lng: -97.743 },
    });

    mod.clearParkedCarLocation();
    expect(mod.loadParkedCarLocation()).toBeNull();
  });

  it("auto-expires parked car after 24 hours", async () => {
    vi.setSystemTime(new Date("2026-04-03T12:00:00Z"));
    const mod = await loadModule();

    mod.saveParkedCarLocation({
      coordinate: { lat: 30.267, lng: -97.743 },
    });

    // Advance 25 hours
    vi.setSystemTime(new Date("2026-04-04T13:00:00Z"));
    expect(mod.loadParkedCarLocation()).toBeNull();
  });

  it("parked car is still valid within 24 hours", async () => {
    vi.setSystemTime(new Date("2026-04-03T12:00:00Z"));
    const mod = await loadModule();

    mod.saveParkedCarLocation({
      coordinate: { lat: 30.267, lng: -97.743 },
    });

    // Advance 23 hours
    vi.setSystemTime(new Date("2026-04-04T11:00:00Z"));
    expect(mod.loadParkedCarLocation()).not.toBeNull();
  });

  it("handles missing optional fields gracefully", async () => {
    vi.setSystemTime(new Date("2026-04-03T12:00:00Z"));
    const mod = await loadModule();

    const saved = mod.saveParkedCarLocation({
      coordinate: { lat: 30.267, lng: -97.743 },
    });

    expect(saved.accuracyMeters).toBeUndefined();
    expect(saved.roadName).toBeUndefined();
  });
});
