/**
 * Client service — navigation_saved_places (Pass 58, F2 scaffolding)
 *
 * Mirrors the notificationPreferences.ts circuit-breaker pattern: any failure
 * (including KI-095 fallback:true responses) trips a 60s backoff so the hook
 * doesn't hammer the edge function while the table is unapplied or RLS is
 * misconfigured. The hook treats every cloud call as fire-and-forget — the
 * authoritative cache is always localStorage (savedLocations.ts), so a
 * silent failure here just means cross-device sync stops until the next
 * successful round-trip.
 *
 * Edge contract:
 *   GET    /navigation-saved-places            → { places: SavedPlaceRow[] }
 *   PUT    /navigation-saved-places            → { place: SavedPlaceRow }
 *   DELETE /navigation-saved-places/:clientId  → { success: true }
 *
 * Either GET or mutating calls may carry `fallback: true` when the table is
 * missing — see handler at supabase/functions/server/handlers/navigation_saved_places.ts.
 */
import { requestSupabaseEdge, SUPABASE_EDGE_ROUTES } from "./runtime";
import type { NavigationSavedLocation } from "../../types/navigation";

export type SavedPlaceRow = {
  id: string;
  clerk_user_id: string;
  client_id: string;
  label: string;
  subtitle: string | null;
  category: "home" | "work" | "saved" | "recent";
  lat: number;
  lng: number;
  last_used_at: string | null;
  created_at: string;
  updated_at: string;
};

let cachedFailure: { until: number } | null = null;
const FAILURE_BACKOFF_MS = 60_000;

function tripFailureBackoff() {
  cachedFailure = { until: Date.now() + FAILURE_BACKOFF_MS };
}

function backoffActive(): boolean {
  return Boolean(cachedFailure && Date.now() < cachedFailure.until);
}

function clearBackoff() {
  cachedFailure = null;
}

export async function fetchNavigationSavedPlaces(): Promise<{
  places: SavedPlaceRow[];
  fallback: boolean;
}> {
  if (backoffActive()) {
    return { places: [], fallback: true };
  }
  try {
    const result = await requestSupabaseEdge<{
      places: SavedPlaceRow[];
      fallback?: boolean;
    }>(SUPABASE_EDGE_ROUTES.navigationSavedPlaces, { method: "GET" });
    if (result.fallback) {
      tripFailureBackoff();
      return { places: [], fallback: true };
    }
    clearBackoff();
    return { places: result.places ?? [], fallback: false };
  } catch (err) {
    tripFailureBackoff();
    return { places: [], fallback: true };
  }
}

export async function upsertNavigationSavedPlace(
  location: NavigationSavedLocation
): Promise<boolean> {
  if (backoffActive()) return false;
  try {
    const result = await requestSupabaseEdge<{
      place?: SavedPlaceRow;
      success?: boolean;
      fallback?: boolean;
    }>(SUPABASE_EDGE_ROUTES.navigationSavedPlaces, {
      method: "PUT",
      body: JSON.stringify({
        place: {
          client_id: location.id,
          label: location.label,
          subtitle: location.subtitle ?? null,
          category: location.category,
          lat: location.coordinate.lat,
          lng: location.coordinate.lng,
          last_used_at: location.lastUsedAt ?? null,
        },
      }),
    });
    if (result.fallback) {
      tripFailureBackoff();
      return false;
    }
    clearBackoff();
    return Boolean(result.success ?? result.place);
  } catch (err) {
    tripFailureBackoff();
    return false;
  }
}

export async function deleteNavigationSavedPlace(clientId: string): Promise<boolean> {
  if (backoffActive()) return false;
  try {
    const result = await requestSupabaseEdge<{
      success?: boolean;
      fallback?: boolean;
    }>(`${SUPABASE_EDGE_ROUTES.navigationSavedPlaces}/${encodeURIComponent(clientId)}`, {
      method: "DELETE",
    });
    if (result.fallback) {
      tripFailureBackoff();
      return false;
    }
    clearBackoff();
    return Boolean(result.success);
  } catch (err) {
    tripFailureBackoff();
    return false;
  }
}
