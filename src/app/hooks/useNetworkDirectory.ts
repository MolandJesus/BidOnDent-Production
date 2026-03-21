import { useEffect, useState } from "react";
import {
  fetchDirectoryInventory,
  getDirectoryInventoryUpdatedEventName,
} from "../services/networkProfiles";
import type { DirectoryInventory } from "../types/networkProfiles";

const EMPTY_DIRECTORY: DirectoryInventory = {
  shops: [],
  insurers: [],
};

export function useNetworkDirectory() {
  const [inventory, setInventory] = useState<DirectoryInventory>(EMPTY_DIRECTORY);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadInventory = async (forceRefresh = false) => {
      try {
        setIsLoading(true);
        setError(null);
        const nextInventory = await fetchDirectoryInventory(forceRefresh);
        if (isMounted) {
          setInventory(nextInventory);
        }
      } catch (inventoryError: any) {
        if (isMounted) {
          setError(inventoryError?.message || "Unable to load directory inventory");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    const handleDirectoryUpdate = () => {
      void loadInventory(true);
    };

    void loadInventory(false);
    window.addEventListener(getDirectoryInventoryUpdatedEventName(), handleDirectoryUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener(getDirectoryInventoryUpdatedEventName(), handleDirectoryUpdate);
    };
  }, []);

  return {
    error,
    inventory,
    isLoading,
  };
}
