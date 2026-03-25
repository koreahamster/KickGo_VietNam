import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { SPACING } from "@/constants/spacing";
import { withAppFont } from "@/constants/typography";
import { useI18n } from "@/core/i18n/LanguageProvider";
import { useAuth } from "@/hooks/useAuth";
import type { SupportedLanguage } from "@/types/profile.types";

const HERO_IMAGE = require("../../assets/images/main.png");

type ViewMode = "main" | "email";
type HeroButtonVariant = "yellow" | "facebook" | "zalo" | "dark" | "brand";

type HeroCopy = {
  heroCaption: string;
  signupCta: string;
  facebookCta: string;
  zaloCta: string;
  googleCta: string;
  emailCta: string;
  customerCenter: string;
  customerCenterMessage: string;
  facebookPending: string;
  zaloPending: string;
  emailOnlyTitle: string;
  emailOnlySubtitle: string;
  backToMain: string;
};

const COPY: Record<SupportedLanguage, HeroCopy> = {
  ko: {
    heroCaption: "승리를 위한 축구 어시스턴트",
    signupCta: "회원가입으로 시작하기",
    facebookCta: "Facebook으로 시작하기",
    zaloCta: "Zalo로 시작하기",
    googleCta: "Google로 시작하기",
    emailCta: "이메일로 로그인",
    customerCenter: "고객센터",
    customerCenterMessage: "고객센터는 준비 중입니다.",
    facebookPending: "Facebook 로그인은 준비 중입니다.",
    zaloPending: "Zalo 로그인은 준비 중입니다.",
    emailOnlyTitle: "이메일 로그인",
    emailOnlySubtitle: "등록한 이메일과 비밀번호로 로그인하세요.",
    backToMain: "이전으로",
  },
  vi: {
    heroCaption: "Trợ lý bóng đá cho chiến thắng",
    signupCta: "Bắt đầu với đăng ký",
    facebookCta: "Tiếp tục với Facebook",
    zaloCta: "Tiếp tục với Zalo",
    googleCta: "Tiếp tục với Google",
    emailCta: "Đăng nhập bằng email",
    customerCenter: "Trung tâm hỗ trợ",
    customerCenterMessage: "Trung tâm hỗ trợ đang được chuẩn bị.",
    facebookPending: "Đăng nhập Facebook đang được chuẩn bị.",
    zaloPending: "Đăng nhập Zalo đang được chuẩn bị.",
    emailOnlyTitle: "Đăng nhập email",
    emailOnlySubtitle: "Nhập email và mật khẩu đã đăng ký.",
    backToMain: "Quay lại",
  },
  en: {
    heroCaption: "Your football assistant for every match",
    signupCta: "Start with Sign Up",
    facebookCta: "Continue with Facebook",
    zaloCta: "Continue with Zalo",
    googleCta: "Continue with Google",
    emailCta: "Log In with Email",
    customerCenter: "Customer Center",
    customerCenterMessage: "Customer support is coming soon.",
    facebookPending: "Facebook login is coming soon.",
    zaloPending: "Zalo login is coming soon.",
    emailOnlyTitle: "Email Login",
    emailOnlySubtitle: "Enter the email and password you already use.",
    backToMain: "Back",
  },
};

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

type HeroButtonProps = {
  label: string;
  onPress: () => void;
  variant: HeroButtonVariant;
  isDisabled?: boolean;
  icon: JSX.Element;
};

function HeroButton(props: HeroButtonProps): JSX.Element {
  const { label, onPress, variant, isDisabled = false, icon } = props;

  return (
    <Pressable
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.heroButton,
        heroButtonVariants[variant],
        pressed && !isDisabled && styles.heroButtonPressed,
        isDisabled && styles.heroButtonDisabled,
      ]}
    >
      <View style={styles.heroButtonInner}>
        <View style={styles.heroButtonIcon}>{icon}</View>
        <Text style={withAppFont([styles.heroButtonLabel, heroButtonLabelVariants[variant]])}>{label}</Text>
      </View>
    </Pressable>
  );
}

