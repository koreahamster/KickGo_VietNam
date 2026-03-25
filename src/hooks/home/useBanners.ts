import { useQuery } from "@tanstack/react-query";

import { getBanners } from "@/services/home.service";

export function useBanners() {
  return useQuery({
    queryKey: ["home", "banners"],
    queryFn: getBanners,
    staleTime: 1000 * 60 * 5,
  });
}