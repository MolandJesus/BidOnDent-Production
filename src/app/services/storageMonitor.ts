/**
 * Storage and Bandwidth Monitoring for Supabase
 * Helps track usage and prevent exceeding free tier limits
 */

import { projectId, publicAnonKey } from '../../../utils/supabase/info';

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
    // Fetch all damage reports to count photos
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-9f243523/storage-stats`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      console.warn('Unable to fetch storage stats, using estimates');
      return getEstimatedStats();
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching storage stats:', error);
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
    estimatedStorageUsed: '0MB',
    estimatedStorageUsedBytes: 0,
    storageLimit: '1GB',
    storagePercentage: 0,
    bandwidthWarning: false,
    needsCleanup: false
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
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-9f243523/cleanup-old-reports`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ daysOld })
      }
    );

    if (!response.ok) {
      console.error('Failed to cleanup old reports');
      return 0;
    }

    const { deleted } = await response.json();
    console.log(`🗑️ Cleaned up ${deleted} old reports`);
    return deleted;
  } catch (error) {
    console.error('Error cleaning up old reports:', error);
    return 0;
  }
}
