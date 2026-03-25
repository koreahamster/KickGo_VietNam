import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppLogo } from "@/components/AppLogo";
import { PrimaryButton } from "@/components/PrimaryButton";
import { COLORS } from "@/constants/colors";
import { SPACING } from "@/constants/spacing";
import { useI18n } from "@/core/i18n/LanguageProvider";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";

export default function HomeScreen(): JSX.Element {
  const { t } = useI18n();
  const { errorMessage, isAuthenticated, isLoading, signOut, user } = useAuth();
  const {
    hasProfile,
    isProfileLoading,
    pendingRoleOnboarding,
    profileBundle,
    profileErrorMessage,
  } = useProfile({ enabled: isAuthenticated });

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
      <View style={styles.container}>
        <AppLogo />
        <Text style={styles.title}>KickGo</Text>
        {isLoading || (isAuthenticated && isProfileLoading) ? (
          <Text style={styles.description}>{t("home.loadingDescription")}</Text>
        ) : !isAuthenticated ? (
          <>
            <Text style={styles.description}>{t("home.guestDescription")}</Text>
            <View style={styles.buttonGroup}>
              <PrimaryButton label={t("home.login")} onPress={() => router.push("/(auth)/login")} />
              <PrimaryButton
                label={t("home.signup")}
                onPress={() => router.push("/(auth)/signup")}
                variant="secondary"
              />
            </View>
          </>
        ) : !hasProfile ? (
          <>
            <Text style={styles.description}>{t("home.needProfileDescription")}</Text>
            <View style={styles.buttonGroup}>
              <PrimaryButton
                label={t("home.phoneVerify")}
                onPress={() => router.push("/(auth)/phone-verify")}
              />
              <PrimaryButton
                label={t("home.createProfile")}
                onPress={() => router.push("/(onboarding)/create-profile")}
                variant="secondary"
              />
              <PrimaryButton
                label={t("common.logout")}
                onPress={() => void signOut()}
                variant="outline"
              />
            </View>
          </>
        ) : pendingRoleOnboarding.length > 0 ? (
          <>
            <Text style={styles.description}>{t("home.pendingRoleDescription")}</Text>
            <View style={styles.buttonGroup}>
              <PrimaryButton
                label={t("home.continueRoleOnboarding")}
                onPress={() => router.push("/(onboarding)/role-onboarding")}
              />
              <PrimaryButton
                label={t("home.profile")}
                onPress={() => router.push("/(tabs)/profile")}
                variant="secondary"
              />
              <PrimaryButton
                label={t("common.logout")}
                onPress={() => void signOut()}
                variant="outline"
              />
            </View>
          </>
        ) : (
          <>
            <Text style={styles.description}>{t("home.completedDescription")}</Text>
            <Text style={styles.userText}>
              {profileBundle.profile?.display_name ?? user?.email ?? "-"}
            </Text>
            <View style={styles.buttonGroup}>
              <PrimaryButton
                label={t("home.openProfile")}
                onPress={() => router.push("/(tabs)/profile")}
              />
              <PrimaryButton
                label={t("home.settings")}
                onPress={() => router.push("/(settings)/settings")}
                variant="secondary"
              />
              <PrimaryButton
                label={t("common.logout")}
                onPress={() => void signOut()}
                variant="outline"
              />
            </View>
          </>
        )}

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
        {!errorMessage && profileErrorMessage ? (
          <Text style={styles.errorText}>{profileErrorMessage}</Text>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.screenHorizontal,
    backgroundColor: COLORS.background,
  },
  title: { marginTop: SPACING.md, fontSize: 34, fontWeight: "800", color: COLORS.textPrimary },
  description: {
    marginTop: SPACING.sm,
    textAlign: "center",
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.textSecondary,
  },
  userText: {
    marginTop: SPACING.md,
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  buttonGroup: { width: "100%", marginTop: SPACING.xl, gap: SPACING.md },
  errorText: {
    marginTop: SPACING.lg,
    textAlign: "center",
    fontSize: 14,
    lineHeight: 20,
    color: "#b83a3a",
  },
});