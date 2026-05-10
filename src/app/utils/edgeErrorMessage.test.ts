/**
 * Tests for friendlyEdgeError — Pass 209.
 *
 * Maps raw edge-function errors into UI-safe copy. Covers:
 *   - EdgeFunctionError code → friendly map
 *   - Pattern matching across known backend strings
 *   - Pass-through for already-safe messages
 *   - Fallback for schema/constraint vocabulary
 *   - Tolerance for non-Error inputs (string, undefined, null)
 */
import { describe, expect, it } from "vitest";

import { EdgeFunctionError } from "../services/supabase/runtime";
import { friendlyEdgeError } from "./edgeErrorMessage";

describe("friendlyEdgeError — code-based mapping", () => {
  it("maps UNAUTHORIZED code to sign-in copy", () => {
    const err = new EdgeFunctionError("ignored backend message", 401, "UNAUTHORIZED");
    expect(friendlyEdgeError(err)).toBe("Please sign in again to continue.");
  });

  it("maps FORBIDDEN code to permission copy", () => {
    const err = new EdgeFunctionError("ignored", 403, "FORBIDDEN");
    expect(friendlyEdgeError(err)).toBe("You don't have permission to perform this action.");
  });

  it("maps SHOP_PROFILE_REQUIRED to onboarding hint", () => {
    const err = new EdgeFunctionError("ignored", 412, "SHOP_PROFILE_REQUIRED");
    expect(friendlyEdgeError(err)).toMatch(/Complete your shop profile first/);
  });

  it("maps RATE_LIMITED code to slow-down copy", () => {
    const err = new EdgeFunctionError("ignored", 429, "RATE_LIMITED");
    expect(friendlyEdgeError(err)).toMatch(/too fast/);
  });

  it("falls through to message-based mapping when EdgeFunctionError has no code", () => {
    const err = new EdgeFunctionError("zip_codes array required for zip_codes type", 400);
    expect(friendlyEdgeError(err)).toBe("Add at least one ZIP code before saving.");
  });
});

describe("friendlyEdgeError — pattern-based mapping", () => {
  it("zip_codes pattern", () => {
    expect(friendlyEdgeError(new Error("zip_codes array required"))).toBe(
      "Add at least one ZIP code before saving."
    );
  });

  it("center_latitude/longitude required pattern", () => {
    expect(friendlyEdgeError(new Error("center_latitude is required"))).toBe(
      "Pick a location on the map first."
    );
    expect(friendlyEdgeError(new Error("center_longitude is required"))).toBe(
      "Pick a location on the map first."
    );
  });

  it("radius_miles range pattern", () => {
    expect(friendlyEdgeError(new Error("radius_miles must be between 1 and 200"))).toBe(
      "Pick a radius between 1 and 200 miles."
    );
  });

  it("auth/JWT/expired patterns", () => {
    expect(friendlyEdgeError(new Error("no authorization header"))).toMatch(/session expired/i);
    expect(friendlyEdgeError(new Error("Bearer token missing"))).toMatch(/session expired/i);
    expect(friendlyEdgeError(new Error("jwt expired"))).toMatch(/session expired/i);
  });

  it("network failure patterns", () => {
    expect(friendlyEdgeError(new Error("Failed to fetch"))).toMatch(/Couldn't reach the server/);
    expect(friendlyEdgeError(new Error("Load failed"))).toMatch(/Couldn't reach the server/);
  });

  it("conflict / unique-key pattern", () => {
    expect(friendlyEdgeError(new Error("duplicate key value"))).toBe("That entry already exists.");
  });
});

describe("friendlyEdgeError — pass-through and fallback", () => {
  it("returns the message verbatim when it looks user-safe", () => {
    expect(friendlyEdgeError(new Error("Your photo is too large."))).toBe(
      "Your photo is too large."
    );
  });

  it("returns fallback when the message contains schema vocabulary", () => {
    expect(
      friendlyEdgeError(new Error('null value in column "user_id" violates not-null constraint'))
    ).toBe("Something went wrong. Please try again.");
    expect(friendlyEdgeError(new Error('foreign key constraint "vehicles_user_id_fkey"'))).toBe(
      "Something went wrong. Please try again."
    );
  });

  it("respects custom fallback string", () => {
    expect(friendlyEdgeError(new Error("violates check constraint"), "Couldn't save bid.")).toBe(
      "Couldn't save bid."
    );
  });

  it("accepts string errors directly", () => {
    expect(friendlyEdgeError("Just a plain message")).toBe("Just a plain message");
  });

  it("returns fallback for empty/undefined/null inputs", () => {
    expect(friendlyEdgeError(undefined)).toBe("Something went wrong. Please try again.");
    expect(friendlyEdgeError(null)).toBe("Something went wrong. Please try again.");
    expect(friendlyEdgeError("")).toBe("Something went wrong. Please try again.");
  });
});
