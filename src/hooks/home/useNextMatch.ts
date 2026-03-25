import { useQuery } from "@tanstack/react-query";

import { getNextMatch } from "@/services/home.service";

export function useNextMatch(userId: string | null, enabled: boolean) {
  return useQuery({
    queryKey: ["home", "next-match", userId],
    queryFn: () => getNextMatch(userId ?? undefined),
    enabled: enabled && Boolean(userId),
    staleTime: 1000 * 30,
  });
}