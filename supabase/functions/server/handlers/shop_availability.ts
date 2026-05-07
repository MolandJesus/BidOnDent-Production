/**
 * Edge handler — shop_availability (Pass 59, F4 scaffolding)
 *
 * Routes:
 *   PUT /shop-availability         → upsert own availability snapshot
 *   GET /shop-availability/:shopId → public read of one shop's availability
 *
 * Mirrors navigation_saved_places.ts (Pass 58) for KI-095 graceful-
 * degradation: missing column / table / RLS deny (42P01 / 42703 / 42501 /
 * 0LP01) → returns `fallback: true` with HTTP 200 so the client circuit
 * breaker trips and UI keeps rendering without realtime data until the
 * migration is applied.
 *
 * Auth: Clerk via requireClerkSession (verify_jwt:false at the gateway, see
 * supabase/config.toml [functions.server]).
 *
 * No list endpoint: customers consume the live picture via the realtime
 * subscription on shop_profiles. One-shot `GET /shop-availability/:shopId`
 * exists for fallback / single-marker rehydration only.
 */
import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { requireClerkSession } from "../utils/authz.ts";
import { sanitizeErrorMessage } from "../utils/helpers.ts";

type RespondFunction = (
  body: Record<string, unknown>,
  status?: number,
  headers?: Record<string, string>
) => Response;

// 42P01 undefined_table, 42703 undefined_column, 42501 insufficient_privilege,
// 0LP01 invalid_grant_operation. Any of these mean the migration in
// 20260507000002_add_shop_availability_columns.sql has not been applied.
const PERSISTENCE_UNAVAILABLE_CODES = ["42P01", "42703", "42501", "0LP01"];

const NOTE_MAX_LEN = 200;

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

function shapeAvailability(row: Record<string, unknown> | null) {
  if (!row) return null;
  return {
    shopId: row.id ?? null,
    isAvailable: Boolean(row.is_available),
    availableUntil: (row.available_until as string | null) ?? null,
    availabilityUpdatedAt: (row.availability_updated_at as string | null) ?? null,
    availabilityNote: (row.availability_note as string | null) ?? null,
  };
}

export async function updateOwnShopAvailability(
  req: Request,
  supabase: SupabaseClient,
  respond: RespondFunction
): Promise<Response> {
  try {
    const session = await requireClerkSession(req, { requireEmail: false });
    const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;

    if (!body || typeof body !== "object") {
      return respond({ error: "Missing payload" }, 400);
    }

    const isAvailable = body.isAvailable === true;
    const availableUntilRaw = body.availableUntil;
    const noteRaw = body.note;

    let availableUntil: string | null = null;
    if (typeof availableUntilRaw === "string" && availableUntilRaw.length > 0) {
      const parsed = new Date(availableUntilRaw);
      if (Number.isNaN(parsed.getTime())) {
        return respond({ error: "Invalid availableUntil" }, 400);
      }
      availableUntil = parsed.toISOString();
    }

    let note: string | null = null;
    if (typeof noteRaw === "string") {
      const trimmed = noteRaw.trim();
      note = trimmed.length === 0 ? null : trimmed.slice(0, NOTE_MAX_LEN);
    }

    const { data, error } = await supabase
      .from("shop_profiles")
      .update({
        is_available: isAvailable,
        available_until: availableUntil,
        availability_note: note,
        availability_updated_at: new Date().toISOString(),
      })
      .eq("clerk_user_id", session.clerkUserId)
      .select("id, is_available, available_until, availability_updated_at, availability_note")
      .maybeSingle();

    if (error) {
      logPostgrestError("updateOwnShopAvailability update", error);
      if (isPersistenceUnavailable(error)) {
        return respond({ success: true, fallback: true }, 200);
      }
      return respond({ error: "Failed to update availability" }, 500);
    }

    if (!data) {
      // Caller is signed in but has no shop_profiles row — treat as 404 so
      // non-shop accounts can't silently succeed.
      return respond({ error: "Shop profile not found for this user" }, 404);
    }

    return respond({ availability: shapeAvailability(data), success: true });
  } catch (error) {
    return respond({ error: sanitizeErrorMessage(error) }, getAuthErrorStatus(error));
  }
}

export async function getShopAvailability(
  req: Request,
  supabase: SupabaseClient,
  respond: RespondFunction,
  shopId: string
): Promise<Response> {
  try {
    // Public read: anyone can ask "is shop X available?" — no Clerk session
    // required. The shop profile SELECT policy already permits authenticated
    // reads, and unauthenticated map widgets just degrade to no marker dot.
    if (!shopId) {
      return respond({ error: "Missing shopId" }, 400);
    }

    const { data, error } = await supabase
      .from("shop_profiles")
      .select("id, is_available, available_until, availability_updated_at, availability_note")
      .eq("id", shopId)
      .maybeSingle();

    if (error) {
      logPostgrestError("getShopAvailability select", error);
      if (isPersistenceUnavailable(error)) {
        return respond({ availability: null, fallback: true }, 200);
      }
      return respond({ error: "Failed to fetch availability" }, 500);
    }

    return respond({ availability: shapeAvailability(data), success: true });
  } catch (error) {
    return respond({ error: sanitizeErrorMessage(error) }, getAuthErrorStatus(error));
  }
}
