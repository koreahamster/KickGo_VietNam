import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { withAppFont } from "@/constants/typography";
import { useI18n } from "@/core/i18n/LanguageProvider";
import { signUpWithEmail } from "@/services/auth.service";
import type { SupportedLanguage } from "@/types/profile.types";

const COPY: Record<SupportedLanguage, { title: string; subtitle: string; submit: string; back: string; confirm: string; passwordError: string; confirmError: string; genericError: string }> = {
  ko: {
    title: "\uc774\uba54\uc77c \uac00\uc785",
    subtitle: "\uc774\uba54\uc77c \uacc4\uc815\uc73c\ub85c KickGo\ub97c \uc2dc\uc791\ud558\uc138\uc694.",
    submit: "\uac00\uc785\ud558\uae30",
    back: "\uc774\uc804 \ud654\uba74\uc73c\ub85c \ub3cc\uc544\uac00\uae30",
    confirm: "\ube44\ubc00\ubc88\ud638 \ud655\uc778",
    passwordError: "\ube44\ubc00\ubc88\ud638\ub294 8\uc790 \uc774\uc0c1\uc774\uc5b4\uc57c \ud569\ub2c8\ub2e4.",
    confirmError: "\ube44\ubc00\ubc88\ud638\uac00 \uc77c\uce58\ud558\uc9c0 \uc54a\uc2b5\ub2c8\ub2e4.",
    genericError: "\uac00\uc785\uc744 \uc644\ub8cc\ud560 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4.",
  },
  vi: {
    title: "\u0110\u0103ng k\u00fd email",
    subtitle: "B\u1eaft \u0111\u1ea7u KickGo b\u1eb1ng t\u00e0i kho\u1ea3n email.",
    submit: "\u0110\u0103ng k\u00fd",
    back: "Quay l\u1ea1i",
    confirm: "X\u00e1c nh\u1eadn m\u1eadt kh\u1ea9u",
    passwordError: "M\u1eadt kh\u1ea9u ph\u1ea3i c\u00f3 \u00edt nh\u1ea5t 8 k\u00fd t\u1ef1.",
    confirmError: "M\u1eadt kh\u1ea9u x\u00e1c nh\u1eadn kh\u00f4ng kh\u1edbp.",
    genericError: "Kh\u00f4ng th\u1ec3 \u0111\u0103ng k\u00fd.",
  },
  en: {
    title: "Email Sign Up",
    subtitle: "Start KickGo with your email account.",
    submit: "Sign Up",
    back: "Back",
    confirm: "Confirm password",
    passwordError: "Password must be at least 8 characters.",
    confirmError: "Passwords do not match.",
    genericError: "Unable to sign up.",
  },
};

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export default function EmailSignupScreen(): JSX.Element {
  const { language, t } = useI18n();
  const copy = useMemo(() => COPY[language], [language]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (): Promise<void> => {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) {
      setErrorMessage(t("auth.login.validationRequiredEmail"));
      return;
    }
    if (!normalizedEmail.includes("@")) {
      setErrorMessage(t("auth.login.validationInvalidEmail"));
      return;
    }
    if (password.length < 8) {
      setErrorMessage(copy.passwordError);
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage(copy.confirmError);
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await signUpWithEmail(normalizedEmail, password);
      router.replace("/(auth)/phone-verify");
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage(copy.genericError);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.contentWrap}>
          <Text style={withAppFont(styles.title)}>{copy.title}</Text>
          <Text style={withAppFont(styles.subtitle)}>{copy.subtitle}</Text>
          <View style={styles.formCard}>
            <TextInput autoCapitalize="none" autoCorrect={false} keyboardType="email-address" onChangeText={(value) => { setEmail(value); setErrorMessage(null); }} placeholder={t("auth.login.emailPlaceholder")} placeholderTextColor="#94a3b8" style={styles.input} value={email} />
            <TextInput autoCapitalize="none" autoCorrect={false} secureTextEntry onChangeText={(value) => { setPassword(value); setErrorMessage(null); }} placeholder={t("auth.login.passwordPlaceholder")} placeholderTextColor="#94a3b8" style={styles.input} value={password} />
            <TextInput autoCapitalize="none" autoCorrect={false} secureTextEntry onChangeText={(value) => { setConfirmPassword(value); setErrorMessage(null); }} placeholder={copy.confirm} placeholderTextColor="#94a3b8" style={styles.input} value={confirmPassword} />
            <Pressable disabled={isSubmitting} onPress={() => void handleSubmit()} style={({ pressed }) => [styles.submitButton, pressed && styles.pressed, isSubmitting && styles.disabled]}>
              <Text style={withAppFont(styles.submitLabel)}>{isSubmitting ? "..." : copy.submit}</Text>
            </Pressable>
            <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.backLinkButton, pressed && styles.pressed]}>
              <Text style={withAppFont(styles.backLinkLabel)}>{copy.back}</Text>
            </Pressable>
          </View>
          {errorMessage ? <Text style={withAppFont(styles.errorText)}>{errorMessage}</Text> : null}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#ffffff" },
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 20, paddingBottom: 24 },
  contentWrap: { flex: 1, justifyContent: "center" },
  title: { fontSize: 30, fontWeight: "900", color: "#0f172a" },
  subtitle: { fontSize: 15, lineHeight: 22, color: "#64748b", marginTop: 10, marginBottom: 24 },
  formCard: { gap: 12 },
  input: { minHeight: 54, borderRadius: 16, borderWidth: 1, borderColor: "#dbe4f0", paddingHorizontal: 16, fontSize: 16, color: "#0f172a", backgroundColor: "#f8fafc" },
  submitButton: { marginTop: 8, minHeight: 54, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: "#ef4444" },
  submitLabel: { fontSize: 16, fontWeight: "800", color: "#ffffff" },
  backLinkButton: { alignItems: "center", justifyContent: "center", paddingTop: 6, paddingBottom: 4 },
  backLinkLabel: { fontSize: 14, fontWeight: "700", color: "#475569" },
  pressed: { opacity: 0.88 },
  disabled: { opacity: 0.55 },
  errorText: { marginTop: 14, color: "#dc2626", fontSize: 14, lineHeight: 20, textAlign: "center" },
});
