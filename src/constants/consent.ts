import type { ConsentType } from "@/types/consent.types";

export const CURRENT_POLICY_VERSION = "v1.0";

export const CONSENT_TYPE_LABELS: Record<ConsentType, string> = {
  privacy_policy: "개인정보처리방침",
  marketing: "마케팅 정보 수신",
};