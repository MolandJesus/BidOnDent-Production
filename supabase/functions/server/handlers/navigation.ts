import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { requireClerkSession } from "../utils/authz.ts";
import { sanitizeErrorMessage } from "../utils/helpers.ts";

type RespondFunction = (
  body: Record<string, unknown>,
  status?: number,
  headers?: Record<string, string>
) => Response;

function getNavigationErrorStatus(error: unknown) {
  const message = error instanceof Error ? error.message : "";

  if (message === "No Authorization header provided" || message.includes("Authorization header")) {
    return 401;
  }

  return 500;
}

function isNavigationSessionPayload(value: unknown) {
  return typeof value === "object" && value !== null;
}

export async function getNavigationSession(
  req: Request,
  supabase: SupabaseClient,
  respond: RespondFunction
): Promise<Response> {
  try {
    const session = await requireClerkSession(req, { requireEmail: false });

    const { data, error } = await supabase
      .from("navigation_sessions")
      .select("session_data, session_id, updated_at")
      .eq("clerk_user_id", session.clerkUserId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      return respond({ error: sanitizeErrorMessage(error) }, 500);
    }

    return respond({
      session: data?.session_data ?? null,
      sessionId: typeof data?.session_id === "string" ? data.session_id : null,
      success: true,
    });
  } catch (error) {
    return respond({ error: sanitizeErrorMessage(error) }, getNavigationErrorStatus(error));
  }
}

export async function saveNavigationSession(
  req: Request,
  supabase: SupabaseClient,
  respond: RespondFunction
): Promise<Response> {
  try {
    const session = await requireClerkSession(req, { requireEmail: false });
    let body: Record<string, unknown> = {};

    try {
      body = await req.json();
    } catch {
      return respond({ error: "Invalid JSON in request body" }, 400);
    }

    const sessionId = typeof body.sessionId === "string" ? body.sessionId.trim() : "";
    const navigationSession = body.session;

    if (!sessionId) {
      return respond({ error: "Missing sessionId" }, 400);
    }

    if (!isNavigationSessionPayload(navigationSession)) {
      return respond({ error: "Missing session payload" }, 400);
    }

    const { error } = await supabase.from("navigation_sessions").upsert(
      {
        clerk_user_id: session.clerkUserId,
        session_data: navigationSession,
        session_id: sessionId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "clerk_user_id,session_id" }
    );

    if (error) {
      return respond({ error: sanitizeErrorMessage(error) }, 500);
    }

    return respond({ success: true });
  } catch (error) {
    return respond({ error: sanitizeErrorMessage(error) }, getNavigationErrorStatus(error));
  }
}

export async function deleteNavigationSession(
  req: Request,
  supabase: SupabaseClient,
  respond: RespondFunction
): Promise<Response> {
  try {
    const session = await requireClerkSession(req, { requireEmail: false });
    let body: Record<string, unknown> = {};

    try {
      body = await req.json();
    } catch {
      return respond({ error: "Invalid JSON in request body" }, 400);
    }

    const sessionId = typeof body.sessionId === "string" ? body.sessionId.trim() : "";

    if (!sessionId) {
      return respond({ error: "Missing sessionId" }, 400);
    }

    const { error } = await supabase
      .from("navigation_sessions")
      .delete()
      .eq("clerk_user_id", session.clerkUserId)
      .eq("session_id", sessionId);

    if (error) {
      return respond({ error: sanitizeErrorMessage(error) }, 500);
    }

    return respond({ success: true });
  } catch (error) {
    return respond({ error: sanitizeErrorMessage(error) }, getNavigationErrorStatus(error));
  }
}
