import { router } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PrimaryButton } from "@/components/PrimaryButton";
import { ACCOUNT_TYPE_OPTIONS, getOptionLabel, LANGUAGE_OPTIONS } from "@/constants/profile-options";
import { COLORS } from "@/constants/colors";
import { SPACING } from "@/constants/spacing";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";

export default function ProfileTabScreen(): JSX.Element {
  const { isAuthenticated, isLoading: isAuthLoading, user } = useAuth();
  const { hasProfile, isProfileLoading, pendingRoleOnboarding, profileBundle } = useProfile({ enabled: isAuthenticated });

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!isAuthenticated) {
      router.replace("/(auth)/login");
    }
  }, [isAuthenticated, isAuthLoading]);

  if (isAuthLoading || isProfileLoading) {
    return (
      <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.title}>{"\uD504\uB85C\uD544"}</Text>
          <Text style={styles.description}>{"\uD504\uB85C\uD544 \uC815\uBCF4\uB97C \uBD88\uB7EC\uC624\uACE0 \uC788\uC2B5\uB2C8\uB2E4."}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!hasProfile) {
    return (
      <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.title}>{"\uD504\uB85C\uD544"}</Text>
          <Text style={styles.description}>{"\uACF5\uD1B5 \uD504\uB85C\uD544\uC744 \uBA3C\uC800 \uC644\uC131\uD558\uBA74 \uC124\uC815\uACFC \uD504\uB85C\uD544 \uC815\uBCF4\uB97C \uAD00\uB9AC\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4."}</Text>
          <View style={styles.buttonGroup}>
            <PrimaryButton label={"\uACF5\uD1B5 \uD504\uB85C\uD544 \uC124\uC815"} onPress={() => router.push("/(onboarding)/create-profile")} />
            <PrimaryButton label={"\uC804\uD654\uBC88\uD638 \uC778\uC99D"} onPress={() => router.push("/(auth)/phone-verify")} variant="secondary" />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const profile = profileBundle.profile;
  const roles = profileBundle.accountTypes
    .map((role) => getOptionLabel(ACCOUNT_TYPE_OPTIONS, role))
    .filter((value): value is string => Boolean(value));

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>{"\uD504\uB85C\uD544"}</Text>
        <View style={styles.card}>
          <Text style={styles.label}>{"\uC774\uB984"}</Text>
          <Text style={styles.value}>{profile?.display_name ?? "-"}</Text>
          <Text style={styles.label}>{"\uC774\uBA54\uC77C"}</Text>
          <Text style={styles.value}>{user?.email ?? "-"}</Text>
          <Text style={styles.label}>{"\uC5B8\uC5B4"}</Text>
          <Text style={styles.value}>
            {getOptionLabel(LANGUAGE_OPTIONS, profile?.preferred_language ?? null) ?? "-"}
          </Text>
          <Text style={styles.label}>{"\uC9C0\uC5ED"}</Text>
          <Text style={styles.value}>
            {profile?.province_code ?? "-"} / {profile?.district_code ?? "-"}
          </Text>
          <Text style={styles.label}>{"\uC5ED\uD560"}</Text>
          <Text style={styles.value}>{roles.length > 0 ? roles.join(", ") : "-"}</Text>
        </View>
        <View style={styles.buttonGroup}>
          <PrimaryButton
            label={"\uD504\uB85C\uD544 \uAE30\uBCF8 \uC218\uC815"}
            onPress={() => router.push("/(onboarding)/create-profile?mode=edit")}
          />
          {pendingRoleOnboarding.length > 0 ? (
            <PrimaryButton
              label={"\uC5ED\uD560\uBCC4 \uC628\uBCF4\uB529 \uACC4\uC18D"}
              onPress={() => router.push("/(onboarding)/role-onboarding")}
              variant="secondary"
            />
          ) : null}
          <PrimaryButton label={"\uC124\uC815"} onPress={() => router.push("/(settings)/settings")} variant="outline" />
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
  description: { marginTop: SPACING.sm, fontSize: 15, lineHeight: 22, color: COLORS.textSecondary },
  card: {
    marginTop: SPACING.xl,
    padding: SPACING.lg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    gap: SPACING.sm,
  },
  label: { fontSize: 13, fontWeight: "700", color: COLORS.textMuted, textTransform: "uppercase" },
  value: { fontSize: 16, color: COLORS.textPrimary, marginBottom: SPACING.sm },
  buttonGroup: { marginTop: SPACING.xl, gap: SPACING.md },
});