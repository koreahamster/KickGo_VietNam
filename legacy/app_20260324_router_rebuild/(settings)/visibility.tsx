import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PrimaryButton } from "@/components/PrimaryButton";
import { SelectField } from "@/components/SelectField";
import { COLORS } from "@/constants/colors";
import { SPACING } from "@/constants/spacing";
import { getVisibilityOptions } from "@/constants/profile-options";
import { useI18n } from "@/core/i18n/LanguageProvider";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import type { SupportedVisibility } from "@/types/profile.types";

export default function VisibilityScreen(): JSX.Element {
  const { language, t } = useI18n();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const {
    hasProfile,
    isProfileLoading,
    isSubmittingProfile,
    nextOnboardingRoute,
    profileBundle,
    profileErrorMessage,
    profileStatusMessage,
    updateProfileVisibility,
  } = useProfile({ enabled: isAuthenticated });
  const [visibility, setVisibility] = useState<SupportedVisibility | null>(null);
  const visibilityOptions = useMemo(() => getVisibilityOptions(language), [language]);

  useEffect(() => {
    setVisibility(profileBundle.profile?.visibility ?? null);
  }, [profileBundle.profile?.visibility]);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!isAuthenticated) {
      router.replace("/(auth)/login");
    }
  }, [isAuthenticated, isAuthLoading]);

  const handleSave = async (): Promise<void> => {
    if (!visibility) {
      return;
    }

    try {
      await updateProfileVisibility(visibility);
      router.back();
    } catch {
      // handled in hook
    }
  };

  if (isAuthLoading || isProfileLoading) {
    return (
      <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.title}>{t("settings.visibility.title")}</Text>
          <Text style={styles.subtitle}>{t("settings.visibility.loadingSubtitle")}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!hasProfile) {
    return (
      <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.title}>{t("settings.visibility.title")}</Text>
          <Text style={styles.subtitle}>{t("settings.visibility.needProfileSubtitle")}</Text>
          <View style={styles.card}>
            <PrimaryButton label={t("settings.visibility.continueOnboarding")} onPress={() => router.replace(nextOnboardingRoute)} />
            <PrimaryButton label={t("settings.visibility.backToSettings")} variant="outline" onPress={() => router.replace("/(settings)/settings")} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>{t("settings.visibility.title")}</Text>
        <Text style={styles.subtitle}>{t("settings.visibility.subtitle")}</Text>
        <View style={styles.card}>
          <SelectField
            label={t("settings.visibility.label")}
            placeholder={t("settings.visibility.placeholder")}
            value={visibility}
            options={visibilityOptions}
            onChange={(value) => setVisibility(value as SupportedVisibility | null)}
          />
          <PrimaryButton
            label={isSubmittingProfile ? t("settings.visibility.saving") : t("settings.visibility.save")}
            onPress={() => void handleSave()}
            isDisabled={isSubmittingProfile || !visibility}
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