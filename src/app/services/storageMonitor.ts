/**
 * Storage and Bandwidth Monitoring for Supabase
 * Helps track usage and prevent exceeding free tier limits
 */

import { requestSupabaseEdge, SUPABASE_EDGE_ROUTES } from "./supabase/runtime";

export interface StorageStats {
  totalReports: number;
  totalPhotos: number;
  estimatedStorageUsed: string; // e.g., "450MB"
  estimatedStorageUsedBytes: number;
  storageLimit: string;
  storagePercentage: number;
  bandwidthWarning: boolean;
  needsCleanup: boolean;
}

/**
 * Get storage usage statistics
 * @returns Storage stats object
 */
export async function getStorageStats(): Promise<StorageStats> {
  try {
    const data = await requestSupabaseEdge<StorageStats>(SUPABASE_EDGE_ROUTES.storageStats, {
      method: "GET",
    });
    return data;
  } catch (error) {
    if (import.meta.env.DEV) console.error("Error fetching storage stats:", error);
    return getEstimatedStats();
  }
}

/**
 * Get estimated stats when server endpoint is unavailable
 */
function getEstimatedStats(): StorageStats {
  return {
    totalReports: 0,
    totalPhotos: 0,
    estimatedStorageUsed: "0MB",
    estimatedStorageUsedBytes: 0,
    storageLimit: "1GB",
    storagePercentage: 0,
    bandwidthWarning: false,
    needsCleanup: false,
  };
}

/**
 * Check if storage is approaching limits
 * @returns Warning message if approaching limits, null otherwise
 */
export async function checkStorageLimits(): Promise<string | null> {
  const stats = await getStorageStats();

  // Warn at 70% storage
  if (stats.storagePercentage > 70) {
    return `⚠️ Storage at ${stats.storagePercentage}% capacity. Consider cleaning up old test data.`;
  }

  // Warn at 50% storage
  if (stats.storagePercentage > 50) {
    return `📊 Storage at ${stats.storagePercentage}% capacity. ${stats.estimatedStorageUsed} used of ${stats.storageLimit}.`;
  }

  return null;
}

/**
 * Clean up old test data (reports older than X days)
 * @param daysOld - Delete reports older than this many days
 * @returns Number of reports deleted
 */
export async function cleanupOldReports(daysOld: number = 30): Promise<number> {
  try {
    const { deletedReports } = await requestSupabaseEdge<{ deletedReports?: number }>(
      SUPABASE_EDGE_ROUTES.cleanupOldReports,
      {
        body: JSON.stringify({ daysOld }),
        method: "POST",
      }
    );
    if (import.meta.env.DEV) console.log(`🗑️ Cleaned up ${deletedReports || 0} old reports`);
    return deletedReports || 0;
  } catch (error) {
    if (import.meta.env.DEV) console.error("Error cleaning up old reports:", error);
    return 0;
  }
}
