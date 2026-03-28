import {
  isSupportedSupabaseBucket,
  requestSupabaseEdge,
  SUPABASE_EDGE_ROUTES,
  SUPABASE_STORAGE_BUCKETS,
  type SupportedSupabaseBucket,
} from "./runtime";

export function normalizeStoragePath(path: string) {
  return path
    .replace(/\\/g, "/")
    .replace(/\.\./g, "")
    .replace(/^\/+/, "")
    .replace(/\/{2,}/g, "/");
}

export function buildStoragePointerUrl(bucket: SupportedSupabaseBucket, path: string) {
  const normalizedPath = normalizeStoragePath(path);
  return `storage://${encodeURIComponent(bucket)}/${normalizedPath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/")}`;
}

export function extractStoragePathFromUrl(url: string, bucket: SupportedSupabaseBucket) {
  if (!url) {
    return null;
  }

  if (url.startsWith("storage://")) {
    const withoutScheme = url.slice("storage://".length);
    const slashIndex = withoutScheme.indexOf("/");
    if (slashIndex < 0) {
      return null;
    }

    const decodedBucket = decodeURIComponent(withoutScheme.slice(0, slashIndex));
    if (decodedBucket !== bucket) {
      return null;
    }

    return normalizeStoragePath(decodeURIComponent(withoutScheme.slice(slashIndex + 1)));
  }

  try {
    const parsed = new URL(url);
    const pathname = decodeURIComponent(parsed.pathname);
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

      const parsedBucket = remainder.slice(0, slashIndex);
      if (!isSupportedSupabaseBucket(parsedBucket) || parsedBucket !== bucket) {
        continue;
      }

      return normalizeStoragePath(remainder.slice(slashIndex + 1));
    }
  } catch {
    return null;
  }

  return null;
}

export type UploadedPhotoObject = {
  bucket: SupportedSupabaseBucket;
  path: string;
  publicUrl: string | null;
};

export type ListedStorageObject = {
  contentType?: string;
  createdAt: string;
  name: string;
  path: string;
  size: number;
  updatedAt: string;
};

type UploadPhotoOptions = {
  cacheControl?: string;
  contentType?: string;
  path?: string;
  upsert?: boolean;
};

export async function uploadPhotoObject(
  file: File | Blob,
  bucket: SupportedSupabaseBucket,
  fileName?: string,
  options?: UploadPhotoOptions
): Promise<UploadedPhotoObject | null> {
  try {
    if (import.meta.env.DEV) {
      console.log("📤 Uploading photo to Supabase Storage via authenticated edge request...");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("bucket", bucket);
    if (fileName) {
      formData.append("fileName", fileName);
    }
    if (options?.path) {
      formData.append("path", normalizeStoragePath(options.path));
    }
    if (options?.cacheControl) {
      formData.append("cacheControl", options.cacheControl);
    }
    if (options?.contentType) {
      formData.append("contentType", options.contentType);
    }
    if (typeof options?.upsert === "boolean") {
      formData.append("upsert", String(options.upsert));
    }

    if (import.meta.env.DEV) console.log(`📤 Uploading to bucket: ${bucket}`);

    const response = await requestSupabaseEdge<{ bucket?: string; path?: string; publicUrl?: string }>(
      SUPABASE_EDGE_ROUTES.uploadPhoto,
      {
        body: formData,
        method: "POST",
      }
    );

    const uploadedPath =
      typeof response.path === "string" && response.path
        ? normalizeStoragePath(response.path)
        : extractStoragePathFromUrl(response.publicUrl || "", bucket);

    if (!uploadedPath) {
      return null;
    }

    if (import.meta.env.DEV) console.log("✅ Photo uploaded successfully:", response.publicUrl);

    return {
      bucket,
      path: uploadedPath,
      publicUrl: response.publicUrl || null,
    };
  } catch (error) {
    if (import.meta.env.DEV) console.error("❌ Exception in uploadPhotoObject:", error);
    return null;
  }
}

export async function uploadPhoto(
  file: File | Blob,
  bucket: SupportedSupabaseBucket,
  fileName?: string
): Promise<string | null> {
  const uploadedPhoto = await uploadPhotoObject(file, bucket, fileName);
  return uploadedPhoto?.publicUrl || null;
}

export async function deletePhoto(
  url: string,
  bucket: SupportedSupabaseBucket
): Promise<boolean> {
  try {
    const filePath = extractStoragePathFromUrl(url, bucket);

    if (!filePath) {
      if (import.meta.env.DEV) {
        console.warn("Could not resolve storage path for deletion:", { bucket, url });
      }
      return false;
    }

    const { success } = await requestSupabaseEdge<{ success?: boolean }>(
      SUPABASE_EDGE_ROUTES.deletePhoto,
      {
        body: JSON.stringify({
          bucket,
          url,
        }),
        method: "POST",
      }
    );

    if (!success) {
      return false;
    }

    if (import.meta.env.DEV) console.log("✅ Photo deleted from Supabase Storage");
    return true;
  } catch (error) {
    if (import.meta.env.DEV) console.error("Error in deletePhoto:", error);
    return false;
  }
}

export async function getSignedStorageUrl(
  bucket: SupportedSupabaseBucket,
  path: string,
  expiresIn = 3600
): Promise<string | null> {
  try {
    const { signedUrl } = await requestSupabaseEdge<{ signedUrl?: string }>(
      SUPABASE_EDGE_ROUTES.storageSignedUrl,
      {
        body: JSON.stringify({
          bucket,
          expiresIn,
          path: normalizeStoragePath(path),
        }),
        method: "POST",
      }
    );

    return signedUrl || null;
  } catch (error) {
    if (import.meta.env.DEV) console.error("Error in getSignedStorageUrl:", error);
    return null;
  }
}

export async function listStorageObjects(
  bucket: SupportedSupabaseBucket,
  path = "",
  limit = 100,
  offset = 0
): Promise<ListedStorageObject[] | null> {
  try {
    const query = new URLSearchParams({
      bucket,
      limit: String(limit),
      offset: String(offset),
      path: normalizeStoragePath(path),
    });

    const { files } = await requestSupabaseEdge<{ files?: ListedStorageObject[] }>(
      `${SUPABASE_EDGE_ROUTES.storageList}?${query.toString()}`,
      {
        method: "GET",
      }
    );

    return Array.isArray(files) ? files : [];
  } catch (error) {
    if (import.meta.env.DEV) console.error("Error in listStorageObjects:", error);
    return null;
  }
}

export async function uploadImageToSupabase(base64: string, fileName: string): Promise<string | null> {
  try {
    const base64Data = base64.split(",")[1] || base64;
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "image/jpeg" });

    const sizeInMB = blob.size / 1024 / 1024;
    if (import.meta.env.DEV) console.log(`📊 Image blob size: ${sizeInMB.toFixed(2)}MB (${blob.size} bytes)`);

    if (blob.size > 2 * 1024 * 1024) {
      if (import.meta.env.DEV) {
        console.error(
          `❌ Image too large for upload: ${sizeInMB.toFixed(2)}MB (max 2MB)`
        );
        console.error(`   File will be stored locally instead of cloud storage`);
      }
      return null;
    }

    if (import.meta.env.DEV) console.log("✅ Image size acceptable, proceeding with upload...");

    return await uploadPhoto(blob, SUPABASE_STORAGE_BUCKETS.reportMedia, fileName);
  } catch (error) {
    if (import.meta.env.DEV) console.error("Error in uploadImageToSupabase:", error);
    return null;
  }
}
