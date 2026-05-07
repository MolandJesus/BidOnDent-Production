/**
 * Edge handler — navigation_saved_places (Pass 58, F2 scaffolding)
 *
 * Routes:
 *   GET    /navigation-saved-places           → list places for the signed-in user
 *   PUT    /navigation-saved-places           → upsert one place (by client_id)
 *   DELETE /navigation-saved-places/:clientId → delete one place by client_id
 *
 * KI-095 graceful-degradation contract: if the underlying table is missing
 * (42P01) or RLS denies the service role (42501 / 0LP01), GET returns
 * `{ places: [], fallback: true }` with HTTP 200 so the client UI keeps
 * working off its localStorage mirror. PUT/DELETE return `{ success: true,
 * fallback: true }` with 200 in the same scenarios — the client treats those
 * as "cloud unreachable, localStorage already updated, retry next session".
 *
 * Auth: Clerk via requireClerkSession (verify_jwt:false at the gateway, see
 * supabase/config.toml [functions.server]).
 */
import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { requireClerkSession } from "../utils/authz.ts";
import { sanitizeErrorMessage } from "../utils/helpers.ts";

type RespondFunction = (
  body: Record<string, unknown>,
  status?: number,
  headers?: Record<string, string>
) => Response;

const PERSISTENCE_UNAVAILABLE_CODES = ["42P01", "42501", "0LP01"];

function isPersistenceUnavailable(error: unknown): boolean {
  const code = (error as { code?: string } | null)?.code;
  return code !== undefined && PERSISTENCE_UNAVAILABLE_CODES.includes(code);
}

function logPostgrestError(context: string, error: unknown): void {
  const e = error as { code?: string; message?: string; details?: string; hint?: string } | null;
  console.error(`${context}:`, {
    code: e?.code,
    message: e?.message,
    details: e?.details,
    hint: e?.hint,
  });
}

function getAuthErrorStatus(error: unknown): number {
  const message = error instanceof Error ? error.message : "";
  if (message === "No Authorization header provided" || message.includes("Authorization header")) {
    return 401;
  }
  return 500;
}

type SavedPlaceRow = {
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

function isValidCategory(value: unknown): value is SavedPlaceRow["category"] {
  return value === "home" || value === "work" || value === "saved" || value === "recent";
}

export async function getNavigationSavedPlaces(
  req: Request,
  supabase: SupabaseClient,
  respond: RespondFunction
): Promise<Response> {
  try {
    const session = await requireClerkSession(req, { requireEmail: false });

    const { data, error } = await supabase
      .from("navigation_saved_places")
      .select("*")
      .eq("clerk_user_id", session.clerkUserId)
      .order("updated_at", { ascending: false });

    if (error) {
      logPostgrestError("getNavigationSavedPlaces select", error);
      if (isPersistenceUnavailable(error)) {
        return respond({ places: [], fallback: true }, 200);
      }
      return respond({ error: "Failed to fetch saved places" }, 500);
    }

    return respond({ places: data ?? [], success: true });
  } catch (error) {
    return respond({ error: sanitizeErrorMessage(error) }, getAuthErrorStatus(error));
  }
}

export async function upsertNavigationSavedPlace(
  req: Request,
  supabase: SupabaseClient,
  respond: RespondFunction
): Promise<Response> {
  try {
    const session = await requireClerkSession(req, { requireEmail: false });
    const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
    const place = body && typeof body === "object" ? (body.place as Record<string, unknown>) : null;

    if (!place || typeof place !== "object") {
      return respond({ error: "Missing place payload" }, 400);
    }

    const clientId = typeof place.client_id === "string" ? place.client_id : null;
    const label = typeof place.label === "string" ? place.label : null;
    const category = isValidCategory(place.category) ? place.category : null;
    const lat = typeof place.lat === "number" && Number.isFinite(place.lat) ? place.lat : null;
    const lng = typeof place.lng === "number" && Number.isFinite(place.lng) ? place.lng : null;

    if (!clientId || !label || !category || lat === null || lng === null) {
      return respond({ error: "Invalid place payload" }, 400);
    }

    const subtitle = typeof place.subtitle === "string" ? place.subtitle : null;
    const lastUsedAt = typeof place.last_used_at === "string" ? place.last_used_at : null;

    const { data, error } = await supabase
      .from("navigation_saved_places")
      .upsert(
        {
          clerk_user_id: session.clerkUserId,
          client_id: clientId,
          label,
          subtitle,
          category,
          lat,
          lng,
          last_used_at: lastUsedAt,
        },
        { onConflict: "clerk_user_id,client_id" }
      )
      .select("*")
      .single();

    if (error) {
      logPostgrestError("upsertNavigationSavedPlace upsert", error);
      if (isPersistenceUnavailable(error)) {
        return respond({ success: true, fallback: true }, 200);
      }
      return respond({ error: "Failed to save place" }, 500);
    }

    return respond({ place: data, success: true });
  } catch (error) {
    return respond({ error: sanitizeErrorMessage(error) }, getAuthErrorStatus(error));
  }
}

export async function deleteNavigationSavedPlace(
  req: Request,
  supabase: SupabaseClient,
  respond: RespondFunction,
  clientId: string
): Promise<Response> {
  try {
    const session = await requireClerkSession(req, { requireEmail: false });

    if (!clientId) {
      return respond({ error: "Missing client_id" }, 400);
    }

    const { error } = await supabase
      .from("navigation_saved_places")
      .delete()
      .eq("clerk_user_id", session.clerkUserId)
      .eq("client_id", clientId);

    if (error) {
      logPostgrestError("deleteNavigationSavedPlace delete", error);
      if (isPersistenceUnavailable(error)) {
        return respond({ success: true, fallback: true }, 200);
      }
      return respond({ error: "Failed to delete place" }, 500);
    }

    return respond({ success: true });
  } catch (error) {
    return respond({ error: sanitizeErrorMessage(error) }, getAuthErrorStatus(error));
  }
}
