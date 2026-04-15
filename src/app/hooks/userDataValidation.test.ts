import { describe, expect, it } from "vitest";

import type { UserData } from "../types";
import { isCachedUserData, sanitizeCachedUserData } from "./userDataValidation";

const validUserData = {
  userInfo: {
    name: "Morgan Test",
    email: "morgan@example.com",
    profileImage: "https://example.com/avatar.jpg",
  },
  vehicles: [
    {
      id: "vehicle-1",
      year: "2024",
      make: "Honda",
      model: "Civic",
      vin: "1HGBH41JXMN109186",
      licensePlate: "ABC1234",
      color: "Blue",
    },
  ],
  reports: [
    {
      id: "report-1",
      vehicleId: "vehicle-1",
      vehicleInfo: { year: "2024", make: "Honda", model: "Civic", vin: "1HGBH41JXMN109186" },
      damageAreas: ["front bumper"],
      photos: ["https://example.com/photo.jpg"],
      description: "Front bumper dent",
      status: "pending",
      createdAt: "2026-04-03T12:00:00.000Z",
      address: "123 Peachtree St NE",
      city: "Atlanta",
      state: "GA",
      zipCode: "30309",
    },
  ],
  bids: [
    {
      id: "bid-1",
      shopId: "shop-1",
      shopName: "Midtown Precision Collision",
      shopEmail: "shop@example.com",
      reportId: "report-1",
      amount: 1500,
      estimatedDays: 3,
      description: "Repair and paint",
      status: "pending",
      createdAt: "2026-04-03T13:00:00.000Z",
    },
  ],
  userPhone: "4045551212",
  redirectInfo: {
    type: "customer",
    email: "morgan@example.com",
    isReturning: true,
  },
  notifications: [
    {
      id: "notif-1",
      type: "bid",
      message: "A new bid arrived.",
      time: "Just now",
      read: false,
      createdAt: "2026-04-03T13:00:00.000Z",
    },
  ],
  hasSeenPhotoGuide: true,
  photoStorage: {
    "report-1": ["https://example.com/photo.jpg"],
  },
  activities: [
    {
      id: "activity-1",
      type: "bid_submitted",
      message: "Bid submitted",
      timestamp: "2026-04-03T13:00:00.000Z",
      metadata: { reportId: "report-1" },
    },
  ],
} as unknown as UserData;

describe("userDataValidation", () => {
  it("accepts a fully valid cached user payload", () => {
    expect(isCachedUserData(validUserData)).toBe(true);
  });

  it("rejects invalid cached payload shells", () => {
    expect(
      isCachedUserData({
        ...validUserData,
        photoStorage: { "report-1": ["ok", 123] },
      })
    ).toBe(false);

    expect(
      isCachedUserData({
        ...validUserData,
        redirectInfo: { type: "admin" },
      })
    ).toBe(false);
  });

  it("sanitizes invalid nested collections while keeping valid user state", () => {
    const mixedPayload = {
      ...validUserData,
      vehicles: [...validUserData.vehicles, { id: "broken-vehicle", year: 2024 }],
      reports: [...validUserData.reports, { id: "broken-report", vehicleId: "vehicle-1" }],
      bids: [...validUserData.bids, { id: "broken-bid", amount: "free" }],
      notifications: [...validUserData.notifications, { id: "broken-notif", type: "bid" }],
      activities: [...(validUserData.activities ?? []), { id: "broken-activity", type: "oops" }],
    } as unknown as UserData;

    const sanitized = sanitizeCachedUserData(mixedPayload);

    expect(sanitized.vehicles).toEqual(validUserData.vehicles);
    expect(sanitized.reports).toEqual(validUserData.reports);
    expect(sanitized.bids).toEqual(validUserData.bids);
    expect(sanitized.notifications).toEqual(validUserData.notifications);
    expect(sanitized.activities).toEqual(validUserData.activities);
  });
});
