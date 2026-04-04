/**
 * Known major US auto insurance companies for the Insurance Directory.
 * This is reference data — not tied to registered insurer accounts.
 * Once insurers join BidOnDent, their profiles replace/augment this list.
 */

export interface InsuranceDirectoryEntry {
  id: string;
  name: string;
  phone: string;
  website: string;
  claimsPhone: string;
  description: string;
  repairPrograms: string[];
  digitalClaims: boolean;
}

export const INSURANCE_DIRECTORY: InsuranceDirectoryEntry[] = [
  {
    id: "state-farm",
    name: "State Farm",
    phone: "1-800-732-5246",
    website: "statefarm.com",
    claimsPhone: "1-800-732-5246",
    description: "Largest US auto insurer. Select Service repair program with preferred shops.",
    repairPrograms: ["Select Service"],
    digitalClaims: true,
  },
  {
    id: "geico",
    name: "GEICO",
    phone: "1-800-861-8380",
    website: "geico.com",
    claimsPhone: "1-800-861-8380",
    description: "Auto Repair Xpress program for fast, guaranteed repairs at network shops.",
    repairPrograms: ["Auto Repair Xpress"],
    digitalClaims: true,
  },
  {
    id: "progressive",
    name: "Progressive",
    phone: "1-800-776-4737",
    website: "progressive.com",
    claimsPhone: "1-800-274-4499",
    description: "Network repair shops with concierge-level claims service and photo estimates.",
    repairPrograms: ["Progressive Network"],
    digitalClaims: true,
  },
  {
    id: "allstate",
    name: "Allstate",
    phone: "1-800-255-7828",
    website: "allstate.com",
    claimsPhone: "1-800-255-7828",
    description: "Good Hands Repair Network with lifetime guarantee on workmanship.",
    repairPrograms: ["Good Hands Repair Network"],
    digitalClaims: true,
  },
  {
    id: "usaa",
    name: "USAA",
    phone: "1-800-531-8722",
    website: "usaa.com",
    claimsPhone: "1-800-531-8722",
    description: "Members-only insurer for military families. Preferred repair shop network.",
    repairPrograms: ["Preferred Repair"],
    digitalClaims: true,
  },
  {
    id: "liberty-mutual",
    name: "Liberty Mutual",
    phone: "1-800-290-8711",
    website: "libertymutual.com",
    claimsPhone: "1-800-225-2467",
    description: "Guaranteed Repair Network with OEM parts options and rental car coverage.",
    repairPrograms: ["Guaranteed Repair Network"],
    digitalClaims: true,
  },
  {
    id: "farmers",
    name: "Farmers Insurance",
    phone: "1-888-327-6335",
    website: "farmers.com",
    claimsPhone: "1-800-435-7764",
    description: "HelpPoint claims service with preferred collision repair facilities.",
    repairPrograms: ["HelpPoint"],
    digitalClaims: true,
  },
  {
    id: "nationwide",
    name: "Nationwide",
    phone: "1-877-669-6877",
    website: "nationwide.com",
    claimsPhone: "1-800-421-3535",
    description: "Blue Ribbon repair program with vetted shops and guaranteed repairs.",
    repairPrograms: ["Blue Ribbon"],
    digitalClaims: true,
  },
  {
    id: "travelers",
    name: "Travelers",
    phone: "1-800-842-5075",
    website: "travelers.com",
    claimsPhone: "1-800-252-4633",
    description: "National repair network with photo-based claims for faster processing.",
    repairPrograms: ["Travelers Repair Network"],
    digitalClaims: true,
  },
  {
    id: "american-family",
    name: "American Family",
    phone: "1-800-692-6326",
    website: "amfam.com",
    claimsPhone: "1-800-374-1111",
    description:
      "Preferred repair facility network with competitive pricing and quality guarantees.",
    repairPrograms: ["Preferred Repair Facility"],
    digitalClaims: false,
  },
];
