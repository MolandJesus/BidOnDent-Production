import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ── Mock SupabaseStorageAdapter ─────────────────────────────────────────────
// vi.mock is hoisted, so we use vi.hoisted to define the provider first

const { mockProvider } = vi.hoisted(() => {
  const mockProvider = {
    name: "Mock Supabase Storage",
    upload: vi.fn(),
    delete: vi.fn(),
    list: vi.fn(),
    getSignedUrl: vi.fn(),
    getPublicUrl: vi.fn(() => "https://storage.example.com/test/file.jpg"),
    isConfigured: vi.fn(() => true),
    ensureBucket: vi.fn(async () => true),
  };
  return { mockProvider };
});

vi.mock("./SupabaseStorageAdapter", () => {
  function MockAdapter() {
    return mockProvider;
  }
  return { SupabaseStorageAdapter: MockAdapter };
});

import { StorageService } from "./StorageService";

describe("StorageService", () => {
  let service: StorageService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new StorageService();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── Initialization ──

  it("initializes with supabase provider by default", () => {
    const info = service.getProviderInfo();
    expect(info.type).toBe("supabase");
    expect(info.name).toBe("Mock Supabase Storage");
    expect(info.configured).toBe(true);
  });

  it("isConfigured delegates to provider", () => {
    expect(service.isConfigured()).toBe(true);
    mockProvider.isConfigured.mockReturnValueOnce(false);
    expect(service.isConfigured()).toBe(false);
  });

  // ── Upload ──

  it("uploadFile delegates to provider", async () => {
    mockProvider.upload.mockResolvedValueOnce({
      success: true,
      url: "https://storage.example.com/bucket/test.jpg",
      path: "test.jpg",
    });

    const result = await service.uploadFile({
      bucket: "test-bucket",
      path: "test.jpg",
      file: new Blob(["test"], { type: "image/jpeg" }),
    });

    expect(result.success).toBe(true);
    expect(result.url).toContain("test.jpg");
    expect(mockProvider.upload).toHaveBeenCalledOnce();
  });

  it("uploadFile returns error from provider", async () => {
    mockProvider.upload.mockResolvedValueOnce({
      success: false,
      error: "Quota exceeded",
    });

    const result = await service.uploadFile({
      bucket: "test-bucket",
      path: "big-file.jpg",
      file: new Blob(["big"]),
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Quota exceeded");
  });

  // ── Delete ──

  it("deleteFile delegates to provider", async () => {
    mockProvider.delete.mockResolvedValueOnce({ success: true });

    const result = await service.deleteFile({
      bucket: "test-bucket",
      path: "old-file.jpg",
    });

    expect(result.success).toBe(true);
    expect(mockProvider.delete).toHaveBeenCalledOnce();
  });

  // ── List ──

  it("listFiles delegates to provider", async () => {
    mockProvider.list.mockResolvedValueOnce({
      success: true,
      files: [
        { name: "a.jpg", path: "a.jpg", size: 100, createdAt: "", updatedAt: "" },
        { name: "b.jpg", path: "b.jpg", size: 200, createdAt: "", updatedAt: "" },
      ],
    });

    const result = await service.listFiles({
      bucket: "test-bucket",
      path: "photos/",
    });

    expect(result.success).toBe(true);
    expect(result.files).toHaveLength(2);
  });

  // ── Signed URL ──

  it("getSignedUrl delegates to provider", async () => {
    mockProvider.getSignedUrl.mockResolvedValueOnce({
      success: true,
      signedUrl: "https://storage.example.com/signed/file.jpg?token=abc",
    });

    const result = await service.getSignedUrl({
      bucket: "private-bucket",
      path: "secret.pdf",
      expiresIn: 3600,
    });

    expect(result.success).toBe(true);
    expect(result.signedUrl).toContain("token=abc");
  });

  // ── Public URL ──

  it("getPublicUrl delegates to provider", () => {
    const url = service.getPublicUrl("public-bucket", "photo.jpg");
    expect(url).toBe("https://storage.example.com/test/file.jpg");
    expect(mockProvider.getPublicUrl).toHaveBeenCalledWith("public-bucket", "photo.jpg");
  });

  // ── Ensure bucket ──

  it("ensureBucket delegates to provider", async () => {
    const result = await service.ensureBucket("new-bucket");
    expect(result).toBe(true);
    expect(mockProvider.ensureBucket).toHaveBeenCalledWith("new-bucket");
  });

  // ── Provider switching ──

  it("switchProvider changes the active provider type", () => {
    service.switchProvider("aws-s3");
    const info = service.getProviderInfo();
    // Still creates SupabaseStorageAdapter (fallback) but type changes
    expect(info.type).toBe("aws-s3");
  });

  it("getProviderInfo returns current provider details", () => {
    const info = service.getProviderInfo();
    expect(info).toHaveProperty("type");
    expect(info).toHaveProperty("name");
    expect(info).toHaveProperty("configured");
  });
});
