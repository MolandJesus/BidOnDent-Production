// Custom hook for managing user data with CLOUD-FIRST architecture
// ✅ Supabase is PRIMARY data source
// ✅ localStorage is CACHE ONLY for performance
import { useState, useEffect, useRef } from "react";
import type {
  UserInfo,
  Vehicle,
  DamageReport,
  Notification,
  RedirectInfo,
  UserData,
  Bid,
  Activity,
} from "../types";
import { STORAGE_KEYS, getNotificationsByUserType } from "../constants";
import {
  getReportsByClerkUser,
  getVehiclesByClerkUser,
  saveReportByClerkUser,
  saveVehicleByClerkUser,
} from "../services/supabase/clerkEdgeData";
import {
  buildPhotoStorageFromReports,
  buildUserDataCachePayload,
  createSupabaseReportPayload,
  extractBidsFromReports,
  getLastActiveEmail,
  getUserCacheKey,
  loadCachedUserData,
  normalizeEmail,
  saveUserDataCache,
  transformSupabaseReports,
} from "./useUserDataHelpers";

export function useUserData(clerkUserId?: string) {
  const [userInfo, setUserInfo] = useState<UserInfo>({ name: "", email: "", profileImage: "" });
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [reports, setReports] = useState<DamageReport[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [userPhone, setUserPhone] = useState("");
  const [redirectInfo, setRedirectInfo] = useState<RedirectInfo | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [hasSeenPhotoGuide, setHasSeenPhotoGuide] = useState(false);
  const [photoStorage, setPhotoStorage] = useState<Record<string, string[]>>({});
  const isSavingRef = useRef(false);
  const isLoadingFromCloudRef = useRef(false);

  const loadUserDataFromCloud = async () => {
    if (!clerkUserId) {
      return;
    }

    isLoadingFromCloudRef.current = true;
    console.log("☁️ Loading data from Clerk-aware edge functions...");

    try {
      const scope =
        redirectInfo?.type === "shop" || redirectInfo?.type === "insurer" ? "marketplace" : "own";

      const [vehiclesData, reportsData] = await Promise.all([
        redirectInfo?.type === "customer"
          ? getVehiclesByClerkUser(clerkUserId)
          : Promise.resolve([]),
        getReportsByClerkUser(clerkUserId, scope),
      ]);

      const transformedReports = transformSupabaseReports(reportsData);
      const nextPhotoStorage = buildPhotoStorageFromReports(reportsData);
      const nextBids = extractBidsFromReports(
        reportsData,
        redirectInfo?.type || "customer",
        clerkUserId
      );

      setVehicles(vehiclesData as Vehicle[]);
      setReports(transformedReports as DamageReport[]);
      setBids(nextBids as Bid[]);
      setPhotoStorage(nextPhotoStorage);

      if (redirectInfo?.type) {
        setNotifications(getNotificationsByUserType(redirectInfo.type));
      }

      if (userInfo.email && redirectInfo) {
        saveUserDataCache(
          buildUserDataCachePayload({
            userInfo,
            vehicles: vehiclesData as UserData["vehicles"],
            reports: transformedReports as UserData["reports"],
            bids: nextBids as UserData["bids"],
            userPhone,
            redirectInfo,
            notifications:
              notifications.length > 0
                ? notifications
                : getNotificationsByUserType(redirectInfo.type),
            hasSeenPhotoGuide,
            photoStorage: nextPhotoStorage,
          }),
          userInfo.email
        );
      }

      console.log(
        `✅ Loaded ${vehiclesData.length} vehicles, ${transformedReports.length} reports, and ${nextBids.length} bids from cloud`
      );
    } catch (error) {
      console.error("❌ Error loading from edge functions:", error);
    } finally {
      isLoadingFromCloudRef.current = false;
    }
  };

  // ============================================================================
  // CACHE LOAD
  // ============================================================================
  useEffect(() => {
    const cachedUserData = loadCachedUserData();
    if (cachedUserData?.data.redirectInfo && cachedUserData.data.userInfo?.email) {
      const { data: userData } = cachedUserData;
      console.log("📦 Loading cached data for instant display...");
      setUserInfo(userData.userInfo || { name: "", email: "", profileImage: "" });
      setVehicles(userData.vehicles || []);
      setReports(userData.reports || []);
      setBids(userData.bids || []);
      setUserPhone(userData.userPhone || "");
      setRedirectInfo(userData.redirectInfo);
      setNotifications(
        userData.notifications || getNotificationsByUserType(userData.redirectInfo.type)
      );
      setHasSeenPhotoGuide(userData.hasSeenPhotoGuide || false);
      setPhotoStorage(
        userData.photoStorage || buildPhotoStorageFromReports(userData.reports || [])
      );
    }
  }, []);

  // ============================================================================
  // CLOUD LOAD (Clerk-aware edge functions)
  // ============================================================================
  useEffect(() => {
    if (!clerkUserId) {
      return;
    }
    void loadUserDataFromCloud();
  }, [clerkUserId, redirectInfo?.type]);

  useEffect(() => {
    if (!clerkUserId || !redirectInfo?.type) {
      return;
    }

    const intervalId = window.setInterval(() => {
      if (document.hidden || isSavingRef.current || isLoadingFromCloudRef.current) {
        return;
      }

      void loadUserDataFromCloud();
    }, 15000);

    return () => window.clearInterval(intervalId);
  }, [clerkUserId, redirectInfo?.type]);

  // ============================================================================
  // CACHE UPDATE (localStorage) - for quick offline access
  // ============================================================================
  useEffect(() => {
    if (redirectInfo && userInfo.email && !isLoadingFromCloudRef.current) {
      const timeoutId = setTimeout(() => {
        const userData = buildUserDataCachePayload({
          userInfo,
          vehicles,
          reports,
          bids,
          userPhone,
          redirectInfo,
          notifications,
          hasSeenPhotoGuide,
          photoStorage,
        });
        saveUserDataCache(userData, userInfo.email);
        console.log("💾 Cache updated (localStorage)");
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [
    userInfo,
    vehicles,
    reports,
    bids,
    userPhone,
    redirectInfo,
    notifications,
    hasSeenPhotoGuide,
    photoStorage,
  ]);

  // ============================================================================
  // MANUAL SAVE FUNCTIONS (with cloud-first approach)
  // ============================================================================

  const saveUserProfile = async (profileData: any) => {
    setUserInfo((current) => ({
      ...current,
      name: profileData.name || current.name,
      email: profileData.email || current.email,
      profileImage: profileData.profileImage || current.profileImage,
    }));
    if (profileData.phone !== undefined) {
      setUserPhone(profileData.phone);
    }
    return true;
  };

  const saveUserVehicles = async (vehiclesData: Vehicle[]) => {
    if (clerkUserId && redirectInfo?.type === "customer") {
      try {
        isSavingRef.current = true;

        for (const vehicle of vehiclesData) {
          await saveVehicleByClerkUser(clerkUserId, vehicle);
        }

        const updatedVehicles = await getVehiclesByClerkUser(clerkUserId);
        setVehicles(updatedVehicles);

        console.log("✅ Vehicles saved to cloud");

        setTimeout(() => {
          isSavingRef.current = false;
        }, 1000);

        return true;
      } catch (error) {
        console.error("❌ Error saving vehicles:", error);
        isSavingRef.current = false;
        return false;
      }
    }
    return false;
  };

  const saveUserReports = async (reportsData: DamageReport[]) => {
    if (clerkUserId && redirectInfo?.type === "customer") {
      try {
        for (const report of reportsData) {
          await saveReportByClerkUser(clerkUserId, createSupabaseReportPayload(report));
        }
        console.log("✅ Reports saved to cloud");
        return true;
      } catch (error) {
        console.error("❌ Error saving reports:", error);
        return false;
      }
    }
    return false;
  };

  const clearSession = () => {
    // Clear cache only - Supabase data persists
    const cacheKey = getUserCacheKey(userInfo.email);
    const lastActiveEmail = getLastActiveEmail();
    localStorage.removeItem(cacheKey);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    if (lastActiveEmail && lastActiveEmail === normalizeEmail(userInfo.email)) {
      localStorage.removeItem(STORAGE_KEYS.USER_DATA_LAST_ACTIVE);
    }
    setRedirectInfo(null);
    setUserInfo({ name: "", email: "", profileImage: "" });
    setVehicles([]);
    setReports([]);
    setBids([]);
    setActivities([]);
    setUserPhone("");
    setNotifications([]);
    setHasSeenPhotoGuide(false);
    setPhotoStorage({});
    console.log("🚪 Session cleared (cache only - cloud data preserved)");
  };

  const pushNotification = (notification: Notification) => {
    setNotifications((current) => {
      const alreadyExists = current.some(
        (existingNotification) => `${existingNotification.id}` === `${notification.id}`
      );
      if (alreadyExists) {
        return current;
      }

      return [notification, ...current].slice(0, 50);
    });
  };

  const markNotificationRead = (notificationId: string | number) => {
    setNotifications((current) =>
      current.map((notification) =>
        `${notification.id}` === `${notificationId}`
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((current) => current.map((notification) => ({ ...notification, read: true })));
  };

  return {
    // State
    userInfo,
    vehicles,
    reports,
    bids,
    activities,
    userPhone,
    redirectInfo,
    notifications,
    hasSeenPhotoGuide,
    photoStorage,
    isSavingRef,
    isLoadingFromCloudRef,

    // Setters
    setUserInfo,
    setVehicles,
    setReports,
    setBids,
    setActivities,
    setUserPhone,
    setRedirectInfo,
    setNotifications,
    setHasSeenPhotoGuide,
    setPhotoStorage,

    // Actions
    saveProfile: saveUserProfile,
    saveVehicles: saveUserVehicles,
    saveReports: saveUserReports,
    pushNotification,
    markNotificationRead,
    markAllNotificationsRead,
    clearSession,
  };
}
