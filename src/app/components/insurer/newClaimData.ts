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

export function buildPolicyholders(reports: any[]): Policyholder[] {
  if (!reports.length) {
    return [
      {
        id: "customer-1",
        name: "BidOnDent Customer",
        email: "bidondent@gmail.com",
        phone: "N/A",
        policyNumber: "POL-BIDONDENT",
        vehicles: [{ year: "2022", make: "Vehicle", model: "On File" }],
        location: "New York Service Region",
        memberSince: "2026",
        activeClaims: 1,
        status: "active",
      },
    ];
  }

  return reports.slice(0, 8).map((report: any, index: number) => {
    const vehicleData = report?.vehicle || report?.vehicleInfo || {};
    const status = String(report?.status ?? "pending").toLowerCase();
    const activeClaims = status === "completed" || status === "resolved" ? 0 : 1;

    return {
      id: `customer-${report?.id ?? index}`,
      name: `Customer ${index + 1}`,
      email: "bidondent@gmail.com",
      phone: "N/A",
      policyNumber: `POL-${String(index + 1).padStart(4, "0")}`,
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

export function buildClaimShops(reports: any[]): ClaimShop[] {
  const total = reports.length || 1;
  return [
    {
      id: "claim-shop-1",
      name: "BidOnDent Partner Network",
      email: "bidondent@gmail.com",
      phone: "N/A",
      address: "Region-assigned dispatch",
      location: "Rockland / Dutchess / Westchester",
      distance: "Service-radius based",
      rating: 4.8,
      reviewCount: Math.max(total * 4, 24),
      specialties: ["Collision Repair", "Claim Handling", "Paint & Body"],
      certified: true,
      partnerSince: "2026",
      completedJobs: Math.max(total - 1, 1),
      avgCompletionDays: 3.8,
    },
    {
      id: "claim-shop-2",
      name: "Regional Overflow Team",
      email: "bidondent@gmail.com",
      phone: "N/A",
      address: "Operational queue routing",
      location: "Expanded NY coverage",
      distance: "Assignment based",
      rating: 4.5,
      reviewCount: Math.max(total * 2, 12),
      specialties: ["High-volume Intake", "Fast Turnaround"],
      certified: false,
      partnerSince: "2026",
      completedJobs: Math.max(Math.floor(total * 0.6), 1),
      avgCompletionDays: 4.2,
    },
  ];
}
