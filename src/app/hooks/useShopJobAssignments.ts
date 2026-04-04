import { useCallback, useEffect, useState } from "react";
import { getJobAssignments, type EnrichedJobAssignment } from "../services/supabase/workflow";

export function useShopJobAssignments(shopClerkUserId: string | null | undefined) {
  const [jobs, setJobs] = useState<EnrichedJobAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!shopClerkUserId) return;
    setIsLoading(true);
    try {
      const result = await getJobAssignments(shopClerkUserId);
      setJobs(result);
    } finally {
      setIsLoading(false);
    }
  }, [shopClerkUserId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { jobs, isLoading, refresh };
}
