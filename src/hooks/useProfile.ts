import { useEffect, useMemo, useState } from "react";

import { saveBootstrapCache } from "@/core/lib/bootstrap-cache";
import { bootstrapDataToProfileBundle, profileBundleToBootstrapData } from "@/core/types/bootstrap.types";
import { getOnboardingRoute, getOnboardingStep, getPendingRoleOnboarding } from "@/lib/onboarding";
import {
  addAccountType as addAccountTypeService,
  createPlayerProfile as createPlayerProfileService,
  createProfile as createProfileService,
  createRefereeProfile as createRefereeProfileService,
  getMyProfileBundle,
  requestAvatarUpload as requestAvatarUploadService,
  updatePlayerProfile as updatePlayerProfileService,
  updateProfile as updateProfileService,
  updateProfileVisibility as updateProfileVisibilityService,
  uploadAvatar as uploadAvatarService,
} from "@/services/profile.service";
import { useBootstrapStore } from "@/store/bootstrap.store";
import type {
  AccountType,
  CreateCommonProfileInput,
  CreatePlayerProfileInput,
  CreateProfileResult,
  PlayerProfileRecord,
  ProfileBundle,
  RequestAvatarUploadInput,
  RequestAvatarUploadResult,
  RoleProfileResult,
  SupportedVisibility,
  UpdateCommonProfileInput,
  UpdatePlayerProfileInput,
  UploadAvatarInput,
} from "@/types/profile.types";

type UseProfileOptions = {
  enabled?: boolean;
};

type UseProfileResult = {
  profileBundle: ProfileBundle;
  hasProfile: boolean;
  accountTypes: AccountType[];
  playerProfile: PlayerProfileRecord | null;
  pendingRoleOnboarding: AccountType[];
  onboardingStep: "create-profile" | "role-onboarding" | "done";
  nextOnboardingRoute: "/(onboarding)/create-profile" | "/(onboarding)/role-onboarding" | "/";
  isProfileLoading: boolean;
  isSubmittingProfile: boolean;
  profileErrorMessage: string | null;
  profileStatusMessage: string | null;
  loadProfileBundle: () => Promise<ProfileBundle>;
  createCommonProfile: (input: CreateCommonProfileInput) => Promise<CreateProfileResult | null>;
  updateCommonProfile: (input: UpdateCommonProfileInput) => Promise<void>;
  requestAvatarUpload: (input: RequestAvatarUploadInput) => Promise<RequestAvatarUploadResult>;
  uploadAvatar: (input: UploadAvatarInput) => Promise<RequestAvatarUploadResult>;
  updateProfileVisibility: (visibility: SupportedVisibility) => Promise<void>;
  addAccountType: (type: AccountType) => Promise<void>;
  createPlayerProfile: (input: CreatePlayerProfileInput) => Promise<RoleProfileResult>;
  updatePlayerProfile: (input: UpdatePlayerProfileInput) => Promise<RoleProfileResult>;
  createRefereeProfile: () => Promise<RoleProfileResult>;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Profile request failed.";
}

function isProfileExistsError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  return error.message.includes("profile_exists") || error.message.includes("profile already exists");
}

function serializeProfileBundle(bundle: ProfileBundle): string {
  return JSON.stringify(bundle);
}

const EMPTY_BUNDLE: ProfileBundle = {
  profile: null,
  accountTypes: [],
  playerProfile: null,
  refereeProfile: null,
};

