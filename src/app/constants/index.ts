// Application constants for BidOnDent
import {
  Home,
  Camera,
  FileCheck,
  User,
  ClipboardList,
  Wrench,
  Shield,
  Building2,
  Mail,
} from "lucide-react";
import type { DamageReport, NavTab } from "../types";

// Import NEW professional auto body repair photos - January 2025
import heroPhoto from "../../assets/e8f91a58c62f0ff2f49336844f4e54fe4e748352.jpg"; // NEW HERO: Person on phone with damaged blue car - perfect customer context!
import paintBoothPhoto from "../../assets/79ea80858b80757542425a73e4494d23fba3e1a1.jpg"; // Professional spray painting red car in paint booth - moved to Certified Professionals
import damageCloseupPhoto from "../../assets/4799948bc65045bf2da01eba74e0d3c3fce2c6ac.jpg"; // Close-up of car damage
import professionalPainterPhoto from "../../assets/1401a387bf298d03aecbed1d0021bd94185b8dfc.jpg"; // Worker spray painting car part - moved to Competitive Pricing
import workshopMechanicPhoto from "../../assets/ab289a3e03c4893fae1b47a9205d7226ceddb6ee.jpg"; // Mechanic in blue coveralls - active workshop
import precisionRepairPhoto from "../../assets/201df77043ff72964e47e63053f570bd0c196eff.jpg";

// Default profile picture - Professional blue car wheel image (PNG: smaller than JPEG for this image)
import defaultProfilePicture from "../../assets/aa5ffbe71e91d1c0e446927c6ed00e83bde1759e.png";

// Brand colors
export const PRIMARY_COLOR = "#003d82";
export const SECONDARY_COLOR = "#00a0e9";

// Call-to-action text
export const CTA_BUTTON_TEXT = "Get Started";

// Navigation tabs for customers
export const CUSTOMER_NAV_TABS: NavTab[] = [
  { id: "home", label: "Dashboard", icon: Home },
  { id: "report", label: "Report", icon: Camera },
  { id: "bids", label: "Bids", icon: FileCheck },
  { id: "account", label: "Account", icon: User },
];

// Navigation tabs for shops
export const SHOP_NAV_TABS: NavTab[] = [
  { id: "home", label: "Dashboard", icon: Home },
  { id: "requests", label: "Requests", icon: ClipboardList },
  { id: "estimates", label: "Estimates", icon: Mail },
  { id: "jobs", label: "Active Jobs", icon: Wrench },
  { id: "account", label: "Account", icon: User },
];

// Navigation tabs for insurers
export const INSURER_NAV_TABS: NavTab[] = [
  { id: "home", label: "Dashboard", icon: Home },
  { id: "claims", label: "Claims", icon: Shield },
  { id: "shops", label: "Partner Shops", icon: Building2 },
  { id: "account", label: "Account", icon: User },
];

// Local storage keys
export const STORAGE_KEYS = {
  USER_DATA: "bidondent_user",
  USER_DATA_LAST_ACTIVE: "bidondent_user_last_active",
  DAMAGE_REPORT_DRAFT: "bidondent_damage_report_draft",
  KEEP_SIGNED_IN: "bidondent_keep_signed_in",
};

export function getNotificationsByUserType(_userType: "customer" | "shop" | "insurer") {
  // Real notifications will come from Supabase events once persisted.
  // Returning empty avoids showing fake activity that erodes user trust.
  return [] as { id: number; type: "bid" | "update" | "message" | "repair_request" | "claim"; message: string; time: string; read: boolean }[];
}

const seedReportOneTimestamp = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
const seedReportTwoTimestamp = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();

export const SEED_DAMAGE_REPORTS: DamageReport[] = [
  {
    id: "seed-report-1",
    vehicleId: "seed-vehicle-1",
    vehicleInfo: { year: "2021", make: "Toyota", model: "Camry" },
    damageAreas: ["Front Bumper"],
    damageArea: "Front Bumper",
    description: "Front bumper damage from a parking lot collision.",
    status: "pending",
    createdAt: seedReportOneTimestamp,
    submittedAt: seedReportOneTimestamp,
    bidsCount: 0,
    photos: [],
  },
  {
    id: "seed-report-2",
    vehicleId: "seed-vehicle-2",
    vehicleInfo: { year: "2019", make: "Honda", model: "CR-V" },
    damageAreas: ["Rear Door"],
    damageArea: "Rear Door",
    description: "Rear passenger-side dent with light paint transfer.",
    status: "in-review",
    createdAt: seedReportTwoTimestamp,
    submittedAt: seedReportTwoTimestamp,
    bidsCount: 2,
    photos: [],
  },
];

// ============================================================================
// LANDING PAGE IMAGES
// ============================================================================
// Updated with new professional photos - January 2025

export const LANDING_PAGE_IMAGES = {
  // Hero section - NEW: Person on phone with damaged blue car - perfect customer context!
  HERO: heroPhoto,

  // Benefits section "Get Your Car Fixed Right" - Damage close-up
  MECHANIC: damageCloseupPhoto,

  // Benefits section "Certified Professionals" - Paint booth (moved from old hero)
  REPAIR_TOOLS: paintBoothPhoto,

  // Benefits section "Competitive Pricing" - Spray painting detail work (moved from Certified Professionals)
  DENT_REPAIR: professionalPainterPhoto,

  // NEW: Workshop mechanic in blue coveralls - active repair work
  WORKSHOP_MECHANIC: workshopMechanicPhoto,

  // How It Works section - Vehicle inspection
  VEHICLE_INSPECTION: workshopMechanicPhoto,

  // Benefits section - Keep original precision repair (not currently used)
  PRECISION_REPAIR: precisionRepairPhoto,

  // Default profile image
  DEFAULT_PROFILE: defaultProfilePicture,
};
