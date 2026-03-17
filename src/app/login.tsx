import { Alert, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PrimaryButton } from "@/components/PrimaryButton";
import { COLORS } from "@/constants/colors";
import { SPACING } from "@/constants/spacing";
import { AUTH_PROVIDER_LABEL } from "@/types/auth.types";

export default function LoginScreen(): JSX.Element {
  const handleGoogleLoginPress = (): void => {
    console.log("Google login tapped");
    Alert.alert("임시 로그인", "인증 로직은 다음 단계에서 구현됩니다.");
  };

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Login</Text>
        <Text style={styles.subtitle}>
          현재 단계에서는 로그인 UI와 화면 이동만 제공합니다.
        </Text>

        <View style={styles.card}>
          <Text style={styles.providerLabel}>{AUTH_PROVIDER_LABEL.google}</Text>
          <PrimaryButton
            label="Google로 로그인"
            onPress={handleGoogleLoginPress}
            variant="outline"
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
    paddingHorizontal: SPACING.screenHorizontal,
    paddingVertical: SPACING.xl,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  subtitle: {
    marginTop: SPACING.sm,
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.textSecondary,
  },
  card: {
    marginTop: SPACING.xl,
    padding: SPACING.lg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    gap: SPACING.md,
  },
  providerLabel: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: COLORS.textMuted,
  },
});