export function useProfile(options?: UseProfileOptions): UseProfileResult {
  const enabled = options?.enabled ?? true;
  const bootstrapData = useBootstrapStore((state) => state.bootstrapData);
  const setBootstrap = useBootstrapStore((state) => state.setBootstrap);
  const cachedBundle = useMemo(
    () => (bootstrapData ? bootstrapDataToProfileBundle(bootstrapData) : EMPTY_BUNDLE),
    [bootstrapData],
  );
  const [profileBundle, setProfileBundle] = useState<ProfileBundle>(cachedBundle);
  const [isProfileLoading, setIsProfileLoading] = useState<boolean>(enabled && !bootstrapData);
  const [isSubmittingProfile, setIsSubmittingProfile] = useState<boolean>(false);
  const [profileErrorMessage, setProfileErrorMessage] = useState<string | null>(null);
  const [profileStatusMessage, setProfileStatusMessage] = useState<string | null>(null);

  const syncBootstrap = (nextBundle: ProfileBundle): void => {
    const nextBootstrap = profileBundleToBootstrapData(nextBundle);
    setBootstrap(nextBootstrap);
    saveBootstrapCache(nextBootstrap);
  };

  const loadProfileBundle = async (): Promise<ProfileBundle> => {
    if (!enabled) {
      setProfileBundle(EMPTY_BUNDLE);
      setProfileErrorMessage(null);
      setProfileStatusMessage(null);
      setIsProfileLoading(false);
      return EMPTY_BUNDLE;
    }

    try {
      setIsProfileLoading(true);
      setProfileErrorMessage(null);
      const nextBundle = await getMyProfileBundle();
      setProfileBundle(nextBundle);
      syncBootstrap(nextBundle);
      return nextBundle;
    } catch (error: unknown) {
      setProfileErrorMessage(getErrorMessage(error));
      return EMPTY_BUNDLE;
    } finally {
      setIsProfileLoading(false);
    }
  };

  useEffect(() => {
    if (!enabled) {
      setProfileBundle(EMPTY_BUNDLE);
      setIsProfileLoading(false);
      return;
    }

    if (serializeProfileBundle(profileBundle) !== serializeProfileBundle(cachedBundle)) {
      setProfileBundle(cachedBundle);
    }

    if (bootstrapData) {
      setIsProfileLoading(false);
    }
  }, [bootstrapData, cachedBundle, enabled, profileBundle]);

  useEffect(() => {
    void loadProfileBundle();
  }, [enabled]);

  const runMutation = async <TResult>(
    action: () => Promise<TResult>,
    successMessage: string,
    afterSuccess?: (result: TResult) => void,
  ): Promise<TResult> => {
    try {
      setIsSubmittingProfile(true);
      setProfileErrorMessage(null);
      setProfileStatusMessage(null);
      const result = await action();
      afterSuccess?.(result);
      await loadProfileBundle();
      setProfileStatusMessage(successMessage);
      return result;
    } catch (error: unknown) {
      setProfileErrorMessage(getErrorMessage(error));
      throw error;
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  const pendingRoleOnboarding = useMemo(() => getPendingRoleOnboarding(profileBundle), [profileBundle]);
  const onboardingStep = useMemo(() => getOnboardingStep(profileBundle), [profileBundle]);
  const nextOnboardingRoute = useMemo(() => getOnboardingRoute(profileBundle), [profileBundle]);

  return {
    profileBundle,
    hasProfile: Boolean(profileBundle.profile),
    accountTypes: profileBundle.accountTypes,
    playerProfile: profileBundle.playerProfile,
    pendingRoleOnboarding,
    onboardingStep,
    nextOnboardingRoute,
    isProfileLoading,
    isSubmittingProfile,
    profileErrorMessage,
    profileStatusMessage,
    loadProfileBundle,
    createCommonProfile: async (input) => {
      try {
        return await runMutation(
          async () => createProfileService(input),
          "Common profile saved.",
          (result) => {
            setProfileBundle((current) => ({
              ...current,
              profile: {
                id: result.profile_id,
                display_name: input.displayName,
                birth_year: input.birthYear,
                avatar_url: current.profile?.avatar_url ?? null,
                bio: input.bio || null,
                phone: current.profile?.phone ?? null,
                is_phone_verified: current.profile?.is_phone_verified ?? false,
                country_code: input.countryCode,
                province_code: input.provinceCode,
                district_code: input.districtCode,
                preferred_language: input.preferredLanguage,
                visibility: input.visibility ?? "members_only",
              },
              accountTypes: current.accountTypes.includes(input.initialAccountType)
                ? current.accountTypes
                : [...current.accountTypes, input.initialAccountType],
            }));
          },
        );
      } catch (error: unknown) {
        if (!isProfileExistsError(error)) {
          throw error;
        }

        await loadProfileBundle();
        setProfileErrorMessage(null);
        setProfileStatusMessage("Existing common profile loaded.");
        return null;
      }
    },
    updateCommonProfile: async (input) =>
      runMutation(
        async () => {
          await updateProfileService(input);
        },
        "Profile updated.",
      ),
    requestAvatarUpload: async (input) =>
      runMutation(
        async () => requestAvatarUploadService(input),
        "Avatar upload URL prepared.",
        (result) => {
          setProfileBundle((current) => ({
            ...current,
            profile: current.profile
              ? {
                  ...current.profile,
                  avatar_url: result.avatar_url,
                }
              : current.profile,
          }));
        },
      ),
    uploadAvatar: async (input) =>
      runMutation(
        async () => uploadAvatarService(input),
        "Avatar updated.",
        (result) => {
          setProfileBundle((current) => ({
            ...current,
            profile: current.profile
              ? {
                  ...current.profile,
                  avatar_url: result.avatar_url,
                }
              : current.profile,
          }));
        },
      ),
    updateProfileVisibility: async (visibility) => {
      await runMutation(
        async () => updateProfileVisibilityService(visibility),
        "Profile visibility updated.",
        (result) => {
          setProfileBundle((current) => ({
            ...current,
            profile: current.profile
              ? {
                  ...current.profile,
                  visibility: result.visibility,
                }
              : current.profile,
          }));
        },
      );
    },
    addAccountType: async (type) =>
      runMutation(
        async () => {
          await addAccountTypeService(type);
        },
        "Account role added.",
      ),
    createPlayerProfile: async (input) =>
      runMutation(
        async () => createPlayerProfileService(input),
        "Player profile saved.",
        () => {
          setProfileBundle((current) => ({
            ...current,
            playerProfile: {
              user_id: current.profile?.id ?? "",
              preferred_position: input.preferredPosition,
              position_first: input.preferredPosition,
              position_second: current.playerProfile?.position_second ?? null,
              position_third: current.playerProfile?.position_third ?? null,
              preferred_foot: input.preferredFoot,
              dominant_foot: input.dominantFoot,
              top_size: input.topSize || null,
              shoe_size: input.shoeSize || null,
              skill_tier: current.playerProfile?.skill_tier ?? 0,
              reputation_score: current.playerProfile?.reputation_score ?? 0,
              stat_stamina: current.playerProfile?.stat_stamina ?? 50,
              stat_dribble: current.playerProfile?.stat_dribble ?? 50,
              stat_shooting: current.playerProfile?.stat_shooting ?? 50,
              stat_passing: current.playerProfile?.stat_passing ?? 50,
              stat_defense: current.playerProfile?.stat_defense ?? 50,
              stat_speed: current.playerProfile?.stat_speed ?? 50,
              left_foot_skill: current.playerProfile?.left_foot_skill ?? 3,
              right_foot_skill: current.playerProfile?.right_foot_skill ?? 3,
              play_styles: current.playerProfile?.play_styles ?? [],
            },
          }));
        },
      ),
    updatePlayerProfile: async (input) =>
      runMutation(
        async () => updatePlayerProfileService(input),
        "Player profile updated.",
        () => {
          setProfileBundle((current) => ({
            ...current,
            playerProfile: current.playerProfile
              ? {
                  ...current.playerProfile,
                  preferred_position: input.preferredPosition ?? input.positionFirst ?? current.playerProfile.preferred_position,
                  position_first: input.positionFirst ?? current.playerProfile.position_first,
                  position_second: input.positionSecond === undefined ? current.playerProfile.position_second : input.positionSecond,
                  position_third: input.positionThird === undefined ? current.playerProfile.position_third : input.positionThird,
                  preferred_foot: input.preferredFoot ?? current.playerProfile.preferred_foot,
                  dominant_foot: input.dominantFoot ?? current.playerProfile.dominant_foot,
                  top_size: input.topSize === undefined ? current.playerProfile.top_size : input.topSize,
                  shoe_size: input.shoeSize === undefined ? current.playerProfile.shoe_size : input.shoeSize,
                  stat_stamina: input.statStamina ?? current.playerProfile.stat_stamina,
                  stat_dribble: input.statDribble ?? current.playerProfile.stat_dribble,
                  stat_shooting: input.statShooting ?? current.playerProfile.stat_shooting,
                  stat_passing: input.statPassing ?? current.playerProfile.stat_passing,
                  stat_defense: input.statDefense ?? current.playerProfile.stat_defense,
                  stat_speed: input.statSpeed ?? current.playerProfile.stat_speed,
                  left_foot_skill: input.leftFootSkill ?? current.playerProfile.left_foot_skill,
                  right_foot_skill: input.rightFootSkill ?? current.playerProfile.right_foot_skill,
                  play_styles: input.playStyles ?? current.playerProfile.play_styles,
                }
              : current.playerProfile,
          }));
        },
      ),
    createRefereeProfile: async () =>
      runMutation(
        async () => createRefereeProfileService(),
        "Referee profile created.",
        () => {
          setProfileBundle((current) => ({
            ...current,
            refereeProfile: {
              user_id: current.profile?.id ?? "",
              average_rating: current.refereeProfile?.average_rating ?? null,
              rating_count: current.refereeProfile?.rating_count ?? 0,
            },
          }));
        },
      ),
  };
}
