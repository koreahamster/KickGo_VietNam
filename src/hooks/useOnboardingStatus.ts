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
  activeRole: AccountType | null;
  isLoading: boolean;
  isOnboardingComplete: boolean;
  onboardingCTA: OnboardingCTA | null;
  facilityCount: number;
  showFacilityRegistrationCTA: boolean;
};

type PlayerProfileLite = {
  position_first: string | null;
};

type RefereeProfileLite = {
  user_id: string;
};

async function getPlayerProfile(userId: string): Promise<PlayerProfileLite | null> {
  const result = await supabase.from("player_profiles").select("position_first").eq("user_id", userId).maybeSingle();
  if (result.error) throw new Error(result.error.message);
  return result.data ?? null;
}

async function getRefereeProfile(userId: string): Promise<RefereeProfileLite | null> {
  const result = await supabase.from("referee_profiles").select("user_id").eq("user_id", userId).maybeSingle();
  if (result.error) throw new Error(result.error.message);
  return result.data ?? null;
}

async function getMyFacilityCount(userId: string): Promise<number> {
  const result = await supabase
    .from("facility_managers")
    .select("facility_id", { count: "exact", head: true })
    .eq("user_id", userId);
  if (result.error) throw new Error(result.error.message);
  return result.count ?? 0;
}

export function useOnboardingStatus(options: UseOnboardingStatusOptions): UseOnboardingStatusResult {
  const { userId, enabled, hasCommonProfile } = options;
  const activeRole = useRoleStore((state) => state.activeRole);
  const canQuery = enabled && hasCommonProfile && Boolean(userId) && Boolean(activeRole);

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
    if (!hasCommonProfile) return false;
    if (!activeRole) return true;
    if (activeRole === "player") return Boolean(playerProfileQuery.data?.position_first);
    if (activeRole === "referee") return Boolean(refereeProfileQuery.data);
    if (activeRole === "facility_manager") return true;
    return false;
  })();

  const onboardingCTA = (() => {
    if (!hasCommonProfile || !activeRole || isOnboardingComplete) {
      return null;
    }

    if (activeRole === "player") {
      return {
        title: "Complete your player profile",
        description: "Set your preferred position to unlock team and match data.",
        buttonLabel: "Complete profile",
        route: "/(onboarding)/player" as const,
      };
    }

    if (activeRole === "referee") {
      return {
        title: "Register your referee profile",
        description: "Create a referee profile to receive match assignments.",
        buttonLabel: "Register referee",
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