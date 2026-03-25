import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { COLORS } from "@/constants/colors";
import { MATCH_POSITION_GRID, getQuarterLabel, getTeamHubCopy } from "@/constants/team-hub";
import { SPACING } from "@/constants/spacing";
import { useI18n } from "@/core/i18n/LanguageProvider";

export default function MatchLineupScreen(): JSX.Element {
  const { teamName, quarterCount, quarterMinutes } = useLocalSearchParams<{
    teamName?: string;
    quarterCount?: string;
    quarterMinutes?: string;
  }>();
  const normalizedTeamName = typeof teamName === "string" ? teamName : "Club";
  const totalQuarters = Math.max(1, Number.parseInt(typeof quarterCount === "string" ? quarterCount : "2", 10) || 2);
  const minutesPerQuarter = Math.max(1, Number.parseInt(typeof quarterMinutes === "string" ? quarterMinutes : "25", 10) || 25);
  const { language } = useI18n();
  const copy = getTeamHubCopy(language);
  const quarterList = useMemo(() => Array.from({ length: totalQuarters }, (_, index) => index + 1), [totalQuarters]);
  const [selectedQuarter, setSelectedQuarter] = useState<number>(1);

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Pressable style={styles.iconButton} onPress={() => router.back()}>
            <Text style={styles.iconText}>{"<"}</Text>
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.title}>{copy.lineupTitle}</Text>
            <Text style={styles.subtitle}>{normalizedTeamName}</Text>
          </View>
          <View style={styles.headerMeta}>
            <Text style={styles.headerMetaText}>{minutesPerQuarter}{copy.perQuarterSuffix}</Text>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quarterSwitch}>
          {quarterList.map((quarter) => (
            <Pressable
              key={quarter}
              style={[styles.quarterCard, selectedQuarter === quarter && styles.quarterCardActive]}
              onPress={() => setSelectedQuarter(quarter)}
            >
              <Text style={[styles.quarterTitle, selectedQuarter === quarter && styles.quarterTitleActive]}>{getQuarterLabel(language, quarter)}</Text>
              <Text style={styles.quarterMeta}>0 {copy.playersSuffix}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.pitchCard}>
          <View style={styles.pitchHeader}>
            <Text style={styles.pitchHeaderText}>{getQuarterLabel(language, selectedQuarter)}</Text>
            <Text style={styles.pitchHeaderHint}>{minutesPerQuarter}{copy.perQuarterSuffix}</Text>
          </View>
          <View style={styles.pitch}>
            {MATCH_POSITION_GRID.map((row, rowIndex) => (
              <View key={`row-${rowIndex}`} style={styles.positionRow}>
                {row.map((position) => (
                  <View key={position} style={styles.positionChip}>
                    <Text style={styles.positionText}>{position}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        </View>

        <View style={styles.bottomActions}>
          <Pressable style={styles.bottomAction}><Text style={styles.bottomActionText}>{copy.loadPreset}</Text></Pressable>
          <Pressable style={styles.bottomAction}><Text style={styles.bottomActionText}>{copy.resetLineup}</Text></Pressable>
        </View>

        <View style={styles.listCard}>
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>{copy.availablePlayers}</Text>
            <Text style={styles.listCount}>0</Text>
          </View>
          <Text style={styles.emptyText}>{copy.noAvailablePlayers}</Text>
        </View>

        <View style={styles.listCard}>
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>{copy.benchPlayers}</Text>
            <Text style={styles.listCount}>1</Text>
          </View>
          <Text style={styles.emptyText}>{copy.noBenchPlayers}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#ffffff" },
  scrollContent: { padding: SPACING.screenHorizontal, paddingBottom: 44, gap: SPACING.lg },
  headerRow: { paddingTop: SPACING.md, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  iconButton: {
    minWidth: 56,
    minHeight: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: { fontSize: 18, fontWeight: "700", color: COLORS.textPrimary },
  headerCenter: { alignItems: "center", gap: 4 },
  title: { fontSize: 28, fontWeight: "800", color: COLORS.textPrimary },
  subtitle: { fontSize: 15, color: COLORS.textSecondary },
  headerMeta: {
    minWidth: 72,
    minHeight: 44,
    borderRadius: 16,
    backgroundColor: "#f4f6fb",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  headerMetaText: { fontSize: 15, fontWeight: "700", color: COLORS.textPrimary },
  quarterSwitch: { gap: SPACING.md },
  quarterCard: {
    width: 104,
    borderRadius: 18,
    backgroundColor: "#f4f6fb",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 4,
  },
  quarterCardActive: { backgroundColor: "#eef3ff" },
  quarterTitle: { fontSize: 18, fontWeight: "800", color: "#a9adb6" },
  quarterTitleActive: { color: COLORS.textPrimary },
  quarterMeta: { fontSize: 14, color: "#b5b9c3" },
  pitchCard: { borderRadius: 28, backgroundColor: "#f7fafc", padding: SPACING.lg, gap: SPACING.md },
  pitchHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  pitchHeaderText: { fontSize: 18, fontWeight: "800", color: COLORS.textPrimary },
  pitchHeaderHint: { fontSize: 15, color: COLORS.textSecondary },
  pitch: {
    borderRadius: 28,
    backgroundColor: "#1ec57a",
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.sm,
    gap: SPACING.md,
  },
  positionRow: { flexDirection: "row", justifyContent: "space-evenly", alignItems: "center", gap: 8 },
  positionChip: {
    minWidth: 58,
    minHeight: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.65)",
    backgroundColor: "rgba(255,255,255,0.5)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  positionText: { fontSize: 16, fontWeight: "700", color: "#355055" },
  bottomActions: { flexDirection: "row", gap: SPACING.md },
  bottomAction: {
    flex: 1,
    minHeight: 56,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  bottomActionText: { fontSize: 16, fontWeight: "700", color: COLORS.textPrimary },
  listCard: { borderRadius: 24, backgroundColor: "#ffffff", padding: SPACING.lg, gap: SPACING.sm, borderWidth: 1, borderColor: COLORS.border },
  listHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  listTitle: { fontSize: 20, fontWeight: "800", color: COLORS.textPrimary },
  listCount: { fontSize: 16, color: COLORS.textSecondary },
  emptyText: { fontSize: 15, lineHeight: 22, color: COLORS.textSecondary },
});
