import { TEST_ACCOUNTS } from "../../config/adminConfig";
import { projectId, publicAnonKey } from "../../../utils/supabase/info";
import { supabase } from "../../services/supabaseService";

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
    const url = `https://${projectId}.supabase.co/functions/v1/server/make-server-9f243523/health`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${publicAnonKey}`,
      },
    });

    const data = await response.json();

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
  setOperationStatus("Querying profiles table...");

  try {
    const timeoutPromise = new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), 5000);
    });

    const queryPromise = supabase
      .from("profiles")
      .select("email, name, account_type, created_at")
      .order("created_at", { ascending: false });

    const result = await Promise.race([queryPromise, timeoutPromise]);

    if (result === null) {
      setOperationStatus(
        "⚠️ Query timed out after 5 seconds.\\n\\nThis suggests a database connectivity issue.\\n\\nPlease check your Supabase dashboard."
      );
      return;
    }

    const { data: profiles, error } = result as any;

    if (error) {
      setOperationStatus(
        `❌ Database Error:\\n\\n${error.message}\\n\\nCode: ${error.code || "N/A"}\\n\\nDetails: ${error.details || "N/A"}`
      );
      return;
    }

    if (!profiles || profiles.length === 0) {
      setOperationStatus("⚠️ No profiles found in database.\\n\\nThe profiles table exists but is empty.");
      return;
    }

    let statusMessage = `✅ Found ${profiles.length} profiles in database:\\n\\n`;

    profiles.forEach((profile: any, index: number) => {
      statusMessage += `${index + 1}. ${profile.email}\\n`;
      statusMessage += `   Name: ${profile.name || "N/A"}\\n`;
      statusMessage += `   Type: ${profile.account_type}\\n`;
      statusMessage += `   Created: ${new Date(profile.created_at).toLocaleString()}\\n\\n`;
    });

    setOperationStatus(statusMessage);
  } catch (error) {
    setOperationStatus(
      `❌ Error: ${error instanceof Error ? error.message : "Unknown error"}\\n\\nStack: ${error instanceof Error ? error.stack : "N/A"}`
    );
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
    const timeoutPromise = new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), 5000);
    });

    const queryPromise = supabase
      .from("profiles")
      .select("email, name, account_type, user_id, created_at, setup_completed")
      .order("created_at", { ascending: false });

    const result = await Promise.race([queryPromise, timeoutPromise]);

    if (result === null) {
      setOperationStatus("⚠️ Query timed out. Database may be slow or unavailable.");
      setCustomAccounts([]);
      setTimeout(() => setOperationStatus(""), 5000);
      return;
    }

    const { data: profiles, error } = result as any;

    if (error) {
      setOperationStatus(`❌ Database Error: ${error.message}`);
      setCustomAccounts([]);
      setTimeout(() => setOperationStatus(""), 5000);
      return;
    }

    if (!profiles) {
      setOperationStatus("⚠️ No profiles found");
      setCustomAccounts([]);
      setTimeout(() => setOperationStatus(""), 3000);
      return;
    }

    const testAccountEmails = TEST_ACCOUNTS.map((a) => a.email);
    const customProfiles = profiles.filter(
      (p: any) => !testAccountEmails.includes(p.email) && p.email !== adminEmail
    );

    const customAccountsList: CustomAccount[] = customProfiles.map((p: any) => ({
      email: p.email,
      name: p.name || "Unknown",
      accountType: p.account_type as "customer" | "shop" | "insurer",
      createdAt: p.created_at,
      userId: p.user_id,
      setupCompleted: p.setup_completed,
    }));

    setCustomAccounts(customAccountsList);

    const newStatuses: Record<string, AccountStatus> = {};
    customProfiles.forEach((p: any) => {
      newStatuses[p.email] = {
        email: p.email,
        exists: true,
        accountType: p.account_type,
        userId: p.user_id,
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
    const timeoutPromise = new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), 5000);
    });

    const queryPromise = supabase.from("profiles").select("*").eq("email", email).maybeSingle();
    const result = await Promise.race([queryPromise, timeoutPromise]);

    if (result === null) {
      setAccountStatuses((prev) => ({
        ...prev,
        [email]: { email, exists: false, loading: false, error: "Timeout" },
      }));
      return;
    }

    const { data: profile, error: profileError } = result as any;

    if (profileError && profileError.code !== "PGRST116") {
      setAccountStatuses((prev) => ({
        ...prev,
        [email]: { email, exists: false, loading: false, error: profileError.message },
      }));
      return;
    }

    if (profile) {
      setAccountStatuses((prev) => ({
        ...prev,
        [email]: {
          email,
          exists: true,
          accountType: profile.account_type,
          userId: profile.user_id,
          name: profile.name,
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
