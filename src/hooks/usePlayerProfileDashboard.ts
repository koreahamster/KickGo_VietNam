import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getMyProfileBundle, updatePlayerProfile, uploadAvatar } from "@/services/profile.service";
import { getMyTeams } from "@/services/team.service";
import type {
  PlayerProfileRecord,
  RequestAvatarUploadResult,
  RoleProfileResult,
  UpdatePlayerProfileInput,
  UploadAvatarInput,
} from "@/types/profile.types";
import type { TeamMembershipRecord } from "@/types/team.types";

type UsePlayerProfileDashboardOptions = {
  userId: string | null;
  enabled: boolean;
};

export type PlayerProfileDashboardResult = {
  profileBundle: Awaited<ReturnType<typeof getMyProfileBundle>> | null;
  teams: TeamMembershipRecord[];
  isLoading: boolean;
  isUploadingAvatar: boolean;
  isUpdatingPlayerProfile: boolean;
  errorMessage: string | null;
  uploadAvatar: (input: UploadAvatarInput) => Promise<RequestAvatarUploadResult>;
  updatePlayerProfile: (input: UpdatePlayerProfileInput) => Promise<RoleProfileResult>;
  refetchAll: () => Promise<void>;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "\uD504\uB85C\uD544 \uC815\uBCF4\uB97C \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.";
}

function mergePlayerProfile(current: PlayerProfileRecord | null, input: UpdatePlayerProfileInput): PlayerProfileRecord | null {
  if (!current) {
    return current;
  }

  return {
    ...current,
    preferred_position: input.preferredPosition ?? current.preferred_position,
    preferred_foot: input.preferredFoot ?? current.preferred_foot,
    dominant_foot: input.dominantFoot ?? current.dominant_foot,
    top_size: input.topSize ?? current.top_size,
    shoe_size: input.shoeSize ?? current.shoe_size,
    left_foot_skill: input.leftFootSkill ?? current.left_foot_skill,
    right_foot_skill: input.rightFootSkill ?? current.right_foot_skill,
    play_styles: input.playStyles ?? current.play_styles,
  };
}

export function usePlayerProfileDashboard(
  options: UsePlayerProfileDashboardOptions,
): PlayerProfileDashboardResult {
  const { userId, enabled } = options;
  const queryClient = useQueryClient();
  const isEnabled = enabled && Boolean(userId);

  const profileQuery = useQuery({
    queryKey: ["profile", userId],
    queryFn: getMyProfileBundle,
    enabled: isEnabled,
  });

  const teamsQuery = useQuery({
    queryKey: ["team-memberships", userId],
    queryFn: getMyTeams,
    enabled: isEnabled,
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: (input: UploadAvatarInput) => uploadAvatar(input),
    onSuccess: (result) => {
      queryClient.setQueryData<Awaited<ReturnType<typeof getMyProfileBundle>> | undefined>(
        ["profile", userId],
        (current) => {
          if (!current || !current.profile) {
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

  const updatePlayerProfileMutation = useMutation({
    mutationFn: (input: UpdatePlayerProfileInput) => updatePlayerProfile(input),
    onSuccess: (_, variables) => {
      queryClient.setQueryData<Awaited<ReturnType<typeof getMyProfileBundle>> | undefined>(
        ["profile", userId],
        (current) => {
          if (!current) {
            return current;
          }

          return {
            ...current,
            playerProfile: mergePlayerProfile(current.playerProfile, variables),
          };
        },
      );
      void queryClient.invalidateQueries({ queryKey: ["profile", userId] });
    },
  });

  const firstError = profileQuery.error ?? teamsQuery.error;

  return {
    profileBundle: profileQuery.data ?? null,
    teams: teamsQuery.data ?? [],
    isLoading: profileQuery.isLoading || teamsQuery.isLoading,
    isUploadingAvatar: uploadAvatarMutation.isPending,
    isUpdatingPlayerProfile: updatePlayerProfileMutation.isPending,
    errorMessage: firstError ? getErrorMessage(firstError) : null,
    uploadAvatar: (input) => uploadAvatarMutation.mutateAsync(input),
    updatePlayerProfile: (input) => updatePlayerProfileMutation.mutateAsync(input),
    refetchAll: async () => {
      await Promise.all([profileQuery.refetch(), teamsQuery.refetch()]);
    },
  };
}
