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
import {
  getProfile,
  getVehicles,
  getDamageReports,
  saveProfile,
  saveVehicle,
  saveDamageReport,
} from "../services/supabaseService";
import { getMyBids } from "../services/supabase/bids";
import { saveProfileToCloud, saveVehiclesToCloud, saveReportsToCloud } from "./userDataActions";
import { STORAGE_KEYS, getNotificationsByUserType } from "../constants";
import {
  isUuidLike,
  normalizeEmail,
  getUserCacheKey,
  getLastActiveCacheKey,
  buildPhotoStorageFromReports,
  transformSupabaseReport,
  buildSupabaseReportPayload,
  toFrontendVehicle,
  toSupabaseVehicle,
  toFrontendBid,
} from "./userDataUtils";

export function useUserData(clerkUserId?: string, websiteUserKey?: string, signedInEmail?: string) {
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

  // ============================================================================
  // CLOUD-FIRST DATA LOADING
  // ============================================================================
  useEffect(() => {
    const loadUserData = async () => {
      // Step 1: Load from localStorage CACHE for instant UI (optional)
      const identityCacheKey = getUserCacheKey(undefined, websiteUserKey);
      const signedInEmailCacheKey = getUserCacheKey(signedInEmail);
      const lastActiveCacheKey = getLastActiveCacheKey();
      const cachedData =
        localStorage.getItem(identityCacheKey) ||
        localStorage.getItem(signedInEmailCacheKey) ||
        localStorage.getItem(lastActiveCacheKey) ||
        localStorage.getItem(STORAGE_KEYS.USER_DATA);
      console.log("[DEBUG] useUserData: Checking localStorage cache", {
        identityCacheKey,
        signedInEmailCacheKey,
        lastActiveCacheKey,
        cachedData,
      });
      if (cachedData) {
        try {
          const userData: UserData = JSON.parse(cachedData);
          if (userData.redirectInfo && userData.userInfo?.email) {
            console.log("[DEBUG] useUserData: Loaded cached data", userData);
            setUserInfo(userData.userInfo || { name: "", email: "", profileImage: "" });
            setVehicles(userData.vehicles || []);
            setReports(userData.reports || []);
            setUserPhone(userData.userPhone || "");
            setRedirectInfo(userData.redirectInfo);
            setNotifications(
              userData.notifications ?? getNotificationsByUserType(userData.redirectInfo.type)
            );
            setHasSeenPhotoGuide(userData.hasSeenPhotoGuide || false);
            const cachedPhotoStorage =
              userData.photoStorage || buildPhotoStorageFromReports(userData.reports || []);
            setPhotoStorage(cachedPhotoStorage);
          }
        } catch (error) {
          console.error("[DEBUG] useUserData: Error loading cached data:", error);
        }
      }

      // Step 2: Check if we have a Clerk-backed website identity
      if (!signedInEmail || !clerkUserId) {
        console.log("[DEBUG] useUserData: No Clerk identity available yet - skipping cloud load");
        setReportsLoading(false);
        return;
      }

      // Step 3: Load from SUPABASE (PRIMARY source of truth)
      isLoadingFromCloudRef.current = true;
      console.log("[DEBUG] useUserData: Loading data from Supabase (PRIMARY source)...", {
        clerkUserId,
        websiteUserKey,
        signedInEmail,
      });

      try {
        const email = signedInEmail;
        if (!email) {
          console.error("[DEBUG] useUserData: No email in identity");
          return;
        }

        const userCacheKey = getUserCacheKey(email, websiteUserKey);
        const legacyCache = localStorage.getItem(STORAGE_KEYS.USER_DATA);
        if (legacyCache && !localStorage.getItem(userCacheKey)) {
          localStorage.setItem(userCacheKey, legacyCache);
          localStorage.removeItem(STORAGE_KEYS.USER_DATA);
        }

        // Load profile
        console.log("[DEBUG] useUserData: Calling getProfile", {
          clerkUserId,
          email,
          websiteUserKey,
        });
        const profileData = await getProfile({
          clerkUserId,
          email,
          websiteUserKey,
        });
        console.log("[DEBUG] useUserData: getProfile result", profileData);

        if (profileData) {
          if (import.meta.env.DEV) console.log("Profile loaded from Supabase:", profileData);

          // Set state from Supabase data
          setUserInfo({
            name: profileData.name,
            email: profileData.email,
            profileImage: profileData.profile_image_url || "",
          });
          setUserPhone(profileData.phone || "");
          setRedirectInfo({
            type: profileData.account_type,
            email: profileData.email,
          });
          setNotifications(getNotificationsByUserType(profileData.account_type));

          // Load vehicles from Supabase
          const vehiclesData = await getVehicles(clerkUserId);
          setVehicles(vehiclesData.map(toFrontendVehicle));
          if (import.meta.env.DEV)
            console.log(`Loaded ${vehiclesData.length} vehicles from Supabase`);

          // Load reports from Supabase
          setReportsLoading(true);
          setReportsError(null);
          const reportsData = await getDamageReports(clerkUserId);
          if (Array.isArray(reportsData)) {
            // Success
            const transformedReports = reportsData.map(
              transformSupabaseReport
            ) as unknown as DamageReport[];
            setReports(transformedReports);
            setReportsError(null);
            // Populate photoStorage from reports
            const photoStorageData: Record<string, string[]> = {};
            reportsData.forEach((report: any) => {
              if (report.photo_urls && Array.isArray(report.photo_urls)) {
                photoStorageData[report.id || ""] = report.photo_urls;
              }
            });
            setPhotoStorage(photoStorageData);
            if (import.meta.env.DEV)
              console.log(`[DEV] Loaded ${transformedReports.length} reports from Supabase`);
          } else if (reportsData && reportsData.error) {
            setReports([]);
            setReportsError(reportsData.error);
            if (import.meta.env.DEV) {
              console.error(`[DEV] Reports error:`, reportsData.error);
            }
          } else {
            setReports([]);
            setReportsError("unknown-error");
            if (import.meta.env.DEV) {
              console.error(`[DEV] Unknown reports error:`, reportsData);
            }
          }
          setReportsLoading(false);

          // Load bids from Supabase
          const bidsData = await getMyBids(clerkUserId);
          const transformedBids = bidsData.map(toFrontendBid);
          setBids(transformedBids);
          if (import.meta.env.DEV)
            console.log(`[DEV] Loaded ${transformedBids.length} bids from Supabase`);

          // Step 4: Update localStorage CACHE with fresh data
          const validReports = Array.isArray(reportsData) ? reportsData : [];
          const freshUserData: UserData = {
            userInfo: {
              name: profileData.name,
              email: profileData.email,
              profileImage: profileData.profile_image_url || "",
            },
            vehicles: vehiclesData.map(toFrontendVehicle),
            reports: validReports.map(transformSupabaseReport) as unknown as DamageReport[],
            bids: transformedBids,
            userPhone: profileData.phone || "",
            redirectInfo: {
              type: profileData.account_type,
              email: profileData.email,
            },
            notifications: getNotificationsByUserType(profileData.account_type),
            hasSeenPhotoGuide: false,
            photoStorage: validReports.reduce((acc: Record<string, string[]>, report: any) => {
              if (report?.id && Array.isArray(report.photo_urls)) {
                acc[report.id] = report.photo_urls;
              }
              return acc;
            }, {}),
          };

          try {
            localStorage.setItem(userCacheKey, JSON.stringify(freshUserData));
            localStorage.setItem(
              STORAGE_KEYS.USER_DATA_LAST_ACTIVE,
              websiteUserKey || normalizeEmail(email)
            );
            if (import.meta.env.DEV) console.log("Cache updated with fresh Supabase data");
          } catch {
            // Graceful: quota exceeded or private mode — Supabase is source of truth
          }
        } else {
          if (import.meta.env.DEV)
            console.log("No profile found in Supabase - new user or needs migration");

          // Check if we have cached data for this user (migration case)
          if (cachedData) {
            let userData: UserData;
            try {
              userData = JSON.parse(cachedData);
            } catch {
              userData = {} as UserData;
            }
            if (userData?.userInfo?.email === email && userData.redirectInfo) {
              if (import.meta.env.DEV) console.log("Migrating cached data to Supabase...");

              // Create profile in Supabase from cached data
              await saveProfile(
                {
                  email: email,
                  name: userData.userInfo.name,
                  phone: userData.userPhone || "",
                  profile_image_url: undefined, // Don't migrate base64 images
                  account_type: userData.redirectInfo.type,
                },
                {
                  clerkUserId,
                  email,
                  websiteUserKey,
                }
              );

              // Migrate vehicles
              if (userData.vehicles && userData.vehicles.length > 0) {
                for (const vehicle of userData.vehicles) {
                  await saveVehicle(toSupabaseVehicle(vehicle), clerkUserId);
                }
                if (import.meta.env.DEV) console.log("Migrated vehicles to Supabase");
              }

              if (import.meta.env.DEV)
                console.log("Migration complete - reloading from Supabase...");
              // Reload to get fresh data with UUIDs
              window.location.reload();
            }
          }
        }
      } catch (error) {
        if (import.meta.env.DEV) console.error("Error loading from Supabase:", error);
      } finally {
        isLoadingFromCloudRef.current = false;
      }
    };

    loadUserData();
  }, [clerkUserId, signedInEmail, websiteUserKey]);

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
        try {
          localStorage.setItem(
            getUserCacheKey(userInfo.email, websiteUserKey),
            JSON.stringify(userData)
          );
          localStorage.setItem(
            STORAGE_KEYS.USER_DATA_LAST_ACTIVE,
            websiteUserKey || normalizeEmail(userInfo.email)
          );
          if (import.meta.env.DEV) console.log("Cache updated (localStorage)");
        } catch {
          // Graceful: quota exceeded or private mode — Supabase is source of truth
        }
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
    if (!userInfo.email || !redirectInfo || isSavingRef.current || isLoadingFromCloudRef.current) {
      return;
    }

    const timeoutId = setTimeout(async () => {
      isSavingRef.current = true;

      try {
        if (!clerkUserId) {
          return;
        }

        const isCloudUrl =
          userInfo.profileImage &&
          (userInfo.profileImage.startsWith("http://") ||
            userInfo.profileImage.startsWith("https://"));

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
        if (import.meta.env.DEV) console.log("Auto-saved profile to Supabase");

        if (vehicles.length > 0) {
          for (const vehicle of vehicles) {
            await saveVehicle(toSupabaseVehicle(vehicle), clerkUserId);
          }
          if (import.meta.env.DEV) console.log("Auto-saved vehicles to Supabase");
        }

        if (reports.length > 0) {
          for (const report of reports) {
            await saveDamageReport(buildSupabaseReportPayload(report), clerkUserId);
          }
          if (import.meta.env.DEV) console.log("Auto-saved reports to Supabase");
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

  const saveUserProfile = async (profileData: any) => {
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
    const lastActiveIdentifier = localStorage.getItem(STORAGE_KEYS.USER_DATA_LAST_ACTIVE);
    localStorage.removeItem(cacheKey);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    if (
      lastActiveIdentifier &&
      lastActiveIdentifier === (websiteUserKey || normalizeEmail(userInfo.email))
    ) {
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
