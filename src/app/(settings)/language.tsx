import { router } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PrimaryButton } from "@/components/PrimaryButton";
import { SelectField } from "@/components/SelectField";
import { COLORS } from "@/constants/colors";
import { LANGUAGE_OPTIONS } from "@/constants/profile-options";
import { SPACING } from "@/constants/spacing";
import { useI18n } from "@/core/i18n/LanguageProvider";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import type { SupportedLanguage } from "@/types/profile.types";

export default function LanguageScreen(): JSX.Element {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { language: appLanguage, setLanguage: setAppLanguage, t } = useI18n();
  const {
    hasProfile,
    isProfileLoading,
    isSubmittingProfile,
    nextOnboardingRoute,
    profileBundle,
    profileErrorMessage,
    profileStatusMessage,
    updateCommonProfile,
  } = useProfile({ enabled: isAuthenticated });
  const [language, setLanguage] = useState<SupportedLanguage | null>(null);

  useEffect(() => {
    setLanguage(profileBundle.profile?.preferred_language ?? appLanguage);
  }, [appLanguage, profileBundle.profile?.preferred_language]);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, isAuthLoading]);

  const handleSave = async (): Promise<void> => {
    if (!language) {
      return;
    }

    const previousLanguage = appLanguage;

    try {
      await setAppLanguage(language);
      await updateCommonProfile({ preferredLanguage: language });
      router.back();
    } catch {
      await setAppLanguage(previousLanguage);
    }
  };

  if (isAuthLoading || isProfileLoading) {
    return (
      <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.title}>{t("settings.language.title")}</Text>
          <Text style={styles.subtitle}>{t("settings.language.loadingSubtitle")}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!hasProfile) {
    return (
      <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.title}>{t("settings.language.title")}</Text>
          <Text style={styles.subtitle}>{t("settings.language.needProfileSubtitle")}</Text>
          <View style={styles.card}>
            <PrimaryButton label={t("settings.language.continueOnboarding")} onPress={() => router.replace(nextOnboardingRoute)} />
            <PrimaryButton label={t("settings.language.backToSettings")} variant="outline" onPress={() => router.replace("/(settings)/settings")} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>{t("settings.language.title")}</Text>
        <Text style={styles.subtitle}>{t("settings.language.subtitle")}</Text>
        <View style={styles.card}>
          <SelectField
            label={t("common.language")}
            placeholder={t("settings.language.placeholder")}
            value={language}
            options={LANGUAGE_OPTIONS}
            onChange={(value) => setLanguage(value as SupportedLanguage | null)}
          />
          <PrimaryButton
            label={isSubmittingProfile ? t("settings.language.saving") : t("common.save")}
            onPress={() => void handleSave()}
            isDisabled={isSubmittingProfile || !language || language === appLanguage}
          />
        </View>
        {profileErrorMessage ? <Text style={styles.errorText}>{profileErrorMessage}</Text> : null}
        {profileStatusMessage ? <Text style={styles.statusText}>{profileStatusMessage}</Text> : null}
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
  errorText: { marginTop: SPACING.lg, fontSize: 14, lineHeight: 20, color: "#b83a3a" },
  statusText: { marginTop: SPACING.lg, fontSize: 14, lineHeight: 20, color: COLORS.brand },
});
