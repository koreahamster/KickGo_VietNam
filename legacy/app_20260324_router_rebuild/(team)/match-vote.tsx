import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { COLORS } from "@/constants/colors";
import { SPACING } from "@/constants/spacing";
import { getQuarterLabel, getTeamHubCopy } from "@/constants/team-hub";
import { useI18n } from "@/core/i18n/LanguageProvider";

export default function MatchVoteScreen(): JSX.Element {
  const { teamId, teamName, quarterCount } = useLocalSearchParams<{ teamId?: string; teamName?: string; quarterCount?: string }>();
  const normalizedTeamId = typeof teamId === "string" ? teamId : "";
  const normalizedTeamName = typeof teamName === "string" ? teamName : "Club";
  const totalQuarters = Math.max(1, Number.parseInt(typeof quarterCount === "string" ? quarterCount : "2", 10) || 2);
  const { language } = useI18n();
  const copy = getTeamHubCopy(language);
  const [topTab, setTopTab] = useState<"voted" | "pending">("voted");
  const [mode, setMode] = useState<"time" | "quarter">("time");

  const quarterTabs = useMemo(() => Array.from({ length: totalQuarters }, (_, index) => index + 1), [totalQuarters]);

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backText}>{"<"}</Text>
          </Pressable>
          <View style={styles.pillSwitch}>
            <Pressable style={[styles.switchItem, topTab === "voted" && styles.switchItemActive]} onPress={() => setTopTab("voted")}>
              <Text style={[styles.switchLabel, topTab === "voted" && styles.switchLabelActive]}>{copy.votedTab} 0</Text>
            </Pressable>
            <Pressable style={[styles.switchItem, topTab === "pending" && styles.switchItemActive]} onPress={() => setTopTab("pending")}>
              <Text style={[styles.switchLabel, topTab === "pending" && styles.switchLabelActive]}>{copy.notVotedTab} 1</Text>
            </Pressable>
          </View>
        </View>

        <Text style={styles.teamName}>{normalizedTeamName}</Text>
        <Text style={styles.subtitle}>{copy.voteSubtitle}</Text>

        <View style={styles.modeRow}>
          <Pressable style={[styles.modeButton, mode === "time" && styles.modeButtonActive]} onPress={() => setMode("time")}>
            <Text style={[styles.modeText, mode === "time" && styles.modeTextActive]}>{copy.timeTab}</Text>
          </Pressable>
          <Pressable style={[styles.modeButton, mode === "quarter" && styles.modeButtonActive]} onPress={() => setMode("quarter")}>
            <Text style={[styles.modeText, mode === "quarter" && styles.modeTextActive]}>{copy.quarterTab}</Text>
          </Pressable>
          <View style={styles.countSummary}>
            <Text style={styles.countSummaryText}>O 0</Text>
            <Text style={styles.countSummaryText}>D 0</Text>
            <Text style={styles.countSummaryText}>X 0</Text>
          </View>
        </View>

        {mode === "quarter" ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quarterStrip}>
            {quarterTabs.map((quarter) => (
              <View key={quarter} style={styles.quarterChip}>
                <Text style={styles.quarterChipText}>{getQuarterLabel(language, quarter)}</Text>
              </View>
            ))}
          </ScrollView>
        ) : null}

        <View style={styles.emptyWrap}>
          <View style={styles.emptyIcon}>
            <Text style={styles.emptyIconText}>V</Text>
          </View>
          <Text style={styles.emptyText}>{copy.noVotes}</Text>
        </View>

        <Pressable
          style={styles.footerButton}
          onPress={() =>
            router.push({
              pathname: "/(team)/match-lineup",
              params: { teamId: normalizedTeamId, teamName: normalizedTeamName, quarterCount: String(totalQuarters) },
            })
          }
        >
          <Text style={styles.footerButtonText}>{copy.lineupButton}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#ffffff" },
  container: { flex: 1, paddingHorizontal: SPACING.screenHorizontal, paddingVertical: SPACING.xl },
  headerRow: { flexDirection: "row", alignItems: "center", gap: SPACING.md },
  backButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  backText: { fontSize: 30, color: COLORS.textPrimary },
  pillSwitch: {
    flex: 1,
    flexDirection: "row",
    borderRadius: 28,
    backgroundColor: "#f0f2f7",
    padding: 4,
  },
  switchItem: { flex: 1, minHeight: 52, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  switchItemActive: { backgroundColor: "#ffffff", borderWidth: 1, borderColor: COLORS.textPrimary },
  switchLabel: { fontSize: 18, fontWeight: "700", color: "#9aa0ad" },
  switchLabelActive: { color: COLORS.textPrimary },
  teamName: { marginTop: SPACING.xl, fontSize: 18, fontWeight: "700", color: COLORS.textMuted },
  subtitle: { marginTop: SPACING.sm, fontSize: 15, lineHeight: 22, color: COLORS.textSecondary },
  modeRow: { marginTop: SPACING.xl, flexDirection: "row", alignItems: "center", gap: SPACING.sm },
  modeButton: {
    minHeight: 52,
    borderRadius: 18,
    backgroundColor: "#ffffff",
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  modeButtonActive: { backgroundColor: "#f1f5ff" },
  modeText: { fontSize: 18, fontWeight: "800", color: "#c3c7d1" },
  modeTextActive: { color: COLORS.textPrimary },
  countSummary: { marginLeft: "auto", flexDirection: "row", gap: SPACING.md },
  countSummaryText: { fontSize: 18, fontWeight: "700", color: "#2f76ff" },
  quarterStrip: { marginTop: SPACING.lg, gap: SPACING.sm },
  quarterChip: {
    borderRadius: 16,
    backgroundColor: "#eef4ff",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  quarterChipText: { fontSize: 15, fontWeight: "700", color: COLORS.textPrimary },
  emptyWrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: SPACING.md },
  emptyIcon: { width: 88, height: 88, borderRadius: 44, alignItems: "center", justifyContent: "center", backgroundColor: "#f1f3f7" },
  emptyIconText: { fontSize: 42, color: "#b7bbc3" },
  emptyText: { fontSize: 20, color: "#d0d3da", textAlign: "center" },
  footerButton: {
    borderRadius: 18,
    backgroundColor: "#f0f4fc",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  footerButtonText: { fontSize: 16, fontWeight: "700", color: COLORS.textPrimary },
});
