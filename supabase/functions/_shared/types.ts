export type AccountType = "player" | "referee" | "facility_manager";
export type ConsentType = "privacy_policy" | "marketing";
export type SupportedLanguage = "vi" | "ko" | "en";
export type SupportedFoot = "left" | "right" | "both";
export type SupportedPosition = "GK" | "CB" | "FB" | "DM" | "CM" | "AM" | "WG" | "ST";
export type SupportedVisibility = "public" | "members_only" | "private";
export type SupportedAvatarContentType = "image/jpeg" | "image/png" | "image/webp" | "image/heic" | "image/heif";
export type SupportedPlayStyle =
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

export type ErrorPayload = {
  code: string;
  message: string;
};

export type SuccessResponse<T> = {
  success: true;
  data: T;
  error: null;
};

export type FailureResponse = {
  success: false;
  data: null;
  error: ErrorPayload;
};

export type ApiResponse<T> = SuccessResponse<T> | FailureResponse;
