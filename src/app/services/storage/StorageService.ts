/**
 * ============================================================================
 * UNIVERSAL STORAGE SERVICE
 * ============================================================================
 * 
 * Single interface for all cloud storage operations.
 * Switch providers by changing environment variable.
 * 
 * Usage:
 *   import { storageService } from './services/storage/StorageService';
 *   
 *   // Upload
 *   const result = await storageService.uploadFile({
 *     bucket: 'bidondent-profiles',
 *     file: photoFile,
 *     path: `users/${userId}/profile.jpg`
 *   });
 * 
 * Environment Variables:
 *   STORAGE_PROVIDER=supabase (default)
 *   STORAGE_PROVIDER=aws-s3
 *   STORAGE_PROVIDER=cloudflare-r2
 * ============================================================================
 */

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
  StorageProviderType
} from './types';
import { SupabaseStorageAdapter } from './SupabaseStorageAdapter';

/**
 * Storage Service - Provider-agnostic storage operations
 */
class StorageService {
  private provider: IStorageProvider;
  private providerType: StorageProviderType;

  constructor() {
    // Get provider from environment or default to Supabase
    this.providerType = this.getProviderType();
    this.provider = this.initializeProvider();

    console.log(`📦 Storage Service initialized with provider: ${this.provider.name}`);
  }

  /**
   * Get provider type from environment or default
   */
  private getProviderType(): StorageProviderType {
    // Check environment variable (would be set in deployment)
    if (typeof window !== 'undefined') {
      const envProvider = (window as any).__STORAGE_PROVIDER__;
      if (envProvider) {
        return envProvider as StorageProviderType;
      }
    }

    // Default to Supabase
    return 'supabase';
  }

  /**
   * Initialize the appropriate storage provider
   */
  private initializeProvider(): IStorageProvider {
    switch (this.providerType) {
      case 'supabase':
        return new SupabaseStorageAdapter();
      
      case 'aws-s3':
        // Future: AWS S3 adapter
        console.warn('AWS S3 adapter not yet implemented, falling back to Supabase');
        return new SupabaseStorageAdapter();
      
      case 'cloudflare-r2':
        // Future: Cloudflare R2 adapter
        console.warn('Cloudflare R2 adapter not yet implemented, falling back to Supabase');
        return new SupabaseStorageAdapter();
      
      case 'gcp-storage':
        // Future: Google Cloud Storage adapter
        console.warn('GCP Storage adapter not yet implemented, falling back to Supabase');
        return new SupabaseStorageAdapter();
      
      case 'azure-blob':
        // Future: Azure Blob Storage adapter
        console.warn('Azure Blob adapter not yet implemented, falling back to Supabase');
        return new SupabaseStorageAdapter();
      
      default:
        return new SupabaseStorageAdapter();
    }
  }

  /**
   * Upload a file
   */
  async uploadFile(options: UploadOptions): Promise<UploadResult> {
    console.log(`📤 Uploading to ${this.provider.name}: ${options.bucket}/${options.path}`);
    return await this.provider.upload(options);
  }

  /**
   * Delete a file
   */
  async deleteFile(options: DeleteOptions): Promise<DeleteResult> {
    console.log(`🗑️ Deleting from ${this.provider.name}: ${options.bucket}/${options.path}`);
    return await this.provider.delete(options);
  }

  /**
   * List files in a bucket/path
   */
  async listFiles(options: ListOptions): Promise<ListResult> {
    return await this.provider.list(options);
  }

  /**
   * Get a signed URL for private file access
   */
  async getSignedUrl(options: SignedUrlOptions): Promise<SignedUrlResult> {
    return await this.provider.getSignedUrl(options);
  }

  /**
   * Get public URL for a file
   */
  getPublicUrl(bucket: string, path: string): string {
    return this.provider.getPublicUrl(bucket, path);
  }

  /**
   * Check if provider is configured
   */
  isConfigured(): boolean {
    return this.provider.isConfigured();
  }

  /**
   * Ensure a bucket exists
   */
  async ensureBucket(bucket: string): Promise<boolean> {
    return await this.provider.ensureBucket(bucket);
  }

  /**
   * Get current provider info
   */
  getProviderInfo() {
    return {
      type: this.providerType,
      name: this.provider.name,
      configured: this.provider.isConfigured()
    };
  }

  /**
   * Switch provider at runtime (advanced use case)
   */
  switchProvider(type: StorageProviderType) {
    console.log(`🔄 Switching storage provider to: ${type}`);
    this.providerType = type;
    this.provider = this.initializeProvider();
  }
}

// Export singleton instance
export const storageService = new StorageService();

// Export for testing/direct access
export { StorageService };
