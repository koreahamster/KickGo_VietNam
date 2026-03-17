import Constants from "expo-constants";
import { router } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PrimaryButton } from "@/components/PrimaryButton";
import { COLORS } from "@/constants/colors";
import { SPACING } from "@/constants/spacing";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";

export default function SettingsScreen(): JSX.Element {
  const { isAuthenticated, isLoading: isAuthLoading, signOut } = useAuth();
  const { hasProfile, isProfileLoading, profileBundle } = useProfile({ enabled: isAuthenticated });
  const appVersion = Constants.expoConfig?.version ?? "1.0.0";

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!isAuthenticated) {
      router.replace("/(auth)/login");
      return;
    }

    if (!isProfileLoading && !hasProfile) {
      router.replace("/(auth)/phone-verify");
    }
  }, [hasProfile, isAuthenticated, isAuthLoading, isProfileLoading]);

  if (isAuthLoading || isProfileLoading) {
    return (
      <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.title}>설정</Text>
          <Text style={styles.subtitle}>설정 정보를 불러오고 있습니다.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>설정</Text>
        <Text style={styles.subtitle}>Phase 2 MVP 공통 설정 항목입니다.</Text>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Profile</Text>
          <Text style={styles.value}>{profileBundle.profile?.display_name ?? "미설정"}</Text>
          <PrimaryButton label="프로필 기본 수정" onPress={() => router.push("/(onboarding)/create-profile?mode=edit")} />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Common Settings</Text>
          <View style={styles.buttonGroup}>
            <PrimaryButton label="Language" onPress={() => router.push("/(settings)/language")} variant="secondary" />
            <PrimaryButton label="Region" onPress={() => router.push("/(settings)/region")} variant="secondary" />
            <PrimaryButton label="Account Roles" onPress={() => router.push("/(settings)/roles")} variant="secondary" />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>App</Text>
          <Text style={styles.value}>버전 {appVersion}</Text>
          <PrimaryButton label="Logout" onPress={() => void signOut()} variant="outline" />
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
