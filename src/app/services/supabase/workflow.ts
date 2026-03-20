import { supabase } from "./client";

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
  const { data, error } = await supabase
    .from("platform_activity_events")
    .insert({
      event_type: payload.event_type,
      source: payload.source || "app",
      payload: payload.payload || {},
    })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function createJobAssignment(payload: JobAssignmentPayload) {
  const { data, error } = await supabase
    .from("job_assignments")
    .insert(payload)
    .select("id, status")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateJobAssignmentStatus(
  assignmentId: string,
  status: "scheduled" | "in_progress" | "awaiting_parts" | "completed" | "cancelled"
) {
  const { data, error } = await supabase
    .from("job_assignments")
    .update({ status })
    .eq("id", assignmentId)
    .select("id, status")
    .single();

  if (error) {
    throw error;
  }

  return data;
}
