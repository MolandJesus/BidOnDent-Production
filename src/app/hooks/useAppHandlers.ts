import type { useNavigation } from "./useNavigation";
import type { useUserData } from "./useUserData";
import { saveDamageReport } from "../services/supabaseService";

type NavigationState = ReturnType<typeof useNavigation>;
type UserDataState = ReturnType<typeof useUserData> & Record<string, any>;

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
    console.log("Use Clerk sign-in UI");
  };

  const handleLogout = async () => {
    try {
      console.log("Signing out from Clerk...");

      await signOut();

      userData.clearSession();
      userData.setBids([]);
      userData.setActivities([]);

      navigation.setShowLandingPage(true);
      navigation.setShowProfileDropdown(false);

      console.log("Logged out successfully - Clerk session ended and local state cleared");
    } catch (error) {
      console.error("Error during logout:", error);
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
      console.log("Deleting Clerk account...");
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
    metadata?: any
  ) => {
    const newActivity = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      type,
      message,
      metadata,
    };
    userData.setActivities([newActivity, ...userData.activities] as any);
  };

  const submitBid = async (
    reportId: string,
    bidAmount: number,
    estimatedDays?: number,
    description?: string
  ) => {
    console.log(`Submitting bid of $${bidAmount} for report ${reportId}`);

    const report = userData.reports.find((entry) => entry.id === reportId) as any;
    if (!report) {
      console.error("Report not found:", reportId);
      return;
    }

    const vehicleInfo = `${report.year} ${report.make} ${report.model}`;

    // Build bid object for Supabase
    const bid = {
      report_id: reportId,
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
      const savedBid = await submitBid(bid as any);
      if (savedBid) {
        addActivity(
          "bid_submitted",
          `Submitted bid of $${bidAmount.toLocaleString()} for ${vehicleInfo}`,
          {
            reportId,
            bidAmount,
            vehicleInfo,
          }
        );
        console.log("✅ Bid submitted and persisted to Supabase");
      } else {
        console.error("Bid submission failed (Supabase error)");
      }
    } catch (error) {
      console.error("Error submitting bid to Supabase:", error);
    }
  };

  const handleReportSubmit = async (report: any) => {
    try {
      console.log("Submitting damage report to API...");

      const savedApiReport = await saveDamageReport(
        {
          vehicle_make: report.vehicle?.make || "",
          vehicle_model: report.vehicle?.model || "",
          vehicle_year: parseInt(report.vehicle?.year || "0", 10),
          damage_type: report.damageArea || "unknown",
          damage_severity: "moderate",
          damage_description: report.description || "",
          damage_location: report.damageArea || "",
          photo_urls: report.photos || [],
          insurance_claim: false,
          preferred_contact: "email",
          additional_notes: report.incident || "",
          status: "pending",
        },
        userId
      );

      if (!savedApiReport) {
        console.error("Failed to save report");
        userData.setReports((previous: any[]) => [...previous, report]);
        if (report?.id && Array.isArray(report.photos)) {
          userData.setPhotoStorage((previous: Record<string, string[]>) => ({
            ...previous,
            [report.id]: report.photos,
          }));
        }
        return;
      }

      console.log("Damage report saved to database:", savedApiReport.id);

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
      console.error("Error submitting report:", error);
      userData.setReports((previous: any[]) => [...previous, report]);
      if (report?.id && Array.isArray(report.photos)) {
        userData.setPhotoStorage((previous: Record<string, string[]>) => ({
          ...previous,
          [report.id]: report.photos,
        }));
      }
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
