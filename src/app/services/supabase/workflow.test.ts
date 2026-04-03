import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("./runtime", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./runtime")>();
  return {
    ...actual,
    requestSupabaseEdge: vi.fn(),
  };
});

import {
  createJobAssignment,
  logWorkflowEvent,
  updateJobAssignmentStatus,
} from "./workflow";
import { requestSupabaseEdge, SUPABASE_EDGE_ROUTES } from "./runtime";

const mockRequest = vi.mocked(requestSupabaseEdge);

afterEach(() => {
  mockRequest.mockReset();
});

// ---------------------------------------------------------------------------
// logWorkflowEvent
// ---------------------------------------------------------------------------
describe("logWorkflowEvent", () => {
  it("sends the event and returns the eventId", async () => {
    mockRequest.mockResolvedValueOnce({ eventId: "evt-1" });

    const result = await logWorkflowEvent({
      event_type: "report_submitted",
      source: "customer-app",
      payload: { reportId: "r-1" },
    });

    expect(result).toEqual({ eventId: "evt-1" });
    expect(mockRequest).toHaveBeenCalledWith(SUPABASE_EDGE_ROUTES.workflowEvent, {
      method: "POST",
      body: JSON.stringify({
        event_type: "report_submitted",
        source: "customer-app",
        payload: { reportId: "r-1" },
      }),
    });
  });

  it("sends minimal event without optional fields", async () => {
    mockRequest.mockResolvedValueOnce({ eventId: "evt-2" });

    const result = await logWorkflowEvent({ event_type: "bid_submitted" });

    expect(result.eventId).toBe("evt-2");
  });

  it("propagates errors from the edge function", async () => {
    mockRequest.mockRejectedValueOnce(new Error("edge down"));

    await expect(logWorkflowEvent({ event_type: "repair_completed" })).rejects.toThrow("edge down");
  });
});

// ---------------------------------------------------------------------------
// createJobAssignment
// ---------------------------------------------------------------------------
describe("createJobAssignment", () => {
  const basePayload = {
    damage_report_id: "r-1",
    customer_user_id: "cust-1",
    shop_user_id: "shop-1",
  };

  it("creates assignment and returns the result", async () => {
    mockRequest.mockResolvedValueOnce({
      assignment: { id: "ja-1", status: "scheduled" },
    });

    const result = await createJobAssignment(basePayload);

    expect(result).toEqual({ id: "ja-1", status: "scheduled" });
    expect(mockRequest).toHaveBeenCalledWith(SUPABASE_EDGE_ROUTES.jobAssignment, {
      method: "POST",
      body: JSON.stringify(basePayload),
    });
  });

  it("returns undefined when response has no assignment", async () => {
    mockRequest.mockResolvedValueOnce({});

    const result = await createJobAssignment(basePayload);

    expect(result).toBeUndefined();
  });

  it("includes optional fields when provided", async () => {
    mockRequest.mockResolvedValueOnce({
      assignment: { id: "ja-2", status: "scheduled" },
    });

    await createJobAssignment({
      ...basePayload,
      insurer_user_id: "ins-1",
      bid_id: "bid-1",
      status: "in_progress",
      scheduled_start_at: "2026-04-10T09:00:00Z",
      estimated_completion_at: "2026-04-12T17:00:00Z",
    });

    const body = JSON.parse(mockRequest.mock.calls[0][1]!.body as string);
    expect(body.insurer_user_id).toBe("ins-1");
    expect(body.bid_id).toBe("bid-1");
    expect(body.status).toBe("in_progress");
  });

  it("propagates errors", async () => {
    mockRequest.mockRejectedValueOnce(new Error("conflict"));

    await expect(createJobAssignment(basePayload)).rejects.toThrow("conflict");
  });
});

// ---------------------------------------------------------------------------
// updateJobAssignmentStatus
// ---------------------------------------------------------------------------
describe("updateJobAssignmentStatus", () => {
  it("updates status and returns the assignment", async () => {
    mockRequest.mockResolvedValueOnce({
      assignment: { id: "ja-1", status: "completed" },
    });

    const result = await updateJobAssignmentStatus("ja-1", "completed");

    expect(result).toEqual({ id: "ja-1", status: "completed" });
    expect(mockRequest).toHaveBeenCalledWith(SUPABASE_EDGE_ROUTES.jobAssignmentStatus, {
      method: "POST",
      body: JSON.stringify({ assignmentId: "ja-1", status: "completed" }),
    });
  });

  it("returns undefined when response has no assignment", async () => {
    mockRequest.mockResolvedValueOnce({});

    const result = await updateJobAssignmentStatus("ja-1", "cancelled");

    expect(result).toBeUndefined();
  });

  it("propagates errors", async () => {
    mockRequest.mockRejectedValueOnce(new Error("fail"));

    await expect(updateJobAssignmentStatus("ja-1", "in_progress")).rejects.toThrow("fail");
  });
});
