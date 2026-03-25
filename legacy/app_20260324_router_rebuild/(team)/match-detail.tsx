import { router, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PrimaryButton } from "@/components/PrimaryButton";
import { COLORS } from "@/constants/colors";
import { SPACING } from "@/constants/spacing";
import { getQuarterLabel, getTeamHubCopy } from "@/constants/team-hub";
import { useI18n } from "@/core/i18n/LanguageProvider";
import { useMatchDetail } from "@/hooks/useMatchDetail";

function formatScheduleLabel(value: string): string {
  if (!value) {
    return "-";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    weekday: "short",
  });
}

export default function MatchDetailScreen(): JSX.Element {
  const { matchId, teamId, teamName, opponentName, venueName, schedule, quarterCount, quarterMinutes } = useLocalSearchParams<{
    matchId?: string;
    teamId?: string;
    teamName?: string;
    opponentName?: string;
    venueName?: string;
    schedule?: string;
    quarterCount?: string;
    quarterMinutes?: string;
  }>();
  const normalizedMatchId = typeof matchId === "string" ? matchId : null;
  const normalizedTeamId = typeof teamId === "string" ? teamId : "";
  const { language } = useI18n();
  const copy = getTeamHubCopy(language);
  const { matchDetail, isMatchDetailLoading, matchDetailErrorMessage } = useMatchDetail(normalizedMatchId, {
    enabled: !!normalizedMatchId,
  });

  const homeTeam = matchDetail?.homeTeam?.name || (typeof teamName === "string" && teamName.trim() ? teamName : "Merongrong");
  const awayTeam = matchDetail?.opponentDisplayName || (typeof opponentName === "string" && opponentName.trim() ? opponentName : copy.opponentPlaceholder);
  const venue = matchDetail?.match.venue_name?.trim() || (typeof venueName === "string" && venueName.trim() ? venueName : copy.venuePlaceholder);
  const scheduleLabel = formatScheduleLabel(matchDetail?.match.scheduled_at || (typeof schedule === "string" ? schedule : ""));
  const totalQuarters = matchDetail?.match.quarter_count ?? Math.max(1, Number.parseInt(typeof quarterCount === "string" ? quarterCount : "2", 10) || 2);
  const minutesPerQuarter = matchDetail?.match.quarter_minutes ?? Math.max(1, Number.parseInt(typeof quarterMinutes === "string" ? quarterMinutes : "25", 10) || 25);
  const noticeText = matchDetail?.match.notice?.trim() || copy.noticeEmpty;
  const summary = matchDetail?.attendanceSummary ?? { yes: 0, late: 0, no: 0, unknown: 0 };
  const quarterSummary = `${totalQuarters}${copy.quarterPrefix} / ${minutesPerQuarter}${copy.perQuarterSuffix}`;

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Pressable style={styles.iconButton} onPress={() => router.back()}>
            <Text style={styles.iconText}>{"<"}</Text>
          </Pressable>
          <View style={styles.headerActions}>
            <Pressable
              style={styles.iconButton}
              onPress={() =>
                router.push({
                  pathname: "/(team)/match-vote",
                  params: { teamId: normalizedTeamId, teamName: homeTeam, quarterCount: String(totalQuarters), matchId: normalizedMatchId ?? "" },
                })
              }
            >
              <Text style={styles.iconText}>{copy.voteButton}</Text>
            </Pressable>
            <Pressable
              style={styles.iconButton}
              onPress={() =>
                router.push({
                  pathname: "/(team)/match-lineup",
                  params: {
                    teamId: normalizedTeamId,
                    teamName: homeTeam,
                    quarterCount: String(totalQuarters),
                    quarterMinutes: String(minutesPerQuarter),
                    matchId: normalizedMatchId ?? "",
                  },
                })
              }
            >
              <Text style={styles.iconText}>{copy.lineupButton}</Text>
            </Pressable>
          </View>
        </View>

        <Text style={styles.schedule}>{scheduleLabel}</Text>
        <Text style={styles.venue}>{venue}</Text>
        <Text style={styles.matchup}>{homeTeam} VS {awayTeam}</Text>
        <Text style={styles.metaLine}>{quarterSummary}</Text>
        {isMatchDetailLoading ? <Text style={styles.loadingText}>{copy.matchHubSubtitle}</Text> : null}
        {matchDetailErrorMessage ? <Text style={styles.errorText}>{matchDetailErrorMessage}</Text> : null}

        <View style={styles.attendanceRow}>
          <Pressable style={[styles.attendanceButton, styles.leaveButton]}>
            <Text style={[styles.attendanceLabel, styles.leaveLabel]}>{copy.attendanceLeave}</Text>
          </Pressable>
          <Pressable style={[styles.attendanceButton, styles.joinButton]}>
            <Text style={[styles.attendanceLabel, styles.joinLabel]}>{copy.attendanceJoin}</Text>
          </Pressable>
        </View>

        <View style={styles.countStrip}>
          <Text style={styles.countTitle}>{copy.attendanceCountsTitle}</Text>
          <Text style={styles.countText}>O {summary.yes}</Text>
          <Text style={styles.countText}>D {summary.late}</Text>
          <Text style={styles.countText}>X {summary.no}</Text>
          <Text style={styles.pendingText}>{copy.notVotedTab} {summary.unknown}</Text>
        </View>

        <View style={styles.noticeCard}>
          <Text style={styles.sectionTitle}>{copy.noticeSectionTitle}</Text>
          <Text style={styles.sectionSubtitle}>{noticeText}</Text>
          <View style={styles.tagRow}>
            <View style={styles.uniformTag}><Text style={styles.uniformText}>{copy.uniformLabel}</Text></View>
          </View>
        </View>

        <View style={styles.tacticalCard}>
          <Text style={styles.sectionTitle}>{copy.lineupPreviewTitle}</Text>
          <Text style={styles.sectionSubtitle}>{getQuarterLabel(language, 1)} / {quarterSummary}</Text>
          <View style={styles.pitchPreview}>
            <Text style={styles.pitchPreviewText}>LINEUP</Text>
          </View>
        </View>

        <View style={styles.bottomActionBar}>
          <PrimaryButton
            label={copy.attendanceOpenVote}
            variant="secondary"
            onPress={() =>
              router.push({
                pathname: "/(team)/match-vote",
                params: { teamId: normalizedTeamId, teamName: homeTeam, quarterCount: String(totalQuarters), matchId: normalizedMatchId ?? "" },
              })
            }
          />
          <PrimaryButton
            label={copy.attendanceOpenLineup}
            variant="outline"
            onPress={() =>
              router.push({
                pathname: "/(team)/match-lineup",
                params: {
                  teamId: normalizedTeamId,
                  teamName: homeTeam,
                  quarterCount: String(totalQuarters),
                  quarterMinutes: String(minutesPerQuarter),
                  matchId: normalizedMatchId ?? "",
                },
              })
            }
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f8f6f1" },
  scrollContent: { padding: SPACING.screenHorizontal, paddingBottom: 44, gap: SPACING.lg },
  headerRow: { paddingTop: SPACING.md, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerActions: { flexDirection: "row", gap: SPACING.sm },
  iconButton: {
    minWidth: 54,
    minHeight: 54,
    borderRadius: 27,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SPACING.md,
  },
  iconText: { fontSize: 16, fontWeight: "700", color: COLORS.textPrimary },
  schedule: { marginTop: SPACING.md, fontSize: 34, fontWeight: "800", color: COLORS.textPrimary },
  venue: { fontSize: 16, color: COLORS.textMuted },
  matchup: { fontSize: 22, fontWeight: "800", color: COLORS.textPrimary },
  metaLine: { fontSize: 15, color: COLORS.textSecondary },
  loadingText: { fontSize: 14, lineHeight: 20, color: COLORS.textSecondary },
  errorText: { fontSize: 14, lineHeight: 20, color: "#b83a3a" },
  attendanceRow: { flexDirection: "row", gap: SPACING.md },
  attendanceButton: { flex: 1, minHeight: 82, borderRadius: 24, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  leaveButton: { backgroundColor: "#ffffff", borderColor: COLORS.textPrimary },
  joinButton: { backgroundColor: "#ff315c", borderColor: "#ff315c" },
  attendanceLabel: { fontSize: 20, fontWeight: "800" },
  leaveLabel: { color: COLORS.textPrimary },
  joinLabel: { color: "#ffffff" },
  countStrip: { borderRadius: 22, backgroundColor: "#eef2fb", padding: SPACING.md, flexDirection: "row", alignItems: "center", gap: SPACING.md, flexWrap: "wrap" },
  countTitle: { fontSize: 16, fontWeight: "700", color: COLORS.textPrimary },
  countText: { fontSize: 18, fontWeight: "700", color: "#7c8797" },
  pendingText: { marginLeft: "auto", fontSize: 20, fontWeight: "800", color: COLORS.textPrimary },
  noticeCard: { borderRadius: 26, backgroundColor: "#ffffff", padding: SPACING.lg, gap: SPACING.sm },
  tacticalCard: { borderRadius: 26, backgroundColor: "#ffffff", padding: SPACING.lg, gap: SPACING.md },
  sectionTitle: { fontSize: 26, fontWeight: "800", color: COLORS.textPrimary },
  sectionSubtitle: { fontSize: 15, lineHeight: 22, color: COLORS.textSecondary },
  tagRow: { flexDirection: "row" },
  uniformTag: { borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, backgroundColor: "#fffdf8", paddingHorizontal: 14, paddingVertical: 10 },
  uniformText: { fontSize: 14, fontWeight: "700", color: COLORS.textSecondary },
  pitchPreview: { height: 320, borderRadius: 24, backgroundColor: "#0d6a4b", alignItems: "center", justifyContent: "center" },
  pitchPreviewText: { fontSize: 42, fontWeight: "800", color: "rgba(255,255,255,0.24)" },
  bottomActionBar: { gap: SPACING.sm },
});