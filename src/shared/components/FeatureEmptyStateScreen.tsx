import type { ReactNode } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PrimaryButton } from "@/components/PrimaryButton";
import { COLORS } from "@/constants/colors";
import { SPACING } from "@/constants/spacing";
import { withAppFont } from "@/constants/typography";

type FeatureAction = {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline";
};

type FeatureSection = {
  title: string;
  body: string;
  footer?: string;
};

type FeatureEmptyStateScreenProps = {
  eyebrow?: string;
  title: string;
  description: string;
  badge?: string;
  sections?: FeatureSection[];
  primaryAction?: FeatureAction;
  secondaryAction?: FeatureAction;
  children?: ReactNode;
};

export function FeatureEmptyStateScreen(props: FeatureEmptyStateScreenProps): JSX.Element {
  const {
    eyebrow = "KickGo",
    title,
    description,
    badge,
    sections = [],
    primaryAction,
    secondaryAction,
    children,
  } = props;

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <Text style={withAppFont(styles.eyebrow)}>{eyebrow}</Text>
          <Text style={withAppFont(styles.title)}>{title}</Text>
          <Text style={withAppFont(styles.description)}>{description}</Text>
          {badge ? (
            <View style={styles.badgeWrap}>
              <Text style={withAppFont(styles.badge)}>{badge}</Text>
            </View>
          ) : null}
        </View>

        {sections.map((section) => (
          <View key={section.title} style={styles.sectionCard}>
            <Text style={withAppFont(styles.sectionTitle)}>{section.title}</Text>
            <Text style={withAppFont(styles.sectionBody)}>{section.body}</Text>
            {section.footer ? <Text style={withAppFont(styles.sectionFooter)}>{section.footer}</Text> : null}
          </View>
        ))}

        {children}

        {primaryAction || secondaryAction ? (
          <View style={styles.actionGroup}>
            {primaryAction ? (
              <PrimaryButton label={primaryAction.label} onPress={primaryAction.onPress} variant={primaryAction.variant} />
            ) : null}
            {secondaryAction ? (
              <PrimaryButton label={secondaryAction.label} onPress={secondaryAction.onPress} variant={secondaryAction.variant} />
            ) : null}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.screenHorizontal,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xl,
    gap: SPACING.lg,
  },
  heroCard: {
    borderRadius: 28,
    padding: SPACING.xl,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.sm,
  },
  eyebrow: { fontSize: 12, fontWeight: "700", letterSpacing: 1.1, textTransform: "uppercase", color: COLORS.textMuted },
  title: { fontSize: 34, fontWeight: "900", color: COLORS.textPrimary },
  description: { fontSize: 16, lineHeight: 24, color: COLORS.textSecondary },
  badgeWrap: {
    marginTop: SPACING.sm,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: COLORS.brandSoft,
  },
  badge: { fontSize: 13, fontWeight: "700", color: COLORS.brand },
  sectionCard: {
    borderRadius: 22,
    padding: SPACING.lg,
    backgroundColor: "#fffdf8",
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.sm,
  },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: COLORS.textPrimary },
  sectionBody: { fontSize: 15, lineHeight: 22, color: COLORS.textSecondary },
  sectionFooter: { fontSize: 13, lineHeight: 18, color: COLORS.textMuted },
  actionGroup: { gap: SPACING.md },
});