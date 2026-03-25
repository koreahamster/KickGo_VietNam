import { useQuery } from "@tanstack/react-query";

import { getHomeMyTeams } from "@/services/home.service";

export function useMyTeams(userId: string | null, enabled: boolean) {
  return useQuery({
    queryKey: ["home", "my-teams", userId],
    queryFn: () => getHomeMyTeams(userId ?? undefined),
    enabled: enabled && Boolean(userId),
    staleTime: 1000 * 30,
  });
}