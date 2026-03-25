import { useEffect } from "react";

import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Alert, StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "@/components/PrimaryButton";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";

export default function RefereeOnboardingScreen(): JSX.Element {
  const auth = useAuth();
  const profile = useProfile({ enabled: auth.isAuthenticated });

  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      router.replace("/(auth)/login");
    }
  }, [auth.isAuthenticated, auth.isLoading]);

  const hasCommonProfile = profile.hasProfile;
  const hasRefereeProfile = Boolean(profile.profileBundle.refereeProfile);

  const handleCreate = async (): Promise<void> => {
    if (!hasCommonProfile) {
      router.replace("/(onboarding)/create-profile");
      return;
    }

    if (hasRefereeProfile) {
      router.replace("/");
      return;
    }

    try {
      await profile.createRefereeProfile();
      router.replace("/");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "심판 프로필 생성에 실패했습니다.";
      Alert.alert("심판 등록 실패", message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>심판 프로필을 등록해주세요</Text>
        <Text style={styles.body}>
          심판 프로필을 등록하면 경기 배정을 받고 수익과 활동 기록을 확인할 수 있습니다.
        </Text>
        <PrimaryButton
          label={hasRefereeProfile ? "홈으로 이동" : "심판 등록하기"}
          onPress={() => void handleCreate()}
          isDisabled={profile.isSubmittingProfile}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
    gap: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#111827",
  },
  body: {
    fontSize: 15,
    lineHeight: 24,
    color: "#6b7280",
  },
});
