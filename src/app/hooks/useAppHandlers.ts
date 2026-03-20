import type { useNavigation } from "./useNavigation";
import type { useUserData } from "./useUserData";
import { saveReportByClerkUser, submitBidByClerkUser } from "../services/supabase/clerkEdgeData";

type NavigationState = ReturnType<typeof useNavigation>;
type UserDataState = ReturnType<typeof useUserData> & Record<string, any>;

type UseAppHandlersArgs = {
  userId?: string;
  signOut: () => Promise<void>;
  openSignUp?: () => void;
  userData: UserDataState;
  navigation: NavigationState;
  projectId: string;
  publicAnonKey: string;
  logWorkflowEvent?: (payload: {
    event_type:
      | "report_submitted"
      | "shops_notified"
      | "bid_submitted"
      | "bid_selected"
      | "repair_scheduled"
      | "repair_completed"
      | "claim_submitted"
      | "claim_reviewed"
      | "claim_approved"
      | "claim_denied"
      | "shop_interest_submitted"
      | "insurer_interest_submitted";
    source?: string;
    payload?: Record<string, unknown>;
  }) => Promise<unknown>;
};

export function useAppHandlers({
  userId,
  signOut,
  openSignUp,
  userData,
  navigation,
  projectId,
  publicAnonKey,
  logWorkflowEvent,
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
    estimatedDays = 3,
    description = "Professional repair service with quality guarantee"
  ) => {
    console.log(`Submitting bid of $${bidAmount} for report ${reportId}`);

    const report = userData.reports.find((entry) => entry.id === reportId) as any;
    if (!report) {
      console.error("Report not found:", reportId);
      return;
    }

    const vehicleInfo = `${report.year} ${report.make} ${report.model}`;

    const fallbackBid = {
      id: Date.now().toString(),
      reportId,
      shopId: userId || userData.userInfo.email,
      shopName: userData.userInfo.name || "Shop Name",
      shopEmail: userData.userInfo.email || "",
      amount: bidAmount,
      estimatedDays,
      description,
      status: "pending",
      createdAt: new Date().toISOString(),
      shopRating: 4.8,
      shopReviews: 42,
      shopDistance: "Within service area",
    };

    let newBid = fallbackBid;

    if (userId) {
      try {
        const savedBidRecord = await submitBidByClerkUser(userId, {
          damage_report_id: reportId,
          amount: bidAmount,
          estimated_days: estimatedDays,
          description,
          shop_name: fallbackBid.shopName,
          shop_email: fallbackBid.shopEmail,
          shop_rating: fallbackBid.shopRating,
          shop_reviews: fallbackBid.shopReviews,
          shop_distance: fallbackBid.shopDistance,
        });

        if (savedBidRecord?.id) {
          newBid = {
            ...fallbackBid,
            id: savedBidRecord.id,
          };
        }
      } catch (error) {
        console.error("Error saving bid to edge API, keeping local fallback:", error);
      }
    }

    const newBids = [newBid, ...userData.bids];
    userData.setBids(newBids as any);

    const updatedReports = userData.reports.map((entry: any) => {
      if (entry.id === reportId) {
        const existingBids = Array.isArray(entry.bids) ? entry.bids : [];
        return {
          ...entry,
          bidsCount: existingBids.length + 1,
          bids: [newBid, ...existingBids],
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

    void logWorkflowEvent?.({
      event_type: "bid_submitted",
      source: "dashboard",
      payload: {
        report_id: reportId,
        amount: bidAmount,
        estimated_days: estimatedDays,
      },
    });

    console.log("Bid submitted successfully");
    console.log(
      "Report bids count:",
      updatedReports.find((entry) => entry.id === reportId)?.bidsCount
    );
    console.log("Total bids:", newBids.length);
  };

  const handleReportSubmit = async (report: any) => {
    try {
      console.log("Submitting damage report to edge API...");

      const apiReport = {
        vehicle_make: report.vehicle?.make || "",
        vehicle_model: report.vehicle?.model || "",
        vehicle_year: report.vehicle?.year || "0",
        damage_type: report.damageArea || "unknown",
        damage_severity: "moderate",
        damage_description: report.description || "",
        damage_location: report.damageArea || "",
        photo_urls: report.photos || [],
        insurance_claim: false,
        preferred_contact: "email",
        additional_notes: report.incident || "",
        status: "pending",
      };

      if (!userId) {
        console.error("Missing Clerk user ID for report submission");
        userData.setReports([...userData.reports, report]);
        return;
      }

      const savedReportRecord = await saveReportByClerkUser(userId, apiReport);
      if (!savedReportRecord) {
        console.error("Failed to save report: edge API returned no record");
        userData.setReports([...userData.reports, report]);
        return;
      }

      console.log("Damage report saved to database:", savedReportRecord.id);

      const savedReport = {
        ...report,
        id: savedReportRecord.id || report.id,
      };
      userData.setReports([...userData.reports, savedReport]);
      if (savedReport?.id && Array.isArray(savedReport.photos)) {
        userData.setPhotoStorage({
          ...userData.photoStorage,
          [savedReport.id]: savedReport.photos,
        });
      }

      void logWorkflowEvent?.({
        event_type: "report_submitted",
        source: "dashboard",
        payload: {
          report_id: savedReport.id,
          damage_area: savedReport.damageArea,
        },
      });

      void logWorkflowEvent?.({
        event_type: "shops_notified",
        source: "dashboard",
        payload: {
          report_id: savedReport.id,
        },
      });
    } catch (error) {
      console.error("Error submitting report:", error);
      userData.setReports([...userData.reports, report]);
      if (report?.id && Array.isArray(report.photos)) {
        userData.setPhotoStorage({
          ...userData.photoStorage,
          [report.id]: report.photos,
        });
      }
    }
  };

  return {
    handleLogin,
    handleLogout,
    submitBid,
    handleReportSubmit,
  };
}
