import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { requireClerkSession } from "../utils/authz.ts";
import { sanitizeErrorMessage } from "../utils/helpers.ts";

type RespondFunction = (
  body: Record<string, unknown>,
  status?: number,
  headers?: Record<string, string>
) => Response;

const VALID_JOB_STATUSES = new Set([
  "scheduled",
  "in_progress",
  "awaiting_parts",
  "completed",
  "cancelled",
]);

function getWorkflowErrorStatus(error: unknown) {
  const message = error instanceof Error ? error.message : "";

  if (message === "No Authorization header provided" || message.includes("Authorization header")) {
    return 401;
  }

  return 500;
}

function getString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function logWorkflowEvent(
  req: Request,
  supabase: SupabaseClient,
  respond: RespondFunction
): Promise<Response> {
  try {
    await requireClerkSession(req, { requireEmail: false });

    let body: Record<string, unknown> = {};
    try {
      body = await req.json();
    } catch {
      return respond({ error: "Invalid JSON in request body" }, 400);
    }

    const eventType = getString(body.event_type);
    const source = getString(body.source) || "app";
    const payload =
      typeof body.payload === "object" && body.payload !== null
        ? (body.payload as Record<string, unknown>)
        : {};

    if (!eventType) {
      return respond({ error: "Missing event_type" }, 400);
    }

    const { data, error } = await supabase
      .from("platform_activity_events")
      .insert({
        event_type: eventType,
        payload,
        source,
      })
      .select("id")
      .single();

    if (error) {
      return respond({ error: sanitizeErrorMessage(error) }, 500);
    }

    return respond({
      eventId: data?.id || null,
      success: true,
    });
  } catch (error) {
    return respond({ error: sanitizeErrorMessage(error) }, getWorkflowErrorStatus(error));
  }
}

export async function createJobAssignment(
  req: Request,
  supabase: SupabaseClient,
  respond: RespondFunction
): Promise<Response> {
  try {
    await requireClerkSession(req, { requireEmail: false });

    let body: Record<string, unknown> = {};
    try {
      body = await req.json();
    } catch {
      return respond({ error: "Invalid JSON in request body" }, 400);
    }

    const payload = {
      bid_id: getString(body.bid_id) || null,
      customer_user_id: getString(body.customer_user_id),
      damage_report_id: getString(body.damage_report_id),
      estimated_completion_at: getString(body.estimated_completion_at) || null,
      insurer_user_id: getString(body.insurer_user_id) || null,
      scheduled_start_at: getString(body.scheduled_start_at) || null,
      shop_user_id: getString(body.shop_user_id),
      status: getString(body.status) || "scheduled",
    };

    if (
      !payload.damage_report_id ||
      !payload.customer_user_id ||
      !payload.shop_user_id ||
      !VALID_JOB_STATUSES.has(payload.status)
    ) {
      return respond({ error: "Invalid job assignment payload" }, 400);
    }

    const { data, error } = await supabase
      .from("job_assignments")
      .insert(payload)
      .select("id, status")
      .single();

    if (error) {
      return respond({ error: sanitizeErrorMessage(error) }, 500);
    }

    return respond({
      assignment: data || null,
      success: true,
    });
  } catch (error) {
    return respond({ error: sanitizeErrorMessage(error) }, getWorkflowErrorStatus(error));
  }
}

export async function updateJobAssignmentStatus(
  req: Request,
  supabase: SupabaseClient,
  respond: RespondFunction
): Promise<Response> {
  try {
    await requireClerkSession(req, { requireEmail: false });

    let body: Record<string, unknown> = {};
    try {
      body = await req.json();
    } catch {
      return respond({ error: "Invalid JSON in request body" }, 400);
    }

    const assignmentId = getString(body.assignmentId);
    const status = getString(body.status);

    if (!assignmentId || !VALID_JOB_STATUSES.has(status)) {
      return respond({ error: "Invalid job assignment status update" }, 400);
    }

    const { data, error } = await supabase
      .from("job_assignments")
      .update({ status })
      .eq("id", assignmentId)
      .select("id, status")
      .single();

    if (error) {
      return respond({ error: sanitizeErrorMessage(error) }, 500);
    }

    return respond({
      assignment: data || null,
      success: true,
    });
  } catch (error) {
    return respond({ error: sanitizeErrorMessage(error) }, getWorkflowErrorStatus(error));
  }
}
