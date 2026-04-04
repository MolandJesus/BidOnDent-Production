export type Policyholder = {
  id: string;
  name: string;
  email: string;
  phone: string;
  policyNumber: string;
  vehicles: Array<{ year: string | number; make: string; model: string; vin?: string }>;
  location: string;
  memberSince: string;
  activeClaims: number;
  status: "active" | "inactive";
};

export type ClaimShop = {
  id: string;
  /** Clerk user ID — present for real shops, absent for demo/placeholder */
  clerkUserId?: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  location: string;
  distance: string;
  rating: number;
  reviewCount: number;
  specialties: string[];
  certified: boolean;
  partnerSince: string;
  completedJobs: number;
  avgCompletionDays: number;
};

function asRecord(value: unknown): Record<string, any> {
  return value && typeof value === "object" ? (value as Record<string, any>) : {};
}

export function buildPolicyholders(reports: Array<Record<string, any>>): Policyholder[] {
  if (!reports.length) {
    return [
      {
        id: "customer-placeholder",
        name: "No policyholders on file",
        email: "N/A",
        phone: "N/A",
        policyNumber: "N/A",
        vehicles: [{ year: "", make: "No vehicle", model: "on file" }],
        location: "N/A",
        memberSince: "",
        activeClaims: 0,
        status: "inactive",
      },
    ];
  }

  return reports.slice(0, 8).map((report, index) => {
    const safeReport = asRecord(report);
    const vehicleData = asRecord(safeReport.vehicle || safeReport.vehicleInfo);
    const status = String(safeReport.status ?? "pending").toLowerCase();
    const activeClaims = status === "completed" || status === "resolved" ? 0 : 1;

    return {
      id: `customer-${safeReport.id ?? index}`,
      name: typeof safeReport.customerName === "string" ? safeReport.customerName : "Not provided",
      email:
        typeof safeReport.customerEmail === "string" ? safeReport.customerEmail : "Not provided",
      phone:
        typeof safeReport.customerPhone === "string" ? safeReport.customerPhone : "Not provided",
      policyNumber:
        typeof safeReport.policyNumber === "string" ? safeReport.policyNumber : "Not provided",
      vehicles: [
        {
          year:
            typeof vehicleData.year === "string" || typeof vehicleData.year === "number"
              ? vehicleData.year
              : "",
          make: typeof vehicleData.make === "string" ? vehicleData.make : "Vehicle",
          model: typeof vehicleData.model === "string" ? vehicleData.model : "Pending",
          vin: typeof vehicleData.vin === "string" ? vehicleData.vin : undefined,
        },
      ],
      location:
        typeof safeReport.location === "string" ? safeReport.location : "New York Service Region",
      memberSince: "2026",
      activeClaims,
      status: "active",
    };
  });
}

export function buildClaimShops(_reports: unknown[]): ClaimShop[] {
  return [
    {
      id: "claim-shop-1",
      name: "BidOnDent Partner Network",
      email: "partners@bidondent.com",
      phone: "Not provided",
      address: "Region-assigned dispatch",
      location: "New York service region",
      distance: "Service-radius based",
      rating: 0,
      reviewCount: 0,
      specialties: ["Collision Repair", "Paint & Body"],
      certified: false,
      partnerSince: "2026",
      completedJobs: 0,
      avgCompletionDays: 0,
    },
  ];
}
