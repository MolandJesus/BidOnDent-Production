import type { Bid, DamageReport, Vehicle } from "./types";
import { edgeFunctionJson } from "./edgeFunctions";

type ReportScope = "own" | "marketplace";

type ReportsResponse = {
  reports: DamageReport[];
};

type VehiclesResponse = {
  vehicles: Vehicle[];
};

type SavedReportResponse = {
  report: DamageReport;
};

type SavedVehicleResponse = {
  vehicle: Vehicle;
};

type SavedBidResponse = {
  bid: Bid;
};

function buildQuery(path: string, params: Record<string, string | undefined>) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      searchParams.set(key, value);
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `${path}?${queryString}` : path;
}

export async function getReportsByClerkUser(
  clerkUserId: string,
  scope: ReportScope = "own"
): Promise<DamageReport[]> {
  const data = await edgeFunctionJson<ReportsResponse>(
    buildQuery("/reports", {
      clerkUserId,
      scope,
    })
  );

  return data.reports || [];
}

export async function saveReportByClerkUser(
  clerkUserId: string,
  report: Record<string, unknown>
): Promise<DamageReport | null> {
  const data = await edgeFunctionJson<SavedReportResponse>("/reports", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      clerkUserId,
      report,
    }),
  });

  return data.report || null;
}

export async function getVehiclesByClerkUser(clerkUserId: string): Promise<Vehicle[]> {
  const data = await edgeFunctionJson<VehiclesResponse>(
    buildQuery("/vehicles", {
      clerkUserId,
    })
  );

  return data.vehicles || [];
}

export async function saveVehicleByClerkUser(
  clerkUserId: string,
  vehicle: Record<string, unknown>
): Promise<Vehicle | null> {
  const data = await edgeFunctionJson<SavedVehicleResponse>("/vehicles", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      clerkUserId,
      vehicle,
    }),
  });

  return data.vehicle || null;
}

export async function deleteVehicleByClerkUser(
  clerkUserId: string,
  vehicleId: string
): Promise<boolean> {
  await edgeFunctionJson<{ success: boolean }>("/delete-vehicle", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      clerkUserId,
      vehicleId,
    }),
  });

  return true;
}

export async function submitBidByClerkUser(
  clerkUserId: string,
  bid: Record<string, unknown>
): Promise<Bid | null> {
  const data = await edgeFunctionJson<SavedBidResponse>("/bids", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      clerkUserId,
      bid,
    }),
  });

  return data.bid || null;
}
