import { router } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { PrimaryButton } from "@/components/PrimaryButton";
import { COLORS } from "@/constants/colors";
import { SPACING } from "@/constants/spacing";
import { useI18n } from "@/core/i18n/LanguageProvider";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";

export default function PhoneVerifyScreen(): JSX.Element {
  const { language, setLanguage, t } = useI18n();
  const { isAuthenticated, isLoading, signOut } = useAuth();
  const {
    hasProfile,
    isProfileLoading,
    nextOnboardingRoute,
    onboardingStep,
    pendingRoleOnboarding,
  } = useProfile({ enabled: isAuthenticated });

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!isAuthenticated) {
      router.replace("/(auth)/login");
    }
  }, [isAuthenticated, isLoading]);

  const handleContinue = (): void => {
    router.replace(nextOnboardingRoute);
  };

  const handleSignOut = async (): Promise<void> => {
    await signOut();
    router.replace("/");
  };

  const helperText = !hasProfile
    ? t("auth.phoneVerify.helperCreate")
    : pendingRoleOnboarding.length > 0
      ? t("auth.phoneVerify.helperRole")
      : t("auth.phoneVerify.helperDone");

  const primaryLabel = onboardingStep === "create-profile"
    ? t("auth.phoneVerify.continueProfile")
    : onboardingStep === "role-onboarding"
      ? t("auth.phoneVerify.continueRole")
      : t("auth.phoneVerify.goHome");

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <View style={styles.container}>
        <LanguageSwitcher value={language} onChange={(nextLanguage) => void setLanguage(nextLanguage)} label={t("common.language")} />
        <Text style={styles.title}>{t("auth.phoneVerify.title")}</Text>
        <Text style={styles.subtitle}>{t("auth.phoneVerify.subtitle")}</Text>
        <View style={styles.card}>
          <Text style={styles.helperText}>{helperText}</Text>
          <PrimaryButton label={primaryLabel} onPress={handleContinue} isDisabled={isProfileLoading} />
          <PrimaryButton label={t("common.logout")} variant="outline" onPress={() => void handleSignOut()} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: {
    flex: 1,
    paddingHorizontal: SPACING.screenHorizontal,
    paddingVertical: SPACING.xl,
    backgroundColor: COLORS.background,
    gap: SPACING.md,
  },
  title: { fontSize: 30, fontWeight: "800", color: COLORS.textPrimary },
  subtitle: { fontSize: 15, lineHeight: 22, color: COLORS.textSecondary },
  card: {
    padding: SPACING.lg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    gap: SPACING.md,
  },
  helperText: { fontSize: 14, lineHeight: 21, color: COLORS.textSecondary },
});