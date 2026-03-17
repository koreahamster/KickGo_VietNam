import { router } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PrimaryButton } from "@/components/PrimaryButton";
import { COLORS } from "@/constants/colors";
import { SPACING } from "@/constants/spacing";
import { useAuth } from "@/hooks/useAuth";
import { AUTH_PROVIDER_LABEL } from "@/types/auth.types";

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export default function LoginScreen(): JSX.Element {
  const {
    errorMessage,
    isAuthenticated,
    isLoading,
    isSigningIn,
    signInWithEmail,
    signInWithGoogle,
    statusMessage,
  } = useAuth();
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
      setValidationMessage("이메일을 입력해 주세요.");
      return false;
    }

    if (!normalizedEmail.includes("@")) {
      setValidationMessage("올바른 이메일 형식을 입력해 주세요.");
      return false;
    }

    if (password.length < 6) {
      setValidationMessage("비밀번호는 6자 이상으로 입력해 주세요.");
      return false;
    }

    setValidationMessage(null);
    return true;
  };

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>로그인</Text>
        <Text style={styles.subtitle}>가입한 계정으로 로그인하고 온보딩을 이어서 진행하세요.</Text>
        <View style={styles.card}>
          <Text style={styles.providerLabel}>{AUTH_PROVIDER_LABEL.email}</Text>
          <TextInput autoCapitalize="none" autoCorrect={false} keyboardType="email-address" value={email} onChangeText={(value) => { setEmail(value); setValidationMessage(null); }} placeholder="이메일 주소" placeholderTextColor={COLORS.textMuted} style={styles.input} />
          <TextInput autoCapitalize="none" autoCorrect={false} secureTextEntry value={password} onChangeText={(value) => { setPassword(value); setValidationMessage(null); }} placeholder="비밀번호" placeholderTextColor={COLORS.textMuted} style={styles.input} />
          <PrimaryButton label={isSigningIn ? "로그인 중..." : "이메일로 로그인"} onPress={() => { if (!validateForm()) { return; } void signInWithEmail(normalizeEmail(email), password); }} isDisabled={isLoading || isSigningIn} />
          <PrimaryButton label="회원가입" onPress={() => router.push("/(auth)/signup")} variant="secondary" isDisabled={isLoading || isSigningIn} />
        </View>
        <View style={styles.card}>
          <Text style={styles.providerLabel}>{AUTH_PROVIDER_LABEL.google}</Text>
          <PrimaryButton label={isSigningIn ? "로그인 중..." : "Google로 계속하기"} onPress={() => { void signInWithGoogle(); }} variant="outline" isDisabled={isLoading || isSigningIn} />
          <Text style={styles.helperText}>Google 로그인은 유지되며, Expo Go에서는 앱 복귀 검증이 제한됩니다.</Text>
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
  container: { flex: 1, paddingHorizontal: SPACING.screenHorizontal, paddingVertical: SPACING.xl, backgroundColor: COLORS.background },
  title: { fontSize: 30, fontWeight: "800", color: COLORS.textPrimary },
  subtitle: { marginTop: SPACING.sm, fontSize: 15, lineHeight: 22, color: COLORS.textSecondary },
  card: { marginTop: SPACING.xl, padding: SPACING.lg, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface, gap: SPACING.md },
  providerLabel: { fontSize: 13, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", color: COLORS.textMuted },
  input: { minHeight: 54, borderRadius: 16, borderWidth: 1, borderColor: COLORS.borderStrong, backgroundColor: "#fffdf8", paddingHorizontal: SPACING.md, fontSize: 15, color: COLORS.textPrimary },
  helperText: { fontSize: 13, lineHeight: 19, color: COLORS.textSecondary },
  errorText: { marginTop: SPACING.lg, fontSize: 14, lineHeight: 20, color: "#b83a3a" },
  statusText: { marginTop: SPACING.lg, fontSize: 14, lineHeight: 20, color: COLORS.brand },
});
