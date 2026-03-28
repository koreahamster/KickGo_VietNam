import { router } from "expo-router";
import { useMemo } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { withAppFont } from "@/constants/typography";
import { useI18n } from "@/core/i18n/LanguageProvider";
import type { SupportedLanguage } from "@/types/profile.types";

const COPY: Record<SupportedLanguage, {
  back: string;
  title: string;
  subtitle: string;
  phonePlaceholder: string;
  disabledButton: string;
  skip: string;
}> = {
  ko: {
    back: "\uc774\uc804",
    title: "\uc804\ud654\ubc88\ud638 \uc778\uc99d",
    subtitle: "\ubcf8\uc778 \ud655\uc778\uc744 \uc704\ud574 \uc804\ud654\ubc88\ud638 \uc778\uc99d\uc774 \ud544\uc694\ud569\ub2c8\ub2e4.",
    phonePlaceholder: "+84 \uc804\ud654\ubc88\ud638 \uc785\ub825",
    disabledButton: "\uc778\uc99d\ubc88\ud638 \ubc1b\uae30 (\uc900\ube44 \uc911)",
    skip: "\uac1c\ubc1c \ud14c\uc2a4\ud2b8\uc6a9 - \uac74\ub108\ub6f0\uae30 \u2192",
  },
  vi: {
    back: "Quay l\u1ea1i",
    title: "X\u00e1c minh s\u1ed1 \u0111i\u1ec7n tho\u1ea1i",
    subtitle: "C\u1ea7n x\u00e1c minh s\u1ed1 \u0111i\u1ec7n tho\u1ea1i \u0111\u1ec3 x\u00e1c nh\u1eadn danh t\u00ednh c\u1ee7a b\u1ea1n.",
    phonePlaceholder: "+84 Nh\u1eadp s\u1ed1 \u0111i\u1ec7n tho\u1ea1i",
    disabledButton: "Nh\u1eadn m\u00e3 x\u00e1c minh (s\u1eafp ra m\u1eaft)",
    skip: "B\u1ecf qua cho ki\u1ec3m th\u1eed \u2192",
  },
  en: {
    back: "Back",
    title: "Phone Verification",
    subtitle: "Phone verification is required to confirm your identity.",
    phonePlaceholder: "+84 Enter phone number",
    disabledButton: "Get verification code (Coming Soon)",
    skip: "Skip for development testing \u2192",
  },
};

export default function PhoneVerifyScreen(): JSX.Element {
  const { language } = useI18n();
  const copy = useMemo(() => COPY[language], [language]);

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <View style={styles.container}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={withAppFont(styles.backButtonLabel)}>{copy.back}</Text>
        </Pressable>

        <View style={styles.contentWrap}>
          <Text style={withAppFont(styles.title)}>{copy.title}</Text>
          <Text style={withAppFont(styles.subtitle)}>{copy.subtitle}</Text>

          <View style={styles.formCard}>
            <TextInput
              editable={false}
              placeholder={copy.phonePlaceholder}
              placeholderTextColor="#94a3b8"
              style={styles.input}
              value=""
            />
            <Pressable disabled style={styles.disabledButton}>
              <Text style={withAppFont(styles.disabledButtonLabel)}>{copy.disabledButton}</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.footerWrap}>
          <Pressable onPress={() => router.replace("/(onboarding)/create-profile")} style={({ pressed }) => [styles.skipButton, pressed && styles.pressed]}>
            <Text style={withAppFont(styles.skipButtonLabel)}>{copy.skip}</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  backButton: {
    alignSelf: "flex-start",
    paddingVertical: 8,
  },
  backButtonLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#334155",
  },
  contentWrap: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 30,
    fontWeight: "900",
    color: "#0f172a",
    marginTop: 12,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: "#64748b",
    marginTop: 10,
    marginBottom: 24,
  },
  formCard: {
    gap: 12,
  },
  input: {
    minHeight: 54,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#dbe4f0",
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#0f172a",
    backgroundColor: "#f8fafc",
    opacity: 0.5,
  },
  disabledButton: {
    minHeight: 54,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ef4444",
    opacity: 0.4,
  },
  disabledButtonLabel: {
    fontSize: 16,
    fontWeight: "800",
    color: "#ffffff",
  },
  footerWrap: {
    alignItems: "center",
    marginTop: 12,
  },
  skipButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  skipButtonLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#475569",
    textDecorationLine: "underline",
  },
  pressed: {
    opacity: 0.75,
  },
});
