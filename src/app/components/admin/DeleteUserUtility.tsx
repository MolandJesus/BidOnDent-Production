import { useState } from "react";
import { isAdmin } from "../../utils/adminCheck";
import { deleteAdminUser } from "../../services/supabase/admin";

/**
 * TEMPORARY ADMIN UTILITY - Delete User Account
 * This is a temporary component to delete user accounts
 * Only visible to admin (molalign5@gmail.com)
 * After use, this component can be removed.
 */
export default function DeleteUserUtility({ userEmail }: { userEmail: string }) {
  // Only show for admin
  if (!isAdmin(userEmail)) {
    return null;
  }

  const [email, setEmail] = useState("molalign5+insurer@gmail.com");
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleDeleteUser = async () => {
    if (
      !confirm(
        `Are you sure you want to delete the account for ${email}? This action cannot be undone.`
      )
    ) {
      return;
    }

    setLoading(true);
    setStatus("Deleting user...");

    try {
      const data = await deleteAdminUser(email, {
        adminEmail: userEmail,
      });

      if (data.success) {
        setStatus(
          `✅ Success! ${data.message}\n\nDeleted:\n- Auth user: ${data.deleted?.auth ? "Yes" : "No"}\n- Profile: ${data.deleted?.profile ? "Yes" : "Yes (or didn't exist)"}\n- KV data: ${data.deleted?.kv_data ? "Yes" : "Yes (or didn't exist)"}\n\nYou can now create a new insurer account with this email.`
        );
      } else {
        setStatus(`❌ Error: ${data.error || "Failed to delete user"}`);
      }
    } catch (error) {
      console.error("Delete user error:", error);
      setStatus(`❌ Network error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bd-glass-floating border-2 border-[#003d82] rounded-lg p-6 max-w-md z-50">
      <h3 className="font-bold mb-4 text-[#003d82]">🛠️ Admin: Delete User Account</h3>

      <div className="mb-4">
        <label className="block text-sm mb-2">Email to delete:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg"
          placeholder="email@example.com"
        />
      </div>

      <button
        onClick={handleDeleteUser}
        disabled={loading || !email}
        className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed mb-4"
      >
        {loading ? "Deleting..." : "Delete User Account"}
      </button>

      {status && (
        <div
          className={`p-4 rounded-lg whitespace-pre-wrap text-sm ${
            status.startsWith("✅") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {status}
        </div>
      )}

      <div className="mt-4 text-xs text-gray-600">
        <p className="mb-2">This will permanently delete:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>User from Supabase Auth</li>
          <li>Profile from database</li>
          <li>All KV store data (profile, vehicles, reports)</li>
        </ul>
      </div>
    </div>
  );
}
