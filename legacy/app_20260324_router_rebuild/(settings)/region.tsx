import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PrimaryButton } from "@/components/PrimaryButton";
import { SelectField } from "@/components/SelectField";
import { COLORS } from "@/constants/colors";
import { getDistrictOptions, getProvinceOptions } from "@/constants/profile-options";
import { SPACING } from "@/constants/spacing";
import { useI18n } from "@/core/i18n/LanguageProvider";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";

export default function RegionScreen(): JSX.Element {
  const { t } = useI18n();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const {
    hasProfile,
    isProfileLoading,
    isSubmittingProfile,
    nextOnboardingRoute,
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
    }
  }, [isAuthenticated, isAuthLoading]);

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
      // handled in hook
    }
  };

  if (isAuthLoading || isProfileLoading) {
    return (
      <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.title}>{t("settings.region.title")}</Text>
          <Text style={styles.subtitle}>{t("settings.region.loadingSubtitle")}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!hasProfile) {
    return (
      <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.title}>{t("settings.region.title")}</Text>
          <Text style={styles.subtitle}>{t("settings.region.needProfileSubtitle")}</Text>
          <View style={styles.card}>
            <PrimaryButton label={t("settings.region.continueOnboarding")} onPress={() => router.replace(nextOnboardingRoute)} />
            <PrimaryButton label={t("settings.region.backToSettings")} variant="outline" onPress={() => router.replace("/(settings)/settings")} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>{t("settings.region.title")}</Text>
        <Text style={styles.subtitle}>{t("settings.region.subtitle")}</Text>
        <View style={styles.card}>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>{t("settings.region.country")}</Text>
            <View style={styles.readOnlyField}>
              <Text style={styles.readOnlyValue}>{t("settings.region.countryValue")}</Text>
            </View>
            <Text style={styles.helperText}>{t("settings.region.helper")}</Text>
          </View>
          <SelectField
            label={t("settings.region.province")}
            placeholder={t("settings.region.selectProvince")}
            value={provinceCode}
            options={provinceOptions}
            onChange={(value) => {
              setProvinceCode(value);
              setDistrictCode(null);
            }}
          />
          <SelectField
            label={t("settings.region.district")}
            placeholder={t("settings.region.selectDistrict")}
            value={districtCode}
            options={districtOptions}
            onChange={setDistrictCode}
            isDisabled={!provinceCode}
          />
          <PrimaryButton
            label={isSubmittingProfile ? t("settings.region.saving") : t("settings.region.save")}
            onPress={() => void handleSave()}
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