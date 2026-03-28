import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ImageBackground,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SPACING } from "@/constants/spacing";
import { withAppFont } from "@/constants/typography";
import { useI18n } from "@/core/i18n/LanguageProvider";
import { useAuth } from "@/hooks/useAuth";
import type { SupportedLanguage } from "@/types/profile.types";

const HERO_IMAGE = require("../../assets/images/main.png");

type HeroButtonVariant = "facebook" | "zalo" | "dark";

type LoginCopy = {
  heroCaption: string;
  facebookCta: string;
  zaloCta: string;
  googleCta: string;
  emailLogin: string;
  emailSignup: string;
  customerCenter: string;
  faq: string;
  facebookPending: string;
  zaloPending: string;
  languageSheetTitle: string;
  languageSheetCancel: string;
};

const COPY: Record<SupportedLanguage, LoginCopy> = {
  ko: {
    heroCaption: "\uc2b9\ub9ac\ub97c \uc704\ud55c \ucd95\uad6c \uc5b4\uc2dc\uc2a4\ud134\ud2b8",
    facebookCta: "Facebook\uc73c\ub85c \uc2dc\uc791\ud558\uae30",
    zaloCta: "Zalo\ub85c \uc2dc\uc791\ud558\uae30",
    googleCta: "Google\ub85c \uc2dc\uc791\ud558\uae30",
    emailLogin: "\uc774\uba54\uc77c \ub85c\uadf8\uc778",
    emailSignup: "\uc774\uba54\uc77c \uac00\uc785",
    customerCenter: "\uace0\uac1d\uc13c\ud130",
    faq: "\uc790\uc8fc \ubb3b\ub294 \uc9c8\ubb38",
    facebookPending: "Facebook \ub85c\uadf8\uc778\uc740 \uc900\ube44 \uc911\uc785\ub2c8\ub2e4.",
    zaloPending: "Zalo \ub85c\uadf8\uc778\uc740 \uc900\ube44 \uc911\uc785\ub2c8\ub2e4.",
    languageSheetTitle: "\uc5b8\uc5b4 \uc120\ud0dd",
    languageSheetCancel: "\ucde8\uc18c",
  },
  vi: {
    heroCaption: "Tr\u1ee3 th\u1ee7 b\u00f3ng \u0111\u00e1 \u0111\u1ec3 chi\u1ebfn th\u1eafng",
    facebookCta: "Ti\u1ebfp t\u1ee5c v\u1edbi Facebook",
    zaloCta: "Ti\u1ebfp t\u1ee5c v\u1edbi Zalo",
    googleCta: "Ti\u1ebfp t\u1ee5c v\u1edbi Google",
    emailLogin: "\u0110\u0103ng nh\u1eadp email",
    emailSignup: "\u0110\u0103ng k\u00fd email",
    customerCenter: "Trung t\u00e2m h\u1ed7 tr\u1ee3",
    faq: "C\u00e2u h\u1ecfi th\u01b0\u1eddng g\u1eb7p",
    facebookPending: "\u0110\u0103ng nh\u1eadp Facebook \u0111ang \u0111\u01b0\u1ee3c chu\u1ea9n b\u1ecb.",
    zaloPending: "\u0110\u0103ng nh\u1eadp Zalo \u0111ang \u0111\u01b0\u1ee3c chu\u1ea9n b\u1ecb.",
    languageSheetTitle: "Ch\u1ecdn ng\u00f4n ng\u1eef",
    languageSheetCancel: "H\u1ee7y",
  },
  en: {
    heroCaption: "Your football assistant for every match",
    facebookCta: "Continue with Facebook",
    zaloCta: "Continue with Zalo",
    googleCta: "Continue with Google",
    emailLogin: "Email Login",
    emailSignup: "Email Sign Up",
    customerCenter: "Support",
    faq: "FAQ",
    facebookPending: "Facebook login is coming soon.",
    zaloPending: "Zalo login is coming soon.",
    languageSheetTitle: "Choose language",
    languageSheetCancel: "Cancel",
  },
};

const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  ko: "\uD83C\uDDF0\uD83C\uDDF7 \ud55c\uad6d\uc5b4",
  vi: "\uD83C\uDDFB\uD83C\uDDF3 Ti\u1ebfng Vi\u1ec7t",
  en: "\uD83C\uDDFA\uD83C\uDDF8 English",
};

const LANGUAGE_OPTIONS: SupportedLanguage[] = ["ko", "vi", "en"];

type HeroButtonProps = {
  icon: JSX.Element;
  isDisabled?: boolean;
  label: string;
  onPress: () => void;
  variant: HeroButtonVariant;
};

