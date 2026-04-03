import type { useNavigation } from "./useNavigation";
import type { useUserData } from "./useUserData";
import { saveDamageReport } from "../services/supabaseService";
import { submitBid as submitBidToSupabase } from "../services/supabase/bids";
import { buildSupabaseReportPayload, toFrontendBid } from "./userDataUtils";
import type { DamageReport } from "../types";

type NavigationState = ReturnType<typeof useNavigation>;
type UserDataState = ReturnType<typeof useUserData>;

type UseAppHandlersArgs = {
  deleteCurrentUser?: () => Promise<void>;
  userId?: string;
  signOut: () => Promise<void>;
  openSignUp?: () => void;
  userData: UserDataState;
  navigation: NavigationState;
};

export function useAppHandlers({
  deleteCurrentUser,
  userId,
  signOut,
  openSignUp,
  userData,
  navigation,
}: UseAppHandlersArgs) {
  const handleLogin = () => {
    if (openSignUp) {
      openSignUp();
      return;
    }
    if (import.meta.env.DEV) console.log("Use Clerk sign-in UI");
  };

  const handleLogout = async () => {
    try {
      if (import.meta.env.DEV) console.log("Signing out from Clerk...");

      await signOut();

      userData.clearSession();
      userData.setBids([]);
      userData.setActivities([]);

      navigation.setShowLandingPage(true);
      navigation.setShowProfileDropdown(false);

      if (import.meta.env.DEV)
        console.log("Logged out successfully - Clerk session ended and local state cleared");
    } catch (error) {
      if (import.meta.env.DEV) console.error("Error during logout:", error);
      userData.clearSession();
      userData.setBids([]);
      userData.setActivities([]);
      navigation.setShowLandingPage(true);
      navigation.setShowProfileDropdown(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!userId || !deleteCurrentUser) {
      throw new Error("Account deletion is not available for this session.");
    }

    try {
      if (import.meta.env.DEV) console.log("Deleting Clerk account...");
      await deleteCurrentUser();
    } finally {
      userData.clearSession();
      userData.setBids([]);
      userData.setActivities([]);
      navigation.setShowLandingPage(true);
      navigation.setShowProfileDropdown(false);
    }
  };

  const addActivity = (
    type:
      | "bid_submitted"
      | "claim_opened"
      | "claim_in_progress"
      | "claim_approved"
      | "claim_denied"
      | "new_user",
    message: string,
    metadata?: Record<string, unknown>
  ) => {
    const newActivity = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      type,
      message,
      metadata,
    };
    userData.setActivities([newActivity, ...userData.activities]);
  };

  const submitBid = async (
    reportId: string,
    bidAmount: number,
    estimatedDays?: number,
    description?: string
  ) => {
    if (!userId) {
      throw new Error("Please sign in to submit a bid.");
    }

    if (import.meta.env.DEV) console.log(`Submitting bid of $${bidAmount} for report ${reportId}`);

    const report = userData.reports.find((entry) => entry.id === reportId);
    if (!report) {
      throw new Error(`Report not found: ${reportId}`);
    }

    const vehicleInfo =
      `${report.vehicle?.year || ""} ${report.vehicle?.make || ""} ${report.vehicle?.model || ""}`.trim() ||
      "Vehicle";

    // Build bid object for Supabase
    const bid: import("../services/supabase/types").Bid = {
      damage_report_id: reportId,
      shop_name: userData.userInfo.name || "Shop Name",
      shop_email: userData.userInfo.email,
      amount: bidAmount,
      estimated_days: estimatedDays ?? 0,
      description: description || "",
      status: "pending",
    };

    try {
      const savedBid = await submitBidToSupabase(bid, userId);
      if (savedBid) {
        userData.setBids((prev) => [...prev, toFrontendBid(savedBid)]);
        addActivity(
          "bid_submitted",
          `Submitted bid of $${bidAmount.toLocaleString()} for ${vehicleInfo}`,
          {
            reportId,
            bidAmount,
            vehicleInfo,
          }
        );
        if (import.meta.env.DEV) console.log("✅ Bid submitted and persisted to Supabase");
      } else {
        throw new Error("Bid submission failed — no response from server");
      }
    } catch (error) {
      if (import.meta.env.DEV) console.error("Error submitting bid to Supabase:", error);
      throw error;
    }
  };

  const handleReportSubmit = async (report: DamageReport) => {
    try {
      if (!userId) {
        throw new Error("Please sign in to submit a damage report.");
      }

      if (import.meta.env.DEV) console.log("Submitting damage report to API...");

      const savedApiReport = await saveDamageReport(buildSupabaseReportPayload(report), userId);

      if (!savedApiReport) {
        if (import.meta.env.DEV) console.error("Failed to save report");
        throw new Error("Failed to save report to server. Please try again.");
      }

      if (import.meta.env.DEV) console.log("Damage report saved to database:", savedApiReport.id);

      const savedReport = {
        ...report,
        id: savedApiReport.id || report.id,
      };
      userData.setReports((previous) => [...previous, savedReport as DamageReport]);
      if (savedReport.id && Array.isArray(savedReport.photos)) {
        userData.setPhotoStorage((previous: Record<string, string[]>) => ({
          ...previous,
          [savedReport.id]: savedReport.photos,
        }));
      }
    } catch (error) {
      if (import.meta.env.DEV) console.error("Error submitting report:", error);
      throw error;
    }
  };

  return {
    handleLogin,
    handleDeleteAccount,
    handleLogout,
    submitBid,
    handleReportSubmit,
  };
}
