export type AccountType = "player" | "referee" | "facility_manager";

export type SupportedLanguage = "vi" | "ko" | "en";
export type SupportedVisibility = "public" | "members_only" | "private";
export type SupportedAvatarContentType = "image/jpeg" | "image/png" | "image/webp" | "image/heic" | "image/heif";
export type PlayStyleValue =
  | "aggressive"
  | "defensive"
  | "dribbler"
  | "build_up"
  | "physical"
  | "speed"
  | "creative"
  | "team_player"
  | "scorer"
  | "defender";

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
  visibility: SupportedVisibility;
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
  left_foot_skill: number;
  right_foot_skill: number;
  play_styles: PlayStyleValue[];
};

export type RefereeProfileRecord = {
  user_id: string;
  average_rating: number | null;
  rating_count: number;
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
  visibility?: SupportedVisibility;
};

export type UpdateCommonProfileInput = {
  displayName?: string;
  birthYear?: number | null;
  countryCode?: string;
  provinceCode?: string;
  districtCode?: string;
  preferredLanguage?: SupportedLanguage;
  bio?: string;
  visibility?: SupportedVisibility;
};

export type CreatePlayerProfileInput = {
  preferredPosition: string;
  preferredFoot: string;
  dominantFoot: string;
  topSize: string;
  shoeSize: string;
};

export type UpdatePlayerProfileInput = Partial<CreatePlayerProfileInput> & {
  leftFootSkill?: number;
  rightFootSkill?: number;
  playStyles?: PlayStyleValue[];
};

export type RequestAvatarUploadInput = {
  fileName: string;
  contentType: SupportedAvatarContentType;
};

export type UploadAvatarInput = {
  uri: string;
  fileName: string;
  contentType: SupportedAvatarContentType;
};

export type RequestAvatarUploadResult = {
  upload_url: string;
  avatar_url: string;
  storage_path: string;
  file_name: string;
};

export type AvatarUploadBinary = ArrayBuffer | Uint8Array | Blob;

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

export type UpdateProfileVisibilityResult = {
  profile_id: string;
  visibility: SupportedVisibility;
};

