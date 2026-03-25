import { useQuery } from "@tanstack/react-query";

import { getRecentResults } from "@/services/home.service";

export function useRecentResults(userId: string | null, enabled: boolean) {
  return useQuery({
    queryKey: ["home", "recent-results", userId],
    queryFn: () => getRecentResults(userId ?? undefined),
    enabled: enabled && Boolean(userId),
    staleTime: 1000 * 30,
  });
}