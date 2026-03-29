/**
 * Demo Data Service
 * Replaces Supabase database with browser-backed demo storage
 * For demonstration purposes only - NOT for production use
 */

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

const VEHICLES_KEY = "bidondent_demo_vehicles";
const REPORTS_KEY = "bidondent_demo_reports";
const BIDS_KEY = "bidondent_demo_bids";
const demoMemoryCollections: Record<string, unknown[]> = {};

const isOptionalString = (value: unknown) => value === undefined || typeof value === "string";

const isVehicle = (value: unknown): value is Vehicle => {
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

const isDamageReport = (value: unknown): value is DamageReport => {
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

const isBid = (value: unknown): value is Bid => {
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

function getMemoryCollection<T>(key: string): T[] | null {
  const cached = demoMemoryCollections[key];
  return Array.isArray(cached) ? (cached as T[]) : null;
}

function cacheCollectionInMemory<T>(key: string, items: T[]) {
  demoMemoryCollections[key] = items;
}

function persistStoredCollection<T>(key: string, items: T[]) {
  cacheCollectionInMemory(key, items);

  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch {
    // Keep the current session usable even if browser storage is blocked
  }
}

function clearStoredCollection(key: string) {
  delete demoMemoryCollections[key];

  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore storage failures and still clear the in-memory fallback
  }
}

function loadStoredCollection<T>(
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

class DemoDataService {
  // ============================================================================
  // VEHICLES
  // ============================================================================

  async getVehicles(userId: string): Promise<Vehicle[]> {
    const vehicles = this.getAllVehicles();
    return vehicles.filter((v) => v.userId === userId);
  }

  async addVehicle(vehicle: Omit<Vehicle, "id">): Promise<Vehicle> {
    const newVehicle: Vehicle = {
      ...vehicle,
      id: `vehicle-${Date.now()}`,
    };

    const vehicles = this.getAllVehicles();
    vehicles.push(newVehicle);
    persistStoredCollection(VEHICLES_KEY, vehicles);

    return newVehicle;
  }

  async updateVehicle(id: string, updates: Partial<Vehicle>): Promise<Vehicle | null> {
    const vehicles = this.getAllVehicles();
    const index = vehicles.findIndex((v) => v.id === id);

    if (index === -1) return null;

    const updatedVehicle = { ...vehicles[index], ...updates };
    if (!isVehicle(updatedVehicle)) return null;

    vehicles[index] = updatedVehicle;
    persistStoredCollection(VEHICLES_KEY, vehicles);

    return vehicles[index];
  }

  async deleteVehicle(id: string): Promise<boolean> {
    const vehicles = this.getAllVehicles();
    const filtered = vehicles.filter((v) => v.id !== id);
    persistStoredCollection(VEHICLES_KEY, filtered);
    return true;
  }

  private getAllVehicles(): Vehicle[] {
    return loadStoredCollection(VEHICLES_KEY, isVehicle, []);
  }

  // ============================================================================
  // DAMAGE REPORTS
  // ============================================================================

  async getDamageReports(
    userId: string,
    userType: "customer" | "shop" | "insurer"
  ): Promise<DamageReport[]> {
    const reports = this.getAllReports();

    // Customers only see their own reports
    if (userType === "customer") {
      return reports.filter((r) => r.userId === userId);
    }

    // Shops and insurers see all reports
    return reports;
  }

  async getDamageReport(id: string): Promise<DamageReport | null> {
    const reports = this.getAllReports();
    return reports.find((r) => r.id === id) || null;
  }

  async addDamageReport(report: Omit<DamageReport, "id" | "submittedAt">): Promise<DamageReport> {
    const newReport: DamageReport = {
      ...report,
      id: `report-${Date.now()}`,
      submittedAt: new Date().toISOString(),
      status: "pending",
    };

    const reports = this.getAllReports();
    reports.push(newReport);
    persistStoredCollection(REPORTS_KEY, reports);

    return newReport;
  }

  async updateDamageReport(
    id: string,
    updates: Partial<DamageReport>
  ): Promise<DamageReport | null> {
    const reports = this.getAllReports();
    const index = reports.findIndex((r) => r.id === id);

    if (index === -1) return null;

    const updatedReport = { ...reports[index], ...updates };
    if (!isDamageReport(updatedReport)) return null;

    reports[index] = updatedReport;
    persistStoredCollection(REPORTS_KEY, reports);

    return reports[index];
  }

  private getAllReports(): DamageReport[] {
    return loadStoredCollection(REPORTS_KEY, isDamageReport, this.getInitialReports());
  }

  private getInitialReports(): DamageReport[] {
    // Some demo reports for shops/insurers to see
    return [
      {
        id: "demo-report-1",
        userId: "demo-customer-1",
        vehicleId: "demo-vehicle-1",
        damageType: "Collision",
        damageArea: "Front Bumper",
        severity: "moderate",
        description:
          "Front bumper damaged from parking lot incident. Paint scratches and minor dent.",
        photoUrls: [],
        status: "pending",
        submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        location: "Seattle, WA",
      },
      {
        id: "demo-report-2",
        userId: "demo-customer-1",
        vehicleId: "demo-vehicle-2",
        damageType: "Dent",
        damageArea: "Rear Door",
        severity: "minor",
        description: "Small dent on rear passenger door. No paint damage.",
        photoUrls: [],
        status: "pending",
        submittedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        location: "Bellevue, WA",
      },
    ];
  }

  // ============================================================================
  // BIDS
  // ============================================================================

  async getBidsForReport(reportId: string): Promise<Bid[]> {
    const bids = this.getAllBids();
    return bids.filter((b) => b.reportId === reportId);
  }

  async getBidsForShop(shopId: string): Promise<Bid[]> {
    const bids = this.getAllBids();
    return bids.filter((b) => b.shopId === shopId);
  }

  async addBid(bid: Omit<Bid, "id" | "createdAt">): Promise<Bid> {
    const newBid: Bid = {
      ...bid,
      id: `bid-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: "pending",
    };

    const bids = this.getAllBids();
    bids.push(newBid);
    persistStoredCollection(BIDS_KEY, bids);

    return newBid;
  }

  async updateBid(id: string, updates: Partial<Bid>): Promise<Bid | null> {
    const bids = this.getAllBids();
    const index = bids.findIndex((b) => b.id === id);

    if (index === -1) return null;

    const updatedBid = { ...bids[index], ...updates };
    if (!isBid(updatedBid)) return null;

    bids[index] = updatedBid;
    persistStoredCollection(BIDS_KEY, bids);

    return bids[index];
  }

  private getAllBids(): Bid[] {
    return loadStoredCollection(BIDS_KEY, isBid, this.getInitialBids());
  }

  private getInitialBids(): Bid[] {
    // Some demo bids
    return [
      {
        id: "demo-bid-1",
        reportId: "demo-report-1",
        shopId: "demo-shop-1",
        shopName: "Quick Fix Auto Body",
        amount: 850,
        estimatedTime: "2-3 days",
        status: "pending",
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        description: "We can fix this bumper with paintless dent repair and touch-up paint.",
      },
      {
        id: "demo-bid-2",
        reportId: "demo-report-1",
        shopId: "demo-shop-2",
        shopName: "Premium Collision Center",
        amount: 1200,
        estimatedTime: "3-4 days",
        status: "pending",
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        description: "Full bumper replacement with OEM parts and professional paint matching.",
      },
    ];
  }

  // ============================================================================
  // UTILITY
  // ============================================================================

  // Clear all demo data (for testing)
  clearAllData(): void {
    clearStoredCollection(VEHICLES_KEY);
    clearStoredCollection(REPORTS_KEY);
    clearStoredCollection(BIDS_KEY);
  }
}

// Export singleton instance
export const demoDataService = new DemoDataService();
