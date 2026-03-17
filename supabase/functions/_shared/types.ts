export type AccountType = "player" | "referee" | "facility_manager";
export type SupportedLanguage = "vi" | "ko" | "en";
export type SupportedFoot = "left" | "right" | "both";
export type SupportedPosition = "GK" | "CB" | "FB" | "DM" | "CM" | "AM" | "WG" | "ST";

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
