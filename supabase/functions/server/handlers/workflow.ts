import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { requireClerkSession, requireMarketplaceContext } from "../utils/authz.ts";
import { sanitizeErrorMessage } from "../utils/helpers.ts";
import { notifyCustomerClaimDecision } from "./notificationEmails.ts";

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

    const actorId = getString(body.actor_id);
    const objectId = getString(body.object_id);
    const outcome = getString(body.outcome);

    const { data, error } = await supabase
      .from("platform_activity_events")
      .insert({
        event_type: eventType,
        payload,
        source,
        ...(actorId ? { actor_id: actorId } : {}),
        ...(objectId ? { object_id: objectId } : {}),
        ...(outcome ? { outcome } : {}),
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

/** GET /workflow/job-assignments?shopClerkUserId=X — returns enriched jobs for a shop */
export async function getJobAssignments(
  req: Request,
  supabase: SupabaseClient,
  respond: RespondFunction
) {
  try {
    const url = new URL(req.url);
    const shopClerkUserId = url.searchParams.get("shopClerkUserId");
    if (!shopClerkUserId) {
      return respond({ error: "shopClerkUserId is required" }, 400);
    }

    const { data: jobs, error } = await supabase
      .from("job_assignments")
      .select("*")
      .eq("shop_clerk_user_id", shopClerkUserId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) throw error;
    if (!jobs || jobs.length === 0) {
      return respond({ jobs: [] });
    }

    // Enrich with report + bid data
    const reportIds = [...new Set(jobs.map((j: any) => j.damage_report_id).filter(Boolean))];
    const bidIds = [...new Set(jobs.map((j: any) => j.bid_id).filter(Boolean))];

    const [reportResult, bidResult] = await Promise.all([
      reportIds.length > 0
        ? supabase.from("damage_reports").select("*").in("id", reportIds)
        : { data: [] },
      bidIds.length > 0
        ? supabase.from("bids").select("*").in("id", bidIds)
        : { data: [] },
    ]);

    // Fetch customer names from profiles using clerk_user_id from each report
    const clerkUserIds = [
      ...new Set(
        (reportResult.data || []).map((r: any) => r.clerk_user_id).filter(Boolean)
      ),
    ];
    const profileMap = new Map<string, { name: string | null; email: string | null; phone: string | null }>();
    if (clerkUserIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("clerk_user_id, name, email, phone")
        .in("clerk_user_id", clerkUserIds);
      (profiles || []).forEach((p: any) => {
        profileMap.set(p.clerk_user_id, {
          name: p.name || null,
          email: p.email || null,
          phone: p.phone || null,
        });
      });
    }

    const reportMap = new Map(
      (reportResult.data || []).map((r: any) => {
        const profile = r.clerk_user_id ? profileMap.get(r.clerk_user_id) : null;
        return [
          r.id,
          {
            ...r,
            customer_name: profile?.name || null,
            customer_email: profile?.email || null,
            customer_phone: profile?.phone || null,
          },
        ];
      })
    );
    const bidMap = new Map((bidResult.data || []).map((b: any) => [b.id, b]));

    const enriched = jobs.map((job: any) => ({
      ...job,
      report: reportMap.get(job.damage_report_id) || null,
      bid: bidMap.get(job.bid_id) || null,
    }));

    return respond({ jobs: enriched });
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
    const session = await requireClerkSession(req, { requireEmail: false });

    let body: Record<string, unknown> = {};
    try {
      body = await req.json();
    } catch {
      return respond({ error: "Invalid JSON in request body" }, 400);
    }

    const payload = {
      bid_id: getString(body.bid_id) || null,
      customer_clerk_user_id: getString(body.customer_user_id) || null,
      damage_report_id: getString(body.damage_report_id),
      estimated_completion_at: getString(body.estimated_completion_at) || null,
      insurer_clerk_user_id: getString(body.insurer_user_id) || null,
      scheduled_start_at: getString(body.scheduled_start_at) || null,
      shop_clerk_user_id: getString(body.shop_user_id) || null,
      status: getString(body.status) || "scheduled",
    };

    if (
      !payload.damage_report_id ||
      !payload.customer_clerk_user_id ||
      !payload.shop_clerk_user_id ||
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
      // Unique constraint violation → report already has an active assignment
      if (error.code === "23505") {
        return respond({ error: "This report already has an active job assignment" }, 409);
      }
      return respond({ error: sanitizeErrorMessage(error) }, 500);
    }

    // Fire-and-forget: log activity event
    supabase.from("platform_activity_events").insert({
      event_type: "job_assignment_created",
      source: "api",
      actor_id: session.clerkUserId,
      object_id: data?.id || null,
      outcome: "success",
      payload: {
        damage_report_id: payload.damage_report_id,
        shop_clerk_user_id: payload.shop_clerk_user_id,
        bid_id: payload.bid_id,
      },
    }).then(null, () => {});

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

const VALID_CLAIM_DECISIONS = new Set(["approved", "denied"]);

export async function submitInsuranceClaim(
  req: Request,
  supabase: SupabaseClient,
  respond: RespondFunction
): Promise<Response> {
  try {
    const { session } = await requireMarketplaceContext(req, supabase);

    let body: Record<string, unknown> = {};
    try {
      body = await req.json();
    } catch {
      return respond({ error: "Invalid JSON in request body" }, 400);
    }

    const reportId = getString(body.reportId);
    const policyNumber = getString(body.policyNumber);
    const incidentDate = getString(body.incidentDate);
    const damageDescription = getString(body.damageDescription);
    const estimatedAmount =
      typeof body.estimatedAmount === "number" ? body.estimatedAmount : null;
    const priority = getString(body.priority) || "medium";
    const shopClerkUserId = getString(body.shopClerkUserId);

    if (!reportId) {
      return respond({ error: "Missing reportId" }, 400);
    }

    const clerkUserId = session.clerkUserId ?? "";

    const payload: Record<string, unknown> = {
      insurance_claim: true,
      claim_status: "submitted",
      updated_at: new Date().toISOString(),
    };

    if (policyNumber) payload.policy_number = policyNumber;
    if (incidentDate) payload.incident_date = incidentDate;
    if (damageDescription) payload.damage_description = damageDescription;
    if (estimatedAmount !== null) payload.estimated_repair_cost = estimatedAmount;
    if (priority) payload.priority = priority;
    if (shopClerkUserId) payload.assigned_shop_clerk_user_id = shopClerkUserId;
    payload.claim_decided_by = clerkUserId;
    payload.claim_decision_date = new Date().toISOString();

    const { data, error } = await supabase
      .from("damage_reports")
      .update(payload)
      .eq("id", reportId)
      .select("id, insurance_claim, claim_status, policy_number, assigned_shop_clerk_user_id")
      .single();

    if (error) {
      return respond({ error: sanitizeErrorMessage(error) }, 500);
    }

    // Create a job assignment if a shop was assigned
    if (shopClerkUserId && data?.id) {
      const { error: jobError } = await supabase
        .from("job_assignments")
        .insert({
          damage_report_id: reportId,
          customer_user_id: clerkUserId,
          shop_user_id: shopClerkUserId,
          insurer_user_id: clerkUserId,
          status: "scheduled",
        });

      if (jobError) {
        // Non-fatal: claim was saved; log for monitoring
        console.error("submitInsuranceClaim: job assignment creation failed:", sanitizeErrorMessage(jobError.message));
      }
    }

    return respond({
      claim: data || null,
      success: true,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const status = message.includes("Marketplace access required")
      ? 403
      : getWorkflowErrorStatus(error);
    return respond({ error: sanitizeErrorMessage(error) }, status);
  }
}

export async function updateClaimDecision(
  req: Request,
  supabase: SupabaseClient,
  respond: RespondFunction
): Promise<Response> {
  try {
    const { session } = await requireMarketplaceContext(req, supabase);

    let body: Record<string, unknown> = {};
    try {
      body = await req.json();
    } catch {
      return respond({ error: "Invalid JSON in request body" }, 400);
    }

    const reportId = getString(body.reportId);
    const decision = getString(body.decision);
    const approvedAmount =
      typeof body.approvedAmount === "number" ? body.approvedAmount : null;
    const denialReason = getString(body.denialReason) || null;

    if (!reportId || !VALID_CLAIM_DECISIONS.has(decision)) {
      return respond({ error: "Missing reportId or invalid decision (approved|denied)" }, 400);
    }

    if (decision === "approved" && (approvedAmount === null || approvedAmount <= 0)) {
      return respond({ error: "Approved amount must be a positive number" }, 400);
    }

    if (decision === "denied" && !denialReason) {
      return respond({ error: "Denial reason is required" }, 400);
    }

    const clerkUserId = session.clerkUserId ?? "";

    const payload: Record<string, unknown> = {
      claim_status: decision,
      claim_decision_date: new Date().toISOString(),
      claim_decided_by: clerkUserId,
      updated_at: new Date().toISOString(),
    };

    if (decision === "approved") {
      payload.approved_amount = approvedAmount;
      payload.denial_reason = null;
    } else {
      payload.denial_reason = denialReason;
      payload.approved_amount = null;
    }

    const { data, error } = await supabase
      .from("damage_reports")
      .update(payload)
      .eq("id", reportId)
      .select("id, claim_status, approved_amount, denial_reason, claim_decision_date")
      .single();

    if (error) {
      return respond({ error: sanitizeErrorMessage(error) }, 500);
    }

    // Fire-and-forget: email customer about claim decision
    if (data?.id) {
      supabase
        .from("damage_reports")
        .select("clerk_user_id")
        .eq("id", reportId)
        .maybeSingle()
        .then(({ data: report }) => {
          if (report?.clerk_user_id) {
            notifyCustomerClaimDecision(
              supabase,
              report.clerk_user_id,
              decision as "approved" | "denied",
              approvedAmount,
              denialReason,
              reportId
            ).catch(() => {});
          }
        })
        .catch(() => {});
    }

    return respond({
      claimDecision: data || null,
      success: true,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const status = message.includes("Marketplace access required")
      ? 403
      : getWorkflowErrorStatus(error);
    return respond({ error: sanitizeErrorMessage(error) }, status);
  }
}
