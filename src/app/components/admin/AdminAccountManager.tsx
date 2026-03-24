import { useState, useEffect } from "react";
import { Trash2, Users, AlertCircle, RefreshCw, UserPlus, CheckCircle } from "lucide-react";
import { ADMIN_EMAIL } from "../../config/adminConfig";
import {
  createTestAdminAccount,
  deleteAdminUsers,
  listAdminUsers,
} from "../../services/supabase/admin";

interface User {
  id: string;
  email: string;
  created_at: string;
  confirmed_at?: string;
  email_confirmed_at?: string;
  last_sign_in_at?: string;
  user_metadata?: {
    name?: string;
    user_type?: string;
  };
}

export default function AdminAccountManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Create test account form
  const [showCreateTest, setShowCreateTest] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [testPassword, setTestPassword] = useState("Password123!");
  const [testUserType, setTestUserType] = useState<"customer" | "shop" | "insurer">("customer");
  const [creating, setCreating] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    setError("");

    try {
      setUsers(await listAdminUsers());
    } catch (err) {
      console.error("Error loading users:", err);
      setError(`Failed to load users: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const toggleUser = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const selectAll = () => {
    const adminEmail = ADMIN_EMAIL;
    const nonAdminUsers = users.filter((u) => u.email?.toLowerCase() !== adminEmail.toLowerCase());
    setSelectedUsers(new Set(nonAdminUsers.map((u) => u.id)));
  };

  const deselectAll = () => {
    setSelectedUsers(new Set());
  };

  const deleteSelected = async () => {
    if (selectedUsers.size === 0) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedUsers.size} user(s)? This cannot be undone.`
    );

    if (!confirmed) return;

    setDeleting(true);
    setError("");
    setSuccess("");

    try {
      const result = await deleteAdminUsers(Array.from(selectedUsers));

      setSuccess(`Successfully deleted ${result.deleted} user(s)`);
      setSelectedUsers(new Set());
      await loadUsers();
    } catch (err) {
      console.error("Error deleting users:", err);
      setError("Failed to delete users");
    } finally {
      setDeleting(false);
    }
  };

  const createTestAccount = async () => {
    if (!testEmail) {
      setError("Email is required");
      return;
    }

    setCreating(true);
    setError("");
    setSuccess("");

    try {
      const result = await createTestAdminAccount({
        email: testEmail,
        password: testPassword,
        userType: testUserType,
      });

      // Check for success - handle both 'success' and 'created' fields
      if (result.success || result.created) {
        setSuccess(`Test account created: ${testEmail}`);
      } else {
        setError("Failed to create test account");
      }

      setTestEmail("");
      setShowCreateTest(false);
      await loadUsers();
    } catch (err) {
      console.error("Error creating test account:", err);
      setError("Failed to create test account");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6" />
            Account Management
          </h2>
          <p className="text-gray-600 mt-1">Manage all user accounts and create test accounts</p>
        </div>
        <button
          onClick={loadUsers}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
          <CheckCircle className="w-5 h-5" />
          {success}
        </div>
      )}

      {/* Actions Bar */}
      <div className="flex items-center gap-3 p-4 bd-glass-card rounded-lg">
        <button
          onClick={selectAll}
          className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded"
        >
          Select All
        </button>
        <button
          onClick={deselectAll}
          className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded"
        >
          Deselect All
        </button>
        <div className="flex-1" />
        <button
          onClick={() => setShowCreateTest(!showCreateTest)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <UserPlus className="w-4 h-4" />
          Create Test Account
        </button>
        {selectedUsers.size > 0 && (
          <button
            onClick={deleteSelected}
            disabled={deleting}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            Delete Selected ({selectedUsers.size})
          </button>
        )}
      </div>

      {/* Create Test Account Form */}
      {showCreateTest && (
        <div className="p-6 bg-green-50 border border-green-200 rounded-lg space-y-4">
          <h3 className="font-semibold text-gray-900">Create Test Account</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="test@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="text"
                value={testPassword}
                onChange={(e) => setTestPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
              <select
                value={testUserType}
                onChange={(e) => setTestUserType(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="customer">Customer</option>
                <option value="shop">Shop</option>
                <option value="insurer">Insurer</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={createTestAccount}
              disabled={creating}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {creating ? "Creating..." : "Create Account"}
            </button>
            <button
              onClick={() => setShowCreateTest(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bd-glass-card rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Select
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Created
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Last Sign In
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const isAdminUser = user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

                  return (
                    <tr key={user.id} className={isAdminUser ? "bg-blue-50" : ""}>
                      <td className="px-4 py-3">
                        {!isAdminUser && (
                          <input
                            type="checkbox"
                            checked={selectedUsers.has(user.id)}
                            onChange={() => toggleUser(user.id)}
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{user.email}</span>
                          {isAdminUser && (
                            <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
                              ADMIN
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 capitalize">
                        {user.user_metadata?.user_type || "customer"}
                      </td>
                      <td className="px-4 py-3">
                        {user.email_confirmed_at || user.confirmed_at ? (
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                            Confirmed
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                            Unconfirmed
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {user.last_sign_in_at
                          ? new Date(user.last_sign_in_at).toLocaleDateString()
                          : "Never"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="text-sm text-gray-600">
        Total: {users.length} user(s) • Selected: {selectedUsers.size}
      </div>
    </div>
  );
}
