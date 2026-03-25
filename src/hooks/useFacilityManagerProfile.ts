import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";
import { getMyProfileBundle, uploadAvatar } from "@/services/profile.service";
import type { RequestAvatarUploadResult, UploadAvatarInput } from "@/types/profile.types";

type FacilitySummary = {
  id: string;
  name: string;
  country_code: string;
  province_code: string;
  district_code: string;
};

type UseFacilityManagerProfileOptions = {
  userId: string | null;
  enabled: boolean;
};

type FacilityManagerStats = {
  registeredFacilities: number;
  todayBookings: number;
  monthlyRevenue: number;
};

type UseFacilityManagerProfileResult = {
  profileBundle: Awaited<ReturnType<typeof getMyProfileBundle>> | null;
  facilities: FacilitySummary[];
  stats: FacilityManagerStats;
  isLoading: boolean;
  isUploadingAvatar: boolean;
  errorMessage: string | null;
  uploadAvatar: (input: UploadAvatarInput) => Promise<RequestAvatarUploadResult>;
  refetchAll: () => Promise<void>;
};

type RawFacilityManagerRow = {
  facility_id: string;
  facilities:
    | FacilitySummary
    | FacilitySummary[]
    | null;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Could not load facility manager profile.";
}

function getMonthRange(): { start: string; end: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0);

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

function normalizeFacility(value: RawFacilityManagerRow["facilities"]): FacilitySummary | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value;
}

async function getManagedFacilities(userId: string): Promise<FacilitySummary[]> {
  const result = await supabase
    .from("facility_managers")
    .select("facility_id, facilities(id, name, country_code, province_code, district_code)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (result.error) {
    throw new Error(result.error.message);
  }

  const rows = (result.data ?? []) as RawFacilityManagerRow[];

  return rows
    .map((row) => normalizeFacility(row.facilities))
    .filter((facility): facility is FacilitySummary => facility !== null);
}

async function getFacilityManagerRevenue(userId: string): Promise<number> {
  const range = getMonthRange();
  const result = await supabase
    .from("wallet_transactions")
    .select("amount")
    .eq("user_id", userId)
    .eq("type", "facility_payment")
    .eq("status", "confirmed")
    .gte("created_at", range.start)
    .lt("created_at", range.end);

  if (result.error) {
    throw new Error(result.error.message);
  }

  return (result.data ?? []).reduce<number>((sum, row) => {
    const amount = typeof row.amount === "number" ? row.amount : Number(row.amount ?? 0);
    return sum + (Number.isFinite(amount) ? amount : 0);
  }, 0);
}

export function useFacilityManagerProfile(
  options: UseFacilityManagerProfileOptions,
): UseFacilityManagerProfileResult {
  const { userId, enabled } = options;
  const queryClient = useQueryClient();
  const isEnabled = enabled && Boolean(userId);

  const profileQuery = useQuery({
    queryKey: ["profile", userId],
    queryFn: getMyProfileBundle,
    enabled: isEnabled,
  });

  const facilitiesQuery = useQuery({
    queryKey: ["facility-manager-facilities", userId],
    queryFn: () => getManagedFacilities(userId as string),
    enabled: isEnabled,
  });

  const revenueQuery = useQuery({
    queryKey: ["facility-manager-revenue", userId],
    queryFn: () => getFacilityManagerRevenue(userId as string),
    enabled: isEnabled,
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: (input: UploadAvatarInput) => uploadAvatar(input),
    onSuccess: (result) => {
      queryClient.setQueryData<Awaited<ReturnType<typeof getMyProfileBundle>> | undefined>(
        ["profile", userId],
        (current) => {
          if (!current?.profile) {
            return current;
          }

          return {
            ...current,
            profile: {
              ...current.profile,
              avatar_url: result.avatar_url,
            },
          };
        },
      );
      void queryClient.invalidateQueries({ queryKey: ["profile", userId] });
    },
  });

  const firstError = profileQuery.error ?? facilitiesQuery.error ?? revenueQuery.error;

  return {
    profileBundle: profileQuery.data ?? null,
    facilities: facilitiesQuery.data ?? [],
    stats: {
      registeredFacilities: facilitiesQuery.data?.length ?? 0,
      todayBookings: 0,
      monthlyRevenue: revenueQuery.data ?? 0,
    },
    isLoading: profileQuery.isLoading || facilitiesQuery.isLoading || revenueQuery.isLoading,
    isUploadingAvatar: uploadAvatarMutation.isPending,
    errorMessage: firstError ? getErrorMessage(firstError) : null,
    uploadAvatar: (input) => uploadAvatarMutation.mutateAsync(input),
    refetchAll: async () => {
      await Promise.all([profileQuery.refetch(), facilitiesQuery.refetch(), revenueQuery.refetch()]);
    },
  };
}

