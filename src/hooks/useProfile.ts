import { useEffect, useMemo, useState } from "react";

import {
  addAccountType as addAccountTypeService,
  createPlayerProfile as createPlayerProfileService,
  createProfile as createProfileService,
  createRefereeProfile as createRefereeProfileService,
  getMyProfileBundle,
  updatePlayerProfile as updatePlayerProfileService,
  updateProfile as updateProfileService,
} from "@/services/profile.service";
import type {
  AccountType,
  CreateCommonProfileInput,
  CreatePlayerProfileInput,
  CreateProfileResult,
  PlayerProfileRecord,
  ProfileBundle,
  RoleProfileResult,
  UpdateCommonProfileInput,
  UpdatePlayerProfileInput,
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
  isProfileLoading: boolean;
  isSubmittingProfile: boolean;
  profileErrorMessage: string | null;
  profileStatusMessage: string | null;
  loadProfileBundle: () => Promise<ProfileBundle>;
  createCommonProfile: (input: CreateCommonProfileInput) => Promise<CreateProfileResult | null>;
  updateCommonProfile: (input: UpdateCommonProfileInput) => Promise<void>;
  addAccountType: (type: AccountType) => Promise<void>;
  createPlayerProfile: (input: CreatePlayerProfileInput) => Promise<RoleProfileResult>;
  updatePlayerProfile: (input: UpdatePlayerProfileInput) => Promise<RoleProfileResult>;
  createRefereeProfile: () => Promise<RoleProfileResult>;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "프로필 처리 중 오류가 발생했습니다.";
}

function isProfileExistsError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  return error.message.includes("profile_exists") || error.message.includes("이미 공통 프로필이 존재합니다");
}

const EMPTY_BUNDLE: ProfileBundle = {
  profile: null,
  accountTypes: [],
  playerProfile: null,
  refereeProfile: null,
};

export function useProfile(options?: UseProfileOptions): UseProfileResult {
  const enabled = options?.enabled ?? true;
  const [profileBundle, setProfileBundle] = useState<ProfileBundle>(EMPTY_BUNDLE);
  const [isProfileLoading, setIsProfileLoading] = useState<boolean>(enabled);
  const [isSubmittingProfile, setIsSubmittingProfile] = useState<boolean>(false);
  const [profileErrorMessage, setProfileErrorMessage] = useState<string | null>(null);
  const [profileStatusMessage, setProfileStatusMessage] = useState<string | null>(null);

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
      return nextBundle;
    } catch (error: unknown) {
      setProfileErrorMessage(getErrorMessage(error));
      return EMPTY_BUNDLE;
    } finally {
      setIsProfileLoading(false);
    }
  };

  useEffect(() => {
    void loadProfileBundle();
  }, [enabled]);

  const runMutation = async <TResult>(
    action: () => Promise<TResult>,
    successMessage: string,
    afterSuccess?: (result: TResult) => void
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

  const pendingRoleOnboarding = useMemo(() => {
    const pending: AccountType[] = [];

    if (profileBundle.accountTypes.includes("player") && !profileBundle.playerProfile) {
      pending.push("player");
    }

    if (profileBundle.accountTypes.includes("referee") && !profileBundle.refereeProfile) {
      pending.push("referee");
    }

    return pending;
  }, [profileBundle.accountTypes, profileBundle.playerProfile, profileBundle.refereeProfile]);

  return {
    profileBundle,
    hasProfile: Boolean(profileBundle.profile),
    accountTypes: profileBundle.accountTypes,
    playerProfile: profileBundle.playerProfile,
    pendingRoleOnboarding,
    isProfileLoading,
    isSubmittingProfile,
    profileErrorMessage,
    profileStatusMessage,
    loadProfileBundle,
    createCommonProfile: async (input) => {
      try {
        return await runMutation(
          async () => createProfileService(input),
          "공통 프로필이 저장되었습니다.",
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
              },
              accountTypes: current.accountTypes.includes(input.initialAccountType)
                ? current.accountTypes
                : [...current.accountTypes, input.initialAccountType],
            }));
          }
        );
      } catch (error: unknown) {
        if (!isProfileExistsError(error)) {
          throw error;
        }

        await loadProfileBundle();
        setProfileErrorMessage(null);
        setProfileStatusMessage("이미 생성된 공통 프로필을 불러왔습니다.");
        return null;
      }
    },
    updateCommonProfile: async (input) =>
      runMutation(async () => {
        await updateProfileService(input);
      }, "프로필이 수정되었습니다."),
    addAccountType: async (type) =>
      runMutation(async () => {
        await addAccountTypeService(type);
      }, "계정 역할이 추가되었습니다."),
    createPlayerProfile: async (input) =>
      runMutation(
        async () => createPlayerProfileService(input),
        "선수 프로필이 저장되었습니다.",
        () => {
          setProfileBundle((current) => ({
            ...current,
            playerProfile: {
              user_id: current.profile?.id ?? "",
              preferred_position: input.preferredPosition,
              preferred_foot: input.preferredFoot,
              dominant_foot: input.dominantFoot,
              top_size: input.topSize || null,
              shoe_size: input.shoeSize || null,
              skill_tier: current.playerProfile?.skill_tier ?? 0,
              reputation_score: current.playerProfile?.reputation_score ?? 0,
            },
          }));
        }
      ),
    updatePlayerProfile: async (input) =>
      runMutation(
        async () => updatePlayerProfileService(input),
        "선수 프로필이 수정되었습니다.",
        () => {
          setProfileBundle((current) => ({
            ...current,
            playerProfile: current.playerProfile
              ? {
                  ...current.playerProfile,
                  preferred_position:
                    input.preferredPosition ?? current.playerProfile.preferred_position,
                  preferred_foot: input.preferredFoot ?? current.playerProfile.preferred_foot,
                  dominant_foot: input.dominantFoot ?? current.playerProfile.dominant_foot,
                  top_size: input.topSize ?? current.playerProfile.top_size,
                  shoe_size: input.shoeSize ?? current.playerProfile.shoe_size,
                }
              : current.playerProfile,
          }));
        }
      ),
    createRefereeProfile: async () =>
      runMutation(
        async () => createRefereeProfileService(),
        "심판 프로필이 생성되었습니다.",
        () => {
          setProfileBundle((current) => ({
            ...current,
            refereeProfile: {
              user_id: current.profile?.id ?? "",
            },
          }));
        }
      ),
  };
}
