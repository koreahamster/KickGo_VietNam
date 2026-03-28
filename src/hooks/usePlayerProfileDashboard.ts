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

type ProfileBundleResult = Awaited<ReturnType<typeof getMyProfileBundle>>;
type UpdateContext = {
  previousProfile?: ProfileBundleResult;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Could not load the player profile.";
}

function hasOwn(input: UpdatePlayerProfileInput, key: keyof UpdatePlayerProfileInput): boolean {
  return Object.prototype.hasOwnProperty.call(input, key);
}

function mergePlayerProfile(current: PlayerProfileRecord | null, input: UpdatePlayerProfileInput): PlayerProfileRecord | null {
  if (!current) {
    return current;
  }

  const next: PlayerProfileRecord = { ...current };

  if (hasOwn(input, "preferredPosition") && input.preferredPosition !== undefined) {
    next.preferred_position = input.preferredPosition;
  }

  if (hasOwn(input, "positionFirst")) {
    next.position_first = input.positionFirst ?? null;
    next.preferred_position = input.positionFirst ?? null;
  }

  if (hasOwn(input, "positionSecond")) {
    next.position_second = input.positionSecond ?? null;
  }

  if (hasOwn(input, "positionThird")) {
    next.position_third = input.positionThird ?? null;
  }

  if (hasOwn(input, "preferredFoot") && input.preferredFoot !== undefined) {
    next.preferred_foot = input.preferredFoot;
  }

  if (hasOwn(input, "dominantFoot") && input.dominantFoot !== undefined) {
    next.dominant_foot = input.dominantFoot;
  }

  if (hasOwn(input, "topSize")) {
    next.top_size = input.topSize ?? null;
  }

  if (hasOwn(input, "shoeSize")) {
    next.shoe_size = input.shoeSize ?? null;
  }

  if (hasOwn(input, "statStamina") && typeof input.statStamina === "number") {
    next.stat_stamina = input.statStamina;
  }

  if (hasOwn(input, "statDribble") && typeof input.statDribble === "number") {
    next.stat_dribble = input.statDribble;
  }

  if (hasOwn(input, "statShooting") && typeof input.statShooting === "number") {
    next.stat_shooting = input.statShooting;
  }

  if (hasOwn(input, "statPassing") && typeof input.statPassing === "number") {
    next.stat_passing = input.statPassing;
  }

  if (hasOwn(input, "statDefense") && typeof input.statDefense === "number") {
    next.stat_defense = input.statDefense;
  }

  if (hasOwn(input, "statSpeed") && typeof input.statSpeed === "number") {
    next.stat_speed = input.statSpeed;
  }

  if (hasOwn(input, "leftFootSkill") && typeof input.leftFootSkill === "number") {
    next.left_foot_skill = input.leftFootSkill;
  }

  if (hasOwn(input, "rightFootSkill") && typeof input.rightFootSkill === "number") {
    next.right_foot_skill = input.rightFootSkill;
  }

  if (hasOwn(input, "playStyles") && input.playStyles !== undefined) {
    next.play_styles = input.playStyles;
  }

  return next;
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
      queryClient.setQueryData<ProfileBundleResult | undefined>(["profile", userId], (current) => {
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
      });
      void queryClient.invalidateQueries({ queryKey: ["profile", userId] });
    },
  });

  const updatePlayerProfileMutation = useMutation<RoleProfileResult, Error, UpdatePlayerProfileInput, UpdateContext>({
    mutationFn: (input: UpdatePlayerProfileInput) => updatePlayerProfile(input),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ["profile", userId] });
      const previousProfile = queryClient.getQueryData<ProfileBundleResult>(["profile", userId]);

      queryClient.setQueryData<ProfileBundleResult | undefined>(["profile", userId], (current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          playerProfile: mergePlayerProfile(current.playerProfile, variables),
        };
      });

      return { previousProfile };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(["profile", userId], context.previousProfile);
      }
    },
    onSettled: () => {
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