/**
 * ============================================================================
 * SUPABASE STORAGE ADAPTER
 * ============================================================================
 * Implementation of IStorageProvider for Supabase Storage
 * ============================================================================
 */

import { supabase } from "../supabaseService";
import {
  buildStoragePointerUrl,
  deletePhoto,
  getSignedStorageUrl,
  listStorageObjects,
  normalizeStoragePath,
  uploadPhotoObject,
} from "../supabase/storage";
import { isSupportedSupabaseBucket, isUserScopedSupabaseBucket } from "../supabase/runtime";
import type {
  IStorageProvider,
  UploadOptions,
  UploadResult,
  DeleteOptions,
  DeleteResult,
  ListOptions,
  ListResult,
  SignedUrlOptions,
  SignedUrlResult,
  StorageFile,
} from "./types";

const toErrMsg = (e: unknown, fallback: string) => (e instanceof Error ? e.message : fallback);

function getPathFileName(path: string) {
  const normalizedPath = normalizeStoragePath(path);
  const pathSegments = normalizedPath.split("/");
  return pathSegments[pathSegments.length - 1] || "upload.jpg";
}

export class SupabaseStorageAdapter implements IStorageProvider {
  name = "Supabase Storage";

  /**
   * Upload file to Supabase Storage
   */
  async upload(options: UploadOptions): Promise<UploadResult> {
    try {
      const { bucket, path, file, contentType, cacheControl, upsert = true } = options;
      const normalizedPath = normalizeStoragePath(path);

      if (isUserScopedSupabaseBucket(bucket)) {
        const uploadedPhoto = await uploadPhotoObject(
          file,
          bucket,
          getPathFileName(normalizedPath),
          {
            cacheControl,
            contentType: contentType || file.type,
            path: normalizedPath,
            upsert,
          }
        );

        if (!uploadedPhoto) {
          return {
            success: false,
            error: "Upload failed",
          };
        }

        const signedUrlResult = await this.getSignedUrl({
          bucket,
          path: uploadedPhoto.path,
          expiresIn: 60 * 60 * 24,
        });
        const publicUrl =
          signedUrlResult.signedUrl ||
          uploadedPhoto.publicUrl ||
          this.getPublicUrl(bucket, uploadedPhoto.path);

        return {
          success: true,
          url: publicUrl,
          publicUrl,
          path: uploadedPhoto.path,
        };
      }

      // Ensure bucket exists
      await this.ensureBucket(bucket);

      const { data, error } = await supabase.storage.from(bucket).upload(normalizedPath, file, {
        contentType: contentType || file.type,
        cacheControl: cacheControl || "3600",
        upsert: upsert,
      });

      if (error) {
        if (import.meta.env.DEV) console.error("Supabase upload error:", error);
        return {
          success: false,
          error: error.message,
        };
      }

      const signedUrlResult = await this.getSignedUrl({
        bucket,
        path: normalizedPath,
        expiresIn: 60 * 60 * 24,
      });
      const publicUrl = signedUrlResult.signedUrl || this.getPublicUrl(bucket, normalizedPath);

      return {
        success: true,
        url: publicUrl,
        publicUrl: publicUrl,
        path: data.path,
      };
    } catch (error: unknown) {
      if (import.meta.env.DEV) console.error("Supabase upload exception:", error);
      return {
        success: false,
        error: toErrMsg(error, "Upload failed"),
      };
    }
  }

  /**
   * Delete file from Supabase Storage
   */
  async delete(options: DeleteOptions): Promise<DeleteResult> {
    try {
      const { bucket, path } = options;
      const normalizedPath = normalizeStoragePath(path);

      if (isUserScopedSupabaseBucket(bucket)) {
        const deleted = await deletePhoto(buildStoragePointerUrl(bucket, normalizedPath), bucket);

        if (!deleted) {
          return {
            success: false,
            error: "Delete failed",
          };
        }

        return { success: true };
      }

      const { error } = await supabase.storage.from(bucket).remove([normalizedPath]);

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      return { success: true };
    } catch (error: unknown) {
      return {
        success: false,
        error: toErrMsg(error, "Delete failed"),
      };
    }
  }

