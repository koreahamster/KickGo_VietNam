import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { type PropsWithChildren, type ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getTeamCreateCopy } from "@/constants/team-create";
import { useI18n } from "@/core/i18n/LanguageProvider";

type TeamCreateScreenFrameProps = PropsWithChildren<{
  step: 1 | 2 | 3;
  footer?: ReactNode;
  onBack?: () => void;
}>;

export function TeamCreateScreenFrame(props: TeamCreateScreenFrameProps): JSX.Element {
  const { language } = useI18n();
  const copy = getTeamCreateCopy(language);

  const handleBack = (): void => {
    if (props.onBack) {
      props.onBack();
      return;
    }

    router.back();
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.header}>
          <Pressable hitSlop={12} onPress={handleBack} style={styles.backButton}>
            <Ionicons color="#111827" name="chevron-back" size={22} />
          </Pressable>
          <Text style={styles.headerTitle}>{copy.title}</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.headerDivider} />

        <View style={styles.progressWrap}>
          <Text style={styles.progressText}>{`${props.step}/3`}</Text>
          <View style={styles.progressTrack}>
            {[1, 2, 3].map((item) => (
              <View
                key={item}
                style={[styles.progressSegment, item <= props.step ? styles.progressSegmentActive : null]}
              />
            ))}
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {props.children}
        </ScrollView>

        {props.footer ? <View style={styles.footerWrap}>{props.footer}</View> : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  backButton: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  headerSpacer: {
    width: 28,
    height: 28,
  },
  headerDivider: {
    height: 2,
    backgroundColor: "#1f2937",
  },
  progressWrap: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 8,
    gap: 8,
  },
  progressText: {
    alignSelf: "flex-end",
    fontSize: 13,
    fontWeight: "700",
    color: "#6b7280",
  },
  progressTrack: {
    flexDirection: "row",
    gap: 8,
  },
  progressSegment: {
    flex: 1,
    height: 6,
    borderRadius: 999,
    backgroundColor: "#e5e7eb",
  },
  progressSegmentActive: {
    backgroundColor: "#111827",
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
  },
  footerWrap: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 20,
    backgroundColor: "#ffffff",
  },
});