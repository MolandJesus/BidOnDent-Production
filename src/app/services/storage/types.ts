/**
 * ============================================================================
 * STORAGE ABSTRACTION LAYER - CLOUD PROVIDER AGNOSTIC
 * ============================================================================
 *
 * This abstraction allows switching between cloud storage providers without
 * changing application code. Supports:
 * - Supabase Storage (current)
 * - AWS S3
 * - Cloudflare R2
 * - Google Cloud Storage
 * - Azure Blob Storage
 *
 * To switch providers, simply change STORAGE_PROVIDER environment variable.
 * ============================================================================
 */

export interface UploadOptions {
  bucket: string;
  path: string;
  file: File | Blob;
  contentType?: string;
  cacheControl?: string;
  upsert?: boolean;
}

export interface UploadResult {
  success: boolean;
  url?: string;
  publicUrl?: string;
  error?: string;
  path?: string;
}

export interface DeleteOptions {
  bucket: string;
  path: string;
}

export interface DeleteResult {
  success: boolean;
  error?: string;
}

export interface ListOptions {
  bucket: string;
  path?: string;
  limit?: number;
  offset?: number;
}

export interface StorageFile {
  name: string;
  path: string;
  size: number;
  createdAt: string;
  updatedAt: string;
  contentType?: string;
}

export interface ListResult {
  success: boolean;
  files?: StorageFile[];
  error?: string;
}

export interface SignedUrlOptions {
  bucket: string;
  path: string;
  expiresIn?: number; // seconds
}

export interface SignedUrlResult {
  success: boolean;
  signedUrl?: string;
  error?: string;
}

/**
 * Storage Provider Interface
 * All storage adapters must implement this interface
 */
export interface IStorageProvider {
  /** Provider name for logging/debugging */
  name: string;

  /** Upload a file to storage */
  upload(options: UploadOptions): Promise<UploadResult>;

  /** Delete a file from storage */
  delete(options: DeleteOptions): Promise<DeleteResult>;

  /** List files in a bucket/path */
  list(options: ListOptions): Promise<ListResult>;

  /** Get a signed URL for private file access */
  getSignedUrl(options: SignedUrlOptions): Promise<SignedUrlResult>;

  /** Get public URL for a file (if bucket is public) */
  getPublicUrl(bucket: string, path: string): string;

  /** Check if provider is properly configured */
  isConfigured(): boolean;

  /** Initialize/validate buckets */
  ensureBucket(bucket: string): Promise<boolean>;
}

/**
 * Storage Provider Types
 */
export type StorageProviderType =
  | "supabase"
  | "aws-s3"
  | "cloudflare-r2"
  | "gcp-storage"
  | "azure-blob";

/**
 * Configuration for each provider
 */
export interface StorageConfig {
  provider: StorageProviderType;

  // Supabase
  supabase?: {
    projectId: string;
    anonKey: string;
    serviceRoleKey?: string;
  };

  // AWS S3
  aws?: {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
    endpoint?: string; // For S3-compatible services
  };

  // Cloudflare R2
  cloudflare?: {
    accountId: string;
    accessKeyId: string;
    secretAccessKey: string;
    endpoint?: string;
  };

  // Google Cloud Storage
  gcp?: {
    projectId: string;
    keyFilename?: string;
    credentials?: Record<string, unknown>;
  };

  // Azure Blob Storage
  azure?: {
    accountName: string;
    accountKey: string;
    endpoint?: string;
  };
}
