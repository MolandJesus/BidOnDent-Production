import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("./runtime", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./runtime")>();
  return {
    ...actual,
    requestSupabaseEdge: vi.fn(),
  };
});

import {
  buildStoragePointerUrl,
  deletePhoto,
  extractStoragePathFromUrl,
  getSignedStorageUrl,
  listStorageObjects,
  normalizeStoragePath,
} from "./storage";
import { requestSupabaseEdge, SUPABASE_EDGE_ROUTES, SUPABASE_STORAGE_BUCKETS } from "./runtime";

const mockRequest = vi.mocked(requestSupabaseEdge);
const BUCKET = SUPABASE_STORAGE_BUCKETS.reportMedia;

afterEach(() => {
  mockRequest.mockReset();
});

// ---------------------------------------------------------------------------
// normalizeStoragePath
// ---------------------------------------------------------------------------
describe("normalizeStoragePath", () => {
  it("converts backslashes to forward slashes", () => {
    expect(normalizeStoragePath("photos\\image.jpg")).toBe("photos/image.jpg");
  });

  it("removes directory traversal sequences", () => {
    expect(normalizeStoragePath("../secret/file.txt")).toBe("secret/file.txt");
  });

  it("strips leading slashes", () => {
    expect(normalizeStoragePath("///photos/image.jpg")).toBe("photos/image.jpg");
  });

  it("collapses multiple consecutive slashes", () => {
    expect(normalizeStoragePath("photos///image.jpg")).toBe("photos/image.jpg");
  });

  it("handles combined path issues", () => {
    expect(normalizeStoragePath("\\..\\photos///image.jpg")).toBe("photos/image.jpg");
  });

  it("returns clean path unchanged", () => {
    expect(normalizeStoragePath("photos/image.jpg")).toBe("photos/image.jpg");
  });
});

// ---------------------------------------------------------------------------
// buildStoragePointerUrl
// ---------------------------------------------------------------------------
describe("buildStoragePointerUrl", () => {
  it("builds storage:// URL with encoded bucket and path", () => {
    const url = buildStoragePointerUrl(BUCKET, "photos/image.jpg");

    expect(url).toBe(`storage://${encodeURIComponent(BUCKET)}/photos/image.jpg`);
  });

  it("normalizes the path before building", () => {
    const url = buildStoragePointerUrl(BUCKET, "///photos\\image.jpg");

    expect(url).toContain("/photos/image.jpg");
    expect(url.startsWith("storage://")).toBe(true);
  });

  it("encodes path segments with special characters", () => {
    const url = buildStoragePointerUrl(BUCKET, "photos/my image (1).jpg");

    expect(url).toContain("my%20image%20(1).jpg");
  });
});

