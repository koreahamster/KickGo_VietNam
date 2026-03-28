import type {
  AccountType,
  CommonProfileRecord,
  PlayerProfileRecord,
  ProfileBundle,
  RefereeProfileRecord,
} from "@/types/profile.types";

export type BootstrapData = {
  profile: CommonProfileRecord | null;
  account_types: AccountType[] | null;
  player_profile: PlayerProfileRecord | null;
  referee_profile: RefereeProfileRecord | null;
};

function isAccountType(value: unknown): value is AccountType {
  return value === "player" || value === "referee" || value === "facility_manager";
}

function coerceAccountTypes(value: unknown): AccountType[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const roles = value.filter(isAccountType);
  return roles.length > 0 ? roles : [];
}

export function coerceBootstrapData(value: unknown): BootstrapData | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const candidate = value as Partial<BootstrapData>;

  return {
    profile: (candidate.profile ?? null) as CommonProfileRecord | null,
    account_types: coerceAccountTypes(candidate.account_types ?? null),
    player_profile: (candidate.player_profile ?? null) as PlayerProfileRecord | null,
    referee_profile: (candidate.referee_profile ?? null) as RefereeProfileRecord | null,
  };
}

export function bootstrapDataToProfileBundle(data: BootstrapData | null): ProfileBundle {
  return {
    profile: data?.profile ?? null,
    accountTypes: data?.account_types ?? [],
    playerProfile: data?.player_profile ?? null,
    refereeProfile: data?.referee_profile ?? null,
  };
}

export function profileBundleToBootstrapData(bundle: ProfileBundle): BootstrapData {
  return {
    profile: bundle.profile,
    account_types: bundle.accountTypes,
    player_profile: bundle.playerProfile,
    referee_profile: bundle.refereeProfile,
  };
}

export function getBootstrapActiveRole(data: BootstrapData | null): AccountType | null {
  return data?.account_types?.[0] ?? null;
}
