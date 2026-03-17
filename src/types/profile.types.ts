export type AccountType = "player" | "referee" | "facility_manager";

export type SupportedLanguage = "vi" | "ko" | "en";

export type CommonProfileRecord = {
  id: string;
  display_name: string;
  birth_year: number | null;
  avatar_url: string | null;
  bio: string | null;
  phone: string | null;
  is_phone_verified: boolean;
  country_code: string;
  province_code: string | null;
  district_code: string | null;
  preferred_language: SupportedLanguage;
};

export type PlayerProfileRecord = {
  user_id: string;
  preferred_position: string | null;
  preferred_foot: string | null;
  dominant_foot: string | null;
  top_size: string | null;
  shoe_size: string | null;
  skill_tier: number;
  reputation_score: number;
};

export type RefereeProfileRecord = {
  user_id: string;
};

export type ProfileBundle = {
  profile: CommonProfileRecord | null;
  accountTypes: AccountType[];
  playerProfile: PlayerProfileRecord | null;
  refereeProfile: RefereeProfileRecord | null;
};

export type CreateCommonProfileInput = {
  displayName: string;
  birthYear: number | null;
  countryCode: string;
  provinceCode: string;
  districtCode: string;
  preferredLanguage: SupportedLanguage;
  bio: string;
  initialAccountType: AccountType;
};

export type UpdateCommonProfileInput = {
  displayName?: string;
  birthYear?: number | null;
  countryCode?: string;
  provinceCode?: string;
  districtCode?: string;
  preferredLanguage?: SupportedLanguage;
  bio?: string;
};

export type CreatePlayerProfileInput = {
  preferredPosition: string;
  preferredFoot: string;
  dominantFoot: string;
  topSize: string;
  shoeSize: string;
};

export type UpdatePlayerProfileInput = Partial<CreatePlayerProfileInput>;

export type ApiErrorPayload = {
  code?: string;
  message: string;
};

export type ApiSuccessPayload<T> = {
  success: true;
  data: T;
  error: null;
};

export type ApiFailurePayload = {
  success: false;
  data: null;
  error: ApiErrorPayload;
};

export type ApiResponse<T> = ApiSuccessPayload<T> | ApiFailurePayload;

export type CreateProfileResult = {
  profile_id: string;
  account_type: AccountType;
  requires_role_onboarding: boolean;
};

export type AddAccountTypeResult = {
  user_id: string;
  type: AccountType;
  existed: boolean;
};

export type RoleProfileResult = {
  user_id: string;
  existed: boolean;
};

export type UpdateProfileResult = {
  profile_id: string;
};
