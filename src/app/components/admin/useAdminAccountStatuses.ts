import { useState } from "react";
import { listAdminProfiles, type AdminProfileSummary } from "../../services/supabase/admin";

export interface AccountStatus {
  email: string;
  exists: boolean;
  accountType?: string;
  userId?: string;
  name?: string;
  loading: boolean;
  error?: string;
}

export function useAdminAccountStatuses() {
  const [accountStatuses, setAccountStatuses] = useState<Record<string, AccountStatus>>({});

  const checkAccountStatus = async (email: string) => {
    setAccountStatuses((prev) => ({
      ...prev,
      [email]: { email, exists: false, loading: true },
    }));

    try {
      console.log("🔍 Checking account for:", email);
      const [profile] = await listAdminProfiles(email);

      if (profile) {
        console.log("✅ Account exists:", profile);
        setAccountStatuses((prev) => ({
          ...prev,
          [email]: {
            email,
            exists: true,
            accountType: (profile as AdminProfileSummary).account_type,
            userId: (profile as AdminProfileSummary).user_id ?? undefined,
            name: (profile as AdminProfileSummary).name ?? undefined,
            loading: false,
          },
        }));
      } else {
        console.log("❌ Account does not exist");
        setAccountStatuses((prev) => ({
          ...prev,
          [email]: { email, exists: false, loading: false },
        }));
      }
    } catch (error) {
      console.error("Error checking account:", error);
      setAccountStatuses((prev) => ({
        ...prev,
        [email]: { email, exists: false, loading: false, error: String(error) },
      }));
    }
  };

  return { accountStatuses, checkAccountStatus };
}
