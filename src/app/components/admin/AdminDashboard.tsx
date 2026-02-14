import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { projectId, publicAnonKey } from "../../../../utils/supabase/info";
import { supabase, type Profile } from "../../services/supabaseService";
import StorageDebugPanel from "../devtools/StorageDebugPanel";
import AdminAccountManager from "./AdminAccountManager";
import AdminHeader from "./AdminHeader";
import QuickActions from "./QuickActions";
import AdminManagementPanel from "./AdminManagementPanel";

/**
 * 🚨 PRODUCTION REMOVAL: Delete this file when removing admin features
 * See /src/app/config/adminConfig.ts for complete removal instructions
 */

interface AdminDashboardProps {
  primaryColor: string;
  adminEmail: string;
}

export default function AdminDashboard({ primaryColor, adminEmail }: AdminDashboardProps) {
  const [operationStatus, setOperationStatus] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  // Admin management state
  const [targetAdminEmail, setTargetAdminEmail] = useState("");
  const [adminManagementStatus, setAdminManagementStatus] = useState("");
  const [isManagingAdmin, setIsManagingAdmin] = useState(false);

  // Health check for Edge Function
  const checkEdgeFunctionHealth = async () => {
    setIsLoading(true);
    setOperationStatus("Checking Edge Function health...");

    try {
      const url = `https://${projectId}.supabase.co/functions/v1/server/make-server-9f243523/health`;
      console.log("🏥 Health check URL:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      });

      console.log("📡 Health check status:", response.status);
      const data = await response.json();
      console.log("📡 Health check data:", data);

      if (response.ok && data.status === "ok") {
        setOperationStatus(
          `✅ Edge Function is healthy!\n\nStatus: ${data.status}\nTimestamp: ${data.timestamp}\n\nYour Edge Function is deployed and responding correctly.`
        );
      } else {
        setOperationStatus(
          `⚠️ Edge Function responded but with unexpected data:\n\n${JSON.stringify(data, null, 2)}`
        );
      }
    } catch (error) {
      console.error("❌ Health check error:", error);
      setOperationStatus(
        `❌ Edge Function is NOT responding!\n\nError: ${error instanceof Error ? error.message : "Unknown error"}\n\nPlease ensure the Edge Function is deployed in Supabase Dashboard.`
      );
    } finally {
      setIsLoading(false);
      setTimeout(() => setOperationStatus(""), 10000);
    }
  };

  // Verify database and show all profiles with setup_completed status
  const verifyDatabase = async () => {
    setIsLoading(true);
    setOperationStatus("Querying profiles table...");

    try {
      console.log("🔍 Querying all profiles from database...");

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise<null>((resolve) => {
        setTimeout(() => {
          console.log("⏱️ Database query timed out after 5 seconds");
          resolve(null);
        }, 5000);
      });

      // Query only core columns that should always exist
      const queryPromise = supabase
        .from("profiles")
        .select("email, name, account_type, created_at")
        .order("created_at", { ascending: false });

      const result = await Promise.race([queryPromise, timeoutPromise]);

      // If timeout occurred
      if (result === null) {
        console.log("⚠️ Database query timed out");
        setOperationStatus(
          `⚠️ Query timed out after 5 seconds.\\n\\nThis suggests a database connectivity issue.\\n\\nPlease check your Supabase dashboard.`
        );
        setIsLoading(false);
        setTimeout(() => setOperationStatus(""), 10000);
        return;
      }

      const { data: profiles, error } = result as { data: Profile[] | null; error: any };

      if (error) {
        console.error("❌ Database query error:", error);
        setOperationStatus(
          `❌ Database Error:\\n\\n${error.message}\\n\\nCode: ${error.code || "N/A"}\\n\\nDetails: ${error.details || "N/A"}`
        );
        setIsLoading(false);
        setTimeout(() => setOperationStatus(""), 10000);
        return;
      }

      if (!profiles || profiles.length === 0) {
        setOperationStatus(
          `⚠️ No profiles found in database.\\n\\nThe profiles table exists but is empty.`
        );
        setIsLoading(false);
        setTimeout(() => setOperationStatus(""), 10000);
        return;
      }

      // Format the results
      let statusMessage = `✅ Found ${profiles.length} profiles in database:\\n\\n`;

      profiles.forEach((profile: Profile, index: number) => {
        statusMessage += `${index + 1}. ${profile.email}\\n`;
        statusMessage += `   Name: ${profile.name || "N/A"}\\n`;
        statusMessage += `   Type: ${profile.account_type}\\n`;
        statusMessage += `   Created: ${profile.created_at ? new Date(profile.created_at).toLocaleString() : "N/A"}\\n\\n`;
      });

      console.log("✅ Database verification successful:", profiles);
      setOperationStatus(statusMessage);
    } catch (error) {
      console.error("❌ Verify database error:", error);
      setOperationStatus(
        `❌ Error: ${error instanceof Error ? error.message : "Unknown error"}\\n\\nStack: ${error instanceof Error ? error.stack : "N/A"}`
      );
    } finally {
      setIsLoading(false);
      setTimeout(() => setOperationStatus(""), 30000); // Show for 30 seconds
    }
  };

  const checkSupabaseConnection = async () => {
    setIsLoading(true);
    setOperationStatus("Checking Supabase connection...");

    try {
      const timeoutPromise = new Promise<null>((resolve) => {
        setTimeout(() => resolve(null), 5000);
      });

      const queryPromise = supabase.from("profiles").select("id", { count: "exact", head: true });

      const result = await Promise.race([queryPromise, timeoutPromise]);

      if (result === null) {
        setOperationStatus("❌ Supabase check timed out after 5 seconds.");
        return;
      }

      const { error, count } = result as { error: any; count: number | null };

      if (error) {
        const status = error.status ? ` (status ${error.status})` : "";
        setOperationStatus(`❌ Supabase check failed${status}: ${error.message}`);
        return;
      }

      setOperationStatus(
        `✅ Supabase is reachable.\n\nProfiles count (head): ${count ?? "unknown"}`
      );
    } catch (error) {
      setOperationStatus(
        `❌ Supabase check error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setIsLoading(false);
      setTimeout(() => setOperationStatus(""), 10000);
    }
  };

  // Check all accounts (simplified - test accounts removed)
  const checkAllAccounts = async () => {
    setOperationStatus("✅ Use the Account Manager below to view and manage all user accounts.");
    setTimeout(() => setOperationStatus(""), 5000);
  };

  // Admin management functions
  const handleManageAdmin = async (promote: boolean) => {
    if (!targetAdminEmail) {
      alert("Please enter an email address");
      return;
    }

    setIsManagingAdmin(true);
    setAdminManagementStatus(`Managing admin status for ${targetAdminEmail}...`);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/make-server-9f243523/admin/manage-admin`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            email: targetAdminEmail,
            promote: promote,
            adminEmail: adminEmail,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        setAdminManagementStatus(`❌ Error: ${result.error || "Unknown error"}`);
        setIsManagingAdmin(false);
        return;
      }

      console.log("✅ Admin status managed successfully:", result);
      setAdminManagementStatus(
        `✅ Successfully ${promote ? "promoted" : "revoked"} admin status for ${targetAdminEmail}`
      );

      // Reset form
      setTargetAdminEmail("");
      setIsManagingAdmin(false);
    } catch (error) {
      console.error("Admin management error:", error);
      setAdminManagementStatus(
        `❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
      setIsManagingAdmin(false);
    } finally {
      setIsManagingAdmin(false);
      setTimeout(() => setAdminManagementStatus(""), 10000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <AdminHeader primaryColor={primaryColor} adminEmail={adminEmail} />

      <QuickActions
        primaryColor={primaryColor}
        isLoading={isLoading}
        operationStatus={operationStatus}
        onCheckAllAccounts={checkAllAccounts}
        onCheckEdgeFunctionHealth={checkEdgeFunctionHealth}
        onVerifyDatabase={verifyDatabase}
        onCheckSupabaseConnection={checkSupabaseConnection}
      />

      {/* Admin Management Section - Only for Super Admin */}
      {adminEmail === "molalign5@gmail.com" && (
        <AdminManagementPanel
          primaryColor={primaryColor}
          targetAdminEmail={targetAdminEmail}
          isManagingAdmin={isManagingAdmin}
          adminManagementStatus={adminManagementStatus}
          onTargetAdminEmailChange={setTargetAdminEmail}
          onPromote={() => handleManageAdmin(true)}
          onRevoke={() => handleManageAdmin(false)}
        />
      )}

      {/* Account Manager Tool */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mb-6"
      >
        <AdminAccountManager />
      </motion.div>

      {/* Storage Debug Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <StorageDebugPanel />
      </motion.div>
    </div>
  );
}
