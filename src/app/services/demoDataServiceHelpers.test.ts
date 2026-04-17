import { afterAll, beforeEach, afterEach, describe, expect, it } from "vitest";

import {
  clearStoredCollection,
  isBid,
  isDamageReport,
  isVehicle,
  loadStoredCollection,
  persistStoredCollection,
} from "./demoDataServiceHelpers";

const TEST_KEY = "bidondent_demo_test_collection";
const originalLocalStorage = globalThis.localStorage;

function createLocalStorageMock() {
  const store = new Map<string, string>();

  return {
    getItem(key: string) {
      return store.has(key) ? store.get(key)! : null;
    },
    setItem(key: string, value: string) {
      store.set(key, String(value));
    },
    removeItem(key: string) {
      store.delete(key);
    },
    clear() {
      store.clear();
    },
  };
}

const validVehicle = {
  id: "vehicle-1",
  userId: "user-1",
  make: "Honda",
  model: "Civic",
  year: 2022,
  color: "Blue",
  vin: "1HGBH41JXMN109186",
  licensePlate: "ABC1234",
  imageUrl: "https://example.com/car.jpg",
};

const validDamageReport = {
  id: "report-1",
  userId: "user-1",
  vehicleId: "vehicle-1",
  damageType: "Dent",
  damageArea: "Front bumper",
  severity: "moderate" as const,
  description: "Front-end dent after parking lot bump.",
  photoUrls: ["https://example.com/photo-1.jpg"],
  status: "pending" as const,
  submittedAt: "2026-04-03T12:00:00.000Z",
  location: "Atlanta, GA",
};

const validBid = {
  id: "bid-1",
  reportId: "report-1",
  shopId: "shop-1",
  shopName: "Midtown Precision Collision",
  amount: 1450,
  estimatedTime: "3 days",
  status: "pending" as const,
  createdAt: "2026-04-03T12:00:00.000Z",
  description: "Includes paint and calibration.",
};

beforeEach(() => {
  Object.defineProperty(globalThis, "localStorage", {
    value: createLocalStorageMock(),
    configurable: true,
    writable: true,
  });
});

afterEach(() => {
  clearStoredCollection(TEST_KEY);
  localStorage.clear();
});

afterAll(() => {
  Object.defineProperty(globalThis, "localStorage", {
    value: originalLocalStorage,
    configurable: true,
    writable: true,
  });
});

describe("demoDataServiceHelpers type guards", () => {
  it("accepts valid demo entities", () => {
    expect(isVehicle(validVehicle)).toBe(true);
    expect(isDamageReport(validDamageReport)).toBe(true);
    expect(isBid(validBid)).toBe(true);
  });

  it("rejects invalid entity shapes", () => {
    expect(isVehicle({ ...validVehicle, year: 2022.5 })).toBe(false);
    expect(isDamageReport({ ...validDamageReport, severity: "critical" })).toBe(false);
    expect(isDamageReport({ ...validDamageReport, photoUrls: ["ok", 12] })).toBe(false);
    expect(isBid({ ...validBid, amount: Number.POSITIVE_INFINITY })).toBe(false);
    expect(isBid({ ...validBid, status: "viewed" })).toBe(false);
  });
});

describe("demoDataServiceHelpers storage behavior", () => {
  it("persists and reloads valid collections", () => {
    persistStoredCollection(TEST_KEY, [validVehicle]);

    const loaded = loadStoredCollection(TEST_KEY, isVehicle, []);

    expect(loaded).toEqual([validVehicle]);
    expect(JSON.parse(localStorage.getItem(TEST_KEY) ?? "[]")).toEqual([validVehicle]);
  });

  it("sanitizes invalid stored items before returning them", () => {
    localStorage.setItem(
      TEST_KEY,
      JSON.stringify([validVehicle, { id: "broken", userId: "user-2" }])
    );

    const loaded = loadStoredCollection(TEST_KEY, isVehicle, []);

    expect(loaded).toEqual([validVehicle]);
    expect(JSON.parse(localStorage.getItem(TEST_KEY) ?? "[]")).toEqual([validVehicle]);
  });

  it("falls back safely when storage contains invalid JSON", () => {
    localStorage.setItem(TEST_KEY, "{not-json");

    const fallback = [validVehicle];
    const loaded = loadStoredCollection(TEST_KEY, isVehicle, fallback);

    expect(loaded).toEqual(fallback);
    expect(localStorage.getItem(TEST_KEY)).toBeNull();
  });

  it("uses the in-memory fallback when storage disappears mid-session", () => {
    persistStoredCollection(TEST_KEY, [validVehicle]);
    localStorage.removeItem(TEST_KEY);

    const loaded = loadStoredCollection(TEST_KEY, isVehicle, []);

    expect(loaded).toEqual([validVehicle]);
  });
});
