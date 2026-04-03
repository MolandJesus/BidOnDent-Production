import { afterEach, describe, expect, it, vi } from "vitest";

import { getClerkTokenForEdgeRequests, setClerkTokenGetter } from "./authSession";

afterEach(() => {
  setClerkTokenGetter(null);
  vi.restoreAllMocks();
});

describe("authSession", () => {
  it("returns null when no Clerk token getter is registered", async () => {
    await expect(getClerkTokenForEdgeRequests()).resolves.toBeNull();
  });

  it("returns the Clerk token from the registered getter", async () => {
    setClerkTokenGetter(async () => "clerk-edge-token");

    await expect(getClerkTokenForEdgeRequests()).resolves.toBe("clerk-edge-token");
  });

  it("returns null when the registered getter throws", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    setClerkTokenGetter(async () => {
      throw new Error("lookup failed");
    });

    await expect(getClerkTokenForEdgeRequests()).resolves.toBeNull();
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it("supports clearing the token getter explicitly", async () => {
    setClerkTokenGetter(async () => "temporary-token");
    setClerkTokenGetter(null);

    await expect(getClerkTokenForEdgeRequests()).resolves.toBeNull();
  });
});
