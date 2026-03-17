import { router } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PrimaryButton } from "@/components/PrimaryButton";
import { ACCOUNT_TYPE_OPTIONS, getOptionLabel } from "@/constants/profile-options";
import { COLORS } from "@/constants/colors";
import { SPACING } from "@/constants/spacing";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import type { AccountType } from "@/types/profile.types";

const ROLE_ORDER: AccountType[] = ["player", "referee", "facility_manager"];

export default function RolesScreen(): JSX.Element {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const {
    accountTypes,
    addAccountType,
    hasProfile,
    isProfileLoading,
    isSubmittingProfile,
    profileErrorMessage,
    profileStatusMessage,
  } = useProfile({ enabled: isAuthenticated });
  const missingRoles = ROLE_ORDER.filter((role) => !accountTypes.includes(role));

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

  const handleAddRole = async (role: AccountType): Promise<void> => {
    try {
      await addAccountType(role);

      if (role === "player" || role === "referee") {
        router.push("/(onboarding)/role-onboarding");
      }
    } catch {
      // Error state is already handled in useProfile.
    }
  };

  if (isAuthLoading || isProfileLoading) {
    return (
      <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.title}>계정 역할</Text>
          <Text style={styles.subtitle}>현재 역할 정보를 불러오고 있습니다.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>계정 역할</Text>
        <Text style={styles.subtitle}>현재 계정에 필요한 역할을 추가할 수 있습니다.</Text>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>보유 역할</Text>
          {accountTypes.length > 0 ? (
            accountTypes.map((role) => (
              <Text key={role} style={styles.value}>
                {getOptionLabel(ACCOUNT_TYPE_OPTIONS, role)}
              </Text>
            ))
          ) : (
            <Text style={styles.value}>아직 역할이 없습니다.</Text>
          )}
        </View>
        {missingRoles.length > 0 ? (
          <View style={styles.buttonGroup}>
            {missingRoles.map((role) => (
              <PrimaryButton
                key={role}
                label={`${getOptionLabel(ACCOUNT_TYPE_OPTIONS, role)} 추가`}
                onPress={() => {
                  void handleAddRole(role);
                }}
                variant="secondary"
                isDisabled={isSubmittingProfile}
              />
            ))}
          </View>
        ) : (
          <Text style={styles.helperText}>현재 지원되는 역할이 모두 추가된 상태입니다.</Text>
        )}
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
    gap: SPACING.sm,
  },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: COLORS.textPrimary },
  value: { fontSize: 15, color: COLORS.textSecondary },
  buttonGroup: { marginTop: SPACING.xl, gap: SPACING.md },
  helperText: { marginTop: SPACING.xl, fontSize: 14, lineHeight: 21, color: COLORS.textSecondary },
  errorText: { marginTop: SPACING.lg, fontSize: 14, lineHeight: 20, color: "#b83a3a" },
  statusText: { marginTop: SPACING.lg, fontSize: 14, lineHeight: 20, color: COLORS.brand },
});
