import { useEffect, useState } from "react";
import {
  loadWebsiteSessionMemory,
  replaceWebsiteSessionMemory,
  type WebsiteIdentity,
} from "../services/auth/websiteIdentity";
import {
  fetchWebsiteSessionMemoryFromCloud,
  queueWebsiteSessionMemorySync,
} from "../services/auth/websitePreferencesSync";
import {
  fetchWebsiteRelationshipCollectionsFromCloud,
  mergeRelationshipCollectionsIntoSessionMemory,
  queueWebsiteRelationshipCollectionsSync,
} from "../services/auth/websiteRelationshipsSync";

type WebsiteAccountType = "customer" | "shop" | "insurer";

function getTimestamp(value?: string) {
  const timestamp = value ? new Date(value).getTime() : 0;
  return Number.isFinite(timestamp) ? timestamp : 0;
}

export function useWebsiteSessionSync(
  identity?: WebsiteIdentity | null,
  accountType?: WebsiteAccountType
) {
  const [isHydrated, setIsHydrated] = useState(!identity);

  useEffect(() => {
    if (!identity) {
      setIsHydrated(true);
      return;
    }

    let cancelled = false;
    setIsHydrated(false);

    const sync = async () => {
      const localMemory = loadWebsiteSessionMemory(identity);
      const [memoryResult, relationshipsResult] = await Promise.allSettled([
        fetchWebsiteSessionMemoryFromCloud(identity),
        fetchWebsiteRelationshipCollectionsFromCloud(identity),
      ]);
      const remoteMemory = memoryResult.status === "fulfilled" ? memoryResult.value : null;
      const remoteRelationships =
        relationshipsResult.status === "fulfilled" ? relationshipsResult.value : null;
      const hydratedRemoteMemory = remoteMemory
        ? mergeRelationshipCollectionsIntoSessionMemory(remoteMemory, remoteRelationships)
        : null;
      const hydratedLocalMemory = mergeRelationshipCollectionsIntoSessionMemory(
        localMemory,
        remoteRelationships
      );

      if (cancelled) {
        return;
      }

      if (!hydratedRemoteMemory) {
        if (getTimestamp(hydratedLocalMemory.updatedAt) > 0) {
          queueWebsiteSessionMemorySync({
            accountType,
            identity,
            sessionMemory: hydratedLocalMemory,
          });
          queueWebsiteRelationshipCollectionsSync({
            accountType,
            identity,
            sessionMemory: hydratedLocalMemory,
          });
        }

        replaceWebsiteSessionMemory(identity, hydratedLocalMemory);
        setIsHydrated(true);
        return;
      }

      const remoteTimestamp = getTimestamp(hydratedRemoteMemory.updatedAt);
      const localTimestamp = getTimestamp(hydratedLocalMemory.updatedAt);

      if (remoteTimestamp >= localTimestamp) {
        replaceWebsiteSessionMemory(identity, hydratedRemoteMemory);
      } else {
        queueWebsiteSessionMemorySync({
          accountType,
          identity,
          sessionMemory: hydratedLocalMemory,
        });
        queueWebsiteRelationshipCollectionsSync({
          accountType,
          identity,
          sessionMemory: hydratedLocalMemory,
        });
      }

      setIsHydrated(true);
    };

    sync().catch((error) => {
      if (import.meta.env.DEV) console.error("Error hydrating website session memory:", error);
      setIsHydrated(true);
    });

    return () => {
      cancelled = true;
    };
  }, [accountType, identity?.websiteUserKey]);

  return isHydrated;
}
