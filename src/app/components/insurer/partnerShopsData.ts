export type PartnerShop = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  location: string;
  distance: string;
  rating: number;
  reviewCount: number;
  specialties: string[];
  certifications: string[];
  certified: boolean;
  partnerSince: string;
  completedJobs: number;
  activeJobs: number;
  avgCompletionDays: number;
  avgCost: number;
  status: "active" | "pending" | "inactive";
};

export const specialtyOptions = [
  "Collision Repair",
  "Paint & Body",
  "Frame Straightening",
  "Insurance Claims",
  "Paintless Dent Repair",
  "Glass Repair",
  "Fast Service",
];

export const certificationOptions = [
  "I-CAR Gold Class",
  "I-CAR Certified",
  "ASE Certified",
  "PPG Certified",
];

export const defaultPartnerShops: PartnerShop[] = [
  {
    id: "shop-1",
    name: "Metro Collision Partners",
    email: "bidondent@gmail.com",
    phone: "N/A",
    address: "Service region dispatch",
    city: "Westchester",
    state: "NY",
    zip: "10601",
    location: "Westchester, NY",
    distance: "Within region",
    rating: 4.7,
    reviewCount: 42,
    specialties: ["Collision Repair", "Insurance Claims"],
    certifications: ["I-CAR Certified"],
    certified: true,
    partnerSince: "2026",
    completedJobs: 18,
    activeJobs: 5,
    avgCompletionDays: 4.1,
    avgCost: 2300,
    status: "active",
  },
];

export function buildDerivedPartnerShops(reports: any[]): PartnerShop[] {
  if (!reports.length) return defaultPartnerShops;

  const totalReports = reports.length;
  const activeReports = reports.filter((report) => {
    const status = String(report?.status ?? "").toLowerCase();
    return status !== "completed" && status !== "resolved";
  }).length;

  return [
    {
      id: "shop-live-1",
      name: "BidOnDent Partner Network",
      email: "bidondent@gmail.com",
      phone: "N/A",
      address: "Coordinated service region",
      city: "Hudson Valley",
      state: "NY",
      zip: "00000",
      location: "Rockland, Dutchess, Westchester + adjacent counties",
      distance: "Region-based dispatch",
      rating: 4.8,
      reviewCount: Math.max(totalReports * 3, 20),
      specialties: ["Collision Repair", "Insurance Workflows", "Damage Assessment"],
      certifications: ["I-CAR Certified", "Workflow Verified"],
      certified: true,
      partnerSince: "2026",
      completedJobs: Math.max(totalReports - activeReports, 0),
      activeJobs: Math.max(activeReports, 1),
      avgCompletionDays: 3.9,
      avgCost: 2400,
      status: "active",
    },
    {
      id: "shop-live-2",
      name: "Regional Overflow Partners",
      email: "bidondent@gmail.com",
      phone: "N/A",
      address: "Operationally assigned",
      city: "New York",
      state: "NY",
      zip: "00000",
      location: "Expanded county support",
      distance: "Assignment based",
      rating: 4.5,
      reviewCount: Math.max(totalReports * 2, 12),
      specialties: ["High-volume Intake", "Parts Coordination"],
      certifications: ["Workflow Verified"],
      certified: false,
      partnerSince: "2026",
      completedJobs: Math.max(Math.floor(totalReports * 0.4), 1),
      activeJobs: Math.max(Math.floor(activeReports * 0.6), 1),
      avgCompletionDays: 4.4,
      avgCost: 2100,
      status: activeReports > 5 ? "active" : "pending",
    },
  ];
}
