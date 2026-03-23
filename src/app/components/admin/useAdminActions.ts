import { useState, useEffect } from "react";
import { TEST_ACCOUNTS } from "../../config/adminConfig";
import { supabase } from "../../services/supabaseService";
import {
  createAdminUser,
  deleteAdminUser,
  getEdgeFunctionHealth,
  listAdminProfiles,
  type AdminProfileSummary,
} from "../../services/supabase/admin";
import { useAdminAccountStatuses, type AccountStatus } from "./useAdminAccountStatuses";
import { useAdminRoleManagement } from "./useAdminRoleManagement";

export type { AccountStatus };

export interface CustomAccount {
  email: string;
  name: string;
  accountType: "customer" | "shop" | "insurer";
  createdAt: string;
  userId?: string | null;
  setupCompleted?: boolean | null;
}

export function useAdminActions(adminEmail: string) {
  const { accountStatuses, checkAccountStatus } = useAdminAccountStatuses();
  const adminManagement = useAdminRoleManagement(adminEmail);

  const [customAccounts, setCustomAccounts] = useState<CustomAccount[]>([]);
  const [operationStatus, setOperationStatus] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  // New test account form state
  const [showNewAccountForm, setShowNewAccountForm] = useState(false);
  const [newAccountEmail, setNewAccountEmail] = useState("");
  const [newAccountName, setNewAccountName] = useState("");
  const [newAccountType, setNewAccountType] = useState<"customer" | "shop" | "insurer">("customer");
  const [newAccountPassword, setNewAccountPassword] = useState("");

  // Health check for Edge Function
  const checkEdgeFunctionHealth = async () => {
    setOperationStatus("Checking Edge Function health...");
    try {
      const health = await getEdgeFunctionHealth();
      console.log("Edge Function health:", health);
      setOperationStatus(
        `Edge Function Status: ${health.status}\nVersion: ${health.version || "unknown"}\nTimestamp: ${health.timestamp || "unknown"}`
      );
    } catch (error) {
      console.error("Health check error:", error);
      setOperationStatus(
        `❌ Edge Function Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setTimeout(() => setOperationStatus(""), 10000);
    }
  };

  // Database verification
  const verifyDatabase = async () => {
    setOperationStatus("Verifying database connection...");
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id")
        .limit(1);

      if (profilesError) {
        setOperationStatus(
          `❌ Database Error: ${profilesError.message}\n\nCode: ${profilesError.code}\nDetails: ${profilesError.details}`
        );
        return;
      }

      const { data: businessProfiles, error: businessError } = await supabase
        .from("business_profiles")
        .select("id")
        .limit(1);

      if (businessError) {
        setOperationStatus(
          `⚠️ Profiles table OK (${profiles?.length || 0} rows)\n❌ Business Profiles Error: ${businessError.message}`
        );
        return;
      }

      setOperationStatus(
        `✅ Database Connected!\n\nProfiles table: OK (${profiles?.length || 0} rows)\nBusiness Profiles table: OK (${businessProfiles?.length || 0} rows)\n\nAll tables accessible.`
      );
    } catch (error) {
      setOperationStatus(
        `❌ Connection Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setTimeout(() => setOperationStatus(""), 10000);
    }
  };

  // Load custom accounts from Supabase
  const loadCustomAccounts = async () => {
    try {
      const profiles = await listAdminProfiles();
      const testEmails = TEST_ACCOUNTS.map((a) => a.email);
      const custom: CustomAccount[] = (profiles as AdminProfileSummary[])
        .filter((p) => !testEmails.includes(p.email))
        .map((p) => ({
          email: p.email,
          name: p.name ?? "Unknown",
          accountType: p.account_type as "customer" | "shop" | "insurer",
          createdAt: p.created_at,
          userId: p.user_id,
          setupCompleted: p.setup_completed,
        }));
      setCustomAccounts(custom);
    } catch (error) {
      console.error("Error loading custom accounts:", error);
    }
  };

  // Check all test accounts
  const checkAllAccounts = async () => {
    setIsLoading(true);
    for (const account of TEST_ACCOUNTS) {
      await checkAccountStatus(account.email);
    }
    setIsLoading(false);
  };

  // Delete account
  const deleteAccount = async (email: string) => {
    if (
      !confirm(
        `⚠️ Are you sure you want to delete ${email}?\n\nThis will permanently delete:\n- Auth user account\n- Database profile\n- All associated data\n\nThis action cannot be undone!\n\nContinue?`
      )
    ) {
      return;
    }

    setIsLoading(true);
    setOperationStatus(`Deleting ${email}...`);

    try {
      const result = await deleteAdminUser(email, { adminEmail });

      if (!result.success) {
        console.error("Delete error:", result.error);
        setOperationStatus(`❌ Error: ${result.error || "Unknown error"}`);
      } else {
        console.log("✅ Account deleted successfully");
        setOperationStatus(
          `✅ Successfully deleted ${email}\n\nBoth auth and profile have been removed.`
        );
        await checkAccountStatus(email);
        await loadCustomAccounts();
      }
    } catch (error) {
      console.error("Delete error:", error);
      setOperationStatus(`❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsLoading(false);
      setTimeout(() => setOperationStatus(""), 5000);
    }
  };

  // Create account
  const createAccount = async (email: string, accountType: string) => {
    const password = prompt(
      `Create password for ${email}:\n\n(Use a test password like "test123" for testing)`
    );

    if (!password) {
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);
    setOperationStatus(`Creating ${email}...`);

    try {
      const accountInfo = TEST_ACCOUNTS.find((a) => a.email === email);
      const result = await createAdminUser(
        {
          email,
          password,
          name: accountInfo?.label || "Test Account",
          account_type: accountType,
        },
        { adminEmail }
      );
      console.log("📡 Response data:", result);

      if (!result.success && !result.created) {
        const errorMsg = `❌ Error: ${result.error || "Unknown error"}\n\nResponse: ${JSON.stringify(result, null, 2)}`;
        console.error("Account creation failed:", result);
        setOperationStatus(errorMsg);
        alert(errorMsg);
        setIsLoading(false);
        return;
      }

      console.log("✅ Account created successfully:", result);
      setOperationStatus(
        `✅ Successfully created ${email}\n\nPassword: ${password}\nUser ID: ${result.userId}\nAccount Type: ${result.accountType}\n\n(Save this password for testing)`
      );
      await checkAccountStatus(email);

      setTimeout(() => {
        alert(
          `Account created!\n\nEmail: ${email}\nPassword: ${password}\nUser ID: ${result.userId}\n\nSave this password for testing.`
        );
      }, 500);
    } catch (error) {
      console.error("❌ Create error:", error);
      const errorMsg = `❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`;
      setOperationStatus(errorMsg);
      alert(errorMsg);
    } finally {
      setIsLoading(false);
      setTimeout(() => setOperationStatus(""), 10000);
    }
  };

  // Create custom test account (for any email)
  const createCustomAccount = async () => {
    if (!newAccountEmail) {
      alert("Please enter an email address");
      return;
    }

    if (!newAccountPassword) {
      alert("Please enter a password");
      return;
    }

    if (newAccountPassword.length < 6) {
      alert("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);
    setOperationStatus(`Creating ${newAccountEmail}...`);

    try {
      const email = newAccountEmail;
      const password = newAccountPassword;
      const accountType = newAccountType;
      const name = newAccountName || "Test Account";

      const result = await createAdminUser(
        { email, password, name, account_type: accountType },
        { adminEmail }
      );

      if (!result.success) {
        setOperationStatus(`❌ Error: ${result.error || "Unknown error"}`);
        setIsLoading(false);
        return;
      }

      console.log("✅ Custom account created successfully:", result);
      setOperationStatus(
        `✅ Successfully created ${email}\n\nPassword: ${password}\n\n(Save this password for testing)`
      );

      setNewAccountEmail("");
      setNewAccountName("");
      setNewAccountPassword("");
      setShowNewAccountForm(false);
      await loadCustomAccounts();

      setTimeout(() => {
        alert(
          `Test Account Created!\n\nEmail: ${email}\nPassword: ${password}\nType: ${accountType}\n\nSave this information for testing.`
        );
      }, 500);
    } catch (error) {
      console.error("Create error:", error);
      setOperationStatus(`❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsLoading(false);
      setTimeout(() => setOperationStatus(""), 10000);
    }
  };

  // Switch to account (login as that account)
  const switchToAccount = async (email: string) => {
    const password = prompt(`Enter password for ${email} to switch accounts:`);

    if (!password) {
      return;
    }

    setIsLoading(true);
    setOperationStatus(`Switching to ${email}...`);

    try {
      await supabase.auth.signOut();

      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setOperationStatus(`❌ Error: ${signInError.message}`);
        setIsLoading(false);
        return;
      }

      if (!signInData.session) {
        setOperationStatus(`❌ Error: Login failed`);
        setIsLoading(false);
        return;
      }

      setOperationStatus(`✅ Switching to ${email}... Reloading...`);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Switch account error:", error);
      setOperationStatus(`❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCustomAccounts();
  }, []);

  return {
    // State
    accountStatuses,
    customAccounts,
    operationStatus,
    isLoading,
    showNewAccountForm,
    newAccountEmail,
    newAccountName,
    newAccountType,
    newAccountPassword,
    // Setters
    setShowNewAccountForm,
    setNewAccountEmail,
    setNewAccountName,
    setNewAccountType,
    setNewAccountPassword,
    // Actions
    checkEdgeFunctionHealth,
    verifyDatabase,
    checkAllAccounts,
    checkAccountStatus,
    deleteAccount,
    createAccount,
    createCustomAccount,
    switchToAccount,
    // Admin role management (delegated)
    ...adminManagement,
  };
}
