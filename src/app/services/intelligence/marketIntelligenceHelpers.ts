import type { InsurerBusinessProfile } from "../../types/networkProfiles";
import { buildDirectoryInsuranceProfiles, mergeDirectoryEntriesByName } from "./directoryAdapters";
import { INSURERS } from "./marketSeedData";

export type MarketUserType = "customer" | "shop" | "insurer";

export interface DirectoryVehicle {
  make?: string;
  model?: string;
  year?: string | number;
}

export interface DirectoryReport {
  damageArea?: string;
  damageAreas?: string[];
  damageType?: string;
  description?: string;
  insurance_company?: string;
}

export interface RecommendationContext {
  userType: MarketUserType;
  searchQuery?: string;
  vehicles?: DirectoryVehicle[];
  reports?: DirectoryReport[];
  connectedInsurerIds?: number[];
}

export interface ShopProfile {
  id: number;
  name: string;
  rating: number;
  reviews: number;
  distanceMiles: number;
  distanceLabel: string;
  certifications: string[];
  specialties: string[];
  supportedVehicleTypes: string[];
  supportedMakes: string[];
  insurerPrograms: string[];
  averagePriceLabel: string;
  averagePriceValue: number;
  completionRate: number;
  responseTimeHours: number;
  responseTimeLabel: string;
  image: string;
  categoryRatings: {
    quality: number;
    service: number;
    timeliness: number;
    value: number;
  };
  capabilityTags: string[];
  serviceArea: string;
  capacityBand: "boutique" | "balanced" | "high-capacity";
  aiSummary: string;
}

export interface ShopRecommendation extends ShopProfile {
  recommendationScore: number;
  insuranceCompatibilityScore: number;
  matchReasons: string[];
  topPick: boolean;
}

export interface InsuranceCompanyProfile {
  id: number;
  name: string;
  description: string;
  headquarters: string;
  claimsPhone: string;
  accountConnectionNotes: string[];
  benefits: string[];
  popular: boolean;
  repairProgramFocus: string[];
  digitalClaimsExperience: "standard" | "strong" | "excellent";
}

export interface InsuranceRecommendation extends InsuranceCompanyProfile {
  fitScore: number;
  connectionReasons: string[];
  connected: boolean;
}

export interface IntelligenceSummary {
  title: string;
  description: string;
  callouts: string[];
}

// ── Utility functions ───────────────────────────────────────────────

export function tokenize(value?: string) {
  return (value || "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .map((token) => token.trim())
    .filter(Boolean);
}

export function extractVehicleMakes(vehicles: DirectoryVehicle[]) {
  return vehicles
    .map((vehicle) => vehicle.make?.trim())
    .filter(Boolean)
    .map((make) => make!.toLowerCase());
}

export function extractDamageSignals(reports: DirectoryReport[]) {
  return reports.flatMap((report) => {
    const directDamageAreas = Array.isArray(report.damageAreas) ? report.damageAreas : [];
    const candidateValues = [
      report.damageArea,
      report.damageType,
      report.description,
      ...directDamageAreas,
    ];

    return candidateValues.filter(Boolean).flatMap((value) => tokenize(String(value)));
  });
}

export function clampScore(value: number) {
  return Math.max(1, Math.min(100, Math.round(value)));
}

export function uniqueTopReasons(reasons: string[]) {
  return [...new Set(reasons)].slice(0, 3);
}

export function matchesSearchQuery(tokens: string[], values: string[]) {
  if (tokens.length === 0) {
    return true;
  }

  const haystack = values.join(" ").toLowerCase();
  return tokens.every((token) => haystack.includes(token));
}

export function getConnectedInsurerNames(
  connectedInsurerIds: number[],
  directoryInsurers: InsurerBusinessProfile[] = []
) {
  return getInsuranceDirectory(directoryInsurers)
    .filter((insurer) => connectedInsurerIds.includes(insurer.id))
    .map((insurer) => insurer.name);
}

export function getInsuranceDirectory(directoryInsurers: InsurerBusinessProfile[] = []) {
  if (directoryInsurers.length === 0) {
    return INSURERS;
  }

  return mergeDirectoryEntriesByName(INSURERS, buildDirectoryInsuranceProfiles(directoryInsurers));
}