// ---------------------------------------------------------------------------
// extractStoragePathFromUrl
// ---------------------------------------------------------------------------
describe("extractStoragePathFromUrl", () => {
  it("returns null for empty url", () => {
    expect(extractStoragePathFromUrl("", BUCKET)).toBeNull();
  });

  it("extracts path from storage:// URL", () => {
    const url = `storage://${encodeURIComponent(BUCKET)}/photos/image.jpg`;

    expect(extractStoragePathFromUrl(url, BUCKET)).toBe("photos/image.jpg");
  });

  it("returns null for storage:// URL with wrong bucket", () => {
    const url = `storage://${encodeURIComponent("wrong-bucket")}/photos/image.jpg`;

    expect(extractStoragePathFromUrl(url, BUCKET)).toBeNull();
  });

  it("returns null for storage:// URL with no path separator", () => {
    expect(extractStoragePathFromUrl("storage://nobucket", BUCKET)).toBeNull();
  });

  it("extracts path from Supabase public object URL", () => {
    const url = `https://example.supabase.co/storage/v1/object/public/${BUCKET}/photos/img.jpg`;

    expect(extractStoragePathFromUrl(url, BUCKET)).toBe("photos/img.jpg");
  });

  it("extracts path from Supabase signed URL", () => {
    const url = `https://example.supabase.co/storage/v1/object/sign/${BUCKET}/photos/img.jpg?token=abc`;

    expect(extractStoragePathFromUrl(url, BUCKET)).toBe("photos/img.jpg");
  });

  it("extracts path from Supabase authenticated URL", () => {
    const url = `https://example.supabase.co/storage/v1/object/authenticated/${BUCKET}/photos/img.jpg`;

    expect(extractStoragePathFromUrl(url, BUCKET)).toBe("photos/img.jpg");
  });

  it("returns null for URL with wrong bucket", () => {
    const url = `https://example.supabase.co/storage/v1/object/public/wrong-bucket/photos/img.jpg`;

    expect(extractStoragePathFromUrl(url, BUCKET)).toBeNull();
  });

  it("returns null for non-storage URL", () => {
    expect(extractStoragePathFromUrl("https://example.com/random", BUCKET)).toBeNull();
  });

  it("returns null for invalid URL", () => {
    expect(extractStoragePathFromUrl("not-a-url", BUCKET)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// deletePhoto
// ---------------------------------------------------------------------------
describe("deletePhoto", () => {
  const photoUrl = `https://example.supabase.co/storage/v1/object/public/${BUCKET}/photos/img.jpg`;

  it("deletes a photo and returns true on success", async () => {
    mockRequest.mockResolvedValueOnce({ success: true });

    const result = await deletePhoto(photoUrl, BUCKET);

    expect(result).toBe(true);
    expect(mockRequest).toHaveBeenCalledWith(SUPABASE_EDGE_ROUTES.deletePhoto, {
      method: "POST",
      body: JSON.stringify({ bucket: BUCKET, url: photoUrl }),
    });
  });

  it("returns false when server returns success: false", async () => {
    mockRequest.mockResolvedValueOnce({ success: false });

    const result = await deletePhoto(photoUrl, BUCKET);

    expect(result).toBe(false);
  });

  it("returns false when path cannot be extracted", async () => {
    const result = await deletePhoto("https://example.com/random", BUCKET);

    expect(result).toBe(false);
    expect(mockRequest).not.toHaveBeenCalled();
  });

  it("returns false on network error", async () => {
    mockRequest.mockRejectedValueOnce(new Error("500"));

    const result = await deletePhoto(photoUrl, BUCKET);

    expect(result).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getSignedStorageUrl
// ---------------------------------------------------------------------------
describe("getSignedStorageUrl", () => {
  it("returns signed URL on success", async () => {
    mockRequest.mockResolvedValueOnce({ signedUrl: "https://signed.example.com/path" });

    const result = await getSignedStorageUrl(BUCKET, "photos/img.jpg");

    expect(result).toBe("https://signed.example.com/path");
    const body = JSON.parse(mockRequest.mock.calls[0][1]!.body as string);
    expect(body.bucket).toBe(BUCKET);
    expect(body.path).toBe("photos/img.jpg");
    expect(body.expiresIn).toBe(3600);
  });

  it("respects custom expiresIn", async () => {
    mockRequest.mockResolvedValueOnce({ signedUrl: "https://signed.example.com" });

    await getSignedStorageUrl(BUCKET, "photos/img.jpg", 600);

    const body = JSON.parse(mockRequest.mock.calls[0][1]!.body as string);
    expect(body.expiresIn).toBe(600);
  });

  it("returns null when response has no signedUrl", async () => {
    mockRequest.mockResolvedValueOnce({});

    const result = await getSignedStorageUrl(BUCKET, "photos/img.jpg");

    expect(result).toBeNull();
  });

  it("returns null on network error", async () => {
    mockRequest.mockRejectedValueOnce(new Error("fail"));

    const result = await getSignedStorageUrl(BUCKET, "photos/img.jpg");

    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// listStorageObjects
// ---------------------------------------------------------------------------
describe("listStorageObjects", () => {
  const fakeFile = {
    contentType: "image/jpeg",
    createdAt: "2026-01-01",
    name: "img.jpg",
    path: "photos/img.jpg",
    size: 1024,
    updatedAt: "2026-01-01",
  };

  it("returns list of files on success", async () => {
    mockRequest.mockResolvedValueOnce({ files: [fakeFile] });

    const result = await listStorageObjects(BUCKET, "photos");

    expect(result).toEqual([fakeFile]);
    expect(mockRequest).toHaveBeenCalledWith(
      expect.stringContaining(`${SUPABASE_EDGE_ROUTES.storageList}?`),
      { method: "GET" },
    );
  });

  it("returns empty array when response has no files key", async () => {
    mockRequest.mockResolvedValueOnce({});

    const result = await listStorageObjects(BUCKET);

    expect(result).toEqual([]);
  });

  it("returns null on network error", async () => {
    mockRequest.mockRejectedValueOnce(new Error("fail"));

    const result = await listStorageObjects(BUCKET);

    expect(result).toBeNull();
  });
});
