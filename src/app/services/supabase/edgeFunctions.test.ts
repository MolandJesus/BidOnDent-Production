import { afterEach, describe, expect, it, vi } from "vitest";

// Mock the runtime module
vi.mock("./runtime", () => ({
  buildSupabaseEdgeHeadersAsync: vi.fn(),
  buildSupabaseFunctionUrl: vi.fn((path: string) => `https://edge.test${path}`),
}));

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

import {
  buildEdgeFunctionUrl,
  edgeFunctionFetch,
  edgeFunctionJson,
} from "./edgeFunctions";
import { buildSupabaseEdgeHeadersAsync } from "./runtime";

const mockHeaders = vi.mocked(buildSupabaseEdgeHeadersAsync);

afterEach(() => {
  mockFetch.mockReset();
  mockHeaders.mockReset();
});

// ---------------------------------------------------------------------------
// buildEdgeFunctionUrl
// ---------------------------------------------------------------------------
describe("buildEdgeFunctionUrl", () => {
  it("builds URL from path", () => {
    expect(buildEdgeFunctionUrl("/reports")).toBe("https://edge.test/reports");
  });
});

// ---------------------------------------------------------------------------
// edgeFunctionFetch
// ---------------------------------------------------------------------------
describe("edgeFunctionFetch", () => {
  it("calls fetch with built URL and merged headers", async () => {
    mockHeaders.mockResolvedValueOnce({ Authorization: "Bearer tok", "Content-Type": "application/json" });
    const fakeResponse = new Response("ok", { status: 200 });
    mockFetch.mockResolvedValueOnce(fakeResponse);

    const result = await edgeFunctionFetch("/reports");
    expect(result).toBe(fakeResponse);
    expect(mockFetch).toHaveBeenCalledWith(
      "https://edge.test/reports",
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: "Bearer tok" }) })
    );
  });

  it("passes through request init options", async () => {
    mockHeaders.mockResolvedValueOnce({});
    mockFetch.mockResolvedValueOnce(new Response("ok"));

    await edgeFunctionFetch("/reports", { method: "POST", body: '{"test":true}' });
    expect(mockFetch).toHaveBeenCalledWith(
      "https://edge.test/reports",
      expect.objectContaining({ method: "POST", body: '{"test":true}' })
    );
  });
});

// ---------------------------------------------------------------------------
// edgeFunctionJson
// ---------------------------------------------------------------------------
describe("edgeFunctionJson", () => {
  it("returns parsed JSON on success", async () => {
    mockHeaders.mockResolvedValueOnce({});
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ reports: [] }), { status: 200 })
    );

    const result = await edgeFunctionJson<{ reports: unknown[] }>("/reports");
    expect(result).toEqual({ reports: [] });
  });

  it("throws on non-ok response with error from body", async () => {
    mockHeaders.mockResolvedValueOnce({});
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "Not found" }), { status: 404 })
    );

    await expect(edgeFunctionJson("/reports")).rejects.toThrow("Not found");
  });

  it("throws generic message when body has no error key", async () => {
    mockHeaders.mockResolvedValueOnce({});
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({}), { status: 500 })
    );

    await expect(edgeFunctionJson("/reports")).rejects.toThrow("Edge function request failed");
  });

  it("uses message field as fallback error text", async () => {
    mockHeaders.mockResolvedValueOnce({});
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ message: "Rate limited" }), { status: 429 })
    );

    await expect(edgeFunctionJson("/reports")).rejects.toThrow("Rate limited");
  });
});
