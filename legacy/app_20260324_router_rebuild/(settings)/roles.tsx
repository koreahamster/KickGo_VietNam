import { router } from "expo-router";
import { useEffect, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PrimaryButton } from "@/components/PrimaryButton";
import { getAccountTypeOptions, getOptionLabel } from "@/constants/profile-options";
import { COLORS } from "@/constants/colors";
import { SPACING } from "@/constants/spacing";
import { useI18n } from "@/core/i18n/LanguageProvider";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import type { AccountType } from "@/types/profile.types";

const ROLE_ORDER: AccountType[] = ["player", "referee", "facility_manager"];

export default function RolesScreen(): JSX.Element {
  const { language, t } = useI18n();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const {
    accountTypes,
    addAccountType,
    hasProfile,
    isProfileLoading,
    isSubmittingProfile,
    nextOnboardingRoute,
    profileErrorMessage,
    profileStatusMessage,
  } = useProfile({ enabled: isAuthenticated });
  const roleOptions = useMemo(() => getAccountTypeOptions(language), [language]);
  const missingRoles = ROLE_ORDER.filter((role) => !accountTypes.includes(role));

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!isAuthenticated) {
      router.replace("/(auth)/login");
    }
  }, [isAuthenticated, isAuthLoading]);

  const handleAddRole = async (role: AccountType): Promise<void> => {
    try {
      await addAccountType(role);

      if (role === "player" || role === "referee") {
        router.push("/(onboarding)/role-onboarding");
      }
    } catch {
      // handled in hook
    }
  };

  if (isAuthLoading || isProfileLoading) {
    return (
      <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.title}>{t("settings.roles.title")}</Text>
          <Text style={styles.subtitle}>{t("settings.roles.loadingSubtitle")}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!hasProfile) {
    return (
      <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.title}>{t("settings.roles.title")}</Text>
          <Text style={styles.subtitle}>{t("settings.roles.needProfileSubtitle")}</Text>
          <View style={styles.card}>
            <PrimaryButton label={t("settings.roles.continueOnboarding")} onPress={() => router.replace(nextOnboardingRoute)} />
            <PrimaryButton label={t("settings.roles.backToSettings")} variant="outline" onPress={() => router.replace("/(settings)/settings")} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>{t("settings.roles.title")}</Text>
        <Text style={styles.subtitle}>{t("settings.roles.subtitle")}</Text>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t("settings.roles.currentRoles")}</Text>
          {accountTypes.length > 0 ? (
            accountTypes.map((role) => (
              <Text key={role} style={styles.value}>
                {getOptionLabel(roleOptions, role)}
              </Text>
            ))
          ) : (
            <Text style={styles.value}>{t("settings.roles.noRoles")}</Text>
          )}
        </View>
        {missingRoles.length > 0 ? (
          <View style={styles.buttonGroup}>
            {missingRoles.map((role) => (
              <PrimaryButton
                key={role}
                label={`${getOptionLabel(roleOptions, role)} ${t("settings.roles.addSuffix")}`}
                onPress={() => void handleAddRole(role)}
                variant="secondary"
                isDisabled={isSubmittingProfile}
              />
            ))}
          </View>
        ) : (
          <Text style={styles.helperText}>{t("settings.roles.allAdded")}</Text>
        )}
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
    gap: SPACING.sm,
  },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: COLORS.textPrimary },
  value: { fontSize: 15, color: COLORS.textSecondary },
  buttonGroup: { marginTop: SPACING.xl, gap: SPACING.md },
  helperText: { marginTop: SPACING.xl, fontSize: 14, lineHeight: 21, color: COLORS.textSecondary },
  errorText: { marginTop: SPACING.lg, fontSize: 14, lineHeight: 20, color: "#b83a3a" },
  statusText: { marginTop: SPACING.lg, fontSize: 14, lineHeight: 20, color: COLORS.brand },
});