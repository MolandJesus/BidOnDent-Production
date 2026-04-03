import type { InsuranceCompanyProfile, ShopProfile } from "./marketIntelligence";
import { CORE_SHOPS } from "./marketSeedShops";

export const SHOPS: ShopProfile[] = [...CORE_SHOPS];

export const INSURERS: InsuranceCompanyProfile[] = [
  {
    id: 1,
    name: "State Farm",
    description: "America's largest auto insurer with broad direct-repair relationships.",
    headquarters: "Bloomington, Illinois",
    claimsPhone: "800-SF-CLAIM",
    accountConnectionNotes: [
      "Strong fit when customers want established DRP-style repair routing.",
      "Often useful for claim-status updates and preferred-network introductions.",
    ],
    benefits: ["Direct claim filing", "Repair network depth", "Strong catastrophe handling"],
    popular: true,
    repairProgramFocus: ["collision", "hail", "network-shops"],
    digitalClaimsExperience: "strong",
  },
  {
    id: 2,
    name: "Geico",
    description:
      "Digital-first carrier with high-volume auto claims and strong consumer familiarity.",
    headquarters: "Chevy Chase, Maryland",
    claimsPhone: "800-841-3000",
    accountConnectionNotes: [
      "Works well for fast consumer claim intake and self-service account lookup.",
      "Useful where price-conscious customers want a familiar carrier workflow.",
    ],
    benefits: ["Fast processing", "Mobile app support", "Wide brand familiarity"],
    popular: true,
    repairProgramFocus: ["collision", "glass", "consumer-self-service"],
    digitalClaimsExperience: "excellent",
  },
  {
    id: 3,
    name: "Progressive",
    description: "Carrier with strong digital claims tooling and broad repair program coverage.",
    headquarters: "Mayfield Village, Ohio",
    claimsPhone: "800-776-4737",
    accountConnectionNotes: [
      "Useful when pairing claims with modern estimate and photo-submission workflows.",
      "Often a strong fit for EV and ADAS-heavy claims in a digital journey.",
    ],
    benefits: ["Photo estimates", "Digital claim workflow", "Broad program participation"],
    popular: true,
    repairProgramFocus: ["ev", "collision", "digital-claims"],
    digitalClaimsExperience: "excellent",
  },
  {
    id: 4,
    name: "Allstate",
    description: "Large national carrier with familiar claims workflows and consumer trust.",
    headquarters: "Northbrook, Illinois",
    claimsPhone: "800-255-7828",
    accountConnectionNotes: [
      "Good general-purpose insurer connection for mainstream personal auto claims.",
      "Often appropriate when customers want guided support over pure self-service.",
    ],
    benefits: ["New car replacement", "Claims support", "Broad market recognition"],
    popular: true,
    repairProgramFocus: ["collision", "consumer-support", "network-routing"],
    digitalClaimsExperience: "strong",
  },
  {
    id: 5,
    name: "USAA",
    description:
      "High-trust insurer serving military members and families with strong service marks.",
    headquarters: "San Antonio, Texas",
    claimsPhone: "800-531-8722",
    accountConnectionNotes: [
      "Best used when the member relationship and service quality matter more than sheer volume.",
      "Strong fit for users who expect careful claims communication and support.",
    ],
    benefits: ["Military member focus", "High service trust", "Strong support reputation"],
    popular: false,
    repairProgramFocus: ["member-service", "ev", "collision"],
    digitalClaimsExperience: "strong",
  },
  {
    id: 6,
    name: "Liberty Mutual",
    description:
      "Carrier with flexible coverage and useful commercial and consumer repair relationships.",
    headquarters: "Boston, Massachusetts",
    claimsPhone: "800-225-2467",
    accountConnectionNotes: [
      "Good when the workflow needs both personal-auto and commercial flexibility.",
      "Can be valuable in mixed fleet and consumer account environments.",
    ],
    benefits: ["Flexible coverage", "Commercial crossover", "Broad repair use cases"],
    popular: false,
    repairProgramFocus: ["fleet", "collision", "mixed-accounts"],
    digitalClaimsExperience: "strong",
  },
  {
    id: 7,
    name: "Farmers Insurance",
    description:
      "Established national insurer with strong catastrophe and hail relevance in many regions.",
    headquarters: "Woodland Hills, California",
    claimsPhone: "800-435-7764",
    accountConnectionNotes: [
      "Useful when hail and storm-related repair flows need stronger insurer alignment.",
      "Can support claim journeys where regional agent relationships matter.",
    ],
    benefits: ["Storm claim strength", "Agent-backed service", "Flexible support options"],
    popular: false,
    repairProgramFocus: ["hail", "storm-response", "agent-support"],
    digitalClaimsExperience: "standard",
  },
  {
    id: 8,
    name: "Nationwide",
    description:
      "National carrier with strong repair-network familiarity and commercial usefulness.",
    headquarters: "Columbus, Ohio",
    claimsPhone: "800-421-3535",
    accountConnectionNotes: [
      "Good fit when insurers and shops need clearer partner-shop visibility.",
      "Often useful for commercial and multi-vehicle operational workflows.",
    ],
    benefits: ["Partner network support", "Commercial relevance", "Broad claims familiarity"],
    popular: false,
    repairProgramFocus: ["network-shops", "commercial", "multi-vehicle"],
    digitalClaimsExperience: "strong",
  },
];
