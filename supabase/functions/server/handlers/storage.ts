/**
 * Storage Route Handlers
 * Photo uploads, storage statistics, and cleanup operations
 */

import {
  activeStorageBuckets,
  canonicalStorageBuckets,
  isSupportedStorageBucket,
  supportedStorageBuckets,
} from "../config/storage.ts";
import {
  requireAdminContext,
  requireClerkSession,
} from "../utils/authz.ts";
import { sanitizeErrorMessage } from "../utils/helpers.ts";
import {
  buildScopedUploadPath,
  createSignedStorageUrl,
  extractStorageObjectTarget,
  isUserScopedStoragePath,
  resolveScopedUserStoragePath,
} from "../utils/storage.ts";

function parseIntegerParam(
  value: string | null,
  fallback: number,
  options?: { max?: number; min?: number }
) {
  if (typeof value !== "string" || !value.trim()) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  if (typeof options?.min === "number" && parsed < options.min) {
    return options.min;
  }

  if (typeof options?.max === "number" && parsed > options.max) {
    return options.max;
  }

  return parsed;
}

const PRO_STORAGE_LIMIT_BYTES = 100 * 1024 * 1024 * 1024;

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

async function listBucketFiles(
  supabase: any,
  bucket: string,
  path = "",
  depth = 0
): Promise<Array<{ metadata?: { size?: number } | null; name: string; path: string }>> {
  if (depth > 5) {
    return [];
  }

  const { data, error } = await supabase.storage.from(bucket).list(path, {
    limit: 100,
    offset: 0,
    sortBy: { column: "name", order: "asc" },
  });

  if (error || !data) {
    return [];
  }

  const files: Array<{ metadata?: { size?: number } | null; name: string; path: string }> = [];

  for (const entry of data) {
    const entryPath = path ? `${path}/${entry.name}` : entry.name;
    if (entry.id) {
      files.push({
        metadata: entry.metadata,
        name: entry.name,
        path: entryPath,
      });
      continue;
    }

    const nestedEntries = await listBucketFiles(supabase, bucket, entryPath, depth + 1);
    files.push(...nestedEntries);
  }

  return files;
}

const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

export async function handleUploadPhoto(
  req: Request,
  supabase: any,
  respond: Function
): Promise<Response> {
  try {
    const formData = await req.formData();
    const session = await requireClerkSession(req, { requireEmail: true });
    const file = formData.get('file') as File;
    const bucket = formData.get('bucket') as string;
    const requestedPathValue = formData.get('path');
    const requestedPath =
      typeof requestedPathValue === "string" && requestedPathValue.trim()
        ? requestedPathValue
        : null;
    const fileName = formData.get('fileName') as string | null;
    const requestedContentTypeValue = formData.get('contentType');
    const requestedContentType =
      typeof requestedContentTypeValue === "string" && requestedContentTypeValue.trim()
        ? requestedContentTypeValue
        : null;
    const cacheControlValue = formData.get("cacheControl");
    const cacheControl =
      typeof cacheControlValue === "string" && cacheControlValue.trim()
        ? cacheControlValue
        : "3600";
    const upsertValue = formData.get("upsert");
    const upsert =
      typeof upsertValue === "string" ? upsertValue.toLowerCase() !== "false" : true;

    if (!file || !bucket) {
      return respond({ error: 'Missing file or bucket parameter' }, 400);
    }

    if (!isSupportedStorageBucket(bucket)) {
      return respond({ error: 'Invalid bucket name' }, 400);
    }

    const contentType = requestedContentType || file.type || null;

    if (contentType && !ALLOWED_IMAGE_TYPES.has(contentType)) {
      return respond({ error: 'Invalid file type. Only images (JPEG, PNG, WebP, GIF) are allowed.' }, 400);
    }

    const uploadPath = requestedPath
      ? resolveScopedUserStoragePath(requestedPath, session.clerkUserId)
      : buildScopedUploadPath({
          clerkUserId: session.clerkUserId,
          contentType,
          fileName,
          originalFileName: file.name || "upload.jpg",
        });

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(uploadPath, file, {
        cacheControl,
        contentType: contentType || undefined,
        upsert,
      });

    if (error) {
      return respond({ error: sanitizeErrorMessage(error) }, 500);
    }

    const signedUrl = await createSignedStorageUrl(
      supabase,
      { bucket, path: data.path },
      60 * 60 * 24
    );

    return respond({
      bucket,
      path: data.path,
      publicUrl: signedUrl,
      success: true,
    });
  } catch (error: any) {
    const status =
      error?.message === "No Authorization header provided" ||
      error?.message?.includes("Authorization header")
        ? 401
        : 500;
    return respond({ error: sanitizeErrorMessage(error) }, status);
  }
}

