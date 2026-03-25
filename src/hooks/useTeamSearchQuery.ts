import { useQuery } from "@tanstack/react-query";
import { searchPublicTeams } from "@/services/team.service";
export function useTeamSearchQuery(keyword: string, enabled = true) {
  const normalizedKeyword = keyword.trim();
  return useQuery({
    queryKey: ["team", "find", normalizedKeyword],
    queryFn: () => searchPublicTeams(normalizedKeyword),
    enabled,
    staleTime: 1000 * 30,
  });
}