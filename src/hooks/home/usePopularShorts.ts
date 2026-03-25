import { useQuery } from "@tanstack/react-query";

import { getPopularShorts } from "@/services/home.service";

export function usePopularShorts() {
  return useQuery({
    queryKey: ["home", "popular-shorts"],
    queryFn: getPopularShorts,
    staleTime: 1000 * 60 * 5,
  });
}