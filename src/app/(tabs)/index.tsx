import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppLogo } from "@/components/AppLogo";
import { PrimaryButton } from "@/components/PrimaryButton";
import { COLORS } from "@/constants/colors";
import { SPACING } from "@/constants/spacing";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";

export default function HomeScreen(): JSX.Element {
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
        <Text style={styles.title}>FootGo</Text>
        {isLoading || (isAuthenticated && isProfileLoading) ? (
          <Text style={styles.description}>
            {"\uACC4\uC815 \uC0C1\uD0DC\uC640 \uC628\uBCF4\uB529 \uC9C4\uD589 \uC5EC\uBD80\uB97C \uD655\uC778\uD558\uACE0 \uC788\uC2B5\uB2C8\uB2E4."}
          </Text>
        ) : !isAuthenticated ? (
          <>
            <Text style={styles.description}>
              {
                "\uD300 \uC6B4\uC601\uBD80\uD130 \uACBD\uAE30 \uAE30\uB85D\uAE4C\uC9C0, \uC544\uB9C8\uCD94\uC5B4 \uD48B\uBCFC \uAD00\uB9AC\uB97C \uD55C\uACF3\uC5D0\uC11C \uAC04\uD3B8\uD558\uAC8C."
              }
            </Text>
            <View style={styles.buttonGroup}>
              <PrimaryButton
                label={"\uB85C\uADF8\uC778"}
                onPress={() => router.push("/(auth)/login")}
              />
              <PrimaryButton
                label={"\uD68C\uC6D0\uAC00\uC785"}
                onPress={() => router.push("/(auth)/signup")}
                variant="secondary"
              />
            </View>
          </>
        ) : !hasProfile ? (
          <>
            <Text style={styles.description}>
              {
                "\uACF5\uD1B5 \uD504\uB85C\uD544\uC774 \uC544\uC9C1 \uC644\uB8CC\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4. \uB2E4\uC74C \uB2E8\uACC4\uB97C \uC9C4\uD589\uD574 \uC8FC\uC138\uC694."
              }
            </Text>
            <View style={styles.buttonGroup}>
              <PrimaryButton
                label={"\uC804\uD654\uBC88\uD638 \uC778\uC99D"}
                onPress={() => router.push("/(auth)/phone-verify")}
              />
              <PrimaryButton
                label={"\uACF5\uD1B5 \uD504\uB85C\uD544 \uC124\uC815"}
                onPress={() => router.push("/(onboarding)/create-profile")}
                variant="secondary"
              />
              <PrimaryButton
                label={"\uB85C\uADF8\uC544\uC6C3"}
                onPress={() => void signOut()}
                variant="outline"
              />
            </View>
          </>
        ) : pendingRoleOnboarding.length > 0 ? (
          <>
            <Text style={styles.description}>
              {
                "\uC5ED\uD560\uBCC4 \uC628\uBCF4\uB529\uC774 \uB0A8\uC544 \uC788\uC2B5\uB2C8\uB2E4. \uD544\uC694\uD55C \uCD94\uAC00 \uC815\uBCF4\uB97C \uC785\uB825\uD558\uBA74 \uD648\uC73C\uB85C \uB118\uC5B4\uAC08 \uC218 \uC788\uC2B5\uB2C8\uB2E4."
              }
            </Text>
            <View style={styles.buttonGroup}>
              <PrimaryButton
                label={"\uC5ED\uD560\uBCC4 \uC628\uBCF4\uB529 \uACC4\uC18D"}
                onPress={() => router.push("/(onboarding)/role-onboarding")}
              />
              <PrimaryButton
                label={"\uD504\uB85C\uD544"}
                onPress={() => router.push("/(tabs)/profile")}
                variant="secondary"
              />
              <PrimaryButton
                label={"\uB85C\uADF8\uC544\uC6C3"}
                onPress={() => void signOut()}
                variant="outline"
              />
            </View>
          </>
        ) : (
          <>
            <Text style={styles.description}>
              {
                "\uD658\uC601\uD569\uB2C8\uB2E4. \uACF5\uD1B5 \uD504\uB85C\uD544\uACFC \uC5ED\uD560\uBCC4 \uC628\uBCF4\uB529\uC774 \uC644\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4."
              }
            </Text>
            <Text style={styles.userText}>
              {profileBundle.profile?.display_name ?? user?.email ?? "-"}
            </Text>
            <View style={styles.buttonGroup}>
              <PrimaryButton
                label={"\uD504\uB85C\uD544\uB85C \uC774\uB3D9"}
                onPress={() => router.push("/(tabs)/profile")}
              />
              <PrimaryButton
                label={"\uC124\uC815"}
                onPress={() => router.push("/(settings)/settings")}
                variant="secondary"
              />
              <PrimaryButton
                label={"\uB85C\uADF8\uC544\uC6C3"}
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
