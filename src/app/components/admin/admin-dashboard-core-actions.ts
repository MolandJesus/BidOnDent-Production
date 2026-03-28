import { TEST_ACCOUNTS } from "../../config/adminConfig";
import {
  getDeepEdgeFunctionHealth,
  getEdgeFunctionHealth,
  listAdminProfiles,
} from "../../services/supabase/admin";

export interface AccountStatus {
  email: string;
  exists: boolean;
  accountType?: string;
  userId?: string;
  name?: string;
  loading: boolean;
  error?: string;
}

export interface CustomAccount {
  email: string;
  name: string;
  accountType: "customer" | "shop" | "insurer";
  createdAt: string;
  userId?: string;
  setupCompleted?: boolean;
}

type SetState<T> = (value: T | ((prev: T) => T)) => void;

export async function checkEdgeFunctionHealthAction(params: {
  setIsLoading: SetState<boolean>;
  setOperationStatus: SetState<string>;
}) {
  const { setIsLoading, setOperationStatus } = params;
  setIsLoading(true);
  setOperationStatus("Checking Edge Function health...");

  try {
    const data = await getEdgeFunctionHealth();

    if (data.status === "ok") {
      setOperationStatus(
        `✅ Edge Function is healthy!\n\nStatus: ${data.status}\nTimestamp: ${data.timestamp}\n\nYour Edge Function is deployed and responding correctly.`
      );
    } else {
      setOperationStatus(
        `⚠️ Edge Function responded but with unexpected data:\n\n${JSON.stringify(data, null, 2)}`
      );
    }
  } catch (error) {
    setOperationStatus(
      `❌ Edge Function is NOT responding!\n\nError: ${error instanceof Error ? error.message : "Unknown error"}\n\nPlease ensure the Edge Function is deployed in Supabase Dashboard.`
    );
  } finally {
    setIsLoading(false);
    setTimeout(() => setOperationStatus(""), 10000);
  }
}

export async function verifyDatabaseAction(params: {
  setIsLoading: SetState<boolean>;
  setOperationStatus: SetState<string>;
}) {
  const { setIsLoading, setOperationStatus } = params;
  setIsLoading(true);
  setOperationStatus("Verifying database access via edge health...");

  try {
    const data = await getDeepEdgeFunctionHealth();
    const checks = Object.entries(data.checks || {});
    const checkLines =
      checks.length > 0
        ? checks.map(([table, status]) => `${table}: ${status}`).join("\\n")
        : "No table checks returned";

    setOperationStatus(
      `${data.status === "ok" ? "✅" : "⚠️"} Database verification via edge:\\n\\nStatus: ${data.status}\\nVersion: ${data.version || "unknown"}\\n\\n${checkLines}`
    );
  } catch (error) {
    setOperationStatus(`❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`);
  } finally {
    setIsLoading(false);
    setTimeout(() => setOperationStatus(""), 30000);
  }
}

export async function loadCustomAccountsAction(params: {
  adminEmail: string;
  setIsLoading: SetState<boolean>;
  setOperationStatus: SetState<string>;
  setCustomAccounts: SetState<CustomAccount[]>;
  setAccountStatuses: SetState<Record<string, AccountStatus>>;
}) {
  const { adminEmail, setIsLoading, setOperationStatus, setCustomAccounts, setAccountStatuses } =
    params;
  setIsLoading(true);
  setOperationStatus("Loading custom accounts...");

  try {
    const profiles = await listAdminProfiles();

    const testAccountEmails = TEST_ACCOUNTS.map((a) => a.email);
    const customProfiles = profiles.filter(
      (p) => !testAccountEmails.includes(p.email) && p.email !== adminEmail
    );

    const customAccountsList: CustomAccount[] = customProfiles.map((p) => ({
      email: p.email,
      name: p.name || "Unknown",
      accountType: p.account_type as "customer" | "shop" | "insurer",
      createdAt: p.created_at,
      userId: p.user_id ?? undefined,
      setupCompleted: p.setup_completed ?? undefined,
    }));

    setCustomAccounts(customAccountsList);

    const newStatuses: Record<string, AccountStatus> = {};
    customProfiles.forEach((p) => {
      newStatuses[p.email] = {
        email: p.email,
        exists: true,
        accountType: p.account_type,
        userId: p.user_id ?? undefined,
        name: p.name || "Unknown",
        loading: false,
      };
    });

    setAccountStatuses((prev) => ({ ...prev, ...newStatuses }));

    setOperationStatus(
      customAccountsList.length > 0
        ? `✅ Loaded ${customAccountsList.length} custom account(s)`
        : "✅ No custom accounts yet"
    );
    setTimeout(() => setOperationStatus(""), 3000);
  } catch (error) {
    setOperationStatus(`❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    setCustomAccounts([]);
  } finally {
    setIsLoading(false);
  }
}

export async function checkAccountStatusAction(params: {
  email: string;
  setAccountStatuses: SetState<Record<string, AccountStatus>>;
}) {
  const { email, setAccountStatuses } = params;

  setAccountStatuses((prev) => ({
    ...prev,
    [email]: { email, exists: false, loading: true },
  }));

  try {
    const [profile] = await listAdminProfiles(email);

    if (profile) {
      setAccountStatuses((prev) => ({
        ...prev,
        [email]: {
          email,
          exists: true,
          accountType: profile.account_type,
          userId: profile.user_id ?? undefined,
          name: profile.name ?? undefined,
          loading: false,
        },
      }));
      return;
    }

    setAccountStatuses((prev) => ({
      ...prev,
      [email]: { email, exists: false, loading: false },
    }));
  } catch (error) {
    setAccountStatuses((prev) => ({
      ...prev,
      [email]: { email, exists: false, loading: false, error: String(error) },
    }));
  }
}