  /**
   * List files in a bucket/path
   */
  async list(options: ListOptions): Promise<ListResult> {
    try {
      const { bucket, path = "", limit = 100, offset = 0 } = options;
      const normalizedPath = normalizeStoragePath(path);

      if (isUserScopedSupabaseBucket(bucket)) {
        const files = await listStorageObjects(bucket, normalizedPath, limit, offset);

        if (!files) {
          return {
            success: false,
            error: "List failed",
          };
        }

        return {
          success: true,
          files: files.map(
            (file): StorageFile => ({
              name: file.name,
              path: file.path,
              size: file.size,
              createdAt: file.createdAt,
              updatedAt: file.updatedAt,
              contentType: file.contentType,
            })
          ),
        };
      }

      const { data, error } = await supabase.storage.from(bucket).list(normalizedPath, {
        limit,
        offset,
        sortBy: { column: "created_at", order: "desc" },
      });

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      const files: StorageFile[] = (data || []).map((file) => ({
        name: file.name,
        path: normalizedPath ? `${normalizedPath}/${file.name}` : file.name,
        size: file.metadata?.size || 0,
        createdAt: file.created_at || new Date().toISOString(),
        updatedAt: file.updated_at || new Date().toISOString(),
        contentType: file.metadata?.mimetype,
      }));

      return {
        success: true,
        files,
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: toErrMsg(error, "List failed"),
      };
    }
  }

  /**
   * Get signed URL for private file access
   */
  async getSignedUrl(options: SignedUrlOptions): Promise<SignedUrlResult> {
    try {
      const { bucket, path, expiresIn = 3600 } = options;
      const normalizedPath = normalizeStoragePath(path);

      if (isUserScopedSupabaseBucket(bucket)) {
        const signedUrl = await getSignedStorageUrl(bucket, normalizedPath, expiresIn);

        if (!signedUrl) {
          return {
            success: false,
            error: "Signed URL generation failed",
          };
        }

        return {
          success: true,
          signedUrl,
        };
      }

      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(normalizedPath, expiresIn);

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: true,
        signedUrl: data.signedUrl,
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: toErrMsg(error, "Signed URL generation failed"),
      };
    }
  }

  /**
   * Get public URL for a file
   */
  getPublicUrl(bucket: string, path: string): string {
    const normalizedPath = normalizeStoragePath(path);

    if (isSupportedSupabaseBucket(bucket)) {
      return buildStoragePointerUrl(bucket, normalizedPath);
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(normalizedPath);

    return data.publicUrl;
  }

  /**
   * Check if Supabase is properly configured
   */
  isConfigured(): boolean {
    try {
      return !!supabase && supabase.storage !== undefined;
    } catch {
      return false;
    }
  }

  /**
   * Ensure bucket exists (create if needed)
   */
  async ensureBucket(bucket: string): Promise<boolean> {
    try {
      if (isSupportedSupabaseBucket(bucket)) {
        return true;
      }

      // Try to list buckets
      const { data: buckets, error } = await supabase.storage.listBuckets();

      if (error) {
        if (import.meta.env.DEV) console.warn("Could not list buckets:", error.message);
        return false;
      }

      // Check if bucket exists
      const bucketExists = buckets?.some((b) => b.name === bucket);

      if (!bucketExists) {
        if (import.meta.env.DEV) console.log(`Creating bucket: ${bucket}`);
        const { error: createError } = await supabase.storage.createBucket(bucket, {
          public: false,
          fileSizeLimit: 52428800, // 50MB limit
        });

        if (createError) {
          if (import.meta.env.DEV)
            console.error(`Failed to create bucket ${bucket}:`, createError.message);
          return false;
        }

        if (import.meta.env.DEV) console.log(`Bucket created: ${bucket}`);
      }

      return true;
    } catch (error: unknown) {
      if (import.meta.env.DEV)
        console.error(`Error ensuring bucket ${bucket}:`, toErrMsg(error, "unknown error"));
      return false;
    }
  }
}
