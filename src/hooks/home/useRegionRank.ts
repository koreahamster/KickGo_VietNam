import { useQuery } from "@tanstack/react-query";

import { getRegionRank } from "@/services/home.service";

export function useRegionRank(userId: string | null, enabled: boolean) {
  return useQuery({
    queryKey: ["home", "region-rank", userId],
    queryFn: () => getRegionRank(userId ?? undefined),
    enabled: enabled && Boolean(userId),
    staleTime: 1000 * 60,
  });
}