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
  FOOT_OPTIONS,
  POSITION_OPTIONS,
  SHOE_SIZE_OPTIONS,
  TOP_SIZE_OPTIONS,
  type SelectOption,
} from "@/constants/profile-options";
import { SPACING } from "@/constants/spacing";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";

const NONE_VALUE = "__NONE__";

const OPTIONAL_TOP_SIZE_OPTIONS: SelectOption[] = [
  { label: "\uC120\uD0DD \uC548 \uD568", value: NONE_VALUE },
  ...TOP_SIZE_OPTIONS,
];

const OPTIONAL_SHOE_SIZE_OPTIONS: SelectOption[] = [
  { label: "\uC120\uD0DD \uC548 \uD568", value: NONE_VALUE },
  ...SHOE_SIZE_OPTIONS,
];

function normalizeOptionalValue(value: string | null): string {
  if (!value || value === NONE_VALUE) {
    return "";
  }

  return value;
}

export default function RoleOnboardingScreen(): JSX.Element {
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
      setValidationMessage("\uC120\uC218 \uD504\uB85C\uD544 \uD544\uC218 \uD56D\uBAA9\uC744 \uBAA8\uB450 \uC120\uD0DD\uD574 \uC8FC\uC138\uC694.");
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
          <Text style={styles.title}>{"\uC5ED\uD560\uBCC4 \uC628\uBCF4\uB529"}</Text>
          <Text style={styles.subtitle}>{"\uACF5\uD1B5 \uD504\uB85C\uD544\uC744 \uBA3C\uC800 \uC644\uC131\uD574\uC57C \uC5ED\uD560\uBCC4 \uC124\uC815\uC744 \uC9C4\uD589\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4."}</Text>
          <View style={styles.card}>
            <Text style={styles.helperText}>{"\uACF5\uD1B5 \uC0AC\uC6A9\uC790 \uC815\uBCF4\uB97C \uC800\uC7A5\uD55C \uB4A4 \uC120\uC218, \uC2EC\uD310 \uB4F1 \uC5ED\uD560\uBCC4 \uC628\uBCF4\uB529\uC744 \uC774\uC5B4\uC11C \uC9C4\uD589\uD574 \uC8FC\uC138\uC694."}</Text>
            <PrimaryButton label={"\uACF5\uD1B5 \uD504\uB85C\uD544\uB85C \uC774\uB3D9"} onPress={() => router.replace("/(onboarding)/create-profile")} />
            <PrimaryButton label={"\uB85C\uADF8\uC544\uC6C3"} variant="outline" onPress={() => void handleSignOut()} />
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
              <Text style={styles.title}>{"\uC5ED\uD560\uBCC4 \uC628\uBCF4\uB529"}</Text>
              <Text style={styles.subtitle}>{"\uC120\uD0DD\uD55C \uC5ED\uD560\uC5D0 \uD544\uC694\uD55C \uCD94\uAC00 \uC815\uBCF4\uB97C \uC785\uB825\uD574 \uC8FC\uC138\uC694."}</Text>

              {showPlayerForm ? (
                <View style={styles.card}>
                  <Text style={styles.sectionTitle}>{"\uC120\uC218 \uD504\uB85C\uD544"}</Text>
                  <SelectField
                    label={"\uC120\uD638 \uD3EC\uC9C0\uC158"}
                    placeholder={"\uD3EC\uC9C0\uC158\uC744 \uC120\uD0DD"}
                    value={preferredPosition}
                    options={POSITION_OPTIONS}
                    onChange={(value) => {
                      setPreferredPosition(value);
                      setValidationMessage(null);
                    }}
                  />
                  <SelectField
                    label={"\uC120\uD638 \uBC1C"}
                    placeholder={"\uC120\uD638 \uBC1C\uC744 \uC120\uD0DD"}
                    value={preferredFoot}
                    options={FOOT_OPTIONS}
                    onChange={(value) => {
                      setPreferredFoot(value);
                      setValidationMessage(null);
                    }}
                  />
                  <SelectField
                    label={"\uC8FC \uC0AC\uC6A9 \uBC1C"}
                    placeholder={"\uC8FC \uC0AC\uC6A9 \uBC1C\uC744 \uC120\uD0DD"}
                    value={dominantFoot}
                    options={FOOT_OPTIONS}
                    onChange={(value) => {
                      setDominantFoot(value);
                      setValidationMessage(null);
                    }}
                  />
                  <SelectField
                    label={"\uC0C1\uC758 \uC0AC\uC774\uC988 (\uC120\uD0DD)"}
                    placeholder={"\uC0AC\uC774\uC988\uB97C \uC120\uD0DD"}
                    value={topSize}
                    options={OPTIONAL_TOP_SIZE_OPTIONS}
                    onChange={(value) => {
                      setTopSize(value);
                      setValidationMessage(null);
                    }}
                  />
                  <SelectField
                    label={"\uBC1C \uC0AC\uC774\uC988 (\uC120\uD0DD)"}
                    placeholder={"\uC0AC\uC774\uC988\uB97C \uC120\uD0DD"}
                    value={shoeSize}
                    options={OPTIONAL_SHOE_SIZE_OPTIONS}
                    onChange={(value) => {
                      setShoeSize(value);
                      setValidationMessage(null);
                    }}
                  />
                  <PrimaryButton
                    label={isSubmittingProfile ? "\uC800\uC7A5 \uC911..." : "\uC120\uC218 \uD504\uB85C\uD544 \uC800\uC7A5"}
                    onPress={() => void handlePlayerSubmit()}
                    isDisabled={isSubmittingProfile}
                  />
                </View>
              ) : null}

              {showRefereeAction ? (
                <View style={styles.card}>
                  <Text style={styles.sectionTitle}>{"\uC2EC\uD310 \uD504\uB85C\uD544"}</Text>
                  <Text style={styles.helperText}>{"MVP \uB2E8\uACC4\uC5D0\uC11C\uB294 \uCD5C\uC18C \uC2EC\uD310 \uD504\uB85C\uD544\uB9CC \uC0DD\uC131\uD569\uB2C8\uB2E4."}</Text>
                  <PrimaryButton
                    label={isSubmittingProfile ? "\uC0DD\uC131 \uC911..." : "\uC2EC\uD310 \uD504\uB85C\uD544 \uC0DD\uC131"}
                    onPress={() => void handleRefereeSubmit()}
                    isDisabled={isSubmittingProfile}
                  />
                </View>
              ) : null}

              {hasFacilityManager ? (
                <View style={styles.card}>
                  <Text style={styles.sectionTitle}>{"\uACBD\uAE30\uC7A5 \uAD00\uB9AC\uC790"}</Text>
                  <Text style={styles.helperText}>{"\uC2DC\uC124 \uC5F0\uACB0\uACFC \uC6B4\uC601 \uC0C1\uC138 \uC124\uC815\uC740 \uD6C4\uC18D \uB2E8\uACC4\uC5D0\uC11C \uC9C0\uC6D0\uB429\uB2C8\uB2E4."}</Text>
                </View>
              ) : null}

              {noPendingRoleOnboarding ? (
                <View style={styles.card}>
                  <Text style={styles.sectionTitle}>{"\uC628\uBCF4\uB529 \uC644\uB8CC"}</Text>
                  <Text style={styles.helperText}>{"\uB0A8\uC544 \uC788\uB358 \uC5ED\uD560\uBCC4 \uC785\uB825\uC774 \uBAA8\uB450 \uC644\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4."}</Text>
                  <PrimaryButton label={"\uD648\uC73C\uB85C \uC774\uB3D9"} onPress={() => router.replace("/")} />
                </View>
              ) : null}

              <View style={styles.actionGroup}>
                <PrimaryButton label={"\uB85C\uADF8\uC544\uC6C3"} variant="outline" onPress={() => void handleSignOut()} />
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