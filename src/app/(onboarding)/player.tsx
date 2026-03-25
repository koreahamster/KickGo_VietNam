import { useEffect } from "react";

import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "@/components/PrimaryButton";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";

export default function PlayerOnboardingEntryScreen(): JSX.Element {
  const auth = useAuth();
  const profile = useProfile({ enabled: auth.isAuthenticated });

  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      router.replace("/(auth)/login");
    }
  }, [auth.isAuthenticated, auth.isLoading]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>선수 프로필을 완료해주세요</Text>
        <Text style={styles.body}>
          포지션과 능력치 설정은 프로필 탭에서 이어서 진행할 수 있습니다.
        </Text>
        {!profile.hasProfile ? (
          <PrimaryButton label="공통 프로필 만들기" onPress={() => router.replace("/(onboarding)/create-profile")} />
        ) : (
          <PrimaryButton label="프로필 탭으로 이동" onPress={() => router.replace("/(tabs)/profile")} />
        )}
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
