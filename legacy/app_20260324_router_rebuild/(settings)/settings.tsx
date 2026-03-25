import Constants from "expo-constants";
import { router } from "expo-router";
import { useEffect, useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PrimaryButton } from "@/components/PrimaryButton";
import { COLORS } from "@/constants/colors";
import { SPACING } from "@/constants/spacing";
import { getOptionLabel, getVisibilityOptions } from "@/constants/profile-options";
import { useI18n } from "@/core/i18n/LanguageProvider";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";

export default function SettingsScreen(): JSX.Element {
  const { language, t } = useI18n();
  const { isAuthenticated, isLoading: isAuthLoading, signOut } = useAuth();
  const { hasProfile, isProfileLoading, nextOnboardingRoute, profileBundle } = useProfile({ enabled: isAuthenticated });
  const appVersion = Constants.expoConfig?.version ?? "1.0.0";
  const visibilityOptions = useMemo(() => getVisibilityOptions(language), [language]);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!isAuthenticated) {
      router.replace("/(auth)/login");
    }
  }, [isAuthenticated, isAuthLoading]);

  const renderContent = (): JSX.Element => {
    if (isAuthLoading || isProfileLoading) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>{t("settings.main.title")}</Text>
          <Text style={styles.subtitle}>{t("settings.main.loadingSubtitle")}</Text>
        </View>
      );
    }

    if (!hasProfile) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>{t("settings.main.title")}</Text>
          <Text style={styles.subtitle}>{t("settings.main.needProfileSubtitle")}</Text>
          <View style={styles.card}>
            <Text style={styles.value}>{t("settings.main.needProfileHelper")}</Text>
            <PrimaryButton label={t("settings.main.continueOnboarding")} onPress={() => router.replace(nextOnboardingRoute)} />
            <PrimaryButton label={t("settings.main.goHome")} variant="outline" onPress={() => router.replace("/")} />
          </View>
        </View>
      );
    }

    const visibilityLabel = getOptionLabel(visibilityOptions, profileBundle.profile?.visibility ?? null) ?? t("settings.main.notSet");

    return (
      <View style={styles.container}>
        <Text style={styles.title}>{t("settings.main.title")}</Text>
        <Text style={styles.subtitle}>{t("settings.main.subtitle")}</Text>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t("settings.main.profileSection")}</Text>
          <Text style={styles.value}>{profileBundle.profile?.display_name ?? t("settings.main.notSet")}</Text>
          <Text style={styles.value}>{`${t("settings.main.visibilityPrefix")}: ${visibilityLabel}`}</Text>
          <PrimaryButton label={t("settings.main.editProfile")} onPress={() => router.push("/(onboarding)/create-profile?mode=edit")} />
          <PrimaryButton label={t("settings.main.profileVisibility")} onPress={() => router.push("/(settings)/visibility")} variant="secondary" />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t("settings.main.commonSection")}</Text>
          <View style={styles.buttonGroup}>
            <PrimaryButton label={t("settings.main.language")} onPress={() => router.push("/(settings)/language")} variant="secondary" />
            <PrimaryButton label={t("settings.main.region")} onPress={() => router.push("/(settings)/region")} variant="secondary" />
            <PrimaryButton label={t("settings.main.roles")} onPress={() => router.push("/(settings)/roles")} variant="secondary" />
            <PrimaryButton label={t("settings.main.notifications")} onPress={() => router.push("/(settings)/notifications")} variant="secondary" />
            <PrimaryButton label={t("settings.main.account")} onPress={() => router.push("/(settings)/account")} variant="secondary" />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t("settings.main.appSection")}</Text>
          <Text style={styles.value}>{`${t("settings.main.versionPrefix")} ${appVersion}`}</Text>
          <PrimaryButton label={t("common.logout")} onPress={() => void signOut()} variant="outline" />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { flexGrow: 1, paddingBottom: SPACING.xl },
  container: {
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
  value: { fontSize: 15, color: COLORS.textSecondary },
  buttonGroup: { gap: SPACING.md },
});