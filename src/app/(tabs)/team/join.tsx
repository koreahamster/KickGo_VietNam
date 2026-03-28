import { router } from "expo-router";
import { useEffect, useState } from "react";
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
import { COLORS } from "@/constants/colors";
import { SPACING } from "@/constants/spacing";
import { getTeamUiCopy } from "@/constants/team-ui";
import { useI18n } from "@/core/i18n/LanguageProvider";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useTeams } from "@/hooks/useTeams";

export default function JoinTeamScreen(): JSX.Element {
  const { language } = useI18n();
  const copy = getTeamUiCopy(language);
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { hasProfile, isProfileLoading, nextOnboardingRoute } = useProfile({
    enabled: isAuthenticated,
  });
  const { joinTeam, isSubmittingTeam, teamErrorMessage, teamStatusMessage } = useTeams({
    enabled: false,
  });
  const [inviteCode, setInviteCode] = useState<string>("");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, isAuthLoading]);

  const handleSubmit = async (): Promise<void> => {
    const normalizedInviteCode = inviteCode.trim().toUpperCase();

    if (!normalizedInviteCode) {
      setFormError(copy.validationInviteCode);
      return;
    }

    setFormError(null);

    try {
      await joinTeam(normalizedInviteCode);
      router.replace({
        pathname: "/(tabs)/team",
        params: { refresh: String(Date.now()) },
      });
    } catch {
      // error message is rendered from the hook state
    }
  };

  const renderContent = (): JSX.Element => {
    if (isAuthLoading || isProfileLoading) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>{copy.joinTitle}</Text>
          <Text style={styles.subtitle}>{copy.loading}</Text>
        </View>
      );
    }

    if (!hasProfile) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>{copy.joinTitle}</Text>
          <Text style={styles.subtitle}>{copy.needProfileTitle}</Text>
          <View style={styles.card}>
            <Text style={styles.descriptionText}>{copy.needProfileHelper}</Text>
            <PrimaryButton
              label={copy.continueOnboarding}
              onPress={() => router.replace(nextOnboardingRoute)}
            />
            <PrimaryButton label={copy.goHome} onPress={() => router.replace("/")} variant="outline" />
          </View>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <Text style={styles.title}>{copy.joinTitle}</Text>
        <Text style={styles.subtitle}>{copy.joinSubtitle}</Text>
        <View style={styles.card}>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>{copy.inviteCodeLabel}</Text>
            <TextInput
              autoCapitalize="characters"
              autoCorrect={false}
              placeholder={copy.inviteCodePlaceholder}
              placeholderTextColor={COLORS.textMuted}
              returnKeyType="done"
              style={styles.input}
              value={inviteCode}
              onChangeText={(value) => setInviteCode(value.toUpperCase())}
              onSubmitEditing={() => {
                Keyboard.dismiss();
                void handleSubmit();
              }}
            />
          </View>

          <PrimaryButton
            label={isSubmittingTeam ? copy.joining : copy.joinSubmit}
            onPress={() => void handleSubmit()}
            isDisabled={isSubmittingTeam}
          />
          <PrimaryButton
            label={copy.cancel}
            onPress={() => router.back()}
            variant="outline"
            isDisabled={isSubmittingTeam}
          />

          {formError ? <Text style={styles.errorText}>{formError}</Text> : null}
          {teamErrorMessage ? <Text style={styles.errorText}>{teamErrorMessage}</Text> : null}
          {teamStatusMessage ? <Text style={styles.statusText}>{teamStatusMessage}</Text> : null}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.safeArea}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {renderContent()}
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { flexGrow: 1, paddingBottom: SPACING.xl },
  container: {
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
  descriptionText: { fontSize: 15, lineHeight: 22, color: COLORS.textSecondary },
  statusText: {
    textAlign: "center",
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.brand,
  },
  errorText: {
    textAlign: "center",
    fontSize: 14,
    lineHeight: 20,
    color: "#b83a3a",
  },
});