export default function LoginScreen(): JSX.Element {
  const { language, setLanguage, t } = useI18n();
  const copy = useMemo(() => COPY[language], [language]);
  const { errorMessage, isAuthenticated, isLoading, isSigningIn, signInWithEmail, signInWithGoogle, statusMessage } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<ViewMode>("main");
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated]);

  const handleEmailLogin = (): void => {
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
    setInfoMessage(null);
    void signInWithEmail(normalizedEmail, password);
  };

  const openPending = (message: string): void => {
    setValidationMessage(null);
    setInfoMessage(message);
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.safeArea}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ImageBackground source={HERO_IMAGE} style={styles.background} imageStyle={styles.backgroundImage}>
            <View style={styles.overlay} />
            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" bounces={false}>
              <View style={styles.topBar}>
                <View style={styles.languageCard}>
                  <LanguageSwitcher value={language} onChange={(nextLanguage) => void setLanguage(nextLanguage)} label={t("common.language")} />
                </View>
              </View>

              {mode === "main" ? (
                <>
                  <View style={styles.heroContent}>
                    <Text style={withAppFont(styles.heroTitle)}>KickGo</Text>
                    <Text style={withAppFont(styles.heroSubtitle)}>{copy.heroCaption}</Text>
                  </View>

                  <View style={styles.actionArea}>
                    <HeroButton label={copy.signupCta} onPress={() => router.push("/(auth)/signup")} variant="yellow" isDisabled={isLoading || isSigningIn} icon={<Ionicons name="person-add" size={22} color="#2a2210" />} />
                    <HeroButton label={copy.facebookCta} onPress={() => openPending(copy.facebookPending)} variant="facebook" isDisabled={isLoading || isSigningIn} icon={<Ionicons name="logo-facebook" size={22} color="#ffffff" />} />
                    <HeroButton label={copy.zaloCta} onPress={() => openPending(copy.zaloPending)} variant="zalo" isDisabled={isLoading || isSigningIn} icon={<MaterialCommunityIcons name="chat-processing" size={22} color="#ffffff" />} />
                    <HeroButton label={copy.googleCta} onPress={() => { setInfoMessage(null); void signInWithGoogle(); }} variant="dark" isDisabled={isLoading || isSigningIn} icon={<Ionicons name="logo-google" size={22} color="#ffffff" />} />
                    <HeroButton label={copy.emailCta} onPress={() => { setValidationMessage(null); setInfoMessage(null); setMode("email"); }} variant="brand" isDisabled={isLoading || isSigningIn} icon={<Ionicons name="mail" size={22} color="#ffffff" />} />
                  </View>
                </>
              ) : (
                <View style={styles.emailModeWrap}>
                  <Pressable onPress={() => { setMode("main"); setValidationMessage(null); setInfoMessage(null); }} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={20} color="#ffffff" />
                    <Text style={withAppFont(styles.backButtonLabel)}>{copy.backToMain}</Text>
                  </Pressable>

                  <View style={styles.heroContentCompact}>
                    <Text style={withAppFont(styles.heroTitle)}>KickGo</Text>
                    <Text style={withAppFont(styles.heroSubtitle)}>{copy.emailOnlySubtitle}</Text>
                  </View>

                  <View style={styles.formCard}>
                    <Text style={withAppFont(styles.formTitle)}>{copy.emailOnlyTitle}</Text>
                    <TextInput autoCapitalize="none" autoCorrect={false} keyboardType="email-address" placeholder={t("auth.login.emailPlaceholder")} placeholderTextColor="rgba(255,255,255,0.7)" style={styles.input} value={email} onChangeText={(value) => { setEmail(value); setValidationMessage(null); }} />
                    <TextInput autoCapitalize="none" autoCorrect={false} secureTextEntry placeholder={t("auth.login.passwordPlaceholder")} placeholderTextColor="rgba(255,255,255,0.7)" style={styles.input} value={password} onChangeText={(value) => { setPassword(value); setValidationMessage(null); }} onSubmitEditing={handleEmailLogin} />
                    <Pressable onPress={handleEmailLogin} disabled={isLoading || isSigningIn} style={({ pressed }) => [styles.emailSubmit, pressed && styles.heroButtonPressed, (isLoading || isSigningIn) && styles.heroButtonDisabled]}>
                      <Text style={withAppFont(styles.emailSubmitLabel)}>{isSigningIn ? t("auth.login.emailButtonLoading") : copy.emailCta}</Text>
                    </Pressable>
                  </View>
                </View>
              )}

              {validationMessage ? <Text style={withAppFont(styles.errorText)}>{validationMessage}</Text> : null}
              {errorMessage ? <Text style={withAppFont(styles.errorText)}>{errorMessage}</Text> : null}
              {infoMessage ? <Text style={withAppFont(styles.statusText)}>{infoMessage}</Text> : null}
              {statusMessage ? <Text style={withAppFont(styles.statusText)}>{statusMessage}</Text> : null}

              <View style={styles.footerRow}>
                <Pressable onPress={() => openPending(copy.customerCenterMessage)} style={styles.footerLinkWrap}>
                  <Ionicons name="headset" size={16} color="#ffffff" />
                  <Text style={withAppFont(styles.footerLink)}>{copy.customerCenter}</Text>
                </Pressable>
              </View>
            </ScrollView>
          </ImageBackground>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#09141d" },
  background: { flex: 1 },
  backgroundImage: { resizeMode: "cover" },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(9, 16, 22, 0.52)" },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.screenHorizontal,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
    justifyContent: "space-between",
    gap: SPACING.lg,
  },
  topBar: { alignItems: "flex-end" },
  languageCard: {
    width: 188,
    borderRadius: 22,
    padding: 12,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  heroContent: { alignItems: "center", justifyContent: "center", paddingTop: 72, gap: SPACING.md },
  heroContentCompact: { alignItems: "center", justifyContent: "center", paddingTop: 24, gap: SPACING.sm },
  heroTitle: { fontSize: 52, fontWeight: "900", color: "#ffffff", letterSpacing: 0.6 },
  heroSubtitle: { fontSize: 20, lineHeight: 28, color: "rgba(255,255,255,0.95)", textAlign: "center", paddingHorizontal: 18 },
  actionArea: { gap: SPACING.md },
  heroButton: { minHeight: 62, borderRadius: 24, justifyContent: "center", alignItems: "center", paddingHorizontal: SPACING.lg, borderWidth: 1 },
  heroButtonInner: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12 },
  heroButtonIcon: { width: 28, alignItems: "center" },
  heroButtonLabel: { fontSize: 19, fontWeight: "800" },
  heroButtonPressed: { opacity: 0.88 },
  heroButtonDisabled: { opacity: 0.55 },
  emailModeWrap: { gap: SPACING.lg },
  backButton: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", paddingVertical: 6 },
  backButtonLabel: { color: "#ffffff", fontSize: 15, fontWeight: "700" },
  formCard: { gap: SPACING.md, marginTop: 4, borderRadius: 24, padding: SPACING.lg, backgroundColor: "rgba(10, 18, 24, 0.78)", borderWidth: 1, borderColor: "rgba(255,255,255,0.16)" },
  formTitle: { fontSize: 22, fontWeight: "800", color: "#ffffff" },
  input: { minHeight: 56, borderRadius: 18, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)", backgroundColor: "rgba(255,255,255,0.12)", paddingHorizontal: SPACING.md, fontSize: 16, color: "#ffffff" },
  emailSubmit: { minHeight: 56, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: "#ff3156" },
  emailSubmitLabel: { fontSize: 16, fontWeight: "800", color: "#ffffff" },
  errorText: { textAlign: "center", fontSize: 14, lineHeight: 20, color: "#ffb1b1" },
  statusText: { textAlign: "center", fontSize: 14, lineHeight: 20, color: "#d7f4ff" },
  footerRow: { alignItems: "center", justifyContent: "center", paddingTop: SPACING.sm },
  footerLinkWrap: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 8, paddingHorizontal: 14 },
  footerLink: { fontSize: 15, color: "rgba(255,255,255,0.92)", fontWeight: "700" },
});

const heroButtonVariants = StyleSheet.create({
  yellow: { backgroundColor: "#f8e25b", borderColor: "#f8e25b" },
  facebook: { backgroundColor: "#1877f2", borderColor: "#1877f2" },
  zalo: { backgroundColor: "#0a8fdc", borderColor: "#0a8fdc" },
  dark: { backgroundColor: "rgba(13, 13, 16, 0.92)", borderColor: "rgba(255,255,255,0.12)" },
  brand: { backgroundColor: "#ff3156", borderColor: "#ff3156" },
});

const heroButtonLabelVariants = StyleSheet.create({
  yellow: { color: "#241d0a" },
  facebook: { color: "#ffffff" },
  zalo: { color: "#ffffff" },
  dark: { color: "#ffffff" },
  brand: { color: "#ffffff" },
});