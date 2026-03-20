/**
 * Demo Data Service
 * Replaces Supabase database with localStorage-based data storage
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

class DemoDataService {
  // ============================================================================
  // VEHICLES
  // ============================================================================

  async getVehicles(userId: string): Promise<Vehicle[]> {
    const vehicles = this.getAllVehicles();
    return vehicles.filter((vehicle) => vehicle.userId === userId);
  }

  async addVehicle(vehicle: Omit<Vehicle, "id">): Promise<Vehicle> {
    const newVehicle: Vehicle = {
      ...vehicle,
      id: `vehicle-${Date.now()}`,
    };

    const vehicles = this.getAllVehicles();
    vehicles.push(newVehicle);
    localStorage.setItem(VEHICLES_KEY, JSON.stringify(vehicles));

    return newVehicle;
  }

  async updateVehicle(id: string, updates: Partial<Vehicle>): Promise<Vehicle | null> {
    const vehicles = this.getAllVehicles();
    const index = vehicles.findIndex((vehicle) => vehicle.id === id);

    if (index === -1) return null;

    vehicles[index] = { ...vehicles[index], ...updates };
    localStorage.setItem(VEHICLES_KEY, JSON.stringify(vehicles));

    return vehicles[index];
  }

  async deleteVehicle(id: string): Promise<boolean> {
    const vehicles = this.getAllVehicles();
    const filtered = vehicles.filter((vehicle) => vehicle.id !== id);
    localStorage.setItem(VEHICLES_KEY, JSON.stringify(filtered));
    return true;
  }

  private getAllVehicles(): Vehicle[] {
    try {
      const json = localStorage.getItem(VEHICLES_KEY);
      return json ? JSON.parse(json) : [];
    } catch {
      return [];
    }
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
      return reports.filter((report) => report.userId === userId);
    }

    // Shops and insurers see all reports
    return reports;
  }

  async getDamageReport(id: string): Promise<DamageReport | null> {
    const reports = this.getAllReports();
    return reports.find((report) => report.id === id) || null;
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
    localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));

    return newReport;
  }

  async updateDamageReport(
    id: string,
    updates: Partial<DamageReport>
  ): Promise<DamageReport | null> {
    const reports = this.getAllReports();
    const index = reports.findIndex((report) => report.id === id);

    if (index === -1) return null;

    reports[index] = { ...reports[index], ...updates };
    localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));

    return reports[index];
  }

  private getAllReports(): DamageReport[] {
    try {
      const json = localStorage.getItem(REPORTS_KEY);
      return json ? JSON.parse(json) : this.getInitialReports();
    } catch {
      return this.getInitialReports();
    }
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
    return bids.filter((bid) => bid.reportId === reportId);
  }

  async getBidsForShop(shopId: string): Promise<Bid[]> {
    const bids = this.getAllBids();
    return bids.filter((bid) => bid.shopId === shopId);
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
    localStorage.setItem(BIDS_KEY, JSON.stringify(bids));

    return newBid;
  }

  async updateBid(id: string, updates: Partial<Bid>): Promise<Bid | null> {
    const bids = this.getAllBids();
    const index = bids.findIndex((bid) => bid.id === id);

    if (index === -1) return null;

    bids[index] = { ...bids[index], ...updates };
    localStorage.setItem(BIDS_KEY, JSON.stringify(bids));

    return bids[index];
  }

  private getAllBids(): Bid[] {
    try {
      const json = localStorage.getItem(BIDS_KEY);
      return json ? JSON.parse(json) : this.getInitialBids();
    } catch {
      return this.getInitialBids();
    }
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
    localStorage.removeItem(VEHICLES_KEY);
    localStorage.removeItem(REPORTS_KEY);
    localStorage.removeItem(BIDS_KEY);
  }
}

// Export singleton instance
export const demoDataService = new DemoDataService();
