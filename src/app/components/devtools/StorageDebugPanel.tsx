import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { HardDrive, Trash, RefreshCw, Save, Eye, EyeOff, Copy, Check } from "lucide-react";

/**
 * Storage Debug Panel
 * Shows all localStorage data with real-time monitoring
 * Only visible to admin users
 */

interface StorageItem {
  key: string;
  value: string;
  size: number;
  type: string;
  preview: string;
}

export default function StorageDebugPanel() {
  const [storageItems, setStorageItems] = useState<StorageItem[]>([]);
  const [totalSize, setTotalSize] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const loadStorageData = () => {
    const items: StorageItem[] = [];
    let total = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;

      const value = localStorage.getItem(key) || "";
      const size = new Blob([value]).size;
      total += size;

      // Determine type and create preview
      let type = "string";
      let preview = value;

      try {
        const parsed = JSON.parse(value);
        type = Array.isArray(parsed) ? "array" : typeof parsed === "object" ? "object" : "json";
        preview = JSON.stringify(parsed, null, 2);
      } catch {
        // Not JSON, keep as string
      }

      items.push({
        key,
        value,
        size,
        type,
        preview: preview.length > 100 ? preview.substring(0, 100) + "..." : preview,
      });
    }

    // Sort by size (largest first)
    items.sort((a, b) => b.size - a.size);

    setStorageItems(items);
    setTotalSize(total);
  };

  useEffect(() => {
    loadStorageData();
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(loadStorageData, 2000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const deleteItem = (key: string) => {
    if (confirm(`Delete "${key}" from localStorage?`)) {
      localStorage.removeItem(key);
      loadStorageData();
    }
  };

  const clearAllStorage = () => {
    if (
      confirm(
        "⚠️ Clear ALL localStorage?\n\nThis will:\n- Log you out\n- Clear all saved progress\n- Clear navigation state\n- Reset all settings\n\nContinue?"
      )
    ) {
      localStorage.clear();
      loadStorageData();
      alert("Storage cleared! Page will reload...");
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  const toggleExpand = (key: string) => {
    const newExpanded = new Set(expandedKeys);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedKeys(newExpanded);
  };

  const copyToClipboard = async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (err) {
      alert("Failed to copy to clipboard");
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case "object":
        return "bg-purple-100 text-purple-700";
      case "array":
        return "bg-blue-100 text-blue-700";
      case "json":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-blue-600" />
            Storage Debug Panel
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            LocalStorage: {storageItems.length} items • {formatBytes(totalSize)} total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
              autoRefresh
                ? "bg-green-100 text-green-700 border border-green-300"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${autoRefresh ? "animate-spin" : ""}`} />
            {autoRefresh ? "Auto-Refresh ON" : "Auto-Refresh OFF"}
          </button>
          <button
            onClick={loadStorageData}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={clearAllStorage}
            className="flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm transition-colors"
          >
            <Trash className="w-4 h-4" />
            Clear All
          </button>
        </div>
      </div>

      {/* Storage Items */}
      <div className="space-y-3">
        {storageItems.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <HardDrive className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No items in localStorage</p>
          </div>
        ) : (
          storageItems.map((item) => {
            const isExpanded = expandedKeys.has(item.key);
            const isCopied = copiedKey === item.key;

            return (
              <motion.div
                key={item.key}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Save className="w-4 h-4 text-gray-400" />
                      <code className="text-sm font-mono font-semibold text-gray-900">
                        {item.key}
                      </code>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${getBadgeColor(item.type)}`}>
                        {item.type}
                      </span>
                      <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
                        {formatBytes(item.size)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleExpand(item.key)}
                      className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                      title={isExpanded ? "Collapse" : "Expand"}
                    >
                      {isExpanded ? (
                        <EyeOff className="w-4 h-4 text-gray-600" />
                      ) : (
                        <Eye className="w-4 h-4 text-gray-600" />
                      )}
                    </button>
                    <button
                      onClick={() => copyToClipboard(item.key, item.value)}
                      className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                      title="Copy value"
                    >
                      {isCopied ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-600" />
                      )}
                    </button>
                    <button
                      onClick={() => deleteItem(item.key)}
                      className="p-1.5 hover:bg-red-100 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>

                {/* Preview or Full Value */}
                <div className="bg-gray-50 rounded border border-gray-200 p-3 overflow-x-auto">
                  <pre className="text-xs font-mono text-gray-700 whitespace-pre-wrap break-all">
                    {isExpanded ? item.value : item.preview}
                  </pre>
                </div>

                {/* Show expand hint if truncated */}
                {!isExpanded && item.value.length > 100 && (
                  <button
                    onClick={() => toggleExpand(item.key)}
                    className="text-xs text-blue-600 hover:text-blue-700 mt-2"
                  >
                    Click eye icon to see full value ({item.value.length} chars)
                  </button>
                )}
              </motion.div>
            );
          })
        )}
      </div>

      {/* Summary */}
      {storageItems.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-2xl font-bold text-blue-600">{storageItems.length}</p>
              <p className="text-xs text-blue-700">Total Items</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-3">
              <p className="text-2xl font-bold text-purple-600">{formatBytes(totalSize)}</p>
              <p className="text-xs text-purple-700">Total Size</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <p className="text-2xl font-bold text-green-600">
                {formatBytes(5 * 1024 * 1024 - totalSize)}
              </p>
              <p className="text-xs text-green-700">Available (~5MB)</p>
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <p className="text-xs text-yellow-800">
          <strong>🔍 What's stored here:</strong> Navigation state, damage report drafts, user
          preferences, and session data. Data persists across page reloads.
        </p>
      </div>
    </motion.div>
  );
}
