import type { useNavigation } from "./useNavigation";
import type { useUserData } from "./useUserData";
import { saveDamageReport } from "../services/supabaseService";
import { buildSupabaseReportPayload, toFrontendBid } from "./userDataUtils";

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
    if (import.meta.env.DEV) console.log(`Submitting bid of $${bidAmount} for report ${reportId}`);

    const report = userData.reports.find((entry) => entry.id === reportId);
    if (!report) {
      if (import.meta.env.DEV) console.error("Report not found:", reportId);
      return;
    }

    const vehicleInfo =
      `${report.vehicle?.year || ""} ${report.vehicle?.make || ""} ${report.vehicle?.model || ""}`.trim() ||
      "Vehicle";

    // Build bid object for Supabase
    const bid = {
      damage_report_id: reportId,
      shop_name: userData.userInfo.name || "Shop Name",
      shop_email: userData.userInfo.email,
      amount: bidAmount,
      estimated_days: estimatedDays ?? 0,
      description: description || "",
      notes: undefined,
      status: "pending",
      shop_rating: undefined,
      shop_reviews: undefined,
      shop_distance: undefined,
    };

    try {
      // Import submitBid from supabase/bids
      const { submitBid } = await import("../services/supabase/bids");
      const savedBid = await submitBid(bid as any, userId);
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
      } else if (import.meta.env.DEV) {
        console.error("Bid submission failed (Supabase error)");
      }
    } catch (error) {
      if (import.meta.env.DEV) console.error("Error submitting bid to Supabase:", error);
    }
  };

  const handleReportSubmit = async (report: Record<string, unknown>) => {
    try {
      if (import.meta.env.DEV) console.log("Submitting damage report to API...");

      const savedApiReport = await saveDamageReport(
        buildSupabaseReportPayload(report),
        userId
      );

      if (!savedApiReport) {
        if (import.meta.env.DEV) console.error("Failed to save report");
        userData.setReports((previous) => [...previous, report as never]);
        if (report?.id && Array.isArray(report.photos)) {
          userData.setPhotoStorage((previous: Record<string, string[]>) => ({
            ...previous,
            [report.id]: report.photos,
          }));
        }
        throw new Error("Failed to save report to server");
      }

      if (import.meta.env.DEV) console.log("Damage report saved to database:", savedApiReport.id);

      const savedReport = {
        ...report,
        id: savedApiReport.id || report.id,
      };
      userData.setReports((previous: any[]) => [...previous, savedReport]);
      if (savedReport?.id && Array.isArray(savedReport.photos)) {
        userData.setPhotoStorage((previous: Record<string, string[]>) => ({
          ...previous,
          [savedReport.id]: savedReport.photos,
        }));
      }
    } catch (error) {
      if (import.meta.env.DEV) console.error("Error submitting report:", error);
      userData.setReports((previous) => [...previous, report as never]);
      if (report?.id && Array.isArray(report.photos)) {
        userData.setPhotoStorage((previous: Record<string, string[]>) => ({
          ...previous,
          [report.id]: report.photos,
        }));
      }
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
