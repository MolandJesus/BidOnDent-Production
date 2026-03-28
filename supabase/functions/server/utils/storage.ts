import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { supportedStorageBuckets } from "../config/storage.ts";

export function normalizeObjectPath(value: string) {
  return value
    .replace(/\\/g, "/")
    .replace(/\.\./g, "")
    .replace(/^\/+/, "")
    .replace(/\/{2,}/g, "/");
}

function getFileExtension(fileName: string, contentType?: string | null) {
  const cleanedFileName = fileName.split("?")[0];
  const explicitExtension = cleanedFileName.includes(".")
    ? cleanedFileName.split(".").pop()?.toLowerCase() || null
    : null;

  if (explicitExtension && /^[a-z0-9]+$/.test(explicitExtension)) {
    return explicitExtension;
  }

  switch (contentType) {
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    default:
      return "jpg";
  }
}

export function extractStorageObjectTarget(rawUrl: string) {
  if (!rawUrl || rawUrl.startsWith("data:")) {
    return null;
  }

  if (rawUrl.startsWith("storage://")) {
    const withoutScheme = rawUrl.slice("storage://".length);
    const slashIndex = withoutScheme.indexOf("/");

    if (slashIndex < 0) {
      return null;
    }

    const bucket = decodeURIComponent(withoutScheme.slice(0, slashIndex));
    const path = normalizeObjectPath(decodeURIComponent(withoutScheme.slice(slashIndex + 1)));

    if (!bucket || !path || !supportedStorageBuckets.includes(bucket as any)) {
      return null;
    }

    return { bucket, path };
  }

  try {
    const url = new URL(rawUrl);
    const pathname = decodeURIComponent(url.pathname);
    const markers = [
      "/storage/v1/object/public/",
      "/storage/v1/object/sign/",
      "/storage/v1/object/authenticated/",
    ];

    for (const marker of markers) {
      const markerIndex = pathname.indexOf(marker);
      if (markerIndex < 0) {
        continue;
      }

      const remainder = pathname.slice(markerIndex + marker.length);
      const slashIndex = remainder.indexOf("/");

      if (slashIndex < 0) {
        continue;
      }

      const bucket = remainder.slice(0, slashIndex);
      const path = normalizeObjectPath(remainder.slice(slashIndex + 1));

      if (!bucket || !path || !supportedStorageBuckets.includes(bucket as any)) {
        continue;
      }

      return { bucket, path };
    }
  } catch {
    return null;
  }

  return null;
}

export function buildStoragePointerUrl(target: { bucket: string; path: string }) {
  const normalizedPath = normalizeObjectPath(target.path);
  return `storage://${encodeURIComponent(target.bucket)}/${normalizedPath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/")}`;
}

export function isUserScopedStoragePath(path: string, clerkUserId: string) {
  const normalizedPath = normalizeObjectPath(path);
  return (
    normalizedPath === `users/${clerkUserId}` ||
    normalizedPath.startsWith(`users/${clerkUserId}/`)
  );
}

export function resolveScopedUserStoragePath(rawPath: string | null | undefined, clerkUserId: string) {
  const normalizedPath = normalizeObjectPath(rawPath || "");
  const userRootPath = `users/${clerkUserId}`;

  if (!normalizedPath) {
    return userRootPath;
  }

  if (isUserScopedStoragePath(normalizedPath, clerkUserId)) {
    return normalizedPath;
  }

  return normalizeObjectPath(`${userRootPath}/${normalizedPath}`);
}

export function buildScopedUploadPath(params: {
  clerkUserId: string;
  contentType?: string | null;
  fileName?: string | null;
  originalFileName: string;
}) {
  const extension = getFileExtension(params.fileName || params.originalFileName, params.contentType);
  const randomId = crypto.randomUUID();
  return normalizeObjectPath(`users/${params.clerkUserId}/${randomId}.${extension}`);
}

export async function createSignedStorageUrl(
  supabase: SupabaseClient,
  target: { bucket: string; path: string },
  expiresIn = 60 * 60 * 24
) {
  const { data, error } = await supabase.storage
    .from(target.bucket)
    .createSignedUrl(target.path, expiresIn);

  if (error) {
    console.error("Error creating signed storage URL:", error);
    return null;
  }

  return data.signedUrl;
}

export async function hydrateSignedStorageUrl(
  supabase: SupabaseClient,
  rawUrl: string | null | undefined,
  expiresIn = 60 * 60 * 24
) {
  if (!rawUrl) {
    return rawUrl || null;
  }

  const target = extractStorageObjectTarget(rawUrl);
  if (!target) {
    return rawUrl;
  }

  const signedUrl = await createSignedStorageUrl(supabase, target, expiresIn);
  return signedUrl || rawUrl;
}

export async function hydrateSignedStorageUrls(
  supabase: SupabaseClient,
  rawUrls: string[] | null | undefined,
  expiresIn = 60 * 60 * 24
) {
  if (!Array.isArray(rawUrls) || rawUrls.length === 0) {
    return Array.isArray(rawUrls) ? rawUrls : [];
  }

  return await Promise.all(
    rawUrls.map((rawUrl) => hydrateSignedStorageUrl(supabase, rawUrl, expiresIn))
  );
}
