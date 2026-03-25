import { useEffect, useMemo, useState } from "react";

import {
  getMyConsentBundle,
  recordConsent as recordConsentService,
} from "@/services/consent.service";
import type {
  ConsentBundle,
  ConsentType,
  RecordConsentInput,
} from "@/types/consent.types";

const EMPTY_CONSENTS: ConsentBundle = {
  privacyPolicy: null,
  marketing: null,
};

type UseConsentOptions = {
  enabled?: boolean;
};

type UseConsentResult = {
  consents: ConsentBundle;
  hasRequiredPrivacyConsent: boolean;
  marketingOptIn: boolean;
  isConsentLoading: boolean;
  isSubmittingConsent: boolean;
  consentErrorMessage: string | null;
  consentStatusMessage: string | null;
  loadConsents: () => Promise<ConsentBundle>;
  recordConsent: (input: RecordConsentInput) => Promise<void>;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Consent request failed.";
}

export function useConsent(options?: UseConsentOptions): UseConsentResult {
  const enabled = options?.enabled ?? true;
  const [consents, setConsents] = useState<ConsentBundle>(EMPTY_CONSENTS);
  const [isConsentLoading, setIsConsentLoading] = useState<boolean>(enabled);
  const [isSubmittingConsent, setIsSubmittingConsent] = useState<boolean>(false);
  const [consentErrorMessage, setConsentErrorMessage] = useState<string | null>(null);
  const [consentStatusMessage, setConsentStatusMessage] = useState<string | null>(null);

  const loadConsents = async (): Promise<ConsentBundle> => {
    if (!enabled) {
      setConsents(EMPTY_CONSENTS);
      setConsentErrorMessage(null);
      setConsentStatusMessage(null);
      setIsConsentLoading(false);
      return EMPTY_CONSENTS;
    }

    try {
      setIsConsentLoading(true);
      setConsentErrorMessage(null);
      const nextBundle = await getMyConsentBundle();
      setConsents(nextBundle);
      return nextBundle;
    } catch (error: unknown) {
      setConsentErrorMessage(getErrorMessage(error));
      return EMPTY_CONSENTS;
    } finally {
      setIsConsentLoading(false);
    }
  };

  useEffect(() => {
    void loadConsents();
  }, [enabled]);

  const recordConsent = async (input: RecordConsentInput): Promise<void> => {
    try {
      setIsSubmittingConsent(true);
      setConsentErrorMessage(null);
      setConsentStatusMessage(null);
      const result = await recordConsentService(input);
      const nextRecord = {
        id: result.user_id,
        user_id: result.user_id,
        consent_type: result.consent_type,
        is_agreed: result.is_agreed,
        policy_version: result.policy_version,
        agreed_at: result.agreed_at,
        ip_address: null,
        created_at: new Date().toISOString(),
      };

      setConsents((current) => ({
        ...current,
        privacyPolicy:
          result.consent_type === "privacy_policy" ? nextRecord : current.privacyPolicy,
        marketing: result.consent_type === "marketing" ? nextRecord : current.marketing,
      }));

      const statusText =
        result.consent_type === "privacy_policy"
          ? "개인정보처리방침 동의가 저장되었습니다."
          : result.is_agreed
            ? "마케팅 정보 수신 동의가 저장되었습니다."
            : "마케팅 정보 수신 거부가 저장되었습니다.";

      setConsentStatusMessage(statusText);
      await loadConsents();
    } catch (error: unknown) {
      setConsentErrorMessage(getErrorMessage(error));
      throw error;
    } finally {
      setIsSubmittingConsent(false);
    }
  };

  const hasRequiredPrivacyConsent = useMemo(
    () => Boolean(consents.privacyPolicy?.is_agreed),
    [consents.privacyPolicy],
  );

  const marketingOptIn = useMemo(
    () => Boolean(consents.marketing?.is_agreed),
    [consents.marketing],
  );

  return {
    consents,
    hasRequiredPrivacyConsent,
    marketingOptIn,
    isConsentLoading,
    isSubmittingConsent,
    consentErrorMessage,
    consentStatusMessage,
    loadConsents,
    recordConsent,
  };
}