import { afterEach, describe, expect, it, vi } from "vitest";

import type { Bid, DamageReport, Vehicle } from "./types";

// Mock the edgeFunctions module
vi.mock("./edgeFunctions", () => ({
  edgeFunctionJson: vi.fn(),
}));

import {
  getReportsByClerkUser,
  saveReportByClerkUser,
  getVehiclesByClerkUser,
  saveVehicleByClerkUser,
  deleteVehicleByClerkUser,
  submitBidByClerkUser,
} from "./clerkEdgeData";
import { edgeFunctionJson } from "./edgeFunctions";

const mockEdge = vi.mocked(edgeFunctionJson);

const fakeReport: DamageReport = {
  id: "rpt-1",
  user_id: "user_abc",
  vehicle_make: "Honda",
  vehicle_model: "Civic",
  vehicle_year: 2022,
  damage_type: "dent",
  damage_severity: "minor",
  damage_location: "front bumper",
  status: "pending",
};

const fakeVehicle: Vehicle = {
  id: "veh-1",
  user_id: "user_abc",
  make: "Honda",
  model: "Civic",
  year: 2022,
};

const fakeBid: Bid = {
  id: "bid-1",
  damage_report_id: "rpt-1",
  amount: 350,
  estimated_days: 3,
  status: "pending",
};

afterEach(() => {
  mockEdge.mockReset();
});

// ---------------------------------------------------------------------------
// getReportsByClerkUser
// ---------------------------------------------------------------------------
describe("getReportsByClerkUser", () => {
  it("fetches own reports by default", async () => {
    mockEdge.mockResolvedValueOnce({ reports: [fakeReport] });
    const result = await getReportsByClerkUser("user_abc");
    expect(result).toEqual([fakeReport]);
    expect(mockEdge).toHaveBeenCalledWith(
      expect.stringContaining("clerkUserId=user_abc")
    );
    expect(mockEdge).toHaveBeenCalledWith(
      expect.stringContaining("scope=own")
    );
  });

  it("fetches marketplace reports when scope specified", async () => {
    mockEdge.mockResolvedValueOnce({ reports: [fakeReport] });
    await getReportsByClerkUser("user_abc", "marketplace");
    expect(mockEdge).toHaveBeenCalledWith(
      expect.stringContaining("scope=marketplace")
    );
  });

  it("returns empty array when response has no reports key", async () => {
    mockEdge.mockResolvedValueOnce({});
    const result = await getReportsByClerkUser("user_abc");
    expect(result).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// saveReportByClerkUser
// ---------------------------------------------------------------------------
describe("saveReportByClerkUser", () => {
  it("posts report and returns saved report", async () => {
    mockEdge.mockResolvedValueOnce({ report: fakeReport });
    const result = await saveReportByClerkUser("user_abc", { description: "dent" });
    expect(result).toEqual(fakeReport);
    expect(mockEdge).toHaveBeenCalledWith(
      "/reports",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("includes clerkUserId and report in body", async () => {
    mockEdge.mockResolvedValueOnce({ report: fakeReport });
    await saveReportByClerkUser("user_abc", { description: "scratch" });
    const callInit = mockEdge.mock.calls[0][1] as RequestInit;
    const body = JSON.parse(callInit.body as string);
    expect(body.clerkUserId).toBe("user_abc");
    expect(body.report.description).toBe("scratch");
  });

  it("returns null when response has no report key", async () => {
    mockEdge.mockResolvedValueOnce({});
    const result = await saveReportByClerkUser("user_abc", {});
    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// getVehiclesByClerkUser
// ---------------------------------------------------------------------------
describe("getVehiclesByClerkUser", () => {
  it("fetches vehicles for the given user", async () => {
    mockEdge.mockResolvedValueOnce({ vehicles: [fakeVehicle] });
    const result = await getVehiclesByClerkUser("user_abc");
    expect(result).toEqual([fakeVehicle]);
    expect(mockEdge).toHaveBeenCalledWith(
      expect.stringContaining("clerkUserId=user_abc")
    );
  });

  it("returns empty array when response has no vehicles key", async () => {
    mockEdge.mockResolvedValueOnce({});
    const result = await getVehiclesByClerkUser("user_abc");
    expect(result).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// saveVehicleByClerkUser
// ---------------------------------------------------------------------------
describe("saveVehicleByClerkUser", () => {
  it("posts vehicle and returns saved vehicle", async () => {
    mockEdge.mockResolvedValueOnce({ vehicle: fakeVehicle });
    const result = await saveVehicleByClerkUser("user_abc", { make: "Honda" });
    expect(result).toEqual(fakeVehicle);
    expect(mockEdge).toHaveBeenCalledWith(
      "/vehicles",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("returns null when response has no vehicle key", async () => {
    mockEdge.mockResolvedValueOnce({});
    const result = await saveVehicleByClerkUser("user_abc", {});
    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// deleteVehicleByClerkUser
// ---------------------------------------------------------------------------
describe("deleteVehicleByClerkUser", () => {
  it("calls delete-vehicle edge function and returns true", async () => {
    mockEdge.mockResolvedValueOnce({ success: true });
    const result = await deleteVehicleByClerkUser("user_abc", "veh-1");
    expect(result).toBe(true);
    expect(mockEdge).toHaveBeenCalledWith(
      "/delete-vehicle",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("includes clerkUserId and vehicleId in body", async () => {
    mockEdge.mockResolvedValueOnce({ success: true });
    await deleteVehicleByClerkUser("user_abc", "veh-1");
    const callInit = mockEdge.mock.calls[0][1] as RequestInit;
    const body = JSON.parse(callInit.body as string);
    expect(body.clerkUserId).toBe("user_abc");
    expect(body.vehicleId).toBe("veh-1");
  });

  it("returns true even if edge function succeeds without success field", async () => {
    mockEdge.mockResolvedValueOnce({});
    const result = await deleteVehicleByClerkUser("user_abc", "veh-1");
    expect(result).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// submitBidByClerkUser
// ---------------------------------------------------------------------------
describe("submitBidByClerkUser", () => {
  it("posts bid and returns saved bid", async () => {
    mockEdge.mockResolvedValueOnce({ bid: fakeBid });
    const result = await submitBidByClerkUser("user_abc", { amount: 350 });
    expect(result).toEqual(fakeBid);
    expect(mockEdge).toHaveBeenCalledWith(
      "/bids",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("includes clerkUserId and bid in body", async () => {
    mockEdge.mockResolvedValueOnce({ bid: fakeBid });
    await submitBidByClerkUser("user_abc", { amount: 350, note: "Quick job" });
    const callInit = mockEdge.mock.calls[0][1] as RequestInit;
    const body = JSON.parse(callInit.body as string);
    expect(body.clerkUserId).toBe("user_abc");
    expect(body.bid.amount).toBe(350);
  });

  it("returns null when response has no bid key", async () => {
    mockEdge.mockResolvedValueOnce({});
    const result = await submitBidByClerkUser("user_abc", {});
    expect(result).toBeNull();
  });
});
