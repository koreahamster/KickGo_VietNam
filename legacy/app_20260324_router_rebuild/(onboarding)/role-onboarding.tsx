import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PrimaryButton } from "@/components/PrimaryButton";
import { SelectField } from "@/components/SelectField";
import { COLORS } from "@/constants/colors";
import {
  getFootOptions,
  POSITION_OPTIONS,
  SHOE_SIZE_OPTIONS,
  TOP_SIZE_OPTIONS,
  type SelectOption,
} from "@/constants/profile-options";
import { SPACING } from "@/constants/spacing";
import { useI18n } from "@/core/i18n/LanguageProvider";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";

const NONE_VALUE = "__NONE__";

function normalizeOptionalValue(value: string | null): string {
  if (!value || value === NONE_VALUE) {
    return "";
  }

  return value;
}

export default function RoleOnboardingScreen(): JSX.Element {
  const { language, t } = useI18n();
  const { isAuthenticated, isLoading: isAuthLoading, signOut } = useAuth();
  const {
    accountTypes,
    createPlayerProfile,
    createRefereeProfile,
    hasProfile,
    isProfileLoading,
    isSubmittingProfile,
    pendingRoleOnboarding,
    playerProfile,
    profileErrorMessage,
    profileStatusMessage,
  } = useProfile({ enabled: isAuthenticated });

  const footOptions = useMemo(() => getFootOptions(language), [language]);
  const optionalTopSizeOptions = useMemo<SelectOption[]>(
    () => [{ label: t("onboarding.roleOnboarding.none"), value: NONE_VALUE }, ...TOP_SIZE_OPTIONS],
    [t],
  );
  const optionalShoeSizeOptions = useMemo<SelectOption[]>(
    () => [{ label: t("onboarding.roleOnboarding.none"), value: NONE_VALUE }, ...SHOE_SIZE_OPTIONS],
    [t],
  );

  const [preferredPosition, setPreferredPosition] = useState<string | null>(playerProfile?.preferred_position ?? null);
  const [preferredFoot, setPreferredFoot] = useState<string | null>(playerProfile?.preferred_foot ?? null);
  const [dominantFoot, setDominantFoot] = useState<string | null>(playerProfile?.dominant_foot ?? null);
  const [topSize, setTopSize] = useState<string | null>(playerProfile?.top_size ?? NONE_VALUE);
  const [shoeSize, setShoeSize] = useState<string | null>(playerProfile?.shoe_size ?? NONE_VALUE);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!playerProfile) {
      return;
    }

    setPreferredPosition(playerProfile.preferred_position ?? null);
    setPreferredFoot(playerProfile.preferred_foot ?? null);
    setDominantFoot(playerProfile.dominant_foot ?? null);
    setTopSize(playerProfile.top_size ?? NONE_VALUE);
    setShoeSize(playerProfile.shoe_size ?? NONE_VALUE);
  }, [playerProfile]);

  useEffect(() => {
    if (isAuthLoading || isProfileLoading) {
      return;
    }

    if (!isAuthenticated) {
      router.replace("/(auth)/login");
    }
  }, [isAuthenticated, isAuthLoading, isProfileLoading]);

  const showPlayerForm = useMemo(() => pendingRoleOnboarding.includes("player"), [pendingRoleOnboarding]);
  const showRefereeAction = useMemo(() => pendingRoleOnboarding.includes("referee"), [pendingRoleOnboarding]);
  const hasFacilityManager = useMemo(() => accountTypes.includes("facility_manager"), [accountTypes]);
  const noPendingRoleOnboarding = pendingRoleOnboarding.length === 0;

  const handleSignOut = async (): Promise<void> => {
    await signOut();
    router.replace("/");
  };

  const handlePlayerSubmit = async (): Promise<void> => {
    if (!preferredPosition || !preferredFoot || !dominantFoot) {
      setValidationMessage(t("onboarding.roleOnboarding.playerValidation"));
      return;
    }

    setValidationMessage(null);

    try {
      await createPlayerProfile({
        preferredPosition,
        preferredFoot,
        dominantFoot,
        topSize: normalizeOptionalValue(topSize),
        shoeSize: normalizeOptionalValue(shoeSize),
      });
    } catch {
      // handled in hook
    }
  };

  const handleRefereeSubmit = async (): Promise<void> => {
    setValidationMessage(null);

    try {
      await createRefereeProfile();
    } catch {
      // handled in hook
    }
  };

  if (!isAuthLoading && !isProfileLoading && !hasProfile) {
    return (
      <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.title}>{t("onboarding.roleOnboarding.title")}</Text>
          <Text style={styles.subtitle}>{t("onboarding.roleOnboarding.needCommonProfile")}</Text>
          <View style={styles.card}>
            <Text style={styles.helperText}>{t("onboarding.roleOnboarding.needCommonProfileHelper")}</Text>
            <PrimaryButton
              label={t("onboarding.roleOnboarding.moveToCommonProfile")}
              onPress={() => router.replace("/(onboarding)/create-profile")}
            />
            <PrimaryButton label={t("common.logout")} variant="outline" onPress={() => void handleSignOut()} />
          </View>
          {profileErrorMessage ? <Text style={styles.errorText}>{profileErrorMessage}</Text> : null}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.safeArea} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
          >
            <View style={styles.container}>
              <Text style={styles.title}>{t("onboarding.roleOnboarding.title")}</Text>
              <Text style={styles.subtitle}>{t("onboarding.roleOnboarding.subtitle")}</Text>

              {showPlayerForm ? (
                <View style={styles.card}>
                  <Text style={styles.sectionTitle}>{t("onboarding.roleOnboarding.playerSection")}</Text>
                  <SelectField
                    label={t("onboarding.roleOnboarding.preferredPosition")}
                    placeholder={t("onboarding.roleOnboarding.selectPosition")}
                    value={preferredPosition}
                    options={POSITION_OPTIONS}
                    onChange={(value) => {
                      setPreferredPosition(value);
                      setValidationMessage(null);
                    }}
                  />
                  <SelectField
                    label={t("onboarding.roleOnboarding.preferredFoot")}
                    placeholder={t("onboarding.roleOnboarding.selectPreferredFoot")}
                    value={preferredFoot}
                    options={footOptions}
                    onChange={(value) => {
                      setPreferredFoot(value);
                      setValidationMessage(null);
                    }}
                  />
                  <SelectField
                    label={t("onboarding.roleOnboarding.dominantFoot")}
                    placeholder={t("onboarding.roleOnboarding.selectDominantFoot")}
                    value={dominantFoot}
                    options={footOptions}
                    onChange={(value) => {
                      setDominantFoot(value);
                      setValidationMessage(null);
                    }}
                  />
                  <SelectField
                    label={t("onboarding.roleOnboarding.topSizeOptional")}
                    placeholder={t("onboarding.roleOnboarding.selectTopSize")}
                    value={topSize}
                    options={optionalTopSizeOptions}
                    onChange={(value) => {
                      setTopSize(value);
                      setValidationMessage(null);
                    }}
                  />
                  <SelectField
                    label={t("onboarding.roleOnboarding.shoeSizeOptional")}
                    placeholder={t("onboarding.roleOnboarding.selectShoeSize")}
                    value={shoeSize}
                    options={optionalShoeSizeOptions}
                    onChange={(value) => {
                      setShoeSize(value);
                      setValidationMessage(null);
                    }}
                  />
                  <PrimaryButton
                    label={isSubmittingProfile ? t("onboarding.roleOnboarding.saveLoading") : t("onboarding.roleOnboarding.savePlayer")}
                    onPress={() => void handlePlayerSubmit()}
                    isDisabled={isSubmittingProfile}
                  />
                </View>
              ) : null}

              {showRefereeAction ? (
                <View style={styles.card}>
                  <Text style={styles.sectionTitle}>{t("onboarding.roleOnboarding.refereeSection")}</Text>
                  <Text style={styles.helperText}>{t("onboarding.roleOnboarding.refereeHelper")}</Text>
                  <PrimaryButton
                    label={isSubmittingProfile ? t("onboarding.roleOnboarding.saveLoading") : t("onboarding.roleOnboarding.createReferee")}
                    onPress={() => void handleRefereeSubmit()}
                    isDisabled={isSubmittingProfile}
                  />
                </View>
              ) : null}

              {hasFacilityManager ? (
                <View style={styles.card}>
                  <Text style={styles.sectionTitle}>{t("onboarding.roleOnboarding.facilityManagerSection")}</Text>
                  <Text style={styles.helperText}>{t("onboarding.roleOnboarding.facilityManagerHelper")}</Text>
                </View>
              ) : null}

              {noPendingRoleOnboarding ? (
                <View style={styles.card}>
                  <Text style={styles.sectionTitle}>{t("onboarding.roleOnboarding.completedSection")}</Text>
                  <Text style={styles.helperText}>{t("onboarding.roleOnboarding.completedHelper")}</Text>
                  <PrimaryButton label={t("onboarding.roleOnboarding.goHome")} onPress={() => router.replace("/")} />
                </View>
              ) : null}

              <View style={styles.actionGroup}>
                <PrimaryButton label={t("common.logout")} variant="outline" onPress={() => void handleSignOut()} />
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
  sectionTitle: { fontSize: 18, fontWeight: "800", color: COLORS.textPrimary },
  helperText: { fontSize: 14, lineHeight: 21, color: COLORS.textSecondary },
  actionGroup: { marginTop: SPACING.lg },
  errorText: { marginTop: SPACING.lg, fontSize: 14, lineHeight: 20, color: "#b83a3a" },
  statusText: { marginTop: SPACING.lg, fontSize: 14, lineHeight: 20, color: COLORS.brand },
});