function HeroButton(props: HeroButtonProps): JSX.Element {
  const { icon, isDisabled = false, label, onPress, variant } = props;

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
  const insets = useSafeAreaInsets();
  const { language, setLanguage } = useI18n();
  const copy = useMemo(() => COPY[language], [language]);
  const { errorMessage, isAuthenticated, isLoading, isSigningIn, signInWithGoogle, statusMessage } = useAuth();
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [isLanguageSheetOpen, setIsLanguageSheetOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated]);

  const topOffset = Math.max(insets.top + 6, 50);
  const bottomOffset = Math.max(insets.bottom, 18) + 12;

  return (
    <View style={styles.screen}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <ImageBackground source={HERO_IMAGE} style={styles.background} imageStyle={styles.backgroundImage}>
        <View style={styles.overlay} />
        <View style={styles.content}>
          <Pressable onPress={() => setIsLanguageSheetOpen(true)} style={[styles.languagePill, { top: topOffset }]}> 
            <Text style={withAppFont(styles.languagePillLabel)}>{LANGUAGE_LABELS[language]}</Text>
            <Ionicons name="chevron-down" size={16} color="#ffffff" />
          </Pressable>

          <View style={styles.heroBlock}>
            <Text style={withAppFont(styles.heroTitle)}>KickGo</Text>
            <Text style={withAppFont(styles.heroSubtitle)}>{copy.heroCaption}</Text>
          </View>

          <View style={[styles.bottomSection, { paddingBottom: bottomOffset }]}>
            <View style={styles.mainActions}>
              <HeroButton
                icon={<Ionicons name="logo-facebook" size={22} color="#ffffff" />}
                isDisabled={isLoading || isSigningIn}
                label={copy.facebookCta}
                onPress={() => setInfoMessage(copy.facebookPending)}
                variant="facebook"
              />
              <HeroButton
                icon={<MaterialCommunityIcons name="chat-processing" size={22} color="#ffffff" />}
                isDisabled={isLoading || isSigningIn}
                label={copy.zaloCta}
                onPress={() => setInfoMessage(copy.zaloPending)}
                variant="zalo"
              />
              <HeroButton
                icon={<Ionicons name="logo-google" size={22} color="#ffffff" />}
                isDisabled={isLoading || isSigningIn}
                label={copy.googleCta}
                onPress={() => {
                  setInfoMessage(null);
                  void signInWithGoogle();
                }}
                variant="dark"
              />
            </View>

            <View style={styles.emailRow}>
              <Pressable onPress={() => router.push("/(auth)/email-login")} style={({ pressed }) => [styles.secondaryEmailButton, pressed && styles.heroButtonPressed]}>
                <Text style={withAppFont(styles.secondaryEmailLabel)}>{copy.emailLogin}</Text>
              </Pressable>
              <Pressable onPress={() => router.push("/(auth)/email-signup")} style={({ pressed }) => [styles.secondaryEmailButton, pressed && styles.heroButtonPressed]}>
                <Text style={withAppFont(styles.secondaryEmailLabel)}>{copy.emailSignup}</Text>
              </Pressable>
            </View>

            {errorMessage ? <Text style={withAppFont(styles.errorText)}>{errorMessage}</Text> : null}
            {infoMessage ? <Text style={withAppFont(styles.statusText)}>{infoMessage}</Text> : null}
            {statusMessage ? <Text style={withAppFont(styles.statusText)}>{statusMessage}</Text> : null}

            <View style={styles.footerWrap}>
              <View style={styles.footerDivider} />
              <View style={styles.footerLinks}>
                <Pressable onPress={() => router.push("/(auth)/faq")}>
                  <Text style={withAppFont(styles.footerLink)}>{copy.customerCenter}</Text>
                </Pressable>
                <Text style={withAppFont(styles.footerDot)}>·</Text>
                <Pressable onPress={() => router.push("/(auth)/faq")}>
                  <Text style={withAppFont(styles.footerLink)}>{copy.faq}</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>

        <Modal animationType="fade" onRequestClose={() => setIsLanguageSheetOpen(false)} transparent visible={isLanguageSheetOpen}>
          <Pressable onPress={() => setIsLanguageSheetOpen(false)} style={styles.modalOverlay}>
            <Pressable onPress={() => undefined} style={styles.sheetCard}>
              <View style={styles.sheetHandle} />
              <Text style={withAppFont(styles.sheetTitle)}>{copy.languageSheetTitle}</Text>
              <View style={styles.sheetOptions}>
                {LANGUAGE_OPTIONS.map((option) => {
                  const isSelected = option === language;
                  return (
                    <Pressable
                      key={option}
                      onPress={() => {
                        void setLanguage(option);
                        setIsLanguageSheetOpen(false);
                      }}
                      style={({ pressed }) => [
                        styles.sheetOption,
                        isSelected && styles.sheetOptionSelected,
                        pressed && styles.heroButtonPressed,
                      ]}
                    >
                      <Text style={withAppFont([styles.sheetOptionLabel, isSelected && styles.sheetOptionLabelSelected])}>
                        {LANGUAGE_LABELS[option]}
                      </Text>
                      {isSelected ? <Ionicons name="checkmark-circle" size={18} color="#2563eb" /> : null}
                    </Pressable>
                  );
                })}
              </View>
              <Pressable onPress={() => setIsLanguageSheetOpen(false)} style={styles.sheetCancelButton}>
                <Text style={withAppFont(styles.sheetCancelLabel)}>{copy.languageSheetCancel}</Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#08131b" },
  background: { flex: 1 },
  backgroundImage: { resizeMode: "cover" },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(6, 12, 18, 0.46)" },
  content: { flex: 1, paddingHorizontal: 24 },
  languagePill: {
    position: "absolute",
    right: 20,
    zIndex: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)",
  },
  languagePillLabel: { color: "#ffffff", fontSize: 13, fontWeight: "700" },
  heroBlock: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 96,
    paddingHorizontal: 18,
  },
  heroTitle: { color: "#ffffff", fontSize: 50, fontWeight: "900", letterSpacing: 0.4, marginBottom: 12 },
  heroSubtitle: { color: "rgba(255,255,255,0.94)", fontSize: 22, lineHeight: 30, textAlign: "center" },
  bottomSection: { gap: 12 },
  mainActions: { gap: 10 },
  heroButton: {
    minHeight: 58,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
  },
  heroButtonInner: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
  heroButtonIcon: { width: 22, alignItems: "center" },
  heroButtonLabel: { fontSize: 18, fontWeight: "800" },
  heroButtonPressed: { opacity: 0.88 },
  heroButtonDisabled: { opacity: 0.55 },
  emailRow: { flexDirection: "row", gap: 12, marginTop: 10 },
  secondaryEmailButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.6)",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  secondaryEmailLabel: { color: "#ffffff", fontSize: 15, fontWeight: "700" },
  footerWrap: { marginTop: 16, alignItems: "center" },
  footerDivider: { alignSelf: "stretch", borderTopWidth: 0.5, borderTopColor: "rgba(255,255,255,0.3)", marginBottom: 14 },
  footerLinks: { flexDirection: "row", gap: 20, alignItems: "center" },
  footerLink: { color: "rgba(255,255,255,0.7)", fontSize: 13 },
  footerDot: { color: "rgba(255,255,255,0.3)", fontSize: 13 },
  errorText: { textAlign: "center", fontSize: 14, lineHeight: 20, color: "#ffd0d0" },
  statusText: { textAlign: "center", fontSize: 14, lineHeight: 20, color: "#def4ff" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.42)", justifyContent: "flex-end" },
  sheetCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
  },
  sheetHandle: { alignSelf: "center", width: 44, height: 5, borderRadius: 999, backgroundColor: "#d1d5db", marginBottom: 16 },
  sheetTitle: { fontSize: 18, fontWeight: "800", color: "#0f172a", textAlign: "center", marginBottom: 16 },
  sheetOptions: { gap: 10 },
  sheetOption: {
    minHeight: 50,
    borderRadius: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  sheetOptionSelected: { borderColor: "#60a5fa", backgroundColor: "#eff6ff" },
  sheetOptionLabel: { fontSize: 15, fontWeight: "700", color: "#0f172a" },
  sheetOptionLabelSelected: { color: "#1d4ed8" },
  sheetCancelButton: {
    marginTop: 14,
    minHeight: 50,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111827",
  },
  sheetCancelLabel: { color: "#ffffff", fontSize: 15, fontWeight: "800" },
});

const heroButtonVariants = StyleSheet.create({
  facebook: { backgroundColor: "#1877f2" },
  zalo: { backgroundColor: "#38bdf8" },
  dark: { backgroundColor: "rgba(12, 14, 19, 0.94)" },
});

const heroButtonLabelVariants = StyleSheet.create({
  facebook: { color: "#ffffff" },
  zalo: { color: "#ffffff" },
  dark: { color: "#ffffff" },
});
