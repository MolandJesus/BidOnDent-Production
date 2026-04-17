import { useState, useEffect } from "react";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { getEdgeFunctionHealth } from "../../services/supabase/admin";
import { SUPABASE_PROJECT_ID } from "../../services/supabase/runtime";

export default function EdgeFunctionStatus() {
  const [status, setStatus] = useState<"checking" | "healthy" | "unhealthy">("checking");
  const [message, setMessage] = useState("Checking Edge Function...");
  const [show, setShow] = useState(true);

  useEffect(() => {
    checkEdgeFunction();
  }, []);

  const checkEdgeFunction = async () => {
    try {
      const data = await getEdgeFunctionHealth();
      setStatus(data.status === "ok" ? "healthy" : "unhealthy");
      setMessage(
        data.status === "ok"
          ? `✅ Edge Function is running! Version: ${data.version || "unknown"}`
          : "⚠️ Edge Function returned an unexpected status"
      );
      if (data.status === "ok") {
        setTimeout(() => setShow(false), 3000);
      }
    } catch (error) {
      setStatus("unhealthy");
      setMessage("❌ Edge Function not responding - needs deployment");
    }
  };

  if (!show) return null;

  return (
    <div className="fixed top-4 right-4 bg-white border-2 border-gray-200 rounded-lg shadow-lg z-50 max-w-md">
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            {status === "checking" && (
              <AlertCircle className="w-5 h-5 text-blue-500 animate-pulse" />
            )}
            {status === "healthy" && <CheckCircle className="w-5 h-5 text-green-500" />}
            {status === "unhealthy" && <XCircle className="w-5 h-5 text-red-500" />}
            <h3 className="font-semibold text-gray-900">Edge Function Status</h3>
          </div>
          <button onClick={() => setShow(false)} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        <p className="text-sm text-gray-700 mb-3">{message}</p>

        {status === "unhealthy" && (
          <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm">
            <p className="font-semibold text-yellow-800 mb-2">📋 Manual Deployment Required:</p>
            <div className="bg-white rounded p-2 mb-2 text-xs">
              <p className="font-mono text-gray-700 mb-1">Run these commands in your terminal:</p>
              <div className="bg-gray-900 text-green-400 p-2 rounded font-mono text-xs overflow-x-auto">
                <div>supabase link --project-ref {SUPABASE_PROJECT_ID}</div>
                <div className="mt-1">supabase functions deploy server</div>
              </div>
            </div>
            <p className="text-xs text-yellow-700 mb-2">
              After deployment (30-60 seconds), click "Recheck Status" below.
            </p>
            <button
              onClick={checkEdgeFunction}
              className="mt-2 w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              🔄 Recheck Status
            </button>
          </div>
        )}

        {status === "healthy" && (
          <p className="text-xs text-green-600">
            All systems operational. You can now create the admin account.
          </p>
        )}
      </div>
    </div>
  );
}
