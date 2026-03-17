import { router } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PrimaryButton } from "@/components/PrimaryButton";
import { COLORS } from "@/constants/colors";
import { SPACING } from "@/constants/spacing";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";

export default function PhoneVerifyScreen(): JSX.Element {
  const { isAuthenticated, isLoading, signOut } = useAuth();
  const { hasProfile, isProfileLoading, pendingRoleOnboarding } = useProfile({ enabled: isAuthenticated });

  useEffect(() => {
    if (isLoading || isProfileLoading) {
      return;
    }

    if (!isAuthenticated) {
      router.replace("/(auth)/login");
      return;
    }

    if (!hasProfile) {
      return;
    }

    if (pendingRoleOnboarding.length > 0) {
      router.replace("/(onboarding)/role-onboarding");
      return;
    }

    router.replace("/");
  }, [hasProfile, isAuthenticated, isLoading, isProfileLoading, pendingRoleOnboarding.length]);

  const handleContinue = (): void => {
    if (hasProfile) {
      if (pendingRoleOnboarding.length > 0) {
        router.replace("/(onboarding)/role-onboarding");
        return;
      }

      router.replace("/");
      return;
    }

    router.replace("/(onboarding)/create-profile");
  };

  const handleSignOut = async (): Promise<void> => {
    await signOut();
    router.replace("/");
  };

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>전화번호 인증</Text>
        <Text style={styles.subtitle}>문서 기준 흐름에 맞춰 전화번호 인증 단계를 먼저 통과합니다.</Text>
        <View style={styles.card}>
          <Text style={styles.helperText}>이번 MVP에서는 온보딩 흐름 연결과 이후 단계 이동까지 우선 구현합니다.</Text>
          <PrimaryButton
            label={hasProfile ? "다음 단계로 계속" : "공통 프로필 입력으로 계속"}
            onPress={handleContinue}
          />
          <PrimaryButton label="로그아웃" variant="outline" onPress={() => { void handleSignOut(); }} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, paddingHorizontal: SPACING.screenHorizontal, paddingVertical: SPACING.xl, backgroundColor: COLORS.background },
  title: { fontSize: 30, fontWeight: "800", color: COLORS.textPrimary },
  subtitle: { marginTop: SPACING.sm, fontSize: 15, lineHeight: 22, color: COLORS.textSecondary },
  card: { marginTop: SPACING.xl, padding: SPACING.lg, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface, gap: SPACING.md },
  helperText: { fontSize: 14, lineHeight: 21, color: COLORS.textSecondary },
});
