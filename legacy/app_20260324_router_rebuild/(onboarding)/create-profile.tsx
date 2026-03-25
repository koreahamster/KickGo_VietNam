import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ConsentCheckField } from "@/components/ConsentCheckField";
import { PrimaryButton } from "@/components/PrimaryButton";
import { SelectField } from "@/components/SelectField";
import { CURRENT_POLICY_VERSION } from "@/constants/consent";
import { COLORS } from "@/constants/colors";
import {
  getAccountTypeOptions,
  getDistrictOptions,
  getOptionLabel,
  getProvinceOptions,
  LANGUAGE_OPTIONS,
} from "@/constants/profile-options";
import { SPACING } from "@/constants/spacing";
import { useI18n } from "@/core/i18n/LanguageProvider";
import { useAuth } from "@/hooks/useAuth";
import { useConsent } from "@/hooks/useConsent";
import { useProfile } from "@/hooks/useProfile";
import { getOnboardingRoute } from "@/lib/onboarding";
import type { AccountType, SupportedLanguage } from "@/types/profile.types";

function normalizeText(value: string): string {
  return value.trim();
}

function parseBirthYear(value: string): number | null {
  const normalized = value.trim();

  if (!normalized) {
    return null;
  }

  const numericValue = Number(normalized);
  return Number.isNaN(numericValue) ? Number.NaN : numericValue;
}

function getLanguageLabel(language: SupportedLanguage): string {
  return getOptionLabel(LANGUAGE_OPTIONS, language) ?? 'English';
}

