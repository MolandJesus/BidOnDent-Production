import type { RedirectInfo } from "../../types";
import type { UserType } from "../clerkService";
import type { NavigationDiscoveryRole } from "./placeDiscovery";

export function resolveNavigationDiscoveryRole(
  role?: NavigationDiscoveryRole | UserType | RedirectInfo["type"] | null
): NavigationDiscoveryRole | undefined {
  if (role === "shop" || role === "insurer" || role === "customer") {
    return role;
  }

  return undefined;
}
