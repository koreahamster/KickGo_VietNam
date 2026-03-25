import { useQuery } from "@tanstack/react-query";

import { getPendingActions } from "@/services/home.service";

export function usePendingActions(userId: string | null, enabled: boolean) {
  return useQuery({
    queryKey: ["home", "pending-actions", userId],
    queryFn: () => getPendingActions(userId ?? undefined),
    enabled: enabled && Boolean(userId),
    staleTime: 1000 * 30,
  });
}