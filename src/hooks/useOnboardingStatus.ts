import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";
import { useRoleStore } from "@/store/role-switch.store";
import type { AccountType } from "@/types/profile.types";

type UseOnboardingStatusOptions = {
  userId: string | null;
  enabled: boolean;
  hasCommonProfile: boolean;
};

type OnboardingCTA = {
  title: string;
  description: string;
  buttonLabel: string;
  route: "/(onboarding)/player" | "/(onboarding)/referee";
};

type UseOnboardingStatusResult = {
  activeRole: AccountType;
  isLoading: boolean;
  isOnboardingComplete: boolean;
  onboardingCTA: OnboardingCTA | null;
  facilityCount: number;
  showFacilityRegistrationCTA: boolean;
};

type PlayerProfileLite = {
  preferred_position: string | null;
};

type RefereeProfileLite = {
  user_id: string;
};

async function getPlayerProfile(userId: string): Promise<PlayerProfileLite | null> {
  const result = await supabase
    .from("player_profiles")
    .select("preferred_position")
    .eq("user_id", userId)
    .maybeSingle();

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data ?? null;
}

async function getRefereeProfile(userId: string): Promise<RefereeProfileLite | null> {
  const result = await supabase
    .from("referee_profiles")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data ?? null;
}

async function getMyFacilityCount(userId: string): Promise<number> {
  const result = await supabase
    .from("facility_managers")
    .select("facility_id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.count ?? 0;
}

export function useOnboardingStatus(
  options: UseOnboardingStatusOptions,
): UseOnboardingStatusResult {
  const { userId, enabled, hasCommonProfile } = options;
  const activeRole = useRoleStore((state) => state.activeRole);
  const canQuery = enabled && hasCommonProfile && Boolean(userId);

  const playerProfileQuery = useQuery({
    queryKey: ["onboarding-status", "player-profile", userId],
    queryFn: () => getPlayerProfile(userId as string),
    enabled: canQuery && activeRole === "player",
  });

  const refereeProfileQuery = useQuery({
    queryKey: ["onboarding-status", "referee-profile", userId],
    queryFn: () => getRefereeProfile(userId as string),
    enabled: canQuery && activeRole === "referee",
  });

  const facilityCountQuery = useQuery({
    queryKey: ["onboarding-status", "facility-count", userId],
    queryFn: () => getMyFacilityCount(userId as string),
    enabled: canQuery && activeRole === "facility_manager",
  });

  const isLoading =
    (activeRole === "player" && playerProfileQuery.isLoading) ||
    (activeRole === "referee" && refereeProfileQuery.isLoading) ||
    (activeRole === "facility_manager" && facilityCountQuery.isLoading);

  const isOnboardingComplete = (() => {
    if (!hasCommonProfile) {
      return false;
    }

    if (activeRole === "player") {
      return Boolean(playerProfileQuery.data?.preferred_position);
    }

    if (activeRole === "referee") {
      return Boolean(refereeProfileQuery.data);
    }

    if (activeRole === "facility_manager") {
      return true;
    }

    return false;
  })();

  const onboardingCTA = (() => {
    if (!hasCommonProfile) {
      return null;
    }

    if (activeRole === "player" && !isOnboardingComplete) {
      return {
        title: "선수 프로필을 완료해주세요",
        description: "포지션과 능력치를 설정하면 팀과 경기 데이터를 볼 수 있어요.",
        buttonLabel: "프로필 완성하기",
        route: "/(onboarding)/player" as const,
      };
    }

    if (activeRole === "referee" && !isOnboardingComplete) {
      return {
        title: "심판 프로필을 등록해주세요",
        description: "심판 프로필을 등록하면 경기 배정을 받을 수 있어요.",
        buttonLabel: "심판 등록하기",
        route: "/(onboarding)/referee" as const,
      };
    }

    return null;
  })();

  const facilityCount = facilityCountQuery.data ?? 0;

  return {
    activeRole,
    isLoading,
    isOnboardingComplete,
    onboardingCTA,
    facilityCount,
    showFacilityRegistrationCTA: activeRole === "facility_manager" && facilityCount === 0,
  };
}
