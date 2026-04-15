import { useCallback, useEffect, useRef, useState } from "react";
import type { WebsiteIdentity } from "../services/auth/websiteIdentity";
import {
  fetchInsurerBusinessProfile,
  fetchShopBusinessProfile,
  saveInsurerBusinessProfile,
  saveShopBusinessProfile,
} from "../services/networkProfiles";
import type { InsurerBusinessProfile, ShopBusinessProfile } from "../types/networkProfiles";

type AccountType = "customer" | "shop" | "insurer";

type BusinessProfileState = {
  businessProfile: ShopBusinessProfile | InsurerBusinessProfile | null;
  error: string | null;
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
  saveProfile: (
    profile:
      | Omit<ShopBusinessProfile, "websiteUserKey" | "clerkUserId">
      | Omit<InsurerBusinessProfile, "websiteUserKey" | "clerkUserId">
  ) => Promise<ShopBusinessProfile | InsurerBusinessProfile | null>;
};

export function useBusinessProfile(
  identity: WebsiteIdentity | null | undefined,
  accountType: AccountType | undefined
): BusinessProfileState {
  const provider = identity?.provider;
  const providerUserId = identity?.providerUserId ?? null;
  const normalizedEmail = identity?.normalizedEmail ?? "";
  const displayName = identity?.displayName ?? "";
  const websiteUserKey = identity?.websiteUserKey ?? "";
  const sessionId = identity?.sessionId ?? "";

  const [businessProfile, setBusinessProfile] = useState<
    ShopBusinessProfile | InsurerBusinessProfile | null
  >(null);
  const [isLoading, setIsLoading] = useState(accountType === "shop" || accountType === "insurer");
  const [error, setError] = useState<string | null>(null);
  const fetchVersion = useRef(0);

  const refreshProfile = useCallback(async () => {
    if (!websiteUserKey || !provider || accountType === "customer" || !accountType) {
      setBusinessProfile(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    const resolvedIdentity: WebsiteIdentity = {
      provider,
      providerUserId,
      normalizedEmail,
      displayName,
      websiteUserKey,
      sessionId,
    };

    const version = ++fetchVersion.current;
    setIsLoading(true);
    setError(null);

    try {
      const profile =
        accountType === "shop"
          ? await fetchShopBusinessProfile(resolvedIdentity)
          : await fetchInsurerBusinessProfile(resolvedIdentity);
      if (version === fetchVersion.current) {
        setBusinessProfile(profile);
      }
    } catch (profileError: unknown) {
      if (version === fetchVersion.current) {
        setError(
          profileError instanceof Error ? profileError.message : "Unable to load business profile"
        );
      }
    } finally {
      if (version === fetchVersion.current) {
        setIsLoading(false);
      }
    }
  }, [
    accountType,
    displayName,
    normalizedEmail,
    provider,
    providerUserId,
    sessionId,
    websiteUserKey,
  ]);

  useEffect(() => {
    void refreshProfile();
  }, [refreshProfile]);

  const saveProfile = async (
    profile:
      | Omit<ShopBusinessProfile, "websiteUserKey" | "clerkUserId">
      | Omit<InsurerBusinessProfile, "websiteUserKey" | "clerkUserId">
  ) => {
    if (!websiteUserKey || !provider || accountType === "customer" || !accountType) {
      return null;
    }

    const resolvedIdentity: WebsiteIdentity = {
      provider,
      providerUserId,
      normalizedEmail,
      displayName,
      websiteUserKey,
      sessionId,
    };

    setError(null);

    try {
      const savedProfile =
        accountType === "shop"
          ? await saveShopBusinessProfile(
              resolvedIdentity,
              profile as Omit<ShopBusinessProfile, "websiteUserKey" | "clerkUserId">
            )
          : await saveInsurerBusinessProfile(
              resolvedIdentity,
              profile as Omit<InsurerBusinessProfile, "websiteUserKey" | "clerkUserId">
            );

      setBusinessProfile(savedProfile);
      return savedProfile;
    } catch (saveError: unknown) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save business profile");
      throw saveError;
    }
  };

  return {
    businessProfile,
    error,
    isLoading,
    refreshProfile,
    saveProfile,
  };
}