export async function handleDeletePhoto(
  req: Request,
  supabase: any,
  respond: Function
): Promise<Response> {
  try {
    const session = await requireClerkSession(req, { requireEmail: true });
    let body: Record<string, unknown> = {};

    try {
      body = await req.json();
    } catch {
      return respond({ error: "Invalid JSON in request body" }, 400);
    }

    const bucket = typeof body.bucket === "string" ? body.bucket : null;
    const rawUrl = typeof body.url === "string" ? body.url : null;

    if (!bucket || !isSupportedStorageBucket(bucket)) {
      return respond({ error: "Invalid bucket name" }, 400);
    }

    if (!rawUrl) {
      return respond({ error: "Missing storage URL" }, 400);
    }

    const target = extractStorageObjectTarget(rawUrl);

    if (!target || target.bucket !== bucket) {
      return respond({ error: "Invalid storage target" }, 400);
    }

    if (!isUserScopedStoragePath(target.path, session.clerkUserId)) {
      return respond({ error: "Forbidden" }, 403);
    }

    const { error } = await supabase.storage.from(bucket).remove([target.path]);

    if (error) {
      return respond({ error: sanitizeErrorMessage(error) }, 500);
    }

    return respond({
      bucket,
      path: target.path,
      success: true,
    });
  } catch (error: any) {
    const status =
      error?.message === "No Authorization header provided" ||
      error?.message?.includes("Authorization header")
        ? 401
        : 500;
    return respond({ error: sanitizeErrorMessage(error) }, status);
  }
}

export async function handleGetSignedStorageUrl(
  req: Request,
  supabase: any,
  respond: Function
): Promise<Response> {
  try {
    const session = await requireClerkSession(req, { requireEmail: true });
    let body: Record<string, unknown> = {};

    try {
      body = await req.json();
    } catch {
      return respond({ error: "Invalid JSON in request body" }, 400);
    }

    const bucket = typeof body.bucket === "string" ? body.bucket : null;
    const path = typeof body.path === "string" ? body.path : null;
    const expiresIn = parseIntegerParam(
      typeof body.expiresIn === "number" ? String(body.expiresIn) : null,
      3600,
      { min: 60, max: 60 * 60 * 24 }
    );

    if (!bucket || !isSupportedStorageBucket(bucket)) {
      return respond({ error: "Invalid bucket name" }, 400);
    }

    if (!path) {
      return respond({ error: "Missing storage path" }, 400);
    }

    const scopedPath = resolveScopedUserStoragePath(path, session.clerkUserId);
    const signedUrl = await createSignedStorageUrl(
      supabase,
      { bucket, path: scopedPath },
      expiresIn
    );

    if (!signedUrl) {
      return respond({ error: "Failed to create signed URL" }, 500);
    }

    return respond({
      bucket,
      path: scopedPath,
      signedUrl,
      success: true,
    });
  } catch (error: any) {
    const status =
      error?.message === "No Authorization header provided" ||
      error?.message?.includes("Authorization header")
        ? 401
        : 500;
    return respond({ error: sanitizeErrorMessage(error) }, status);
  }
}

