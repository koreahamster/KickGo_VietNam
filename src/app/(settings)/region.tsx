import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PrimaryButton } from "@/components/PrimaryButton";
import { SelectField } from "@/components/SelectField";
import { COLORS } from "@/constants/colors";
import { getDistrictOptions, getProvinceOptions } from "@/constants/profile-options";
import { SPACING } from "@/constants/spacing";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";

export default function RegionScreen(): JSX.Element {
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
  const [countryCode] = useState<string>("VN");
  const [provinceCode, setProvinceCode] = useState<string | null>(null);
  const [districtCode, setDistrictCode] = useState<string | null>(null);

  useEffect(() => {
    const profile = profileBundle.profile;
    if (!profile) {
      return;
    }

    setProvinceCode(profile.province_code ?? null);
    setDistrictCode(profile.district_code ?? null);
  }, [profileBundle.profile]);

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

  const provinceOptions = useMemo(() => getProvinceOptions(countryCode), [countryCode]);
  const districtOptions = useMemo(() => getDistrictOptions(provinceCode), [provinceCode]);

  const handleSave = async (): Promise<void> => {
    if (!provinceCode || !districtCode) {
      return;
    }

    try {
      await updateCommonProfile({ countryCode, provinceCode, districtCode });
      router.back();
    } catch {
      // Error state is already handled in useProfile.
    }
  };

  if (isAuthLoading || isProfileLoading) {
    return (
      <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.title}>{"\uC9C0\uC5ED \uC124\uC815"}</Text>
          <Text style={styles.subtitle}>{"\uD604\uC7AC \uC9C0\uC5ED \uC124\uC815\uC744 \uBD88\uB7EC\uC624\uACE0 \uC788\uC2B5\uB2C8\uB2E4."}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>{"\uC9C0\uC5ED \uC124\uC815"}</Text>
        <Text style={styles.subtitle}>
          {"\uACF5\uD1B5 \uD504\uB85C\uD544\uC5D0 \uC800\uC7A5\uB418\uB294 \uC9C0\uC5ED \uCF54\uB4DC\uB97C \uC218\uC815\uD569\uB2C8\uB2E4. \uD604\uC7AC MVP\uC5D0\uC11C\uB294 \uBCA0\uD2B8\uB0A8 \uC9C0\uC5ED \uB370\uC774\uD130\uB9CC \uC81C\uACF5\uD569\uB2C8\uB2E4."}
        </Text>
        <View style={styles.card}>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>{"\uAD6D\uAC00"}</Text>
            <View style={styles.readOnlyField}>
              <Text style={styles.readOnlyValue}>Vietnam</Text>
            </View>
            <Text style={styles.helperText}>
              {"Settings\uC758 \uC9C0\uC5ED \uBCC0\uACBD\uB3C4 \uC628\uBCF4\uB529\uACFC \uB3D9\uC77C\uD55C \uB0B4\uBD80 \uC815\uC801 \uBCA0\uD2B8\uB0A8 \uC9C0\uC5ED \uB370\uC774\uD130 \uAE30\uC900\uC73C\uB85C \uB3D9\uC791\uD569\uB2C8\uB2E4."}
            </Text>
          </View>
          <SelectField
            label={"\uC2DC/\uC131"}
            placeholder={"\uC2DC/\uC131 \uC120\uD0DD"}
            value={provinceCode}
            options={provinceOptions}
            onChange={(value) => {
              setProvinceCode(value);
              setDistrictCode(null);
            }}
          />
          <SelectField
            label={"\uAD6C/\uAD70"}
            placeholder={"\uAD6C/\uAD70 \uC120\uD0DD"}
            value={districtCode}
            options={districtOptions}
            onChange={setDistrictCode}
            isDisabled={!provinceCode}
          />
          <PrimaryButton
            label={isSubmittingProfile ? "\uC800\uC7A5 \uC911..." : "\uC9C0\uC5ED \uC800\uC7A5"}
            onPress={() => {
              void handleSave();
            }}
            isDisabled={isSubmittingProfile || !provinceCode || !districtCode}
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
  fieldGroup: { gap: SPACING.sm },
  label: { fontSize: 14, fontWeight: "700", color: COLORS.textPrimary },
  readOnlyField: {
    minHeight: 54,
    justifyContent: "center",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#f6f1e4",
    paddingHorizontal: SPACING.md,
  },
  readOnlyValue: { fontSize: 15, fontWeight: "600", color: COLORS.textPrimary },
  helperText: { fontSize: 13, lineHeight: 19, color: COLORS.textSecondary },
  errorText: { marginTop: SPACING.lg, fontSize: 14, lineHeight: 20, color: "#b83a3a" },
  statusText: { marginTop: SPACING.lg, fontSize: 14, lineHeight: 20, color: COLORS.brand },
});
