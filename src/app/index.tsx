import { router } from "expo-router";
import { Alert, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppLogo } from "@/components/AppLogo";
import { PrimaryButton } from "@/components/PrimaryButton";
import { COLORS } from "@/constants/colors";
import { SPACING } from "@/constants/spacing";

export default function HomeScreen(): JSX.Element {
  const handleLoginPress = (): void => {
    router.push("/login");
  };

  const handleGetStartedPress = (): void => {
    Alert.alert("준비 중", "이번 단계에서는 홈 화면 구조만 구현합니다.");
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
      <View style={styles.container}>
        <AppLogo />
        <Text style={styles.title}>FootGo</Text>
        <Text style={styles.description}>
          풋볼 팀 관리와 경기 운영을 간편하게
        </Text>

        <View style={styles.buttonGroup}>
          <PrimaryButton label="로그인" onPress={handleLoginPress} />
          <PrimaryButton
            label="시작하기"
            onPress={handleGetStartedPress}
            variant="secondary"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.screenHorizontal,
    backgroundColor: COLORS.background,
  },
  title: {
    marginTop: SPACING.md,
    fontSize: 34,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  description: {
    marginTop: SPACING.sm,
    textAlign: "center",
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.textSecondary,
  },
  buttonGroup: {
    width: "100%",
    marginTop: SPACING.xl,
    gap: SPACING.md,
  },
});
