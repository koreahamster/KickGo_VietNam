import { useQuery } from "@tanstack/react-query";

import { getTeamMembers } from "@/services/team.service";

export function useTeamMembersQuery(teamId: string | null, enabled = true) {
  return useQuery({
    queryKey: ["team-members", teamId],
    queryFn: () => {
      if (!teamId) {
        throw new Error("Team id is required.");
      }

      return getTeamMembers(teamId);
    },
    enabled: enabled && Boolean(teamId),
  });
}
