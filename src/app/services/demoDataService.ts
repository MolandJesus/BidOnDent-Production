/**
 * Demo Data Service
 * Replaces Supabase database with browser-backed demo storage
 * For demonstration purposes only - NOT for production use
 */

import {
  type Vehicle,
  type DamageReport,
  type Bid,
  VEHICLES_KEY,
  REPORTS_KEY,
  BIDS_KEY,
  isVehicle,
  isDamageReport,
  isBid,
  persistStoredCollection,
  clearStoredCollection,
  loadStoredCollection,
} from "./demoDataServiceHelpers";

export type { Vehicle, DamageReport, Bid };

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
