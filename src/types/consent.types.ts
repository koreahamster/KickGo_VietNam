import type { ApiResponse } from "@/types/profile.types";

export type ConsentType = "privacy_policy" | "marketing";

export type UserConsentRecord = {
  id: string;
  user_id: string;
  consent_type: ConsentType;
  is_agreed: boolean;
  policy_version: string;
  agreed_at: string | null;
  ip_address: string | null;
  created_at: string;
};

export type ConsentBundle = {
  privacyPolicy: UserConsentRecord | null;
  marketing: UserConsentRecord | null;
};

export type RecordConsentInput = {
  consentType: ConsentType;
  isAgreed: boolean;
  policyVersion: string;
};

export type RecordConsentResult = {
  user_id: string;
  consent_type: ConsentType;
  is_agreed: boolean;
  policy_version: string;
  agreed_at: string | null;
};

export type ConsentApiResponse<T> = ApiResponse<T>;