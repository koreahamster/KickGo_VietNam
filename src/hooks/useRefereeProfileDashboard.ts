import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";
import { getMyProfileBundle, uploadAvatar } from "@/services/profile.service";
import type { RequestAvatarUploadResult, UploadAvatarInput } from "@/types/profile.types";

type UseRefereeProfileDashboardOptions = {
  userId: string | null;
  enabled: boolean;
};

type RefereeRecentMatch = {
  id: string;
  scheduled_at: string | null;
  venue_name: string | null;
  status: string;
  home_team_name: string;
  away_team_name: string;
};

type RefereeStats = {
  totalAssignments: number;
  monthAssignments: number;
  monthRevenue: number;
};

type UseRefereeProfileDashboardResult = {
  profileBundle: Awaited<ReturnType<typeof getMyProfileBundle>> | null;
  recentMatches: RefereeRecentMatch[];
  stats: RefereeStats;
  isLoading: boolean;
  isUploadingAvatar: boolean;
  errorMessage: string | null;
  uploadAvatar: (input: UploadAvatarInput) => Promise<RequestAvatarUploadResult>;
  refetchAll: () => Promise<void>;
};

type RawTeamName = { name: string | null } | Array<{ name: string | null }> | null;

type RawRecentMatchRow = {
  id: string;
  scheduled_at: string | null;
  venue_name: string | null;
  status: string | null;
  home_team: RawTeamName;
  away_team: RawTeamName;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Could not load referee profile.";
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

function getTeamName(value: RawTeamName): string {
  if (Array.isArray(value)) {
    return value[0]?.name ?? "-";
  }

  return value?.name ?? "-";
}

async function getRecentRefereeMatches(userId: string): Promise<RefereeRecentMatch[]> {
  const result = await supabase
    .from("matches")
    .select(
      "id, scheduled_at, venue_name, status, home_team:teams!matches_home_team_id_fkey(name), away_team:teams!matches_away_team_id_fkey(name)",
    )
    .eq("referee_user_id", userId)
    .order("scheduled_at", { ascending: false })
    .limit(3);

  if (result.error) {
    throw new Error(result.error.message);
  }

  const rows = (result.data ?? []) as RawRecentMatchRow[];

  return rows.map((row) => ({
    id: row.id,
    scheduled_at: row.scheduled_at,
    venue_name: row.venue_name,
    status: row.status ?? "pending",
    home_team_name: getTeamName(row.home_team),
    away_team_name: getTeamName(row.away_team),
  }));
}

async function getRefereeStats(userId: string): Promise<RefereeStats> {
  const range = getMonthRange();
  const [totalResult, monthResult, revenueResult] = await Promise.all([
    supabase
      .from("matches")
      .select("id", { count: "exact", head: true })
      .eq("referee_user_id", userId),
    supabase
      .from("matches")
      .select("id", { count: "exact", head: true })
      .eq("referee_user_id", userId)
      .gte("scheduled_at", range.start)
      .lt("scheduled_at", range.end),
    supabase
      .from("wallet_transactions")
      .select("amount")
      .eq("user_id", userId)
      .eq("type", "match_fee")
      .eq("status", "confirmed")
      .gte("created_at", range.start)
      .lt("created_at", range.end),
  ]);

  if (totalResult.error) {
    throw new Error(totalResult.error.message);
  }

  if (monthResult.error) {
    throw new Error(monthResult.error.message);
  }

  if (revenueResult.error) {
    throw new Error(revenueResult.error.message);
  }

  const monthRevenue = (revenueResult.data ?? []).reduce<number>((sum, row) => {
    const amount = typeof row.amount === "number" ? row.amount : Number(row.amount ?? 0);
    return sum + (Number.isFinite(amount) ? amount : 0);
  }, 0);

  return {
    totalAssignments: totalResult.count ?? 0,
    monthAssignments: monthResult.count ?? 0,
    monthRevenue,
  };
}

export function useRefereeProfileDashboard(
  options: UseRefereeProfileDashboardOptions,
): UseRefereeProfileDashboardResult {
  const { userId, enabled } = options;
  const queryClient = useQueryClient();
  const isEnabled = enabled && Boolean(userId);

  const profileQuery = useQuery({
    queryKey: ["profile", userId],
    queryFn: getMyProfileBundle,
    enabled: isEnabled,
  });

  const recentMatchesQuery = useQuery({
    queryKey: ["referee-recent-matches", userId],
    queryFn: () => getRecentRefereeMatches(userId as string),
    enabled: isEnabled,
  });

  const statsQuery = useQuery({
    queryKey: ["referee-stats", userId],
    queryFn: () => getRefereeStats(userId as string),
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

  const firstError = profileQuery.error ?? recentMatchesQuery.error ?? statsQuery.error;

  return {
    profileBundle: profileQuery.data ?? null,
    recentMatches: recentMatchesQuery.data ?? [],
    stats: statsQuery.data ?? {
      totalAssignments: 0,
      monthAssignments: 0,
      monthRevenue: 0,
    },
    isLoading: profileQuery.isLoading || recentMatchesQuery.isLoading || statsQuery.isLoading,
    isUploadingAvatar: uploadAvatarMutation.isPending,
    errorMessage: firstError ? getErrorMessage(firstError) : null,
    uploadAvatar: (input) => uploadAvatarMutation.mutateAsync(input),
    refetchAll: async () => {
      await Promise.all([profileQuery.refetch(), recentMatchesQuery.refetch(), statsQuery.refetch()]);
    },
  };
}

