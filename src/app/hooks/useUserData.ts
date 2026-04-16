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
import { getProfile, saveProfile } from "../services/supabaseService";
import { saveProfileToCloud, saveVehiclesToCloud, saveReportsToCloud } from "./userDataActions";
import { STORAGE_KEYS, getNotificationsByUserType } from "../constants";
import {
  normalizeEmail,
  getUserCacheKey,
  getLastActiveCacheKey,
  buildPhotoStorageFromReports,
  readLocalStorageItemSafely,
  writeLocalStorageItemSafely,
  removeLocalStorageItemSafely,
} from "./userDataUtils";
import { parseCachedUserData } from "./useUserDataHelpers";
import { hydrateFromCloudProfile, migrateLocalToCloud } from "./useUserDataLoader";
import { useUserDataCloudSync } from "./useUserDataCloudSync";

export function useUserData(
  clerkUserId?: string,
  websiteUserKey?: string,
  signedInEmail?: string,
  authReady = true,
  accountType?: "customer" | "shop" | "insurer"
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
      // When a specific user is identified (clerkUserId), only load from
      // user-scoped cache keys to prevent cross-account report leakage.
      // The lastActive/bare fallbacks are only safe for anonymous pre-auth.
      const cachedData = clerkUserId
        ? (readLocalStorageItemSafely(identityCacheKey) ||
           readLocalStorageItemSafely(signedInEmailCacheKey))
        : (readLocalStorageItemSafely(identityCacheKey) ||
           readLocalStorageItemSafely(signedInEmailCacheKey) ||
           readLocalStorageItemSafely(lastActiveCacheKey) ||
           readLocalStorageItemSafely(STORAGE_KEYS.USER_DATA));
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
          } else if (accountType && signedInEmail && clerkUserId) {
            // Bootstrap profile for first-time user with no localStorage cache
            if (import.meta.env.DEV)
              console.log("[DEBUG] useUserData: Bootstrapping new profile", {
                accountType,
                signedInEmail,
              });
            const bootstrapName = signedInEmail.split("@")[0];
            const saved = await saveProfile(
              {
                email: signedInEmail,
                name: bootstrapName,
                phone: "",
                account_type: accountType,
              },
              { clerkUserId, email: signedInEmail, websiteUserKey }
            );
            if (saved) {
              const freshProfile = await getProfile({
                clerkUserId,
                email: signedInEmail,
                websiteUserKey,
              });
              if (freshProfile) {
                const result = await hydrateFromCloudProfile(freshProfile, clerkUserId);
                applyHydration(result, userCacheKey);
                return;
              }
            }
          }
          setReportsLoading(false);
        }
      } catch (error) {
        if (import.meta.env.DEV) console.error("Error loading from Supabase:", error);
        setReportsError("Unable to load your data. Please check your connection and try again.");
        setReportsLoading(false);
      } finally {
        isLoadingFromCloudRef.current = false;
      }
    };

    loadUserData();
  }, [authReady, clerkUserId, signedInEmail, websiteUserKey, accountType]);

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
  const [syncError, setSyncError] = useState<string | null>(null);
  useUserDataCloudSync({
    userInfo,
    vehicles,
    reports,
    userPhone,
    redirectInfo,
    clerkUserId,
    websiteUserKey,
    isSavingRef,
    isLoadingFromCloudRef,
    lastSavedProfileSignatureRef,
    lastSavedVehiclesSignatureRef,
    lastSavedReportsSignatureRef,
    vehicleSignaturesRef,
    reportSignaturesRef,
    onSyncError: () => setSyncError("Auto-save failed — your recent changes may not be saved."),
  });

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
    syncError,
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
