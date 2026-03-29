/**
 * Navigation Session Lifecycle — React Hook
 *
 * Manages the navigation session state machine:
 *   idle → planning → active ⇄ paused → ended
 *
 * Tracks elapsed active time, pause history, and ensures
 * only valid transitions occur.
 */

import { useCallback, useRef, useState, useEffect } from "react";

import {
  deleteNavigationSessionFromCloud,
  fetchNavigationSession,
  saveNavigationSessionToCloud,
} from "../../services/navigation/navigationSessionCloudService";
import type {
  NavigationSession,
  NavigationSessionActions,
  NavigationSessionEvent,
  SessionPauseEntry,
  SessionWaypoint,
} from "./sessionTypes";

const ANON_ID_KEY = "bidondent_anon_nav_id";

function getStableAnonId(): string {
  const stored = localStorage.getItem(ANON_ID_KEY);
  if (stored) return stored;
  const id = `anon-${crypto.randomUUID()}`;
  localStorage.setItem(ANON_ID_KEY, id);
  return id;
}

let sessionCounter = 0;

export function useNavigationSession(authUserId?: string): NavigationSessionActions {
  // Helper functions moved outside for clarity
  // ...rest of hook logic remains unchanged

  // Use Clerk user ID when available; stable per-browser anonymous ID otherwise
  const storageOwnerKey = authUserId || getStableAnonId();
  const cloudSyncEnabled = Boolean(authUserId);
  const [session, setSession] = useState<NavigationSession>(createIdleSession);
  const [restoredFromCloud, setRestoredFromCloud] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const sessionRef = useRef(session);
  sessionRef.current = session;

  // Hydrate from Supabase on mount (cloud sync)
  useEffect(() => {
    let mounted = true;
    (async () => {
      const persistedSession = await fetchNavigationSession(storageOwnerKey, {
        enableCloud: cloudSyncEnabled,
      });

      if (persistedSession && mounted && shouldRestoreSession(persistedSession)) {
        setSession((prev) => {
          if (prev.status !== "idle") return prev;
          return persistedSession;
        });
        setRestoredFromCloud(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [storageOwnerKey, cloudSyncEnabled]);

  useEffect(() => {
    if (!session.activatedAt || (session.status !== "active" && session.status !== "paused")) {
      return;
    }

    const syncActiveSeconds = () => {
      setSession((prev) => {
        if (
          !prev.activatedAt ||
          (prev.status !== "active" && prev.status !== "paused" && prev.status !== "ended")
        ) {
          return prev;
        }

        const nextActiveSeconds = computeActiveSeconds(prev);
        if (nextActiveSeconds === prev.activeSeconds) {
          return prev;
        }

        return { ...prev, activeSeconds: nextActiveSeconds };
      });
    };

    syncActiveSeconds();

    if (session.status !== "active") {
      return;
    }

    const intervalId = window.setInterval(syncActiveSeconds, 1000);
    return () => window.clearInterval(intervalId);
  }, [session.activatedAt, session.pauses, session.status]);

  const dispatch = useCallback(
    (event: NavigationSessionEvent) => {
      setSession((prev) => {
        const next = reduceSession(prev, event);

        if (next === prev) {
          return prev;
        }

        if (event.type === "RESET") {
          deleteNavigationSessionFromCloud(storageOwnerKey, prev.id, {
            enableCloud: cloudSyncEnabled,
          }).then(
            () => setSyncError(null),
            (err) => {
              if (import.meta.env.DEV) {
                console.warn("[NavigationSession] Reset cleanup failed", err);
              }
              setSyncError(err instanceof Error ? err.message : "Navigation cleanup failed");
            }
          );
        } else {
          saveNavigationSessionToCloud(storageOwnerKey, next, {
            enableCloud: cloudSyncEnabled,
          }).then(
            () => setSyncError(null),
            (err) => {
              if (import.meta.env.DEV) {
                console.warn("[NavigationSession] Sync error — service will retry", err);
              }
              setSyncError(err instanceof Error ? err.message : "Cloud sync failed");
            }
          );
        }

        if (next.activatedAt && next.status !== "idle") {
          return { ...next, activeSeconds: computeActiveSeconds(next) };
        }
        return next;
      });
    },
    [cloudSyncEnabled, storageOwnerKey]
  );

  const startPlanning = useCallback(
    (origin: SessionWaypoint | null, destination: SessionWaypoint) => {
      dispatch({ type: "START_PLANNING", origin, destination });
    },
    [dispatch]
  );

  const selectRoute = useCallback(
    (routeId: string) => dispatch({ type: "SELECT_ROUTE", routeId }),
    [dispatch]
  );

  const activate = useCallback(() => dispatch({ type: "ACTIVATE" }), [dispatch]);

  const pause = useCallback(
    (reason?: SessionPauseEntry["reason"]) => dispatch({ type: "PAUSE", reason }),
    [dispatch]
  );

  const resume = useCallback(() => dispatch({ type: "RESUME" }), [dispatch]);
  const end = useCallback(() => dispatch({ type: "END" }), [dispatch]);
  const reset = useCallback(() => dispatch({ type: "RESET" }), [dispatch]);

  const isNavigating = session.status === "active" || session.status === "paused";
  const hasSession =
    session.status === "planning" || session.status === "active" || session.status === "paused";

  return {
    startPlanning,
    selectRoute,
    activate,
    pause,
    resume,
    end,
    reset,
    isNavigating,
    hasSession,
    restoredFromCloud,
    syncError,
    session,
  };
}

function shouldRestoreSession(session: NavigationSession): boolean {
  return (
    session.status === "planning" || session.status === "active" || session.status === "paused"
  );
}

// Helper functions (outside the hook)
function createSessionId(): string {
  sessionCounter += 1;
  return `nav-${Date.now()}-${sessionCounter}`;
}

function createIdleSession(): NavigationSession {
  return {
    id: createSessionId(),
    status: "idle",
    origin: null,
    destination: null,
    activeRouteId: null,
    startedAt: null,
    activatedAt: null,
    endedAt: null,
    activeSeconds: 0,
    pauses: [],
  };
}

function reduceSession(
  session: NavigationSession,
  event: NavigationSessionEvent
): NavigationSession {
  const now = new Date().toISOString();

  switch (event.type) {
    case "START_PLANNING": {
      if (session.status !== "idle") return session;
      return {
        ...session,
        status: "planning",
        origin: event.origin,
        destination: event.destination,
        startedAt: now,
      };
    }

    case "SELECT_ROUTE": {
      if (session.status !== "planning" && session.status !== "active") return session;
      return { ...session, activeRouteId: event.routeId };
    }

    case "ACTIVATE": {
      if (session.status !== "planning") return session;
      return { ...session, status: "active", activatedAt: now };
    }

    case "PAUSE": {
      if (session.status !== "active") return session;
      const entry: SessionPauseEntry = {
        pausedAt: now,
        resumedAt: null,
        reason: event.reason ?? "user",
      };
      return {
        ...session,
        status: "paused",
        pauses: [...session.pauses, entry],
      };
    }

    case "RESUME": {
      if (session.status !== "paused") return session;
      const pauses = session.pauses.map((p, i) =>
        i === session.pauses.length - 1 ? { ...p, resumedAt: now } : p
      );
      return { ...session, status: "active", pauses };
    }

    case "END": {
      if (session.status !== "active" && session.status !== "paused") return session;
      // Close any open pause
      const closedPauses = session.pauses.map((p) =>
        p.resumedAt === null ? { ...p, resumedAt: now } : p
      );
      return {
        ...session,
        status: "ended",
        endedAt: now,
        pauses: closedPauses,
      };
    }

    case "RESET": {
      return createIdleSession();
    }

    default:
      return session;
  }
}

function computeActiveSeconds(session: NavigationSession): number {
  if (!session.activatedAt) return 0;

  const activatedMs = Date.parse(session.activatedAt);
  const endMs = session.endedAt ? Date.parse(session.endedAt) : Date.now();
  const totalMs = Math.max(0, endMs - activatedMs);

  let pausedMs = 0;
  for (const pause of session.pauses) {
    const pStart = Date.parse(pause.pausedAt);
    const pEnd = pause.resumedAt ? Date.parse(pause.resumedAt) : Date.now();
    pausedMs += Math.max(0, pEnd - pStart);
  }

  return Math.max(0, Math.round((totalMs - pausedMs) / 1000));
}
