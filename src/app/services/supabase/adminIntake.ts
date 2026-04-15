import { buildEdgeFunctionUrl } from "./edgeFunctions";
import { activityEventFromDb } from "./adapters";
import type { ActivityEvent as AppActivityEvent } from "../../types";

export type SubmissionStatus = "submitted" | "reviewing" | "approved" | "rejected";

export type ShopSubmission = {
  id: string;
  shop_name: string;
  contact_person: string;
  email: string;
  state: string;
  status: SubmissionStatus;
  created_at: string;
};

export type InsurerSubmission = {
  id: string;
  company_name: string;
  contact_person: string;
  email: string;
  status: SubmissionStatus;
  created_at: string;
};

export type ActivityEvent = {
  id: string;
  event_type: string;
  source?: string;
  created_at: string;
};

export type AdminIntakeOperationsPayload = {
  shopSubmissions: ShopSubmission[];
  insurerSubmissions: InsurerSubmission[];
  activityEvents: AppActivityEvent[];
};

async function getRequiredClerkToken(getClerkToken: () => Promise<string | null>) {
  const token = await getClerkToken();

  if (!token) {
    throw new Error("Your admin session is not ready. Please refresh and sign in again.");
  }

  return token;
}

export async function loadAdminIntakeOperations(
  getClerkToken: () => Promise<string | null>
): Promise<AdminIntakeOperationsPayload> {
  const accessToken = await getRequiredClerkToken(getClerkToken);
  const response = await fetch(buildEdgeFunctionUrl("/admin/intake-operations"), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result?.error || result?.details || "Failed to load intake operations data");
  }

  const raw = result as {
    shopSubmissions: ShopSubmission[];
    insurerSubmissions: InsurerSubmission[];
    activityEvents: ActivityEvent[];
  };

  return {
    shopSubmissions: raw.shopSubmissions,
    insurerSubmissions: raw.insurerSubmissions,
    activityEvents: (raw.activityEvents || []).map(activityEventFromDb),
  };
}

export async function updateAdminSubmissionStatus(
  getClerkToken: () => Promise<string | null>,
  params: {
    table: "shop_interest_submissions" | "insurer_interest_submissions";
    id: string;
    status: SubmissionStatus;
  }
) {
  const accessToken = await getRequiredClerkToken(getClerkToken);
  const response = await fetch(buildEdgeFunctionUrl("/admin/intake-operations/status"), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  const result = await response.json();

  if (!response.ok || !result?.success) {
    throw new Error(result?.error || result?.details || "Failed to update submission status");
  }
}
