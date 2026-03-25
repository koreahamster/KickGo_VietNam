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
import { PrimaryButton } from "@/components/PrimaryButton";
import { SPACING } from "@/constants/spacing";
import { withAppFont } from "@/constants/typography";
import { useI18n } from "@/core/i18n/LanguageProvider";
import { useAuth } from "@/hooks/useAuth";
import type { SupportedLanguage } from "@/types/profile.types";

const HERO_IMAGE = require("../../assets/images/main.png");

type ViewMode = "main" | "email";
type HeroButtonVariant = "yellow" | "facebook" | "zalo" | "dark" | "brand";

type LocalLoginCopy = {
  heroCaption: string;
  signupCta: string;
  facebookCta: string;
  zaloCta: string;
  customerCenter: string;
  customerCenterMessage: string;
  facebookPending: string;
  zaloPending: string;
  emailOnlyTitle: string;
  emailOnlySubtitle: string;
  backToMain: string;
};

const LOGIN_COPY: Record<SupportedLanguage, LocalLoginCopy> = {
  ko: {
    heroCaption: "승리를 위한 축구 어시스턴트",
    signupCta: "회원가입으로 시작하기",
    facebookCta: "Facebook으로 시작하기",
    zaloCta: "Zalo로 시작하기",
    customerCenter: "고객센터",
    customerCenterMessage: "고객센터는 준비 중입니다.",
    facebookPending: "Facebook 로그인은 준비 중입니다.",
    zaloPending: "Zalo 로그인은 준비 중입니다.",
    emailOnlyTitle: "이메일 로그인",
    emailOnlySubtitle: "가입한 이메일과 비밀번호를 입력해 주세요.",
    backToMain: "이전으로",
  },
  vi: {
    heroCaption: "Trợ lý bóng đá để giành chiến thắng",
    signupCta: "Bắt đầu bằng đăng ký",
    facebookCta: "Tiếp tục với Facebook",
    zaloCta: "Tiếp tục với Zalo",
    customerCenter: "Trung tâm hỗ trợ",
    customerCenterMessage: "Trung tâm hỗ trợ đang được chuẩn bị.",
    facebookPending: "Đăng nhập Facebook đang được chuẩn bị.",
    zaloPending: "Đăng nhập Zalo đang được chuẩn bị.",
    emailOnlyTitle: "Đăng nhập email",
    emailOnlySubtitle: "Nhập email và mật khẩu bạn đã đăng ký.",
    backToMain: "Quay lại",
  },
  en: {
    heroCaption: "Your football assistant for winning matches",
    signupCta: "Start with sign up",
    facebookCta: "Continue with Facebook",
    zaloCta: "Continue with Zalo",
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
        <Text style={withAppFont([styles.heroButtonLabel, heroButtonLabelVariants[variant]])}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

export default function LoginScreen(): JSX.Element {
  const { language, setLanguage, t } = useI18n();
  const copy = useMemo(() => LOGIN_COPY[language], [language]);
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
  const [mode, setMode] = useState<ViewMode>("main");
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    router.replace("/");
  }, [isAuthenticated]);

  const validateForm = (): boolean => {
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail) {
      setValidationMessage(t("auth.login.validationRequiredEmail"));
      return false;
    }

    if (!normalizedEmail.includes("@")) {
      setValidationMessage(t("auth.login.validationInvalidEmail"));
      return false;
    }

    if (password.length < 6) {
      setValidationMessage(t("auth.login.validationPasswordLength"));
      return false;
    }

    setValidationMessage(null);
    return true;
  };

  const handleEmailLogin = (): void => {
    if (!validateForm()) {
      return;
    }

    setInfoMessage(null);
    void signInWithEmail(normalizeEmail(email), password);
  };

  const openPlaceholder = (message: string): void => {
    setValidationMessage(null);
    setInfoMessage(message);
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.safeArea}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ImageBackground source={HERO_IMAGE} style={styles.background} imageStyle={styles.backgroundImage}>
            <View style={styles.overlay} />
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              bounces={false}
            >
              <View style={styles.topBar}>
                <View style={styles.languageCard}>
                  <LanguageSwitcher
                    value={language}
                    onChange={(nextLanguage) => void setLanguage(nextLanguage)}
                    label={t("common.language")}
                  />
                </View>
              </View>

              {mode === "main" ? (
                <>
                  <View style={styles.heroContent}>
                    <Text style={styles.heroTitle}>KickGo</Text>
                    <Text style={styles.heroSubtitle}>{copy.heroCaption}</Text>
                  </View>

                  <View style={styles.actionArea}>
                    <HeroButton
                      label={copy.signupCta}
                      onPress={() => router.push("/(auth)/signup")}
                      variant="yellow"
                      isDisabled={isLoading || isSigningIn}
                      icon={<Ionicons name="person-add" size={24} color="#241d0a" />}
                    />
                    <HeroButton
                      label={copy.facebookCta}
                      onPress={() => openPlaceholder(copy.facebookPending)}
                      variant="facebook"
                      isDisabled={isLoading || isSigningIn}
                      icon={<Ionicons name="logo-facebook" size={24} color="#ffffff" />}
                    />
                    <HeroButton
                      label={copy.zaloCta}
                      onPress={() => openPlaceholder(copy.zaloPending)}
                      variant="zalo"
                      isDisabled={isLoading || isSigningIn}
                      icon={<MaterialCommunityIcons name="chat-processing" size={24} color="#ffffff" />}
                    />
                    <HeroButton
                      label={t("auth.login.googleButton")}
                      onPress={() => {
                        setInfoMessage(null);
                        void signInWithGoogle();
                      }}
                      variant="dark"
                      isDisabled={isLoading || isSigningIn}
                      icon={<Ionicons name="logo-google" size={24} color="#ffffff" />}
                    />
                    <HeroButton
                      label={t("auth.login.emailButton")}
                      onPress={() => {
                        setValidationMessage(null);
                        setInfoMessage(null);
                        setMode("email");
                      }}
                      variant="brand"
                      isDisabled={isLoading || isSigningIn}
                      icon={<Ionicons name="mail" size={24} color="#ffffff" />}
                    />
                  </View>
                </>
              ) : (
                <View style={styles.emailModeWrap}>
                  <Pressable
                    onPress={() => {
                      setMode("main");
                      setValidationMessage(null);
                      setInfoMessage(null);
                    }}
                    style={styles.backButton}
                  >
                    <Ionicons name="chevron-back" size={20} color="#ffffff" />
                    <Text style={styles.backButtonLabel}>{copy.backToMain}</Text>
                  </Pressable>

                  <View style={styles.heroContentCompact}>
                    <Text style={styles.heroTitle}>KickGo</Text>
                    <Text style={styles.heroSubtitle}>{copy.emailOnlySubtitle}</Text>
                  </View>

                  <View style={styles.formCard}> 
                    <Text style={styles.formTitle}>{copy.emailOnlyTitle}</Text>
                    <TextInput
                      autoCapitalize="none"
                      autoCorrect={false}
                      keyboardType="email-address"
                      value={email}
                      onChangeText={(value) => {
                        setEmail(value);
                        setValidationMessage(null);
                      }}
                      placeholder={t("auth.login.emailPlaceholder")}
                      placeholderTextColor="rgba(255,255,255,0.65)"
                      style={styles.input}
                      returnKeyType="next"
                    />
                    <TextInput
                      autoCapitalize="none"
                      autoCorrect={false}
                      secureTextEntry
                      value={password}
                      onChangeText={(value) => {
                        setPassword(value);
                        setValidationMessage(null);
                      }}
                      placeholder={t("auth.login.passwordPlaceholder")}
                      placeholderTextColor="rgba(255,255,255,0.65)"
                      style={styles.input}
                      returnKeyType="done"
                      onSubmitEditing={handleEmailLogin}
                    />
                    <PrimaryButton
                      label={isSigningIn ? t("auth.login.emailButtonLoading") : t("auth.login.emailButton")}
                      onPress={handleEmailLogin}
                      isDisabled={isLoading || isSigningIn}
                    />
                  </View>
                </View>
              )}

              {validationMessage ? <Text style={styles.errorText}>{validationMessage}</Text> : null}
              {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
              {infoMessage ? <Text style={styles.statusText}>{infoMessage}</Text> : null}
              {statusMessage ? <Text style={styles.statusText}>{statusMessage}</Text> : null}

              <View style={styles.footerRow}>
                <Pressable onPress={() => openPlaceholder(copy.customerCenterMessage)} style={styles.footerLinkWrap}>
                  <Ionicons name="headset" size={16} color="#ffffff" />
                  <Text style={styles.footerLink}>{copy.customerCenter}</Text>
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
  safeArea: {
    flex: 1,
    backgroundColor: "#09141d",
  },
  background: {
    flex: 1,
  },
  backgroundImage: {
    resizeMode: "cover",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(7, 12, 16, 0.58)",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.screenHorizontal,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
    justifyContent: "space-between",
    gap: SPACING.lg,
  },
  topBar: {
    alignItems: "flex-end",
  },
  languageCard: {
    width: 180,
    borderRadius: 24,
    padding: 12,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  heroContent: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 84,
    gap: SPACING.md,
  },
  heroContentCompact: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 24,
    gap: SPACING.sm,
  },
  heroTitle: {
    fontSize: 48,
    fontWeight: "900",
    color: "#ffffff",
    letterSpacing: 1,
  },
  heroSubtitle: {
    fontSize: 20,
    lineHeight: 28,
    color: "rgba(255,255,255,0.94)",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  actionArea: {
    gap: SPACING.md,
  },
  heroButton: {
    minHeight: 62,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    borderWidth: 1,
  },
  heroButtonInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  heroButtonIcon: {
    width: 28,
    alignItems: "center",
  },
  heroButtonLabel: {
    fontSize: 20,
    fontWeight: "800",
  },
  heroButtonPressed: {
    opacity: 0.88,
  },
  heroButtonDisabled: {
    opacity: 0.55,
  },
  emailModeWrap: {
    gap: SPACING.lg,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 2,
    paddingVertical: 6,
  },
  backButtonLabel: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
  formCard: {
    gap: SPACING.md,
    marginTop: 4,
    borderRadius: 24,
    padding: SPACING.lg,
    backgroundColor: "rgba(10, 18, 24, 0.78)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
  },
  formTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#ffffff",
  },
  input: {
    minHeight: 56,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    backgroundColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: SPACING.md,
    fontSize: 16,
    color: "#ffffff",
  },
  errorText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#ffb1b1",
    textAlign: "center",
  },
  statusText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#d7f4ff",
    textAlign: "center",
  },
  footerRow: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: SPACING.sm,
  },
  footerLinkWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  footerLink: {
    fontSize: 15,
    color: "rgba(255,255,255,0.92)",
    fontWeight: "700",
  },
});

const heroButtonVariants = StyleSheet.create({
  yellow: {
    backgroundColor: "#f8e25b",
    borderColor: "#f8e25b",
  },
  facebook: {
    backgroundColor: "#1877f2",
    borderColor: "#1877f2",
  },
  zalo: {
    backgroundColor: "#0a8fdc",
    borderColor: "#0a8fdc",
  },
  dark: {
    backgroundColor: "rgba(13, 13, 16, 0.92)",
    borderColor: "rgba(255,255,255,0.12)",
  },
  brand: {
    backgroundColor: "#ff3156",
    borderColor: "#ff3156",
  },
});

const heroButtonLabelVariants = StyleSheet.create({
  yellow: {
    color: "#241d0a",
  },
  facebook: {
    color: "#ffffff",
  },
  zalo: {
    color: "#ffffff",
  },
  dark: {
    color: "#ffffff",
  },
  brand: {
    color: "#ffffff",
  },
});