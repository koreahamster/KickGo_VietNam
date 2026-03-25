import type { AccountType, ProfileBundle } from "@/types/profile.types";

export type OnboardingStep = "create-profile" | "role-onboarding" | "done";

export function getPendingRoleOnboarding(bundle: ProfileBundle): AccountType[] {
  const pending: AccountType[] = [];

  if (bundle.accountTypes.includes("player") && !bundle.playerProfile) {
    pending.push("player");
  }

  if (bundle.accountTypes.includes("referee") && !bundle.refereeProfile) {
    pending.push("referee");
  }

  return pending;
}

export function hasCompletedCommonProfile(bundle: ProfileBundle): boolean {
  return Boolean(bundle.profile?.id);
}

export function getOnboardingStep(bundle: ProfileBundle): OnboardingStep {
  if (!hasCompletedCommonProfile(bundle)) {
    return "create-profile";
  }

  if (getPendingRoleOnboarding(bundle).length > 0) {
    return "role-onboarding";
  }

  return "done";
}

export function getOnboardingRoute(
  bundle: ProfileBundle
): "/(onboarding)/create-profile" | "/(onboarding)/role-onboarding" | "/" {
  const nextStep = getOnboardingStep(bundle);

  if (nextStep === "create-profile") {
    return "/(onboarding)/create-profile";
  }

  if (nextStep === "role-onboarding") {
    return "/(onboarding)/role-onboarding";
  }

  return "/";
}