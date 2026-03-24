/**
 * ============================================================================
 * SUPABASE STORAGE ADAPTER
 * ============================================================================
 * Implementation of IStorageProvider for Supabase Storage
 * ============================================================================
 */

import { supabase } from "../supabaseService";
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

export class SupabaseStorageAdapter implements IStorageProvider {
  name = "Supabase Storage";

  /**
   * Upload file to Supabase Storage
   */
  async upload(options: UploadOptions): Promise<UploadResult> {
    try {
      const { bucket, path, file, contentType, cacheControl, upsert = true } = options;

      // Ensure bucket exists
      await this.ensureBucket(bucket);

      const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
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

      // Get public URL
      const publicUrl = this.getPublicUrl(bucket, path);

      return {
        success: true,
        url: publicUrl,
        publicUrl: publicUrl,
        path: data.path,
      };
    } catch (error: any) {
      if (import.meta.env.DEV) console.error("Supabase upload exception:", error);
      return {
        success: false,
        error: error.message || "Upload failed",
      };
    }
  }

  /**
   * Delete file from Supabase Storage
   */
  async delete(options: DeleteOptions): Promise<DeleteResult> {
    try {
      const { bucket, path } = options;

      const { error } = await supabase.storage.from(bucket).remove([path]);

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Delete failed",
      };
    }
  }

  /**
   * List files in a bucket/path
   */
  async list(options: ListOptions): Promise<ListResult> {
    try {
      const { bucket, path = "", limit = 100, offset = 0 } = options;

      const { data, error } = await supabase.storage.from(bucket).list(path, {
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
        path: path ? `${path}/${file.name}` : file.name,
        size: file.metadata?.size || 0,
        createdAt: file.created_at || new Date().toISOString(),
        updatedAt: file.updated_at || new Date().toISOString(),
        contentType: file.metadata?.mimetype,
      }));

      return {
        success: true,
        files,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "List failed",
      };
    }
  }

  /**
   * Get signed URL for private file access
   */
  async getSignedUrl(options: SignedUrlOptions): Promise<SignedUrlResult> {
    try {
      const { bucket, path, expiresIn = 3600 } = options;

      const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);

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
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Signed URL generation failed",
      };
    }
  }

  /**
   * Get public URL for a file
   */
  getPublicUrl(bucket: string, path: string): string {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);

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
          public: true, // Make buckets public by default for Bidondent
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
    } catch (error: any) {
      if (import.meta.env.DEV) console.error(`Error ensuring bucket ${bucket}:`, error.message);
      return false;
    }
  }
}
