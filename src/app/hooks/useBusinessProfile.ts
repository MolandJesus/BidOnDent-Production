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
  const [businessProfile, setBusinessProfile] = useState<
    ShopBusinessProfile | InsurerBusinessProfile | null
  >(null);
  const [isLoading, setIsLoading] = useState(accountType === "shop" || accountType === "insurer");
  const [error, setError] = useState<string | null>(null);
  const fetchVersion = useRef(0);

  const refreshProfile = useCallback(async () => {
    if (!identity || accountType === "customer" || !accountType) {
      setBusinessProfile(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    const version = ++fetchVersion.current;
    setIsLoading(true);
    setError(null);

    try {
      const profile =
        accountType === "shop"
          ? await fetchShopBusinessProfile(identity)
          : await fetchInsurerBusinessProfile(identity);
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
  }, [accountType, identity]);

  useEffect(() => {
    void refreshProfile();
  }, [refreshProfile]);

  const saveProfile = async (
    profile:
      | Omit<ShopBusinessProfile, "websiteUserKey" | "clerkUserId">
      | Omit<InsurerBusinessProfile, "websiteUserKey" | "clerkUserId">
  ) => {
    if (!identity || accountType === "customer" || !accountType) {
      return null;
    }

    setError(null);

    try {
      const savedProfile =
        accountType === "shop"
          ? await saveShopBusinessProfile(
              identity,
              profile as Omit<ShopBusinessProfile, "websiteUserKey" | "clerkUserId">
            )
          : await saveInsurerBusinessProfile(
              identity,
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
