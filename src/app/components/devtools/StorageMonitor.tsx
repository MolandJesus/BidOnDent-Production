import { useState, useEffect } from "react";
import { Database, HardDrive, Trash2, AlertTriangle } from "lucide-react";
import {
  getStorageStats,
  cleanupOldReports,
  type StorageStats,
} from "../../services/storageMonitor";

export function StorageMonitor() {
  const [stats, setStats] = useState<StorageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [cleaning, setCleaning] = useState(false);
  const [lastCleanup, setLastCleanup] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    const data = await getStorageStats();
    setStats(data);
    setLoading(false);
  };

  const handleCleanup = async (daysOld: number) => {
    if (!confirm(`Delete all damage reports older than ${daysOld} days? This cannot be undone.`)) {
      return;
    }

    setCleaning(true);
    const deleted = await cleanupOldReports(daysOld);
    setLastCleanup(`Deleted ${deleted} old reports`);
    setCleaning(false);

    // Reload stats
    await loadStats();

    // Clear message after 5 seconds
    setTimeout(() => setLastCleanup(null), 5000);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-3">
          <Database className="w-6 h-6 text-gray-400" />
          <p className="text-gray-600">Loading storage stats...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const getStatusColor = () => {
    if (stats.storagePercentage > 70) return "text-red-600";
    if (stats.storagePercentage > 50) return "text-yellow-600";
    return "text-green-600";
  };

  const getProgressColor = () => {
    if (stats.storagePercentage > 70) return "bg-red-500";
    if (stats.storagePercentage > 50) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <HardDrive className="w-6 h-6 text-[#003d82]" />
          <h3 className="font-semibold text-gray-900">Storage Monitor</h3>
        </div>
        <button
          onClick={loadStats}
          disabled={loading}
          className="text-sm text-[#003d82] hover:underline"
        >
          Refresh
        </button>
      </div>

      {/* Storage Usage Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Storage Used</span>
          <span className={`text-sm font-medium ${getStatusColor()}`}>
            {stats.estimatedStorageUsed} / {stats.storageLimit} ({stats.storagePercentage}%)
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${getProgressColor()}`}
            style={{ width: `${Math.min(stats.storagePercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Total Reports</p>
          <p className="text-2xl font-bold text-gray-900">{stats.totalReports}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Total Photos</p>
          <p className="text-2xl font-bold text-gray-900">{stats.totalPhotos}</p>
        </div>
      </div>

      {/* Warnings */}
      {stats.needsCleanup && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-900 mb-1">Storage Critical</p>
              <p className="text-sm text-red-700">
                Storage is over 70% capacity. Consider cleaning up old test data.
              </p>
            </div>
          </div>
        </div>
      )}

      {stats.bandwidthWarning && !stats.needsCleanup && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-900 mb-1">Storage Warning</p>
              <p className="text-sm text-yellow-700">
                Storage is over 50% capacity. Monitor usage closely.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Cleanup Actions */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Cleanup Actions</h4>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleCleanup(30)}
            disabled={cleaning}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            Delete 30+ days old
          </button>
          <button
            onClick={() => handleCleanup(14)}
            disabled={cleaning}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            Delete 14+ days old
          </button>
          <button
            onClick={() => handleCleanup(7)}
            disabled={cleaning}
            className="px-3 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 text-sm rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            Delete 7+ days old
          </button>
        </div>
      </div>

      {/* Cleanup Status */}
      {cleaning && (
        <div className="mt-4 text-sm text-gray-600 flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-[#003d82] border-t-transparent rounded-full animate-spin" />
          Cleaning up old reports...
        </div>
      )}

      {lastCleanup && (
        <div className="mt-4 text-sm text-green-600 flex items-center gap-2">✓ {lastCleanup}</div>
      )}
    </div>
  );
}
