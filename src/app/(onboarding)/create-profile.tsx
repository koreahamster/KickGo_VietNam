import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PrimaryButton } from "@/components/PrimaryButton";
import { SelectField } from "@/components/SelectField";
import { COLORS } from "@/constants/colors";
import { getDistrictOptions, getProvinceOptions, type SelectOption } from "@/constants/profile-options";
import { SPACING } from "@/constants/spacing";
import { withAppFont } from "@/constants/typography";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import type { SupportedLanguage } from "@/types/profile.types";

const LANGUAGE_OPTIONS: SelectOption[] = [
  { label: "\ud55c\uad6d\uc5b4", value: "ko" },
  { label: "Tieng Viet", value: "vi" },
  { label: "English", value: "en" },
];

const COPY = {
  back: "\uc774\uc804",
  loadingTitle: "\ud504\ub85c\ud544 \ud654\uba74\uc744 \ubd88\ub7ec\uc624\ub294 \uc911\uc785\ub2c8\ub2e4.",
  titleCreate: "\uacf5\ud1b5 \ud504\ub85c\ud544 \uc124\uc815",
  titleEdit: "\uacf5\ud1b5 \ud504\ub85c\ud544 \uc218\uc815",
  subtitleCreate: "\ub2c9\ub124\uc784\uacfc \uc9c0\uc5ed, \uc5b8\uc5b4\ub97c \uba3c\uc800 \uc124\uc815\ud574\uc8fc\uc138\uc694.",
  subtitleEdit: "\uae30\ubcf8 \ud504\ub85c\ud544 \uc815\ubcf4\ub97c \uc218\uc815\ud560 \uc218 \uc788\uc2b5\ub2c8\ub2e4.",
  nameLabel: "\ub2c9\ub124\uc784",
  namePlaceholder: "\ub2c9\ub124\uc784\uc744 \uc785\ub825\ud574\uc8fc\uc138\uc694",
  countryLabel: "\uad6d\uac00",
  countryValue: "Vietnam",
  provinceLabel: "\ub3c4\uc2dc",
  provincePlaceholder: "\ub3c4\uc2dc\ub97c \uc120\ud0dd\ud574\uc8fc\uc138\uc694",
  districtLabel: "\uad6c\uc5ed",
  districtPlaceholder: "\uad6c\uc5ed\uc744 \uc120\ud0dd\ud574\uc8fc\uc138\uc694",
  languageLabel: "\uc120\ud638 \uc5b8\uc5b4",
  languagePlaceholder: "\uc5b8\uc5b4\ub97c \uc120\ud0dd\ud574\uc8fc\uc138\uc694",
  saveCreate: "\uc800\uc7a5\ud558\uace0 \uacc4\uc18d\ud558\uae30",
  saveEdit: "\uc218\uc815 \uc800\uc7a5",
  continueTitle: "\uc774\ubbf8 \uacf5\ud1b5 \ud504\ub85c\ud544\uc774 \uc788\uc2b5\ub2c8\ub2e4.",
  continueBody: "\ub2e4\uc74c \ub2e8\uacc4\ub85c \uc774\ub3d9\ud558\uac70\ub098 \ud648\uc73c\ub85c \ub3cc\uc544\uac08 \uc218 \uc788\uc2b5\ub2c8\ub2e4.",
  continueOnboarding: "\uc628\ubcf4\ub529 \uacc4\uc18d\ud558\uae30",
  goHome: "\ud648\uc73c\ub85c \uc774\ub3d9",
  validationName: "\ub2c9\ub124\uc784\uc740 \ud544\uc218\uc785\ub2c8\ub2e4.",
  validationProvince: "\ub3c4\uc2dc\ub97c \uc120\ud0dd\ud574\uc8fc\uc138\uc694.",
  validationDistrict: "\uad6c\uc5ed\uc744 \uc120\ud0dd\ud574\uc8fc\uc138\uc694.",
  saveLoading: "\uc800\uc7a5 \uc911...",
};

function getNextRoute(hasPlayerProfile: boolean): "/(onboarding)/player" | "/(tabs)/home" {
  return hasPlayerProfile ? "/(tabs)/home" : "/(onboarding)/player";
}

