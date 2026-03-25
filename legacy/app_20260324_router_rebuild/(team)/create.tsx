import { router } from "expo-router";
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
import { getDistrictOptions, getProvinceOptions } from "@/constants/profile-options";
import { SPACING } from "@/constants/spacing";
import { getTeamUiCopy, getTeamVisibilityOptions } from "@/constants/team-ui";
import { useI18n } from "@/core/i18n/LanguageProvider";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useTeams } from "@/hooks/useTeams";
import type { SupportedVisibility } from "@/types/profile.types";

export default function CreateTeamScreen(): JSX.Element {
  const { language } = useI18n();
  const copy = getTeamUiCopy(language);
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { hasProfile, isProfileLoading, nextOnboardingRoute } = useProfile({ enabled: isAuthenticated });
  const { createTeam, isSubmittingTeam, teamErrorMessage, teamStatusMessage } = useTeams({ enabled: false });
  const provinceOptions = useMemo(() => getProvinceOptions("VN"), []);
  const visibilityOptions = useMemo(() => getTeamVisibilityOptions(language), [language]);

  const [name, setName] = useState<string>("");
  const [provinceCode, setProvinceCode] = useState<string | null>(null);
  const [districtCode, setDistrictCode] = useState<string | null>(null);
  const [visibility, setVisibility] = useState<SupportedVisibility>("public");
  const [description, setDescription] = useState<string>("");
  const [formError, setFormError] = useState<string | null>(null);

  const districtOptions = useMemo(() => getDistrictOptions(provinceCode), [provinceCode]);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!isAuthenticated) {
      router.replace("/(auth)/login");
    }
  }, [isAuthenticated, isAuthLoading]);

  const handleSubmit = async (): Promise<void> => {
    if (!name.trim()) {
      setFormError(copy.validationName);
      return;
    }

    if (!provinceCode || !districtCode) {
      setFormError(copy.validationRegion);
      return;
    }

    setFormError(null);

    try {
      await createTeam({
        name: name.trim(),
        provinceCode,
        districtCode,
        description: description.trim(),
        visibility,
      });

      router.replace({
        pathname: "/(tabs)/teams",
        params: { refresh: String(Date.now()) },
      });
    } catch {
      // hook-level message is rendered below
    }
  };

  const renderContent = (): JSX.Element => {
    if (isAuthLoading || isProfileLoading) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>{copy.createTitle}</Text>
          <Text style={styles.subtitle}>{copy.listSubtitle}</Text>
        </View>
      );
    }

    if (!hasProfile) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>{copy.createTitle}</Text>
          <Text style={styles.subtitle}>{copy.needProfileTitle}</Text>
          <View style={styles.card}>
            <Text style={styles.descriptionText}>{copy.needProfileHelper}</Text>
            <PrimaryButton label={copy.continueOnboarding} onPress={() => router.replace(nextOnboardingRoute)} />
            <PrimaryButton label={copy.goHome} variant="outline" onPress={() => router.replace("/")} />
          </View>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <Text style={styles.title}>{copy.createTitle}</Text>
        <Text style={styles.subtitle}>{copy.createSubtitle}</Text>

        <View style={styles.card}>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>{copy.nameLabel}</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder={copy.namePlaceholder}
              placeholderTextColor={COLORS.textMuted}
              style={styles.input}
              returnKeyType="done"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>{copy.countryLabel}</Text>
            <View style={styles.readonlyBox}>
              <Text style={styles.readonlyText}>{copy.countryValue}</Text>
            </View>
          </View>

          <SelectField
            label={copy.provinceLabel}
            placeholder={copy.selectProvince}
            value={provinceCode}
            options={provinceOptions}
            onChange={(nextProvince) => {
              setProvinceCode(nextProvince);
              setDistrictCode(null);
            }}
          />

          <SelectField
            label={copy.districtLabel}
            placeholder={copy.selectDistrict}
            value={districtCode}
            options={districtOptions}
            onChange={setDistrictCode}
            isDisabled={!provinceCode}
          />

          <SelectField
            label={copy.visibilityLabel}
            placeholder={copy.selectVisibility}
            value={visibility}
            options={visibilityOptions}
            onChange={(value) => setVisibility(value as SupportedVisibility)}
          />

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>{copy.descriptionLabel}</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder={copy.descriptionPlaceholder}
              placeholderTextColor={COLORS.textMuted}
              style={styles.textArea}
              multiline
              textAlignVertical="top"
            />
          </View>

          <PrimaryButton
            label={isSubmittingTeam ? copy.creating : copy.save}
            onPress={() => void handleSubmit()}
            isDisabled={isSubmittingTeam}
          />
          <PrimaryButton label={copy.cancel} onPress={() => router.back()} variant="outline" isDisabled={isSubmittingTeam} />

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
  textArea: {
    minHeight: 120,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    backgroundColor: "#fffdf8",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  readonlyBox: {
    minHeight: 54,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    backgroundColor: "#eef4ef",
    justifyContent: "center",
    paddingHorizontal: SPACING.md,
  },
  readonlyText: { fontSize: 15, color: COLORS.textPrimary },
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