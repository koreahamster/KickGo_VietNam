import { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ConsentCheckField } from "@/components/ConsentCheckField";
import { PrimaryButton } from "@/components/PrimaryButton";
import { CURRENT_POLICY_VERSION } from "@/constants/consent";
import { COLORS } from "@/constants/colors";
import { SPACING } from "@/constants/spacing";
import { useI18n } from "@/core/i18n/LanguageProvider";
import { useAuth } from "@/hooks/useAuth";
import { useConsent } from "@/hooks/useConsent";

function formatConsentDate(value: string | null, language: string, notRecorded: string): string {
  if (!value) {
    return notRecorded;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const locale = language === "ko" ? "ko-KR" : language === "vi" ? "vi-VN" : "en-US";

  return date.toLocaleString(locale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export default function AccountScreen(): JSX.Element {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { language, t } = useI18n();
  const {
    consents,
    hasRequiredPrivacyConsent,
    marketingOptIn,
    isConsentLoading,
    isSubmittingConsent,
    consentErrorMessage,
    consentStatusMessage,
    recordConsent,
  } = useConsent({ enabled: isAuthenticated });
  const [marketingAgreed, setMarketingAgreed] = useState<boolean>(false);

  useEffect(() => {
    setMarketingAgreed(marketingOptIn);
  }, [marketingOptIn]);

  const privacyStatus = useMemo(
    () => (hasRequiredPrivacyConsent ? t("settings.account.agreed") : t("settings.account.required")),
    [hasRequiredPrivacyConsent, t],
  );

  const handleSavePrivacyConsent = async (): Promise<void> => {
    await recordConsent({
      consentType: "privacy_policy",
      isAgreed: true,
      policyVersion: CURRENT_POLICY_VERSION,
    });
  };

  const handleSaveMarketingConsent = async (): Promise<void> => {
    await recordConsent({
      consentType: "marketing",
      isAgreed: marketingAgreed,
      policyVersion: CURRENT_POLICY_VERSION,
    });
  };

  if (isAuthLoading || isConsentLoading) {
    return (
      <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.title}>{t("settings.account.title")}</Text>
          <Text style={styles.subtitle}>{t("common.loading")}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
          <Text style={styles.title}>{t("settings.account.title")}</Text>
          <Text style={styles.subtitle}>{t("settings.account.subtitle")}</Text>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{t("settings.account.privacySection")}</Text>
            <Text style={styles.value}>{`${t("settings.account.privacyStatusPrefix")}: ${privacyStatus}`}</Text>
            <Text style={styles.value}>{`${t("settings.account.policyVersionPrefix")}: ${consents.privacyPolicy?.policy_version ?? CURRENT_POLICY_VERSION}`}</Text>
            <Text style={styles.value}>{`${t("settings.account.recordedAtPrefix")}: ${formatConsentDate(consents.privacyPolicy?.agreed_at ?? null, language, t("settings.account.notRecorded"))}`}</Text>
            {!hasRequiredPrivacyConsent ? (
              <PrimaryButton
                label={t("settings.account.agreePrivacy")}
                onPress={() => void handleSavePrivacyConsent()}
                isDisabled={isSubmittingConsent}
              />
            ) : null}
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{t("settings.account.marketingSection")}</Text>
            <ConsentCheckField
              title={t("settings.account.marketingTitle")}
              description={t("settings.account.marketingDescription")}
              checked={marketingAgreed}
              onToggle={() => setMarketingAgreed((current) => !current)}
              disabled={isSubmittingConsent}
            />
            <Text style={styles.value}>{`${t("settings.account.currentStatePrefix")}: ${marketingOptIn ? t("settings.account.agreed") : t("settings.account.notAgreed")}`}</Text>
            <Text style={styles.value}>{`${t("settings.account.policyVersionPrefix")}: ${consents.marketing?.policy_version ?? CURRENT_POLICY_VERSION}`}</Text>
            <Text style={styles.value}>{`${t("settings.account.recordedAtPrefix")}: ${formatConsentDate(consents.marketing?.agreed_at ?? null, language, t("settings.account.notRecorded"))}`}</Text>
            <PrimaryButton
              label={t("settings.account.saveMarketing")}
              onPress={() => void handleSaveMarketingConsent()}
              isDisabled={isSubmittingConsent}
            />
          </View>

          {consentErrorMessage ? <Text style={styles.errorText}>{consentErrorMessage}</Text> : null}
          {consentStatusMessage ? <Text style={styles.statusText}>{consentStatusMessage}</Text> : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { flexGrow: 1, paddingBottom: SPACING.xl },
  container: {
    flex: 1,
    paddingHorizontal: SPACING.screenHorizontal,
    paddingVertical: SPACING.xl,
    backgroundColor: COLORS.background,
  },
  title: { fontSize: 30, fontWeight: "800", color: COLORS.textPrimary },
  subtitle: { marginTop: SPACING.sm, fontSize: 15, lineHeight: 22, color: COLORS.textSecondary },
  card: {
    marginTop: SPACING.xl,
    padding: SPACING.lg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    gap: SPACING.md,
  },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: COLORS.textPrimary },
  value: { fontSize: 15, lineHeight: 21, color: COLORS.textSecondary },
  errorText: { marginTop: SPACING.lg, fontSize: 14, lineHeight: 20, color: "#b83a3a" },
  statusText: { marginTop: SPACING.lg, fontSize: 14, lineHeight: 20, color: COLORS.brand },
});