import { TEST_ACCOUNTS } from "../../config/adminConfig";
import { SUPABASE_PROJECT_ID as projectId, SUPABASE_ANON_KEY as publicAnonKey } from "../../services/supabase/runtime";
import { supabase } from "../../services/supabaseService";

type SetState<T> = (value: T | ((prev: T) => T)) => void;

export async function deleteAccountAction(params: {
  email: string;
  adminEmail: string;
  setIsLoading: SetState<boolean>;
  setOperationStatus: SetState<string>;
  checkAccountStatus: (email: string) => Promise<void>;
  loadCustomAccounts: () => Promise<void>;
}) {
  const { email, adminEmail, setIsLoading, setOperationStatus, checkAccountStatus, loadCustomAccounts } =
    params;

  if (
    !window.confirm(
      `⚠️ Are you sure you want to delete ${email}?\n\nThis will permanently delete:\n- Auth user account\n- Database profile\n- All associated data\n\nThis action cannot be undone!\n\nContinue?`
    )
  ) {
    return;
  }

  setIsLoading(true);
  setOperationStatus(`Deleting ${email}...`);

  try {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/server/make-server-9f243523/admin/delete-user`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ email, adminEmail }),
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      setOperationStatus(`❌ Error: ${result.error || "Unknown error"}`);
      return;
    }

    setOperationStatus(`✅ Successfully deleted ${email}\n\nBoth auth and profile have been removed.`);
    await checkAccountStatus(email);
    await loadCustomAccounts();
  } catch (error) {
    setOperationStatus(`❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`);
  } finally {
    setIsLoading(false);
    setTimeout(() => setOperationStatus(""), 5000);
  }
}

export async function createAccountAction(params: {
  email: string;
  accountType: string;
  adminEmail: string;
  setIsLoading: SetState<boolean>;
  setOperationStatus: SetState<string>;
  checkAccountStatus: (email: string) => Promise<void>;
}) {
  const { email, accountType, adminEmail, setIsLoading, setOperationStatus, checkAccountStatus } =
    params;
  const password = window.prompt(
    `Create password for ${email}:\n\n(Use a test password like "test123" for testing)`
  );

  if (!password) {
    return;
  }

  if (password.length < 6) {
    window.alert("Password must be at least 6 characters long");
    return;
  }

  setIsLoading(true);
  setOperationStatus(`Creating ${email}...`);

  try {
    const accountInfo = TEST_ACCOUNTS.find((a) => a.email === email);
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/server/make-server-9f243523/admin/create-user`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          email,
          password,
          name: accountInfo?.label || "Test Account",
          account_type: accountType,
          adminEmail,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok || (!result.success && !result.created)) {
      const errorMsg = `❌ Error: ${result.error || "Unknown error"}\\n\\nResponse: ${JSON.stringify(result, null, 2)}`;
      setOperationStatus(errorMsg);
      window.alert(errorMsg);
      return;
    }

    setOperationStatus(
      `✅ Successfully created ${email}\n\nPassword: ${password}\nUser ID: ${result.userId}\nAccount Type: ${result.accountType}\n\n(Save this password for testing)`
    );
    await checkAccountStatus(email);

    setTimeout(() => {
      window.alert(
        `Account created!\n\nEmail: ${email}\nPassword: ${password}\nUser ID: ${result.userId}\n\nSave this password for testing.`
      );
    }, 500);
  } catch (error) {
    const errorMsg = `❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`;
    setOperationStatus(errorMsg);
    window.alert(errorMsg);
  } finally {
    setIsLoading(false);
    setTimeout(() => setOperationStatus(""), 10000);
  }
}

export async function createCustomAccountAction(params: {
  adminEmail: string;
  newAccountEmail: string;
  newAccountName: string;
  newAccountType: "customer" | "shop" | "insurer";
  newAccountPassword: string;
  setIsLoading: SetState<boolean>;
  setOperationStatus: SetState<string>;
  setNewAccountEmail: SetState<string>;
  setNewAccountName: SetState<string>;
  setNewAccountPassword: SetState<string>;
  setShowNewAccountForm: SetState<boolean>;
  loadCustomAccounts: () => Promise<void>;
}) {
  const {
    adminEmail,
    newAccountEmail,
    newAccountName,
    newAccountType,
    newAccountPassword,
    setIsLoading,
    setOperationStatus,
    setNewAccountEmail,
    setNewAccountName,
    setNewAccountPassword,
    setShowNewAccountForm,
    loadCustomAccounts,
  } = params;

  if (!newAccountEmail) {
    window.alert("Please enter an email address");
    return;
  }

  if (!newAccountPassword) {
    window.alert("Please enter a password");
    return;
  }

  if (newAccountPassword.length < 6) {
    window.alert("Password must be at least 6 characters long");
    return;
  }

  setIsLoading(true);
  setOperationStatus(`Creating ${newAccountEmail}...`);

  try {
    const email = newAccountEmail;
    const password = newAccountPassword;
    const accountType = newAccountType;
    const name = newAccountName || "Test Account";

    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/server/make-server-9f243523/admin/create-user`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          email,
          password,
          name,
          account_type: accountType,
          adminEmail,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      setOperationStatus(`❌ Error: ${result.error || "Unknown error"}`);
      return;
    }

    setOperationStatus(
      `✅ Successfully created ${email}\n\nPassword: ${password}\n\n(Save this password for testing)`
    );

    setNewAccountEmail("");
    setNewAccountName("");
    setNewAccountPassword("");
    setShowNewAccountForm(false);

    await loadCustomAccounts();

    setTimeout(() => {
      window.alert(
        `Test Account Created!\n\nEmail: ${email}\nPassword: ${password}\nType: ${accountType}\n\nSave this information for testing.`
      );
    }, 500);
  } catch (error) {
    setOperationStatus(`❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`);
  } finally {
    setIsLoading(false);
    setTimeout(() => setOperationStatus(""), 10000);
  }
}

export async function switchToAccountAction(params: {
  email: string;
  setIsLoading: SetState<boolean>;
  setOperationStatus: SetState<string>;
}) {
  const { email, setIsLoading, setOperationStatus } = params;
  const password = window.prompt(`Enter password for ${email} to switch accounts:`);

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
      setOperationStatus("❌ Error: Login failed");
      setIsLoading(false);
      return;
    }

    setOperationStatus(`✅ Switching to ${email}... Reloading...`);
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  } catch (error) {
    setOperationStatus(`❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    setIsLoading(false);
  }
}

export async function manageAdminStatusAction(params: {
  targetAdminEmail: string;
  promote: boolean;
  adminEmail: string;
  setIsManagingAdmin: SetState<boolean>;
  setAdminManagementStatus: SetState<string>;
  setTargetAdminEmail: SetState<string>;
}) {
  const {
    targetAdminEmail,
    promote,
    adminEmail,
    setIsManagingAdmin,
    setAdminManagementStatus,
    setTargetAdminEmail,
  } = params;

  if (!targetAdminEmail) {
    window.alert("Please enter an email address");
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
          promote,
          adminEmail,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      setAdminManagementStatus(`❌ Error: ${result.error || "Unknown error"}`);
      setIsManagingAdmin(false);
      return;
    }

    setAdminManagementStatus(
      `✅ Successfully ${promote ? "promoted" : "revoked"} admin status for ${targetAdminEmail}`
    );
    setTargetAdminEmail("");
    setIsManagingAdmin(false);
  } catch (error) {
    setAdminManagementStatus(`❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    setIsManagingAdmin(false);
  } finally {
    setIsManagingAdmin(false);
    setTimeout(() => setAdminManagementStatus(""), 10000);
  }
}