export default function CreateProfileScreen(): JSX.Element {
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const isEditMode = mode === "edit";
  const { language: appLanguage, setLanguage, t } = useI18n();
  const { isAuthenticated, isLoading: isAuthLoading, signOut } = useAuth();
  const {
    accountTypes,
    createCommonProfile,
    hasProfile,
    isProfileLoading,
    isSubmittingProfile,
    nextOnboardingRoute,
    profileBundle,
    profileErrorMessage,
    profileStatusMessage,
    updateCommonProfile,
    loadProfileBundle,
  } = useProfile({ enabled: isAuthenticated });
  const {
    hasRequiredPrivacyConsent,
    marketingOptIn,
    isConsentLoading,
    isSubmittingConsent,
    consentErrorMessage,
    consentStatusMessage,
    recordConsent,
  } = useConsent({ enabled: isAuthenticated });

  const profile = profileBundle.profile;
  const preferredLanguage = profile?.preferred_language ?? appLanguage;
  const [displayName, setDisplayName] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [countryCode] = useState("VN");
  const [provinceCode, setProvinceCode] = useState<string | null>(null);
  const [districtCode, setDistrictCode] = useState<string | null>(null);
  const [initialAccountType, setInitialAccountType] = useState<AccountType | null>(null);
  const [bio, setBio] = useState("");
  const [privacyAgreed, setPrivacyAgreed] = useState<boolean>(false);
  const [marketingAgreed, setMarketingAgreed] = useState<boolean>(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) {
      return;
    }

    setDisplayName(profile.display_name ?? "");
    setBirthYear(profile.birth_year ? String(profile.birth_year) : "");
    setProvinceCode(profile.province_code ?? null);
    setDistrictCode(profile.district_code ?? null);
    setBio(profile.bio ?? "");
    setInitialAccountType(accountTypes[0] ?? null);
  }, [accountTypes, profile]);

  useEffect(() => {
    setPrivacyAgreed(hasRequiredPrivacyConsent);
    setMarketingAgreed(marketingOptIn);
  }, [hasRequiredPrivacyConsent, marketingOptIn]);

  useEffect(() => {
    if (!profile?.preferred_language) {
      return;
    }

    if (profile.preferred_language !== appLanguage) {
      void setLanguage(profile.preferred_language);
    }
  }, [appLanguage, profile?.preferred_language, setLanguage]);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!isAuthenticated) {
      router.replace("/(auth)/login");
    }
  }, [isAuthenticated, isAuthLoading]);

  const provinceOptions = useMemo(() => getProvinceOptions(countryCode), [countryCode]);
  const accountTypeOptions = useMemo(() => getAccountTypeOptions(appLanguage), [appLanguage]);
  const districtOptions = useMemo(() => getDistrictOptions(provinceCode), [provinceCode]);
  const isBusy = isSubmittingProfile || isSubmittingConsent;

  const handleSignOut = async (): Promise<void> => {
    Keyboard.dismiss();
    await signOut();
    router.replace("/");
  };

  const handleCancelEdit = (): void => {
    Keyboard.dismiss();
    router.back();
  };

  const saveConsentSelections = async (): Promise<void> => {
    if (!privacyAgreed) {
      throw new Error(t("onboarding.createProfile.validationPrivacy"));
    }

    await recordConsent({
      consentType: "privacy_policy",
      isAgreed: true,
      policyVersion: CURRENT_POLICY_VERSION,
    });

    await recordConsent({
      consentType: "marketing",
      isAgreed: marketingAgreed,
      policyVersion: CURRENT_POLICY_VERSION,
    });
  };

  const handleContinueWithExistingProfile = async (): Promise<void> => {
    Keyboard.dismiss();
    setValidationMessage(null);

    try {
      if (!hasRequiredPrivacyConsent) {
        await saveConsentSelections();
      }

      router.replace(nextOnboardingRoute);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setValidationMessage(error.message);
      }
    }
  };

  const handleSubmit = async (): Promise<void> => {
    Keyboard.dismiss();

    if (!normalizeText(displayName)) {
      setValidationMessage(t("onboarding.createProfile.validationDisplayName"));
      return;
    }

    const parsedBirthYear = parseBirthYear(birthYear);

    if (Number.isNaN(parsedBirthYear)) {
      setValidationMessage(t("onboarding.createProfile.validationBirthYear"));
      return;
    }

    if (!provinceCode || !districtCode) {
      setValidationMessage(t("onboarding.createProfile.validationRegion"));
      return;
    }

    if (!isEditMode && !initialAccountType) {
      setValidationMessage(t("onboarding.createProfile.validationRole"));
      return;
    }

    if (!isEditMode && !privacyAgreed) {
      setValidationMessage(t("onboarding.createProfile.validationPrivacy"));
      return;
    }

    setValidationMessage(null);

    try {
      if (isEditMode) {
        await updateCommonProfile({
          displayName: normalizeText(displayName),
          birthYear: parsedBirthYear,
          countryCode,
          provinceCode,
          districtCode,
          preferredLanguage,
          bio: normalizeText(bio),
        });
        await setLanguage(preferredLanguage);
        router.back();
        return;
      }

      const latestBundle = await loadProfileBundle();

      if (latestBundle.profile) {
        await saveConsentSelections();
        router.replace(getOnboardingRoute(latestBundle));
        return;
      }

      await createCommonProfile({
        displayName: normalizeText(displayName),
        birthYear: parsedBirthYear,
        countryCode,
        provinceCode,
        districtCode,
        preferredLanguage,
        bio: normalizeText(bio),
        initialAccountType: initialAccountType as AccountType,
      });

      await setLanguage(preferredLanguage);
      await saveConsentSelections();

      const refreshedBundle = await loadProfileBundle();
      router.replace(getOnboardingRoute(refreshedBundle));
    } catch (error: unknown) {
      if (error instanceof Error) {
        setValidationMessage(error.message);
      }
    }
  };

  if (isAuthLoading || isProfileLoading || isConsentLoading) {
    return (
      <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.title}>{t("onboarding.createProfile.loadingTitle")}</Text>
          <Text style={styles.subtitle}>{t("onboarding.createProfile.loadingSubtitle")}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!isEditMode && hasProfile) {
    const continueLabel = nextOnboardingRoute === "/(onboarding)/role-onboarding"
      ? t("onboarding.createProfile.continueRole")
      : t("onboarding.createProfile.goHome");

    return (
      <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.title}>{t("onboarding.createProfile.existingTitle")}</Text>
          <Text style={styles.subtitle}>{t("onboarding.createProfile.existingSubtitle")}</Text>
          <View style={styles.card}>
            {!hasRequiredPrivacyConsent ? (
              <>
                <ConsentCheckField
                  title={t("onboarding.createProfile.privacyTitle")}
                  description={`${t("onboarding.createProfile.privacyDescription")} v${CURRENT_POLICY_VERSION}`}
                  checked={privacyAgreed}
                  onToggle={() => setPrivacyAgreed((current) => !current)}
                  required
                  disabled={isBusy}
                />
                <ConsentCheckField
                  title={t("onboarding.createProfile.marketingTitle")}
                  description={t("onboarding.createProfile.marketingDescription")}
                  checked={marketingAgreed}
                  onToggle={() => setMarketingAgreed((current) => !current)}
                  disabled={isBusy}
                />
              </>
            ) : null}
            <PrimaryButton
              label={continueLabel}
              onPress={() => void handleContinueWithExistingProfile()}
              isDisabled={isBusy}
            />
            <PrimaryButton
              label={t("common.logout")}
              variant="outline"
              onPress={() => void handleSignOut()}
              isDisabled={isBusy}
            />
          </View>
          {validationMessage ? <Text style={styles.errorText}>{validationMessage}</Text> : null}
          {profileStatusMessage ? <Text style={styles.statusText}>{profileStatusMessage}</Text> : null}
          {consentStatusMessage ? <Text style={styles.statusText}>{consentStatusMessage}</Text> : null}
          {profileErrorMessage ? <Text style={styles.errorText}>{profileErrorMessage}</Text> : null}
          {consentErrorMessage ? <Text style={styles.errorText}>{consentErrorMessage}</Text> : null}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.safeArea}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
          >
            <View style={styles.container}>
              <Text style={styles.title}>
                {isEditMode ? t("onboarding.createProfile.editTitle") : t("onboarding.createProfile.createTitle")}
              </Text>
              <Text style={styles.subtitle}>
                {isEditMode ? t("onboarding.createProfile.editSubtitle") : t("onboarding.createProfile.createSubtitle")}
              </Text>
              <View style={styles.card}>
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>{t("onboarding.createProfile.displayName")}</Text>
                  <TextInput
                    value={displayName}
                    onChangeText={(value) => {
                      setDisplayName(value);
                      setValidationMessage(null);
                    }}
                    placeholder={t("onboarding.createProfile.displayNamePlaceholder")}
                    placeholderTextColor={COLORS.textMuted}
                    style={styles.input}
                    returnKeyType="next"
                  />
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>{t("onboarding.createProfile.birthYearOptional")}</Text>
                  <TextInput
                    value={birthYear}
                    onChangeText={(value) => {
                      setBirthYear(value);
                      setValidationMessage(null);
                    }}
                    keyboardType="number-pad"
                    placeholder={t("onboarding.createProfile.birthYearPlaceholder")}
                    placeholderTextColor={COLORS.textMuted}
                    style={styles.input}
                    returnKeyType="done"
                    onSubmitEditing={Keyboard.dismiss}
                    blurOnSubmit
                  />
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>{t("onboarding.createProfile.country")}</Text>
                  <View style={styles.readOnlyField}>
                    <Text style={styles.readOnlyValue}>{t("onboarding.createProfile.countryValue")}</Text>
                  </View>
                  <Text style={styles.helperText}>{t("onboarding.createProfile.countryHelper")}</Text>
                </View>

                <SelectField
                  label={t("onboarding.createProfile.province")}
                  placeholder={t("onboarding.createProfile.selectProvince")}
                  value={provinceCode}
                  options={provinceOptions}
                  onChange={(value) => {
                    Keyboard.dismiss();
                    setProvinceCode(value);
                    setDistrictCode(null);
                    setValidationMessage(null);
                  }}
                />

                <SelectField
                  label={t("onboarding.createProfile.district")}
                  placeholder={t("onboarding.createProfile.selectDistrict")}
                  value={districtCode}
                  options={districtOptions}
                  onChange={(value) => {
                    Keyboard.dismiss();
                    setDistrictCode(value);
                    setValidationMessage(null);
                  }}
                  isDisabled={!provinceCode}
                />

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>{t("onboarding.createProfile.language")}</Text>
                  <View style={styles.readOnlyField}>
                    <Text style={styles.readOnlyValue}>{getLanguageLabel(preferredLanguage)}</Text>
                  </View>
                  <Text style={styles.helperText}>{t("onboarding.createProfile.languageHelper")}</Text>
                </View>

                {!isEditMode ? (
                  <SelectField
                    label={t("onboarding.createProfile.initialRole")}
                    placeholder={t("onboarding.createProfile.chooseRole")}
                    value={initialAccountType}
                    options={accountTypeOptions}
                    onChange={(value) => {
                      Keyboard.dismiss();
                      setInitialAccountType(value as AccountType);
                      setValidationMessage(null);
                    }}
                  />
                ) : null}

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>{t("onboarding.createProfile.bioOptional")}</Text>
                  <TextInput
                    value={bio}
                    onChangeText={(value) => {
                      setBio(value);
                      setValidationMessage(null);
                    }}
                    placeholder={t("onboarding.createProfile.bioPlaceholder")}
                    placeholderTextColor={COLORS.textMuted}
                    multiline
                    style={[styles.input, styles.bioInput]}
                    textAlignVertical="top"
                  />
                </View>

                {!isEditMode ? (
                  <View style={styles.consentGroup}>
                    <Text style={styles.label}>{t("onboarding.createProfile.requiredConsents")}</Text>
                    <ConsentCheckField
                      title={t("onboarding.createProfile.privacyTitle")}
                      description={`${t("onboarding.createProfile.privacyDescription")} v${CURRENT_POLICY_VERSION}`}
                      checked={privacyAgreed}
                      onToggle={() => setPrivacyAgreed((current) => !current)}
                      required
                      disabled={isBusy}
                    />
                    <ConsentCheckField
                      title={t("onboarding.createProfile.marketingTitle")}
                      description={t("onboarding.createProfile.marketingDescription")}
                      checked={marketingAgreed}
                      onToggle={() => setMarketingAgreed((current) => !current)}
                      disabled={isBusy}
                    />
                  </View>
                ) : null}

                <PrimaryButton
                  label={isBusy ? t("onboarding.createProfile.saveLoading") : isEditMode ? t("onboarding.createProfile.saveEdit") : t("onboarding.createProfile.saveCreate")}
                  onPress={() => void handleSubmit()}
                  isDisabled={isBusy}
                />

                {isEditMode ? (
                  <PrimaryButton
                    label={t("profile.editCancel")}
                    variant="outline"
                    onPress={handleCancelEdit}
                    isDisabled={isBusy}
                  />
                ) : (
                  <PrimaryButton
                    label={t("common.logout")}
                    variant="outline"
                    onPress={() => void handleSignOut()}
                    isDisabled={isBusy}
                  />
                )}
              </View>

              {validationMessage ? <Text style={styles.errorText}>{validationMessage}</Text> : null}
              {profileErrorMessage ? <Text style={styles.errorText}>{profileErrorMessage}</Text> : null}
              {consentErrorMessage ? <Text style={styles.errorText}>{consentErrorMessage}</Text> : null}
              {profileStatusMessage ? <Text style={styles.statusText}>{profileStatusMessage}</Text> : null}
              {consentStatusMessage ? <Text style={styles.statusText}>{consentStatusMessage}</Text> : null}
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { flexGrow: 1 },
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
  consentGroup: { gap: SPACING.sm },
  label: { fontSize: 14, fontWeight: "700", color: COLORS.textPrimary },
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
    borderColor: COLORS.border,
    backgroundColor: "#f6f1e4",
    paddingHorizontal: SPACING.md,
  },
  readOnlyValue: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  helperText: {
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.textSecondary,
  },
  bioInput: { minHeight: 96, paddingVertical: SPACING.md },
  errorText: { marginTop: SPACING.lg, fontSize: 14, lineHeight: 20, color: "#b83a3a" },
  statusText: { marginTop: SPACING.lg, fontSize: 14, lineHeight: 20, color: COLORS.brand },
});
