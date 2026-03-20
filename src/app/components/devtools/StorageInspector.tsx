import { useState, useEffect } from "react";
import { X, Database, HardDrive, Trash2, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "../../services/supabaseService";

interface StorageInspectorProps {
  onClose: () => void;
  userEmail?: string;
}

export default function StorageInspector({ onClose, userEmail }: StorageInspectorProps) {
  const [localStorageData, setLocalStorageData] = useState<Record<string, any>>({});
  const [supabaseData, setSupabaseData] = useState<Record<string, any>>({});
  const [testResults, setTestResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Load localStorage data
  const loadLocalStorage = () => {
    const data: Record<string, any> = {};

    // Get all bidondent-related keys
    for (let storageItemIndex = 0; storageItemIndex < localStorage.length; storageItemIndex++) {
      const key = localStorage.key(storageItemIndex);
      if (key && key.startsWith("bidondent")) {
        try {
          const value = localStorage.getItem(key);
          data[key] = value ? JSON.parse(value) : value;
        } catch {
          data[key] = localStorage.getItem(key); // Store as string if not JSON
        }
      }
    }

    setLocalStorageData(data);
  };

  // Load Supabase data
  const loadSupabaseData = async () => {
    if (!userEmail) {
      setSupabaseData({ error: "No user logged in" });
      return;
    }

    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setSupabaseData({ error: "No authenticated user" });
        return;
      }

      // Get profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      // Get vehicles
      const { data: vehicles } = await supabase.from("vehicles").select("*").eq("user_id", user.id);

      // Get damage reports
      const { data: reports } = await supabase
        .from("damage_reports")
        .select("*")
        .eq("user_id", user.id);

      setSupabaseData({
        user_id: user.id,
        email: user.email,
        profile: profile || null,
        vehicles: vehicles || [],
        damage_reports: reports || [],
        total_vehicles: vehicles?.length || 0,
        total_reports: reports?.length || 0,
      });
    } catch (error: any) {
      setSupabaseData({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  // Test: Clear localStorage and verify Supabase data persists
  const testClearLocalStorage = () => {
    const keys = Object.keys(localStorageData);

    // Clear all bidondent localStorage
    keys.forEach((key) => localStorage.removeItem(key));

    setTestResults((prev) => [
      ...prev,
      `✅ Cleared ${keys.length} localStorage items`,
      "🔄 Reload the page - your account data should still be there (from Supabase)!",
    ]);

    loadLocalStorage();
  };

  // Test: Create a draft and verify it's in localStorage
  const testDraftSave = () => {
    const draftKey = "bidondent_damage_report_draft";
    const testDraft = {
      currentStep: 2,
      vehicleInfo: { make: "Test", model: "Draft", year: "2024" },
      timestamp: new Date().toISOString(),
    };

    localStorage.setItem(draftKey, JSON.stringify(testDraft));

    setTestResults((prev) => [
      ...prev,
      `✅ Created test draft in localStorage`,
      "📝 This draft will survive page reloads but won't go to Supabase until submitted",
    ]);

    loadLocalStorage();
  };

  // Initial load
  useEffect(() => {
    loadLocalStorage();
    loadSupabaseData();
  }, [userEmail]);

  const categorizeLocalStorage = (key: string) => {
    if (key.includes("draft")) return { type: "UI State", icon: "📝", color: "text-blue-600" };
    if (key.includes("keep_signed_in"))
      return { type: "Preference", icon: "⚙️", color: "text-green-600" };
    if (key.includes("hasSeenPhotoGuide"))
      return { type: "UI Flag", icon: "👁️", color: "text-purple-600" };
    if (key.includes("account_types") || key.includes("profile_"))
      return { type: "Cache", icon: "💾", color: "text-orange-600" };
    return { type: "Other", icon: "❓", color: "text-gray-600" };
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[#003d82] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-6 h-6" />
            <h2 className="text-xl font-bold">Storage Inspector</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Quick Tests */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              Quick Tests
            </h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={testDraftSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                Test Draft Save (localStorage)
              </button>
              <button
                onClick={testClearLocalStorage}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Clear localStorage
              </button>
              <button
                onClick={() => {
                  loadLocalStorage();
                  loadSupabaseData();
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh Data
              </button>
            </div>

            {/* Test Results */}
            {testResults.length > 0 && (
              <div className="mt-4 space-y-1">
                {testResults.map((result, resultIndex) => (
                  <div key={resultIndex} className="text-sm text-gray-700">
                    {result}
                  </div>
                ))}
                <button
                  onClick={() => setTestResults([])}
                  className="text-sm text-blue-600 hover:underline mt-2"
                >
                  Clear results
                </button>
              </div>
            )}
          </div>

          {/* localStorage Section */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-100 p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-gray-600" />
                <h3 className="font-bold">localStorage (Browser Only)</h3>
              </div>
              <span className="text-sm text-gray-600">
                {Object.keys(localStorageData).length} items
              </span>
            </div>
            <div className="p-4 space-y-3">
              {Object.keys(localStorageData).length === 0 ? (
                <p className="text-gray-500 text-sm">No Bidondent data in localStorage</p>
              ) : (
                Object.entries(localStorageData).map(([key, value]) => {
                  const category = categorizeLocalStorage(key);
                  return (
                    <div key={key} className="border border-gray-200 rounded p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{category.icon}</span>
                          <span className={`text-sm font-semibold ${category.color}`}>
                            {category.type}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 font-mono">{key}</span>
                      </div>
                      <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto max-h-32">
                        {JSON.stringify(value, null, 2)}
                      </pre>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Supabase Section */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-green-100 p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-green-600" />
                <h3 className="font-bold">Supabase (Cloud - Source of Truth)</h3>
              </div>
              {loading && <RefreshCw className="w-4 h-4 text-green-600 animate-spin" />}
            </div>
            <div className="p-4">
              {!userEmail ? (
                <div className="flex items-center gap-2 text-gray-500">
                  <AlertCircle className="w-5 h-5" />
                  <p className="text-sm">Please log in to view Supabase data</p>
                </div>
              ) : (
                <pre className="text-xs bg-gray-50 p-4 rounded overflow-x-auto max-h-96">
                  {JSON.stringify(supabaseData, null, 2)}
                </pre>
              )}
            </div>
          </div>

          {/* Legend */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-bold mb-3">Storage Strategy Explanation</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-blue-600">📝 UI State:</span>
                <span>Drafts, temporary work - Saved locally for convenience</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600">⚙️ Preferences:</span>
                <span>User settings - Saved locally for quick access</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-purple-600">👁️ UI Flags:</span>
                <span>"Has seen" indicators - Saved locally for UX</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-orange-600">💾 Cache:</span>
                <span>Copies of Supabase data for speed - Can be cleared safely</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600">☁️ Supabase:</span>
                <span className="font-bold">
                  Source of truth - Accounts, vehicles, reports all stored here
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
