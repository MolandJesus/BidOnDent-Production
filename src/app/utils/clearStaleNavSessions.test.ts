/**
 * Tests for clearStaleNavSessions — Pass 212.
 *
 * KI-117 hygiene surface. Two pure side-effect localStorage helpers:
 *   - clearStalePlanningNavSessions: sweeps stale "planning" sessions
 *     (never-activated OR untouched > maxAgeMs).
 *   - clearAllUserScopedSessionKeys: nuke-all on sign-out (KI-133/KI-134).
 *
 * Tests use jsdom localStorage directly. afterEach clears storage so
 * tests cannot bleed.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  clearAllUserScopedSessionKeys,
  clearStalePlanningNavSessions,
} from "./clearStaleNavSessions";

const NOW = 1_700_000_000_000; // fixed ms for deterministic age math
const ONE_MIN = 60 * 1000;

function createMemoryStorage(): Storage {
  let entries = new Map<string, string>();
  return {
    get length() {
      return entries.size;
    },
    clear() {
      entries = new Map();
    },
    getItem(key: string) {
      return entries.has(key) ? (entries.get(key) ?? null) : null;
    },
    key(index: number) {
      return Array.from(entries.keys())[index] ?? null;
    },
    removeItem(key: string) {
      entries.delete(key);
    },
    setItem(key: string, value: string) {
      entries.set(key, String(value));
    },
  };
}

function setSession(key: string, payload: Record<string, unknown>): void {
  window.localStorage.setItem(key, JSON.stringify(payload));
}

beforeEach(() => {
  Object.defineProperty(window, "localStorage", {
    value: createMemoryStorage(),
    configurable: true,
  });
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
});

afterEach(() => {
  vi.useRealTimers();
});

// ---------------------------------------------------------------------------
// clearStalePlanningNavSessions
// ---------------------------------------------------------------------------
describe("clearStalePlanningNavSessions", () => {
  it("removes sessions that never activated (activatedAt missing) — covers KI-117", () => {
    setSession("bidondent_nav_session_aaa", {
      status: "planning",
      activatedAt: null,
      updatedAt: NOW,
    });
    expect(clearStalePlanningNavSessions()).toBe(1);
    expect(window.localStorage.getItem("bidondent_nav_session_aaa")).toBeNull();
  });

  it("removes planning sessions older than the maxAgeMs window", () => {
    setSession("bidondent_nav_session_old", {
      status: "planning",
      activatedAt: NOW - 2 * 60 * 60 * 1000,
      updatedAt: NOW - 60 * 60 * 1000, // 60 min ago > 30 min default
    });
    expect(clearStalePlanningNavSessions()).toBe(1);
  });

  it("keeps planning sessions that were updated within the window", () => {
    setSession("bidondent_nav_session_fresh", {
      status: "planning",
      activatedAt: NOW - 5 * ONE_MIN,
      updatedAt: NOW - 5 * ONE_MIN, // 5 min ago, well inside 30 min default
    });
    expect(clearStalePlanningNavSessions()).toBe(0);
    expect(window.localStorage.getItem("bidondent_nav_session_fresh")).not.toBeNull();
  });

  it("respects a custom maxAgeMs window", () => {
    setSession("bidondent_nav_session_x", {
      status: "planning",
      activatedAt: NOW - 10 * ONE_MIN,
      updatedAt: NOW - 10 * ONE_MIN,
    });
    // 10 min old, custom cutoff 5 min → stale → removed
    expect(clearStalePlanningNavSessions(5 * ONE_MIN)).toBe(1);
  });

  it("does NOT touch non-planning sessions (active, completed, etc.)", () => {
    setSession("bidondent_nav_session_active", {
      status: "active",
      activatedAt: null,
      updatedAt: NOW - 60 * 60 * 1000,
    });
    setSession("bidondent_nav_session_done", {
      status: "completed",
      activatedAt: null,
      updatedAt: NOW - 60 * 60 * 1000,
    });
    expect(clearStalePlanningNavSessions()).toBe(0);
    expect(window.localStorage.getItem("bidondent_nav_session_active")).not.toBeNull();
    expect(window.localStorage.getItem("bidondent_nav_session_done")).not.toBeNull();
  });

  it("removes unparseable entries under the nav-session prefix", () => {
    window.localStorage.setItem("bidondent_nav_session_bad", "{not valid json");
    expect(clearStalePlanningNavSessions()).toBe(1);
    expect(window.localStorage.getItem("bidondent_nav_session_bad")).toBeNull();
  });

  it("ignores keys outside the nav-session prefix", () => {
    setSession("other_key_planning", {
      status: "planning",
      activatedAt: null,
      updatedAt: NOW - 60 * 60 * 1000,
    });
    setSession("bidondent_user:abc", { foo: "bar" });
    expect(clearStalePlanningNavSessions()).toBe(0);
    expect(window.localStorage.getItem("other_key_planning")).not.toBeNull();
    expect(window.localStorage.getItem("bidondent_user:abc")).not.toBeNull();
  });

  it("returns 0 with no nav-session keys present", () => {
    expect(clearStalePlanningNavSessions()).toBe(0);
  });

  it("accepts ISO date string for updatedAt", () => {
    setSession("bidondent_nav_session_iso", {
      status: "planning",
      activatedAt: new Date(NOW - 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(NOW - 60 * 60 * 1000).toISOString(),
    });
    expect(clearStalePlanningNavSessions()).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// clearAllUserScopedSessionKeys
// ---------------------------------------------------------------------------
describe("clearAllUserScopedSessionKeys", () => {
  it("removes every user-scoped key in one sweep", () => {
    setSession("bidondent_nav_session_abc", { status: "planning" });
    setSession("bidondent_nav_active_session_abc", { id: "x" });
    setSession("bidondent_user:user_123", { profile: {} });
    window.localStorage.setItem("coverageCurrentLocation", '{"lat":0,"lng":0}');
    window.localStorage.setItem("bidondent_nav_pending_writes", "[]");
    window.localStorage.setItem("bidondent_nav_cloud_unavailable", "1");

    const removed = clearAllUserScopedSessionKeys();

    expect(removed).toBe(6);
    expect(window.localStorage.getItem("bidondent_nav_session_abc")).toBeNull();
    expect(window.localStorage.getItem("bidondent_nav_active_session_abc")).toBeNull();
    expect(window.localStorage.getItem("bidondent_user:user_123")).toBeNull();
    expect(window.localStorage.getItem("coverageCurrentLocation")).toBeNull();
    expect(window.localStorage.getItem("bidondent_nav_pending_writes")).toBeNull();
    expect(window.localStorage.getItem("bidondent_nav_cloud_unavailable")).toBeNull();
  });

  it("ignores unrelated keys", () => {
    window.localStorage.setItem("theme", "dark");
    window.localStorage.setItem("bidondent_app_version", "1.0");
    expect(clearAllUserScopedSessionKeys()).toBe(0);
    expect(window.localStorage.getItem("theme")).toBe("dark");
    expect(window.localStorage.getItem("bidondent_app_version")).toBe("1.0");
  });

  it("is idempotent (second call removes nothing)", () => {
    setSession("bidondent_user:abc", { foo: "bar" });
    expect(clearAllUserScopedSessionKeys()).toBe(1);
    expect(clearAllUserScopedSessionKeys()).toBe(0);
  });

  it("returns 0 with empty storage", () => {
    expect(clearAllUserScopedSessionKeys()).toBe(0);
  });
});
