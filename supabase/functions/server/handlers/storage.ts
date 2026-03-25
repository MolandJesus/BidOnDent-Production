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

const PRO_STORAGE_LIMIT_BYTES = 100 * 1024 * 1024 * 1024;

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

function normalizeUploadPath(fileName: string | null, originalFileName: string) {
  if (fileName && fileName.trim()) {
    const normalized = fileName.trim()
      .replace(/\.\./g, "")
      .replace(/\\/g, "/")
      .replace(/^\/*/, "");
    if (normalized) {
      return normalized;
    }
  }

  const fileExt = originalFileName.split('.').pop() || 'jpg';
  return `uploads/${Date.now()}-${crypto.randomUUID().split('-')[0]}.${fileExt}`;
}

function extractStorageTarget(photoUrl: string) {
  const marker = "/storage/v1/object/public/";
  const markerIndex = photoUrl.indexOf(marker);

  if (markerIndex < 0) {
    return null;
  }

  const remainder = photoUrl.slice(markerIndex + marker.length).split("?")[0];
  const slashIndex = remainder.indexOf("/");

  if (slashIndex < 0) {
    return null;
  }

  const bucket = decodeURIComponent(remainder.slice(0, slashIndex));
  const path = decodeURIComponent(remainder.slice(slashIndex + 1));

  if (!bucket || !path || !isSupportedStorageBucket(bucket)) {
    return null;
  }

  return { bucket, path };
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
    const file = formData.get('file') as File;
    const bucket = formData.get('bucket') as string;
    const fileName = formData.get('fileName') as string | null;

    if (!file || !bucket) {
      return respond({ error: 'Missing file or bucket parameter' }, 400);
    }

    if (!isSupportedStorageBucket(bucket)) {
      return respond({ error: 'Invalid bucket name' }, 400);
    }

    if (file.type && !ALLOWED_IMAGE_TYPES.has(file.type)) {
      return respond({ error: 'Invalid file type. Only images (JPEG, PNG, WebP, GIF) are allowed.' }, 400);
    }

    const uploadPath = normalizeUploadPath(fileName, file.name || "upload.jpg");

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(uploadPath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      return respond({ error: error.message }, 500);
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return respond({
      bucket,
      path: data.path,
      publicUrl,
      success: true,
    });
  } catch (error: any) {
    return respond({ error: error.message }, 500);
  }
}

export async function handleStorageStats(
  supabase: any,
  respond: Function
): Promise<Response> {
  try {
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
    return respond({ error: error.message }, 500);
  }
}

export async function handleCleanupOldReports(
  req: Request,
  supabase: any,
  respond: Function
): Promise<Response> {
  try {
    const body = await req.json();
    const { daysOld = 30 } = body;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const { data: oldReports, error: fetchError } = await supabase
      .from('damage_reports')
      .select('id, photo_urls')
      .lt('created_at', cutoffDate.toISOString());

    if (fetchError) {
      return respond({ error: fetchError.message }, 500);
    }

    let deletedCount = 0;
    const errors = [];

    for (const report of oldReports || []) {
      try {
        if (Array.isArray(report.photo_urls)) {
          for (const photoUrl of report.photo_urls) {
            try {
              const target = typeof photoUrl === "string" ? extractStorageTarget(photoUrl) : null;
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
        errors.push({ reportId: report.id, error: err.message });
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
    return respond({ error: error.message }, 500);
  }
}
