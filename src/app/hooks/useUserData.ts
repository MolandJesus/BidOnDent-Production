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
import { getProfile, saveProfile, saveVehicle } from "../services/supabaseService";
import { saveProfileToCloud, saveVehiclesToCloud, saveReportsToCloud } from "./userDataActions";
import { saveDamageReport } from "../services/supabase/reports";
import { STORAGE_KEYS, getNotificationsByUserType } from "../constants";
import {
  normalizeEmail,
  getUserCacheKey,
  getLastActiveCacheKey,
  buildPhotoStorageFromReports,
  toSupabaseVehicle,
  buildSupabaseReportPayload,
  readLocalStorageItemSafely,
  writeLocalStorageItemSafely,
  removeLocalStorageItemSafely,
} from "./userDataUtils";
import { parseCachedUserData } from "./useUserDataHelpers";
import { hydrateFromCloudProfile, migrateLocalToCloud } from "./useUserDataLoader";

export function useUserData(
  clerkUserId?: string,
  websiteUserKey?: string,
  signedInEmail?: string,
  authReady = true
) {
  const [userInfo, setUserInfo] = useState<UserInfo>({ name: "", email: "", profileImage: "" });
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [reports, setReports] = useState<DamageReport[]>([]);
  const [reportsError, setReportsError] = useState<string | null>(null);
  const [reportsLoading, setReportsLoading] = useState<boolean>(true);
  const [bids, setBids] = useState<Bid[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [userPhone, setUserPhone] = useState("");
  const [redirectInfo, setRedirectInfo] = useState<RedirectInfo | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [hasSeenPhotoGuide, setHasSeenPhotoGuide] = useState(false);
  const [photoStorage, setPhotoStorage] = useState<Record<string, string[]>>({});
  const isSavingRef = useRef(false);
  const isLoadingFromCloudRef = useRef(false);
  const lastSavedProfileSignatureRef = useRef("");
  const lastSavedVehiclesSignatureRef = useRef("");
  const lastSavedReportsSignatureRef = useRef("");
  // Per-entity signature maps for granular dirty tracking
  const vehicleSignaturesRef = useRef<Record<string, string>>({});
  const reportSignaturesRef = useRef<Record<string, string>>({});

  // ============================================================================
  // CLOUD-FIRST DATA LOADING
  // ============================================================================

  /** Apply a HydrationResult to state + refs */
  const applyHydration = (
    result: import("./useUserDataLoader").HydrationResult,
    cacheKey: string
  ) => {
    setUserInfo(result.userInfo);
    setUserPhone(result.userPhone);
    setRedirectInfo(result.redirectInfo);
    setNotifications(result.notifications);
    setVehicles(result.vehicles);
    setReports(result.reports);
    setReportsError(result.reportsError);
    setReportsLoading(false);
    setBids(result.bids);
    setPhotoStorage(result.photoStorage);

    lastSavedProfileSignatureRef.current = result.signatures.profile;
    lastSavedVehiclesSignatureRef.current = result.signatures.vehicles;
    lastSavedReportsSignatureRef.current = result.signatures.reports;
    vehicleSignaturesRef.current = result.signatures.vehicleMap;
    reportSignaturesRef.current = result.signatures.reportMap;

    writeLocalStorageItemSafely(cacheKey, JSON.stringify(result.cachePayload));
    writeLocalStorageItemSafely(
      STORAGE_KEYS.USER_DATA_LAST_ACTIVE,
      websiteUserKey || normalizeEmail(result.userInfo.email)
    );
    if (import.meta.env.DEV) console.log("Cache updated with fresh Supabase data");
  };

  useEffect(() => {
    const loadUserData = async () => {
      // Step 1: Load from localStorage CACHE for instant UI (optional)
      const identityCacheKey = getUserCacheKey(undefined, websiteUserKey);
      const signedInEmailCacheKey = getUserCacheKey(signedInEmail);
      const lastActiveCacheKey = getLastActiveCacheKey();
      const cachedData =
        readLocalStorageItemSafely(identityCacheKey) ||
        readLocalStorageItemSafely(signedInEmailCacheKey) ||
        readLocalStorageItemSafely(lastActiveCacheKey) ||
        readLocalStorageItemSafely(STORAGE_KEYS.USER_DATA);
      if (import.meta.env.DEV)
        console.log("[DEBUG] useUserData: Checking localStorage cache", {
          identityCacheKey,
          signedInEmailCacheKey,
          lastActiveCacheKey,
          cachedData,
        });
      if (cachedData) {
        const userData = parseCachedUserData(cachedData);
        if (userData?.redirectInfo && userData.userInfo.email) {
          if (import.meta.env.DEV) console.log("[DEBUG] useUserData: Loaded cached data", userData);
          setUserInfo(userData.userInfo);
          setVehicles(userData.vehicles);
          setReports(userData.reports);
          setUserPhone(userData.userPhone);
          setRedirectInfo(userData.redirectInfo);
          setNotifications(
            userData.notifications ?? getNotificationsByUserType(userData.redirectInfo.type)
          );
          setHasSeenPhotoGuide(userData.hasSeenPhotoGuide);
          const cachedPhotoStorage =
            userData.photoStorage || buildPhotoStorageFromReports(userData.reports);
          setPhotoStorage(cachedPhotoStorage);
        }
      }

      // Step 2: Check if we have a Clerk-backed website identity and auth token path
      if (!authReady || !signedInEmail || !clerkUserId) {
        if (import.meta.env.DEV)
          console.log("[DEBUG] useUserData: Clerk auth not ready yet - skipping cloud load", {
            authReady,
            clerkUserId,
            signedInEmail,
          });
        setReportsLoading(false);
        return;
      }

      // Step 3: Load from SUPABASE (PRIMARY source of truth)
      isLoadingFromCloudRef.current = true;
      if (import.meta.env.DEV)
        console.log("[DEBUG] useUserData: Loading data from Supabase (PRIMARY source)...", {
          clerkUserId,
          websiteUserKey,
          signedInEmail,
        });

      try {
        const email = signedInEmail;
        if (!email) {
          if (import.meta.env.DEV) console.error("[DEBUG] useUserData: No email in identity");
          return;
        }

        const userCacheKey = getUserCacheKey(email, websiteUserKey);
        const legacyCache = readLocalStorageItemSafely(STORAGE_KEYS.USER_DATA);
        if (legacyCache && !readLocalStorageItemSafely(userCacheKey)) {
          const migrated = writeLocalStorageItemSafely(userCacheKey, legacyCache);
          if (migrated) {
            removeLocalStorageItemSafely(STORAGE_KEYS.USER_DATA);
          }
        }

        if (import.meta.env.DEV)
          console.log("[DEBUG] useUserData: Calling getProfile", {
            clerkUserId,
            email,
            websiteUserKey,
          });
        const profileData = await getProfile({ clerkUserId, email, websiteUserKey });
        if (import.meta.env.DEV) console.log("[DEBUG] useUserData: getProfile result", profileData);

        if (profileData) {
          if (import.meta.env.DEV) console.log("Profile loaded from Supabase:", profileData);
          setReportsLoading(true);
          setReportsError(null);
          const result = await hydrateFromCloudProfile(profileData, clerkUserId);
          applyHydration(result, userCacheKey);
        } else {
          if (import.meta.env.DEV)
            console.log("No profile found in Supabase - new user or needs migration");

          if (cachedData) {
            const migrationResult = await migrateLocalToCloud(
              cachedData,
              email,
              clerkUserId,
              websiteUserKey
            );
            if (migrationResult) {
              applyHydration(migrationResult, userCacheKey);
            }
          }
          setReportsLoading(false);
        }
      } catch (error) {
        if (import.meta.env.DEV) console.error("Error loading from Supabase:", error);
      } finally {
        isLoadingFromCloudRef.current = false;
      }
    };

    loadUserData();
  }, [authReady, clerkUserId, signedInEmail, websiteUserKey]);

  // ============================================================================
  // CACHE UPDATE (localStorage) - for quick offline access
  // ============================================================================
  useEffect(() => {
    if (redirectInfo && userInfo.email && !isLoadingFromCloudRef.current) {
      const timeoutId = setTimeout(() => {
        const userData: UserData = {
          userInfo,
          vehicles,
          reports,
          bids,
          userPhone,
          redirectInfo,
          notifications,
          hasSeenPhotoGuide,
          photoStorage,
        };
        writeLocalStorageItemSafely(
          getUserCacheKey(userInfo.email, websiteUserKey),
          JSON.stringify(userData)
        );
        writeLocalStorageItemSafely(
          STORAGE_KEYS.USER_DATA_LAST_ACTIVE,
          websiteUserKey || normalizeEmail(userInfo.email)
        );
        if (import.meta.env.DEV) console.log("Cache updated (localStorage)");
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
    websiteUserKey,
  ]);

  // ============================================================================
  // CLOUD SYNC (auto-save to Supabase with debounce)
  // ============================================================================
  useEffect(() => {
    if (!userInfo.email || !redirectInfo || isLoadingFromCloudRef.current) {
      return;
    }

    const timeoutId = setTimeout(async () => {
      if (isSavingRef.current) return;
      isSavingRef.current = true;

      try {
        if (!clerkUserId) {
          return;
        }

        const isCloudUrl =
          userInfo.profileImage &&
          (userInfo.profileImage.startsWith("http://") ||
            userInfo.profileImage.startsWith("https://"));

        const profileSignature = JSON.stringify({
          email: userInfo.email,
          name: userInfo.name,
          phone: userPhone,
          profileImage: userInfo.profileImage || "",
          accountType: redirectInfo.type,
        });
        const vehiclesSignature = JSON.stringify(vehicles);
        const reportsSignature = JSON.stringify(reports);

        if (profileSignature !== lastSavedProfileSignatureRef.current) {
          await saveProfile(
            {
              email: userInfo.email,
              name: userInfo.name,
              phone: userPhone,
              profile_image_url: isCloudUrl ? userInfo.profileImage : undefined,
              account_type: redirectInfo.type,
            },
            {
              clerkUserId,
              email: userInfo.email,
              websiteUserKey,
            }
          );
          lastSavedProfileSignatureRef.current = profileSignature;
          if (import.meta.env.DEV) console.log("Auto-saved profile to Supabase");
        }

        if (vehiclesSignature !== lastSavedVehiclesSignatureRef.current) {
          if (vehicles.length > 0) {
            let savedCount = 0;
            for (const vehicle of vehicles) {
              const vid = vehicle.id;
              const vSig = JSON.stringify(vehicle);
              if (vid && vSig === vehicleSignaturesRef.current[vid]) continue;
              await saveVehicle(toSupabaseVehicle(vehicle), clerkUserId);
              if (vid) vehicleSignaturesRef.current[vid] = vSig;
              savedCount++;
            }
            if (import.meta.env.DEV && savedCount > 0)
              console.log(`Auto-saved ${savedCount}/${vehicles.length} vehicles to Supabase`);
          }
          lastSavedVehiclesSignatureRef.current = vehiclesSignature;
        }

        if (reportsSignature !== lastSavedReportsSignatureRef.current) {
          if (reports.length > 0) {
            let savedCount = 0;
            for (const report of reports) {
              const rid = report.id;
              const rSig = JSON.stringify(report);
              if (rid && rSig === reportSignaturesRef.current[rid]) continue;
              await saveDamageReport(buildSupabaseReportPayload(report), clerkUserId);
              if (rid) reportSignaturesRef.current[rid] = rSig;
              savedCount++;
            }
            if (import.meta.env.DEV && savedCount > 0)
              console.log(`Auto-saved ${savedCount}/${reports.length} reports to Supabase`);
          }
          lastSavedReportsSignatureRef.current = reportsSignature;
        }
      } catch (error) {
        if (import.meta.env.DEV) console.error("Error auto-saving to Supabase:", error);
      } finally {
        isSavingRef.current = false;
      }
    }, 2000); // 2 second debounce for cloud saves

    return () => clearTimeout(timeoutId);
  }, [userInfo, vehicles, reports, userPhone, redirectInfo, clerkUserId, websiteUserKey]);

  // ============================================================================
  // MANUAL SAVE FUNCTIONS (with cloud-first approach)
  // ============================================================================

  const saveUserProfile = async (profileData: {
    name?: string;
    phone?: string;
    profileImage?: string;
  }) => {
    if (!userInfo.email || !redirectInfo) return false;
    return saveProfileToCloud({
      email: userInfo.email,
      name: profileData.name || userInfo.name,
      phone: profileData.phone || userPhone,
      profileImage: profileData.profileImage || userInfo.profileImage,
      accountType: redirectInfo.type,
      clerkUserId,
      websiteUserKey,
    });
  };

  const saveUserVehicles = async (vehiclesData: Vehicle[]) => {
    if (!userInfo.email || !clerkUserId) return false;
    isSavingRef.current = true;
    const result = await saveVehiclesToCloud(vehiclesData, clerkUserId);
    if (result) {
      setVehicles(result);
      setTimeout(() => {
        isSavingRef.current = false;
      }, 1000);
      return true;
    }
    isSavingRef.current = false;
    return false;
  };

  const saveUserReports = async (reportsData: DamageReport[]) => {
    if (!userInfo.email || !clerkUserId) return false;
    return saveReportsToCloud(reportsData, clerkUserId);
  };

  const clearSession = () => {
    // Clear cache only - Supabase data persists
    const cacheKey = getUserCacheKey(userInfo.email, websiteUserKey);
    const lastActiveIdentifier = readLocalStorageItemSafely(STORAGE_KEYS.USER_DATA_LAST_ACTIVE);
    removeLocalStorageItemSafely(cacheKey);
    removeLocalStorageItemSafely(STORAGE_KEYS.USER_DATA);
    if (
      lastActiveIdentifier &&
      lastActiveIdentifier === (websiteUserKey || normalizeEmail(userInfo.email))
    ) {
      removeLocalStorageItemSafely(STORAGE_KEYS.USER_DATA_LAST_ACTIVE);
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
    if (import.meta.env.DEV) console.log("Session cleared (cache only - cloud data preserved)");
  };

  return {
    // State
    userInfo,
    vehicles,
    reports,
    reportsLoading,
    reportsError,
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
    clearSession,
  };
}
