import { useQuery } from "@tanstack/react-query";

import { getTeamDetail } from "@/services/team.service";

export function useTeamDetailQuery(teamId: string | null, enabled = true) {
  return useQuery({
    queryKey: ["team", teamId],
    queryFn: () => {
      if (!teamId) {
        throw new Error("Team id is required.");
      }

      return getTeamDetail(teamId);
    },
    enabled: enabled && Boolean(teamId),
  });
}