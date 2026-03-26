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

export function buildPolicyholders(reports: Record<string, unknown>[]): Policyholder[] {
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
    const vehicleData = report?.vehicle || report?.vehicleInfo || {};
    const status = String(report?.status ?? "pending").toLowerCase();
    const activeClaims = status === "completed" || status === "resolved" ? 0 : 1;

    return {
      id: `customer-${report?.id ?? index}`,
      name: report?.customerName || "Policyholder on file",
      email: report?.customerEmail || "On file",
      phone: report?.customerPhone || "On file",
      policyNumber: report?.policyNumber || "Pending verification",
      vehicles: [
        {
          year: vehicleData.year || "",
          make: vehicleData.make || "Vehicle",
          model: vehicleData.model || "Pending",
          vin: vehicleData.vin,
        },
      ],
      location: report?.location || "New York Service Region",
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
      phone: "On file",
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
