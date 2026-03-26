import { useState } from "react";
import { manageAdminAccount } from "../../services/supabase/admin";

export function useAdminRoleManagement(adminEmail: string) {
  const [targetAdminEmail, setTargetAdminEmail] = useState("");
  const [adminManagementStatus, setAdminManagementStatus] = useState("");
  const [isManagingAdmin, setIsManagingAdmin] = useState(false);

  const handleManageAdmin = async (promote: boolean) => {
    if (!targetAdminEmail) {
      alert("Please enter an email address");
      return;
    }

    setIsManagingAdmin(true);
    setAdminManagementStatus(`Managing admin status for ${targetAdminEmail}...`);

    try {
      const result = await manageAdminAccount({ email: targetAdminEmail, promote }, { adminEmail });

      if (!result.success) {
        setAdminManagementStatus(`❌ Error: ${result.error || "Unknown error"}`);
        setIsManagingAdmin(false);
        return;
      }

      if (import.meta.env.DEV) console.log("✅ Admin status managed successfully:", result);
      setAdminManagementStatus(
        `✅ Successfully ${promote ? "promoted" : "revoked"} admin status for ${targetAdminEmail}`
      );

      setTargetAdminEmail("");
      setIsManagingAdmin(false);
    } catch (error) {
      if (import.meta.env.DEV) console.error("Admin management error:", error);
      setAdminManagementStatus(
        `❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
      setIsManagingAdmin(false);
    } finally {
      setTimeout(() => setAdminManagementStatus(""), 10000);
    }
  };

  return {
    targetAdminEmail,
    setTargetAdminEmail,
    adminManagementStatus,
    isManagingAdmin,
    handleManageAdmin,
  };
}
