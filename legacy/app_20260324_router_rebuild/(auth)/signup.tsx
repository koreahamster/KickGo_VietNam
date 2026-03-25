import { router } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { PrimaryButton } from "@/components/PrimaryButton";
import { COLORS } from "@/constants/colors";
import { SPACING } from "@/constants/spacing";
import { useI18n } from "@/core/i18n/LanguageProvider";
import { useAuth } from "@/hooks/useAuth";
import { AUTH_PROVIDER_LABEL } from "@/types/auth.types";

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export default function SignUpScreen(): JSX.Element {
  const { language, setLanguage, t } = useI18n();
  const { errorMessage, isAuthenticated, isLoading, isSigningIn, signUpWithEmail, statusMessage } = useAuth();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    router.replace("/");
  }, [isAuthenticated]);

  const validateForm = (): boolean => {
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail) {
      setValidationMessage(t("auth.signup.validationRequiredEmail"));
      return false;
    }

    if (!normalizedEmail.includes("@")) {
      setValidationMessage(t("auth.signup.validationInvalidEmail"));
      return false;
    }

    if (password.length < 6) {
      setValidationMessage(t("auth.signup.validationPasswordLength"));
      return false;
    }

    setValidationMessage(null);
    return true;
  };

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <View style={styles.container}>
        <LanguageSwitcher value={language} onChange={(nextLanguage) => void setLanguage(nextLanguage)} label={t("common.language")} />
        <Text style={styles.title}>{t("auth.signup.title")}</Text>
        <Text style={styles.subtitle}>{t("auth.signup.subtitle")}</Text>
        <View style={styles.card}>
          <Text style={styles.providerLabel}>{AUTH_PROVIDER_LABEL.email}</Text>
          <TextInput autoCapitalize="none" autoCorrect={false} keyboardType="email-address" value={email} onChangeText={(value) => { setEmail(value); setValidationMessage(null); }} placeholder={t("auth.signup.emailPlaceholder")} placeholderTextColor={COLORS.textMuted} style={styles.input} />
          <TextInput autoCapitalize="none" autoCorrect={false} secureTextEntry value={password} onChangeText={(value) => { setPassword(value); setValidationMessage(null); }} placeholder={t("auth.signup.passwordPlaceholder")} placeholderTextColor={COLORS.textMuted} style={styles.input} />
          <PrimaryButton label={isSigningIn ? t("auth.signup.signupButtonLoading") : t("auth.signup.signupButton")} onPress={() => { if (!validateForm()) { return; } void signUpWithEmail(normalizeEmail(email), password); }} isDisabled={isLoading || isSigningIn} />
          <PrimaryButton label={t("auth.signup.loginButton")} onPress={() => router.push("/(auth)/login")} variant="secondary" isDisabled={isLoading || isSigningIn} />
        </View>
        {validationMessage ? <Text style={styles.errorText}>{validationMessage}</Text> : null}
        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
        {statusMessage ? <Text style={styles.statusText}>{statusMessage}</Text> : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, paddingHorizontal: SPACING.screenHorizontal, paddingVertical: SPACING.xl, backgroundColor: COLORS.background, gap: SPACING.md },
  title: { fontSize: 30, fontWeight: "800", color: COLORS.textPrimary },
  subtitle: { fontSize: 15, lineHeight: 22, color: COLORS.textSecondary },
  card: { padding: SPACING.lg, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface, gap: SPACING.md },
  providerLabel: { fontSize: 13, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", color: COLORS.textMuted },
  input: { minHeight: 54, borderRadius: 16, borderWidth: 1, borderColor: COLORS.borderStrong, backgroundColor: "#fffdf8", paddingHorizontal: SPACING.md, fontSize: 15, color: COLORS.textPrimary },
  errorText: { fontSize: 14, lineHeight: 20, color: "#b83a3a" },
  statusText: { fontSize: 14, lineHeight: 20, color: COLORS.brand },
});