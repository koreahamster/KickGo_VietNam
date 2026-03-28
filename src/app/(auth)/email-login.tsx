import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { withAppFont } from "@/constants/typography";
import { useI18n } from "@/core/i18n/LanguageProvider";
import { useAuth } from "@/hooks/useAuth";
import type { SupportedLanguage } from "@/types/profile.types";

const COPY: Record<SupportedLanguage, { title: string; subtitle: string; submit: string; back: string }> = {
  ko: {
    title: "\uc774\uba54\uc77c \ub85c\uadf8\uc778",
    subtitle: "\ub4f1\ub85d\ud55c \uc774\uba54\uc77c\uacfc \ube44\ubc00\ubc88\ud638\ub85c \ub85c\uadf8\uc778\ud558\uc138\uc694.",
    submit: "\ub85c\uadf8\uc778",
    back: "\uc774\uc804 \ud654\uba74\uc73c\ub85c \ub3cc\uc544\uac00\uae30",
  },
  vi: {
    title: "\u0110\u0103ng nh\u1eadp email",
    subtitle: "\u0110\u0103ng nh\u1eadp b\u1eb1ng email v\u00e0 m\u1eadt kh\u1ea9u \u0111\u00e3 \u0111\u0103ng k\u00fd.",
    submit: "\u0110\u0103ng nh\u1eadp",
    back: "Quay l\u1ea1i",
  },
  en: {
    title: "Email Login",
    subtitle: "Log in with the email and password you already use.",
    submit: "Log In",
    back: "Back",
  },
};

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export default function EmailLoginScreen(): JSX.Element {
  const { language, t } = useI18n();
  const copy = useMemo(() => COPY[language], [language]);
  const { errorMessage, isAuthenticated, isLoading, isSigningIn, signInWithEmail, statusMessage } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated]);

  const handleSubmit = (): void => {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) {
      setValidationMessage(t("auth.login.validationRequiredEmail"));
      return;
    }
    if (!normalizedEmail.includes("@")) {
      setValidationMessage(t("auth.login.validationInvalidEmail"));
      return;
    }
    if (password.length < 6) {
      setValidationMessage(t("auth.login.validationPasswordLength"));
      return;
    }
    setValidationMessage(null);
    void signInWithEmail(normalizedEmail, password);
  };

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.contentWrap}>
          <Text style={withAppFont(styles.title)}>{copy.title}</Text>
          <Text style={withAppFont(styles.subtitle)}>{copy.subtitle}</Text>
          <View style={styles.formCard}>
            <TextInput autoCapitalize="none" autoCorrect={false} keyboardType="email-address" onChangeText={(value) => { setEmail(value); setValidationMessage(null); }} placeholder={t("auth.login.emailPlaceholder")} placeholderTextColor="#94a3b8" style={styles.input} value={email} />
            <TextInput autoCapitalize="none" autoCorrect={false} secureTextEntry onChangeText={(value) => { setPassword(value); setValidationMessage(null); }} onSubmitEditing={handleSubmit} placeholder={t("auth.login.passwordPlaceholder")} placeholderTextColor="#94a3b8" style={styles.input} value={password} />
            <Pressable disabled={isLoading || isSigningIn} onPress={handleSubmit} style={({ pressed }) => [styles.submitButton, pressed && styles.pressed, (isLoading || isSigningIn) && styles.disabled]}>
              <Text style={withAppFont(styles.submitLabel)}>{isSigningIn ? t("auth.login.emailButtonLoading") : copy.submit}</Text>
            </Pressable>
            <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.backLinkButton, pressed && styles.pressed]}>
              <Text style={withAppFont(styles.backLinkLabel)}>{copy.back}</Text>
            </Pressable>
          </View>
          {validationMessage ? <Text style={withAppFont(styles.errorText)}>{validationMessage}</Text> : null}
          {errorMessage ? <Text style={withAppFont(styles.errorText)}>{errorMessage}</Text> : null}
          {statusMessage ? <Text style={withAppFont(styles.statusText)}>{statusMessage}</Text> : null}
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
  statusText: { marginTop: 14, color: "#2563eb", fontSize: 14, lineHeight: 20, textAlign: "center" },
});
