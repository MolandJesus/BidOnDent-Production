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

  const submitBid = (reportId: string, bidAmount: number) => {
    console.log(`Submitting bid of $${bidAmount} for report ${reportId}`);

    const report = userData.reports.find((entry) => entry.id === reportId) as any;
    if (!report) {
      console.error("Report not found:", reportId);
      return;
    }

    const vehicleInfo = `${report.year} ${report.make} ${report.model}`;

    const newBid = {
      id: Date.now().toString(),
      reportId,
      shopId: userData.userInfo.email,
      shopName: userData.userInfo.name || "Shop Name",
      amount: bidAmount,
      estimatedDays: Math.floor(Math.random() * 7) + 1,
      rating: (Math.random() * 1.5 + 3.5).toFixed(1),
      reviewCount: Math.floor(Math.random() * 100) + 10,
      shopDistance: `${(Math.random() * 5 + 0.5).toFixed(1)} miles`,
    };

    const newBids = [...userData.bids, newBid];
    userData.setBids(newBids as any);

    const updatedReports = userData.reports.map((entry: any) => {
      if (entry.id === reportId) {
        return {
          ...entry,
          bidsCount: (entry.bidsCount || 0) + 1,
          bids: [...(entry.bids || []), newBid],
        };
      }
      return entry;
    });
    userData.setReports(updatedReports);

    addActivity(
      "bid_submitted",
      `Submitted bid of $${bidAmount.toLocaleString()} for ${vehicleInfo}`,
      {
        reportId,
        bidAmount,
        vehicleInfo,
      }
    );

    console.log("Bid submitted successfully");
    console.log(
      "Report bids count:",
      updatedReports.find((entry) => entry.id === reportId)?.bidsCount
    );
    console.log("Total bids:", newBids.length);
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
