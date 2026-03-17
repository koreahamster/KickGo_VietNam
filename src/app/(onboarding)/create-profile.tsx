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

import { PrimaryButton } from "@/components/PrimaryButton";
import { SelectField } from "@/components/SelectField";
import { COLORS } from "@/constants/colors";
import {
  ACCOUNT_TYPE_OPTIONS,
  getDistrictOptions,
  getProvinceOptions,
} from "@/constants/profile-options";
import { SPACING } from "@/constants/spacing";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { detectPreferredLanguage } from "@/lib/device-language";
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
  if (language === "ko") {
    return "\uD55C\uAD6D\uC5B4";
  }

  if (language === "en") {
    return "English";
  }

  return "Ti\u1EBFng Vi\u1EC7t";
}

export default function CreateProfileScreen(): JSX.Element {
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const isEditMode = mode === "edit";
  const { isAuthenticated, isLoading: isAuthLoading, signOut } = useAuth();
  const {
    accountTypes,
    createCommonProfile,
    hasProfile,
    isProfileLoading,
    isSubmittingProfile,
    pendingRoleOnboarding,
    profileBundle,
    profileErrorMessage,
    profileStatusMessage,
    updateCommonProfile,
    loadProfileBundle,
  } = useProfile({ enabled: isAuthenticated });

  const profile = profileBundle.profile;
  const [displayName, setDisplayName] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [countryCode] = useState("VN");
  const [provinceCode, setProvinceCode] = useState<string | null>(null);
  const [districtCode, setDistrictCode] = useState<string | null>(null);
  const [preferredLanguage, setPreferredLanguage] = useState<SupportedLanguage>(
    detectPreferredLanguage()
  );
  const [initialAccountType, setInitialAccountType] = useState<AccountType | null>(null);
  const [bio, setBio] = useState("");
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) {
      return;
    }

    setDisplayName(profile.display_name ?? "");
    setBirthYear(profile.birth_year ? String(profile.birth_year) : "");
    setProvinceCode(profile.province_code ?? null);
    setDistrictCode(profile.district_code ?? null);
    setPreferredLanguage(profile.preferred_language ?? detectPreferredLanguage());
    setBio(profile.bio ?? "");
    setInitialAccountType(accountTypes[0] ?? null);
  }, [accountTypes, profile]);

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

  const handleSignOut = async (): Promise<void> => {
    Keyboard.dismiss();
    await signOut();
    router.replace("/");
  };

  const handleSubmit = async (): Promise<void> => {
    Keyboard.dismiss();

    if (!normalizeText(displayName)) {
      setValidationMessage("\uD45C\uC2DC \uC774\uB984\uC744 \uC785\uB825\uD574 \uC8FC\uC138\uC694.");
      return;
    }

    const parsedBirthYear = parseBirthYear(birthYear);

    if (Number.isNaN(parsedBirthYear)) {
      setValidationMessage("\uCD9C\uC0DD \uC5F0\uB3C4\uB294 \uC22B\uC790\uB85C \uC785\uB825\uD574 \uC8FC\uC138\uC694.");
      return;
    }

    if (!provinceCode || !districtCode) {
      setValidationMessage("\uC2DC/\uC131\uACFC \uAD6C/\uAD70\uC744 \uBAA8\uB450 \uC120\uD0DD\uD574 \uC8FC\uC138\uC694.");
      return;
    }

    if (!isEditMode && !initialAccountType) {
      setValidationMessage("\uCD08\uAE30 \uACC4\uC815 \uC5ED\uD560\uC744 \uC120\uD0DD\uD574 \uC8FC\uC138\uC694.");
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
        router.back();
        return;
      }

      const latestBundle = await loadProfileBundle();

      if (latestBundle.profile) {
        if (pendingRoleOnboarding.length > 0) {
          router.replace("/(onboarding)/role-onboarding");
          return;
        }

        router.replace("/");
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

      router.replace("/(onboarding)/role-onboarding");
    } catch {
      // handled in hook
    }
  };

  if (isAuthLoading || isProfileLoading) {
    return (
      <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.title}>{"\uACF5\uD1B5 \uD504\uB85C\uD544"}</Text>
          <Text style={styles.subtitle}>
            {"\uD504\uB85C\uD544 \uC815\uBCF4\uB97C \uBD88\uB7EC\uC624\uACE0 \uC788\uC2B5\uB2C8\uB2E4."}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!isEditMode && hasProfile) {
    return (
      <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.title}>{"\uACF5\uD1B5 \uD504\uB85C\uD544 \uD655\uC778"}</Text>
          <Text style={styles.subtitle}>
            {
              "\uC774\uBBF8 \uACF5\uD1B5 \uD504\uB85C\uD544\uC774 \uC800\uC7A5\uB418\uC5B4 \uC788\uC2B5\uB2C8\uB2E4. \uC544\uB798 \uBC84\uD2BC\uC73C\uB85C \uB2E4\uC74C \uB2E8\uACC4\uB97C \uC9C4\uD589\uD574 \uC8FC\uC138\uC694."
            }
          </Text>
          <View style={styles.card}>
            <PrimaryButton
              label={
                pendingRoleOnboarding.length > 0
                  ? "\uC5ED\uD560\uBCC4 \uC628\uBCF4\uB529 \uACC4\uC18D"
                  : "\uD648\uC73C\uB85C \uC774\uB3D9"
              }
              onPress={() => {
                if (pendingRoleOnboarding.length > 0) {
                  router.replace("/(onboarding)/role-onboarding");
                  return;
                }

                router.replace("/");
              }}
            />
            <PrimaryButton
              label={"\uB85C\uADF8\uC544\uC6C3"}
              variant="outline"
              onPress={() => void handleSignOut()}
            />
          </View>
          {profileStatusMessage ? <Text style={styles.statusText}>{profileStatusMessage}</Text> : null}
          {profileErrorMessage ? <Text style={styles.errorText}>{profileErrorMessage}</Text> : null}
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
                {isEditMode
                  ? "\uD504\uB85C\uD544 \uAE30\uBCF8 \uC218\uC815"
                  : "\uACF5\uD1B5 \uD504\uB85C\uD544 \uC0DD\uC131"}
              </Text>
              <Text style={styles.subtitle}>
                {isEditMode
                  ? "\uC124\uC815\uC5D0\uC11C \uC0AC\uC6A9\uD558\uB294 \uACF5\uD1B5 \uD504\uB85C\uD544 \uC815\uBCF4\uB97C \uC218\uC815\uD569\uB2C8\uB2E4."
                  : "\uACF5\uD1B5 \uC0AC\uC6A9\uC790 \uC815\uBCF4\uC640 \uCD08\uAE30 \uC5ED\uD560, \uC9C0\uC5ED\uC744 \uBA3C\uC800 \uC124\uC815\uD574 \uC8FC\uC138\uC694."}
              </Text>
              <View style={styles.card}>
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>{"\uD45C\uC2DC \uC774\uB984"}</Text>
                  <TextInput
                    value={displayName}
                    onChangeText={(value) => {
                      setDisplayName(value);
                      setValidationMessage(null);
                    }}
                    placeholder={"\uD45C\uC2DC \uC774\uB984"}
                    placeholderTextColor={COLORS.textMuted}
                    style={styles.input}
                    returnKeyType="next"
                  />
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>{"\uCD9C\uC0DD \uC5F0\uB3C4 (\uC120\uD0DD)"}</Text>
                  <TextInput
                    value={birthYear}
                    onChangeText={(value) => {
                      setBirthYear(value);
                      setValidationMessage(null);
                    }}
                    keyboardType="number-pad"
                    placeholder={"ex. 1993"}
                    placeholderTextColor={COLORS.textMuted}
                    style={styles.input}
                    returnKeyType="done"
                    onSubmitEditing={Keyboard.dismiss}
                    blurOnSubmit
                  />
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>{"\uAD6D\uAC00"}</Text>
                  <View style={styles.readOnlyField}>
                    <Text style={styles.readOnlyValue}>Vietnam</Text>
                  </View>
                  <Text style={styles.helperText}>
                    {
                      "\uD604\uC7AC MVP\uC5D0\uC11C\uB294 \uBCA0\uD2B8\uB0A8 \uC9C0\uC5ED \uB370\uC774\uD130\uB9CC \uC9C0\uC6D0\uD569\uB2C8\uB2E4."
                    }
                  </Text>
                </View>

                <SelectField
                  label={"\uC2DC/\uC131"}
                  placeholder={"\uC2DC/\uC131\uC744 \uC120\uD0DD"}
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
                  label={"\uAD6C/\uAD70"}
                  placeholder={"\uAD6C/\uAD70\uC744 \uC120\uD0DD"}
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
                  <Text style={styles.label}>{"\uC5B8\uC5B4"}</Text>
                  <View style={styles.readOnlyField}>
                    <Text style={styles.readOnlyValue}>{getLanguageLabel(preferredLanguage)}</Text>
                  </View>
                  <Text style={styles.helperText}>
                    {
                      "\uB514\uBC14\uC774\uC2A4 \uC5B8\uC5B4\uB97C \uAE30\uC900\uC73C\uB85C \uC790\uB3D9 \uC124\uC815\uD558\uACE0, \uC774\uD6C4 Settings\uC5D0\uC11C \uBCC0\uACBD\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4."
                    }
                  </Text>
                </View>

                {!isEditMode ? (
                  <SelectField
                    label={"\uCD08\uAE30 \uACC4\uC815 \uC5ED\uD560"}
                    placeholder={"\uC5ED\uD560 \uC120\uD0DD"}
                    value={initialAccountType}
                    options={ACCOUNT_TYPE_OPTIONS}
                    onChange={(value) => {
                      Keyboard.dismiss();
                      setInitialAccountType(value as AccountType);
                      setValidationMessage(null);
                    }}
                  />
                ) : null}

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>{"\uC790\uAE30\uC18C\uAC1C (\uC120\uD0DD)"}</Text>
                  <TextInput
                    value={bio}
                    onChangeText={(value) => {
                      setBio(value);
                      setValidationMessage(null);
                    }}
                    placeholder={"\uC790\uAE30\uC18C\uAC1C"}
                    placeholderTextColor={COLORS.textMuted}
                    multiline
                    style={[styles.input, styles.bioInput]}
                    textAlignVertical="top"
                  />
                </View>

                <PrimaryButton
                  label={
                    isSubmittingProfile
                      ? "\uC800\uC7A5 \uC911..."
                      : isEditMode
                        ? "\uC218\uC815 \uC800\uC7A5"
                        : "\uACF5\uD1B5 \uD504\uB85C\uD544 \uC800\uC7A5"
                  }
                  onPress={() => void handleSubmit()}
                  isDisabled={isSubmittingProfile}
                />

                {!isEditMode ? (
                  <PrimaryButton
                    label={"\uB85C\uADF8\uC544\uC6C3"}
                    variant="outline"
                    onPress={() => void handleSignOut()}
                    isDisabled={isSubmittingProfile}
                  />
                ) : null}
              </View>

              {validationMessage ? <Text style={styles.errorText}>{validationMessage}</Text> : null}
              {profileErrorMessage ? <Text style={styles.errorText}>{profileErrorMessage}</Text> : null}
              {profileStatusMessage ? <Text style={styles.statusText}>{profileStatusMessage}</Text> : null}
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
