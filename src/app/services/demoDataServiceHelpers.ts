export interface Vehicle {
  id: string;
  userId: string;
  make: string;
  model: string;
  year: number;
  color: string;
  vin?: string;
  licensePlate?: string;
  imageUrl?: string;
}

export interface DamageReport {
  id: string;
  userId: string;
  vehicleId: string;
  damageType: string;
  damageArea: string;
  severity: "minor" | "moderate" | "severe";
  description: string;
  photoUrls: string[];
  status: "pending" | "bidding" | "accepted" | "completed";
  submittedAt: string;
  location?: string;
}

export interface Bid {
  id: string;
  reportId: string;
  shopId: string;
  shopName: string;
  amount: number;
  estimatedTime: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
  description?: string;
}

export const VEHICLES_KEY = "bidondent_demo_vehicles";
export const REPORTS_KEY = "bidondent_demo_reports";
export const BIDS_KEY = "bidondent_demo_bids";

const demoMemoryCollections: Record<string, unknown[]> = {};

const isOptionalString = (value: unknown) => value === undefined || typeof value === "string";

export const isVehicle = (value: unknown): value is Vehicle => {
  if (typeof value !== "object" || value === null) return false;
  const vehicle = value as Record<string, unknown>;
  return (
    typeof vehicle.id === "string" &&
    typeof vehicle.userId === "string" &&
    typeof vehicle.make === "string" &&
    typeof vehicle.model === "string" &&
    typeof vehicle.year === "number" &&
    Number.isInteger(vehicle.year) &&
    typeof vehicle.color === "string" &&
    isOptionalString(vehicle.vin) &&
    isOptionalString(vehicle.licensePlate) &&
    isOptionalString(vehicle.imageUrl)
  );
};

export const isDamageReport = (value: unknown): value is DamageReport => {
  if (typeof value !== "object" || value === null) return false;
  const report = value as Record<string, unknown>;
  return (
    typeof report.id === "string" &&
    typeof report.userId === "string" &&
    typeof report.vehicleId === "string" &&
    typeof report.damageType === "string" &&
    typeof report.damageArea === "string" &&
    (report.severity === "minor" ||
      report.severity === "moderate" ||
      report.severity === "severe") &&
    typeof report.description === "string" &&
    Array.isArray(report.photoUrls) &&
    report.photoUrls.every((photoUrl) => typeof photoUrl === "string") &&
    (report.status === "pending" ||
      report.status === "bidding" ||
      report.status === "accepted" ||
      report.status === "completed") &&
    typeof report.submittedAt === "string" &&
    isOptionalString(report.location)
  );
};

export const isBid = (value: unknown): value is Bid => {
  if (typeof value !== "object" || value === null) return false;
  const bid = value as Record<string, unknown>;
  return (
    typeof bid.id === "string" &&
    typeof bid.reportId === "string" &&
    typeof bid.shopId === "string" &&
    typeof bid.shopName === "string" &&
    typeof bid.amount === "number" &&
    Number.isFinite(bid.amount) &&
    typeof bid.estimatedTime === "string" &&
    (bid.status === "pending" || bid.status === "accepted" || bid.status === "rejected") &&
    typeof bid.createdAt === "string" &&
    isOptionalString(bid.description)
  );
};

// ── Storage utilities ───────────────────────────────────────────────

function getMemoryCollection<T>(key: string): T[] | null {
  const cached = demoMemoryCollections[key];
  return Array.isArray(cached) ? (cached as T[]) : null;
}

function cacheCollectionInMemory<T>(key: string, items: T[]) {
  demoMemoryCollections[key] = items;
}

export function persistStoredCollection<T>(key: string, items: T[]) {
  cacheCollectionInMemory(key, items);

  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch {
    // Keep the current session usable even if browser storage is blocked
  }
}

export function clearStoredCollection(key: string) {
  delete demoMemoryCollections[key];

  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore storage failures and still clear the in-memory fallback
  }
}

export function loadStoredCollection<T>(
  key: string,
  isValidItem: (value: unknown) => value is T,
  fallback: T[]
) {
  const memoryFallback = getMemoryCollection<T>(key);

  try {
    const json = localStorage.getItem(key);
    if (!json) {
      const safeFallback = memoryFallback ?? fallback;
      cacheCollectionInMemory(key, safeFallback);
      return safeFallback;
    }

    const parsed: unknown = JSON.parse(json);
    if (!Array.isArray(parsed)) {
      clearStoredCollection(key);
      const safeFallback = memoryFallback ?? fallback;
      cacheCollectionInMemory(key, safeFallback);
      return safeFallback;
    }

    const sanitized = parsed.filter((item) => isValidItem(item));
    if (sanitized.length !== parsed.length) {
      persistStoredCollection(key, sanitized);
      return sanitized;
    }

    cacheCollectionInMemory(key, sanitized);
    return sanitized;
  } catch {
    clearStoredCollection(key);
    const safeFallback = memoryFallback ?? fallback;
    cacheCollectionInMemory(key, safeFallback);
    return safeFallback;
  }
}
