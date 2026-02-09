import { useEffect } from "react";

import type { UserProfile } from "../services/clerkService";
import type { useNavigation } from "./useNavigation";
import type { useUserData } from "./useUserData";

type NavigationState = ReturnType<typeof useNavigation>;
type UserDataState = ReturnType<typeof useUserData>;

type UseAppEffectsArgs = {
  navigation: NavigationState;
  userProfile: UserProfile | null;
  userData: UserDataState;
};

export function useAppEffects({
  navigation,
  userProfile,
  userData
}: UseAppEffectsArgs) {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        navigation.profileDropdownRef.current &&
        !navigation.profileDropdownRef.current.contains(event.target as Node)
      ) {
        navigation.setShowProfileDropdown(false);
      }
    };

    if (navigation.showProfileDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [navigation.showProfileDropdown]);

  useEffect(() => {
    if (userProfile && userProfile.account_setup_completed) {
      if (userData.userInfo.name !== userProfile.name || userData.userInfo.email !== userProfile.email) {
        userData.setUserInfo({
          name: userProfile.name,
          email: userProfile.email,
          profileImage: ""
        });
        console.log("Updated user info from Clerk:", {
          name: userProfile.name,
          email: userProfile.email
        });
      }

      if (userData.userPhone !== userProfile.phone) {
        userData.setUserPhone(userProfile.phone);
        console.log("Updated phone from Clerk:", userProfile.phone);
      }

      if (userData.redirectInfo?.type !== userProfile.user_type) {
        userData.setRedirectInfo({
          type: userProfile.user_type as any,
          isReturning: true
        });
        console.log("Updated user type from Clerk:", userProfile.user_type);
      }
    }
  }, [
    userProfile?.name,
    userProfile?.email,
    userProfile?.phone,
    userProfile?.user_type,
    userProfile?.account_setup_completed,
    userData.userInfo.name,
    userData.userInfo.email,
    userData.userPhone,
    userData.redirectInfo?.type
  ]);
}