export default function CreateProfileScreen(): JSX.Element {
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const isEditMode = mode === "edit";
  const auth = useAuth();
  const profile = useProfile({ enabled: auth.isAuthenticated });

  const [displayName, setDisplayName] = useState("");
  const [countryCode] = useState("VN");
  const [provinceCode, setProvinceCode] = useState<string | null>(null);
  const [districtCode, setDistrictCode] = useState<string | null>(null);
  const [preferredLanguage, setPreferredLanguage] = useState<SupportedLanguage>("vi");
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      router.replace("/(auth)/login");
    }
  }, [auth.isAuthenticated, auth.isLoading]);

  useEffect(() => {
    const existingProfile = profile.profileBundle.profile;

    if (!existingProfile) {
      return;
    }

    setDisplayName(existingProfile.display_name ?? "");
    setProvinceCode(existingProfile.province_code ?? null);
    setDistrictCode(existingProfile.district_code ?? null);
    setPreferredLanguage(existingProfile.preferred_language ?? "vi");
  }, [profile.profileBundle.profile]);

  const provinceOptions = useMemo(() => getProvinceOptions(countryCode), [countryCode]);
  const districtOptions = useMemo(() => getDistrictOptions(provinceCode), [provinceCode]);
  const nextRoute = getNextRoute(Boolean(profile.profileBundle.playerProfile));

  const handleSubmit = async (): Promise<void> => {
    const trimmedName = displayName.trim();

    if (!trimmedName) {
      setValidationMessage(COPY.validationName);
      return;
    }

    if (!provinceCode) {
      setValidationMessage(COPY.validationProvince);
      return;
    }

    if (!districtCode) {
      setValidationMessage(COPY.validationDistrict);
      return;
    }

    setValidationMessage(null);

    try {
      if (isEditMode) {
        await profile.updateCommonProfile({
          displayName: trimmedName,
          countryCode,
          provinceCode,
          districtCode,
          preferredLanguage,
        });
        router.back();
        return;
      }

      await profile.createCommonProfile({
        displayName: trimmedName,
        birthYear: null,
        countryCode,
        provinceCode,
        districtCode,
        preferredLanguage,
        bio: "",
        initialAccountType: "player",
        visibility: "members_only",
      });

      router.replace(nextRoute);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : profile.profileErrorMessage;
      setValidationMessage(message ?? "Failed to save profile.");
    }
  };

  if (auth.isLoading || profile.isProfileLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingWrap}>
          <Text style={withAppFont(styles.loadingText)}>{COPY.loadingTitle}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!isEditMode && profile.hasProfile) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={withAppFont(styles.backLabel)}>{COPY.back}</Text>
          </Pressable>

          <View style={styles.hero}>
            <Text style={withAppFont(styles.title)}>{COPY.continueTitle}</Text>
            <Text style={withAppFont(styles.subtitle)}>{COPY.continueBody}</Text>
          </View>

          <View style={styles.card}>
            <PrimaryButton label={COPY.continueOnboarding} onPress={() => router.replace(nextRoute)} />
            <PrimaryButton label={COPY.goHome} variant="outline" onPress={() => router.replace("/(tabs)/home")} />
          </View>

          {validationMessage ? <Text style={withAppFont(styles.errorText)}>{validationMessage}</Text> : null}
          {profile.profileErrorMessage ? <Text style={withAppFont(styles.errorText)}>{profile.profileErrorMessage}</Text> : null}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={withAppFont(styles.backLabel)}>{COPY.back}</Text>
          </Pressable>

          <View style={styles.hero}>
            <Text style={withAppFont(styles.title)}>{isEditMode ? COPY.titleEdit : COPY.titleCreate}</Text>
            <Text style={withAppFont(styles.subtitle)}>{isEditMode ? COPY.subtitleEdit : COPY.subtitleCreate}</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.fieldGroup}>
              <Text style={withAppFont(styles.label)}>{COPY.nameLabel}</Text>
              <TextInput
                value={displayName}
                onChangeText={(value) => {
                  setDisplayName(value);
                  setValidationMessage(null);
                }}
                placeholder={COPY.namePlaceholder}
                placeholderTextColor={COLORS.textMuted}
                style={styles.input}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={withAppFont(styles.label)}>{COPY.countryLabel}</Text>
              <View style={styles.readOnlyField}>
                <Text style={withAppFont(styles.readOnlyValue)}>{COPY.countryValue}</Text>
              </View>
            </View>

            <SelectField
              label={COPY.provinceLabel}
              placeholder={COPY.provincePlaceholder}
              value={provinceCode}
              options={provinceOptions}
              onChange={(value) => {
                setProvinceCode(value);
                setDistrictCode(null);
                setValidationMessage(null);
              }}
            />

            <SelectField
              label={COPY.districtLabel}
              placeholder={COPY.districtPlaceholder}
              value={districtCode}
              options={districtOptions}
              onChange={(value) => {
                setDistrictCode(value);
                setValidationMessage(null);
              }}
              isDisabled={!provinceCode}
            />

            <SelectField
              label={COPY.languageLabel}
              placeholder={COPY.languagePlaceholder}
              value={preferredLanguage}
              options={LANGUAGE_OPTIONS}
              onChange={(value) => {
                setPreferredLanguage(value as SupportedLanguage);
                setValidationMessage(null);
              }}
            />

            <PrimaryButton
              label={profile.isSubmittingProfile ? COPY.saveLoading : isEditMode ? COPY.saveEdit : COPY.saveCreate}
              onPress={() => void handleSubmit()}
              isDisabled={profile.isSubmittingProfile}
            />
          </View>

          {validationMessage ? <Text style={withAppFont(styles.errorText)}>{validationMessage}</Text> : null}
          {profile.profileErrorMessage ? <Text style={withAppFont(styles.errorText)}>{profile.profileErrorMessage}</Text> : null}
          {profile.profileStatusMessage ? <Text style={withAppFont(styles.statusText)}>{profile.profileStatusMessage}</Text> : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: SPACING.screenHorizontal,
    paddingVertical: SPACING.lg,
  },
  loadingWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.screenHorizontal,
  },
  loadingText: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  backButton: {
    alignSelf: "flex-start",
    paddingVertical: 8,
  },
  backLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textSecondary,
  },
  hero: {
    marginTop: 8,
  },
  title: {
    fontSize: 30,
    fontWeight: "900",
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
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  fieldGroup: {
    gap: SPACING.sm,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  input: {
    minHeight: 54,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    backgroundColor: "#fffdf8",
    paddingHorizontal: SPACING.md,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  readOnlyField: {
    minHeight: 54,
    justifyContent: "center",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    backgroundColor: "#fffdf8",
    paddingHorizontal: SPACING.md,
  },
  readOnlyValue: {
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  errorText: {
    marginTop: SPACING.md,
    fontSize: 14,
    lineHeight: 20,
    color: "#b91c1c",
  },
  statusText: {
    marginTop: SPACING.md,
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.brand,
  },
});