export async function handleListStorageObjects(
  req: Request,
  supabase: any,
  respond: Function
): Promise<Response> {
  try {
    const session = await requireClerkSession(req, { requireEmail: true });
    const url = new URL(req.url);
    const bucket = url.searchParams.get("bucket");
    const requestedPath = url.searchParams.get("path");
    const limit = parseIntegerParam(url.searchParams.get("limit"), 100, { min: 1, max: 100 });
    const offset = parseIntegerParam(url.searchParams.get("offset"), 0, { min: 0, max: 1000 });

    if (!bucket || !isSupportedStorageBucket(bucket)) {
      return respond({ error: "Invalid bucket name" }, 400);
    }

    const scopedPath = resolveScopedUserStoragePath(requestedPath, session.clerkUserId);
    const { data, error } = await supabase.storage.from(bucket).list(scopedPath, {
      limit,
      offset,
      sortBy: { column: "created_at", order: "desc" },
    });

    if (error) {
      return respond({ error: sanitizeErrorMessage(error) }, 500);
    }

    return respond({
      bucket,
      files: (data || []).map((file: any) => ({
        contentType: file.metadata?.mimetype,
        createdAt: file.created_at || new Date().toISOString(),
        name: file.name,
        path: scopedPath ? `${scopedPath}/${file.name}` : file.name,
        size: file.metadata?.size || 0,
        updatedAt: file.updated_at || new Date().toISOString(),
      })),
      path: scopedPath,
      success: true,
    });
  } catch (error: any) {
    const status =
      error?.message === "No Authorization header provided" ||
      error?.message?.includes("Authorization header")
        ? 401
        : 500;
    return respond({ error: sanitizeErrorMessage(error) }, status);
  }
}

export async function handleStorageStats(
  req: Request,
  supabase: any,
  respond: Function
): Promise<Response> {
  try {
    await requireAdminContext(req, supabase);

    const buckets = activeStorageBuckets;
    const bucketStats: Record<string, { fileCount: number; formattedSize: string; totalSize: number }> = {};
    let totalPhotos = 0;
    let totalSize = 0;

    for (const bucket of buckets) {
      const files = await listBucketFiles(supabase, bucket);
      const bucketSize = files.reduce((sum, file) => sum + (file.metadata?.size || 0), 0);

      bucketStats[bucket] = {
        fileCount: files.length,
        formattedSize: formatBytes(bucketSize),
        totalSize: bucketSize,
      };

      totalPhotos += files.length;
      totalSize += bucketSize;
    }

    return respond({
      buckets: bucketStats,
      estimatedStorageUsed: formatBytes(totalSize),
      estimatedStorageUsedBytes: totalSize,
      needsCleanup: bucketStats[canonicalStorageBuckets.reportMedia]?.fileCount > 1000,
      storageLimit: '100GB',
      storagePercentage: Math.round((totalSize / PRO_STORAGE_LIMIT_BYTES) * 10000) / 100,
      success: true,
      totalPhotos,
      totalReports: bucketStats[canonicalStorageBuckets.reportMedia]?.fileCount || 0,
      bandwidthWarning: false,
    });
  } catch (error: any) {
    const status =
      error?.message === "Admin access required"
        ? 403
        : error?.message === "No Authorization header provided" ||
            error?.message?.includes("Authorization header")
          ? 401
          : 500;
    return respond({ error: sanitizeErrorMessage(error) }, status);
  }
}

export async function handleCleanupOldReports(
  req: Request,
  supabase: any,
  respond: Function
): Promise<Response> {
  try {
    await requireAdminContext(req, supabase);

    const body = await req.json();
    const { daysOld = 30 } = body;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const { data: oldReports, error: fetchError } = await supabase
      .from('damage_reports')
      .select('id, photo_urls')
      .lt('created_at', cutoffDate.toISOString());

    if (fetchError) {
      return respond({ error: sanitizeErrorMessage(fetchError) }, 500);
    }

    let deletedCount = 0;
    const errors = [];

    for (const report of oldReports || []) {
      try {
        if (Array.isArray(report.photo_urls)) {
          for (const photoUrl of report.photo_urls) {
            try {
              const target =
                typeof photoUrl === "string" ? extractStorageObjectTarget(photoUrl) : null;
              if (target) {
                await supabase.storage.from(target.bucket).remove([target.path]);
              }
            } catch {
              // Continue even if photo deletion fails
            }
          }
        }

        const { error: deleteError } = await supabase
          .from('damage_reports')
          .delete()
          .eq('id', report.id);

        if (!deleteError) {
          deletedCount++;
        }
      } catch (err: any) {
        errors.push({ reportId: report.id, error: sanitizeErrorMessage(err) });
      }
    }

    return respond({
      deletedReports: deletedCount,
      daysOld,
      errors: errors.length > 0 ? errors : undefined,
      success: true,
      supportedBuckets: supportedStorageBuckets,
    });
  } catch (error: any) {
    const status =
      error?.message === "Admin access required"
        ? 403
        : error?.message === "No Authorization header provided" ||
            error?.message?.includes("Authorization header")
          ? 401
          : 500;
    return respond({ error: sanitizeErrorMessage(error) }, status);
  }
}
