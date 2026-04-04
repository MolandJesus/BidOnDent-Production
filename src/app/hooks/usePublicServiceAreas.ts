import { useState, useEffect } from "react";
import {
  getAllPublicServiceAreas,
  type ShopServiceArea,
} from "../services/supabase/serviceAreas";

/**
 * Loads all active radius service areas for rendering on the public shop directory map.
 * Pass 851 — Service area circles in shop directory map.
 */
export function usePublicServiceAreas(): { areas: ShopServiceArea[] } {
  const [areas, setAreas] = useState<ShopServiceArea[]>([]);

  useEffect(() => {
    void getAllPublicServiceAreas()
      .then(setAreas)
      .catch(() => setAreas([]));
  }, []);

  return { areas };
}
