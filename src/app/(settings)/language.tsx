import { router } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PrimaryButton } from "@/components/PrimaryButton";
import { SelectField } from "@/components/SelectField";
import { COLORS } from "@/constants/colors";
import { LANGUAGE_OPTIONS } from "@/constants/profile-options";
import { SPACING } from "@/constants/spacing";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import type { SupportedLanguage } from "@/types/profile.types";

export default function LanguageScreen(): JSX.Element {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const {
    hasProfile,
    isProfileLoading,
    isSubmittingProfile,
    profileBundle,
    profileErrorMessage,
    profileStatusMessage,
    updateCommonProfile,
  } = useProfile({ enabled: isAuthenticated });
  const [language, setLanguage] = useState<SupportedLanguage | null>(null);

  useEffect(() => {
    setLanguage(profileBundle.profile?.preferred_language ?? null);
  }, [profileBundle.profile?.preferred_language]);

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

  const handleSave = async (): Promise<void> => {
    if (!language) {
      return;
    }

    try {
      await updateCommonProfile({ preferredLanguage: language });
      router.back();
    } catch {
      // Error state is already handled in useProfile.
    }
  };

  if (isAuthLoading || isProfileLoading) {
    return (
      <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.title}>언어 설정</Text>
          <Text style={styles.subtitle}>현재 언어 설정을 불러오고 있습니다.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>언어 설정</Text>
        <Text style={styles.subtitle}>앱 기본 표시 언어를 변경합니다.</Text>
        <View style={styles.card}>
          <SelectField
            label="언어"
            placeholder="언어 선택"
            value={language}
            options={LANGUAGE_OPTIONS}
            onChange={(value) => setLanguage(value as SupportedLanguage | null)}
          />
          <PrimaryButton
            label={isSubmittingProfile ? "저장 중..." : "언어 저장"}
            onPress={() => {
              void handleSave();
            }}
            isDisabled={isSubmittingProfile || !language}
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
