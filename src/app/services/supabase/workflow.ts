import { requestSupabaseEdge, SUPABASE_EDGE_ROUTES } from "./runtime";

export type WorkflowEventType =
  | "report_submitted"
  | "shops_notified"
  | "bid_submitted"
  | "bid_selected"
  | "repair_scheduled"
  | "repair_completed"
  | "claim_submitted"
  | "claim_reviewed"
  | "claim_approved"
  | "claim_denied"
  | "shop_interest_submitted"
  | "insurer_interest_submitted";

type EventPayload = {
  event_type: WorkflowEventType;
  source?: string;
  payload?: Record<string, unknown>;
};

type JobAssignmentPayload = {
  damage_report_id: string;
  customer_user_id: string;
  shop_user_id: string;
  insurer_user_id?: string;
  bid_id?: string;
  status?: "scheduled" | "in_progress" | "awaiting_parts" | "completed" | "cancelled";
  scheduled_start_at?: string;
  estimated_completion_at?: string;
};

export async function logWorkflowEvent(payload: EventPayload) {
  return await requestSupabaseEdge<{ eventId?: string | null }>(SUPABASE_EDGE_ROUTES.workflowEvent, {
    body: JSON.stringify(payload),
    method: "POST",
  });
}

export async function createJobAssignment(payload: JobAssignmentPayload) {
  const data = await requestSupabaseEdge<{ assignment?: { id: string; status: string } | null }>(
    SUPABASE_EDGE_ROUTES.jobAssignment,
    {
      body: JSON.stringify(payload),
      method: "POST",
    }
  );

  return data.assignment;
}

export interface EnrichedJobAssignment {
  id: string;
  damage_report_id: string;
  bid_id: string | null;
  shop_clerk_user_id: string;
  customer_clerk_user_id: string | null;
  status: "scheduled" | "in_progress" | "awaiting_parts" | "completed" | "cancelled";
  created_at: string;
  updated_at: string;
  report: Record<string, any> | null;
  bid: Record<string, any> | null;
}

export async function getJobAssignments(shopClerkUserId: string): Promise<EnrichedJobAssignment[]> {
  const data = await requestSupabaseEdge<{ jobs?: EnrichedJobAssignment[] }>(
    `${SUPABASE_EDGE_ROUTES.jobAssignments}?shopClerkUserId=${encodeURIComponent(shopClerkUserId)}`,
    { method: "GET" }
  );
  return data.jobs || [];
}

export async function updateJobAssignmentStatus(
  assignmentId: string,
  status: "scheduled" | "in_progress" | "awaiting_parts" | "completed" | "cancelled"
) {
  const data = await requestSupabaseEdge<{ assignment?: { id: string; status: string } | null }>(
    SUPABASE_EDGE_ROUTES.jobAssignmentStatus,
    {
      body: JSON.stringify({ assignmentId, status }),
      method: "POST",
    }
  );

  return data.assignment;
}
