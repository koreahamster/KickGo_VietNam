import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useI18n } from "@/core/i18n/LanguageProvider";
import { useTeamDetailQuery } from "@/hooks/useTeamDetailQuery";
import { useTeamMatches } from "@/hooks/useTeamMatches";
import type { MatchAttendanceSummary, MatchStatus, TeamMatchSummaryRecord } from "@/types/match.types";

const PAGE_BG = "#eff1f7";
const HEADER_BG = "#161827";
const CARD_BG = "#ffffff";
const TEXT_DARK = "#111827";
const TEXT_SOFT = "#6b7280";
const BRAND = "#0f766e";
const BORDER = "#e9eef5";

const COPY = {
  ko: {
    title: "팀 매치",
    subtitle: "예정된 경기와 최근 출석 현황을 확인합니다.",
    loading: "매치 일정을 불러오는 중입니다...",
    emptyTitle: "등록된 매치가 아직 없어요",
    emptyBody: "팀 첫 경기가 등록되면 이 화면에서 일정과 출석 현황을 확인할 수 있습니다.",
    backToTeam: "팀 홈으로",
    refresh: "새로고침",
    attendance: "출석 현황",
    venueFallback: "정해진 구장이 없어요",
    status: "상태",
    opponent: "상대",
    scheduleError: "매치 일정을 불러오지 못했습니다.",
    quarters: "쿼터",
    minutes: "분",
    noNotice: "등록된 공지가 없습니다.",
    viewSummary: "요약 보기",
    summaryTitle: "매치 요약",
    yes: "참석",
    late: "보류",
    no: "불참",
    unknown: "미응답",
    home: "홈",
    away: "원정",
    statusLabels: {
      scheduled: "예정",
      ongoing: "진행중",
      awaiting_confirmation: "확정 대기",
      awaiting_result: "결과 대기",
      finalized: "종료",
      disputed: "이의 제기",
      auto_finalized: "자동 종료",
      cancelled: "취소",
    },
  },
  vi: {
    title: "Tran dau doi",
    subtitle: "Xem lich thi dau va tinh hinh diem danh gan day.",
    loading: "Dang tai lich tran dau...",
    emptyTitle: "Chua co tran dau nao",
    emptyBody: "Khi co tran dau dau tien, lich va tinh hinh diem danh se hien thi tai day.",
    backToTeam: "Ve trang doi",
    refresh: "Tai lai",
    attendance: "Diem danh",
    venueFallback: "Chua co san co dinh",
    status: "Trang thai",
    opponent: "Doi thu",
    scheduleError: "Khong the tai lich tran dau.",
    quarters: "Hiep",
    minutes: "phut",
    noNotice: "Chua co thong bao.",
    viewSummary: "Xem tom tat",
    summaryTitle: "Tom tat tran dau",
    yes: "Co mat",
    late: "Tre",
    no: "Vang",
    unknown: "Chua tra loi",
    home: "San nha",
    away: "San khach",
    statusLabels: {
      scheduled: "Sap dien ra",
      ongoing: "Dang dien ra",
      awaiting_confirmation: "Cho xac nhan",
      awaiting_result: "Cho ket qua",
      finalized: "Da xong",
      disputed: "Dang tranh chap",
      auto_finalized: "Tu dong dong",
      cancelled: "Da huy",
    },
  },
  en: {
    title: "Team Matches",
    subtitle: "Review scheduled fixtures and recent attendance status.",
    loading: "Loading matches...",
    emptyTitle: "No matches have been registered yet",
    emptyBody: "Once the first match is created, the schedule and attendance overview will appear here.",
    backToTeam: "Back to team",
    refresh: "Refresh",
    attendance: "Attendance",
    venueFallback: "No fixed venue yet",
    status: "Status",
    opponent: "Opponent",
    scheduleError: "Could not load the match calendar.",
    quarters: "quarters",
    minutes: "min",
    noNotice: "No notice has been posted.",
    viewSummary: "View summary",
    summaryTitle: "Match summary",
    yes: "Yes",
    late: "Late",
    no: "No",
    unknown: "Unknown",
    home: "Home",
    away: "Away",
    statusLabels: {
      scheduled: "Scheduled",
      ongoing: "Ongoing",
      awaiting_confirmation: "Awaiting confirmation",
      awaiting_result: "Awaiting result",
      finalized: "Finalized",
      disputed: "Disputed",
      auto_finalized: "Auto finalized",
      cancelled: "Cancelled",
    },
  },
} as const;

type CopyKey = keyof typeof COPY;

type MatchGroup = {
  key: string;
  label: string;
  items: TeamMatchSummaryRecord[];
};

function getLocaleTag(language: CopyKey): string {
  if (language === "ko") {
    return "ko-KR";
  }

  if (language === "vi") {
    return "vi-VN";
  }

  return "en-US";
}

function formatDateLabel(value: string, language: CopyKey): string {
  const parsed = new Date(value);
  return new Intl.DateTimeFormat(getLocaleTag(language), {
    month: "short",
    day: "numeric",
    weekday: "short",
  }).format(parsed);
}

function formatTimeLabel(value: string, language: CopyKey): string {
  const parsed = new Date(value);
  return new Intl.DateTimeFormat(getLocaleTag(language), {
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
}

function formatMonthLabel(value: string, language: CopyKey): string {
  const parsed = new Date(value);
  return new Intl.DateTimeFormat(getLocaleTag(language), {
    year: "numeric",
    month: "long",
  }).format(parsed);
}

function getStatusLabel(language: CopyKey, status: MatchStatus): string {
  return COPY[language].statusLabels[status];
}

function getStatusColors(status: MatchStatus): { bg: string; text: string } {
  switch (status) {
    case "ongoing":
      return { bg: "#dcfce7", text: "#166534" };
    case "finalized":
    case "auto_finalized":
      return { bg: "#e0f2fe", text: "#075985" };
    case "cancelled":
      return { bg: "#fee2e2", text: "#b91c1c" };
    case "awaiting_confirmation":
    case "awaiting_result":
      return { bg: "#fef3c7", text: "#92400e" };
    case "disputed":
      return { bg: "#ede9fe", text: "#6d28d9" };
    default:
      return { bg: "#f3f4f6", text: "#4b5563" };
  }
}

function summarizeAttendance(copy: (typeof COPY)[CopyKey], summary: MatchAttendanceSummary): string {
  return `${copy.yes} ${summary.yes} · ${copy.late} ${summary.late} · ${copy.no} ${summary.no} · ${copy.unknown} ${summary.unknown}`;
}

function buildGroups(matches: TeamMatchSummaryRecord[], language: CopyKey): MatchGroup[] {
  const buckets = new Map<string, MatchGroup>();

  matches.forEach((matchSummary) => {
    const groupKey = matchSummary.match.scheduled_at.slice(0, 7);
    const existing = buckets.get(groupKey);

    if (existing) {
      existing.items.push(matchSummary);
      return;
    }

    buckets.set(groupKey, {
      key: groupKey,
      label: formatMonthLabel(matchSummary.match.scheduled_at, language),
      items: [matchSummary],
    });
  });

  return Array.from(buckets.values());
}

function MatchCard(props: {
  language: CopyKey;
  matchSummary: TeamMatchSummaryRecord;
}): JSX.Element {
  const { language, matchSummary } = props;
  const copy = COPY[language];
  const statusColors = getStatusColors(matchSummary.match.status);
  const sideLabel = matchSummary.match.team_side === "home" ? copy.home : copy.away;

  return (
    <View style={styles.matchCard}>
      <View style={styles.matchTopRow}>
        <View>
          <Text style={styles.matchDate}>{formatDateLabel(matchSummary.match.scheduled_at, language)}</Text>
          <Text style={styles.matchTime}>{formatTimeLabel(matchSummary.match.scheduled_at, language)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}> 
          <Text style={[styles.statusBadgeLabel, { color: statusColors.text }]}>{getStatusLabel(language, matchSummary.match.status)}</Text>
        </View>
      </View>

      <View style={styles.opponentRow}>
        <Text style={styles.opponentLabel}>{copy.opponent}</Text>
        <Text style={styles.opponentName}>{matchSummary.opponentDisplayName}</Text>
      </View>

      <View style={styles.metaWrap}>
        <View style={styles.metaPill}>
          <Ionicons color="#6b7280" name="location-outline" size={14} />
          <Text style={styles.metaPillLabel}>{matchSummary.match.venue_name?.trim() || copy.venueFallback}</Text>
        </View>
        <View style={styles.metaPill}>
          <Ionicons color="#6b7280" name="layers-outline" size={14} />
          <Text style={styles.metaPillLabel}>{`${matchSummary.match.quarter_count}${copy.quarters} · ${matchSummary.match.quarter_minutes}${copy.minutes}`}</Text>
        </View>
        <View style={styles.metaPill}>
          <Ionicons color="#6b7280" name="shirt-outline" size={14} />
          <Text style={styles.metaPillLabel}>{sideLabel}</Text>
        </View>
      </View>

      <View style={styles.attendanceCard}>
        <View style={styles.attendanceHeader}>
          <Text style={styles.attendanceTitle}>{copy.attendance}</Text>
          <Pressable
            onPress={() => {
              Alert.alert(copy.summaryTitle, summarizeAttendance(copy, matchSummary.attendanceSummary));
            }}
          >
            <Text style={styles.summaryButton}>{copy.viewSummary}</Text>
          </Pressable>
        </View>
        <Text style={styles.attendanceSummary}>{summarizeAttendance(copy, matchSummary.attendanceSummary)}</Text>
      </View>

      <View style={styles.noticeWrap}>
        <Text style={styles.noticeText}>{matchSummary.match.notice?.trim() || copy.noNotice}</Text>
      </View>
    </View>
  );
}

export default function TeamMatchesScreen(): JSX.Element {
  const { language } = useI18n();
  const locale = (language in COPY ? language : "en") as CopyKey;
  const copy = COPY[locale];
  const { teamId: rawTeamId } = useLocalSearchParams<{ teamId?: string | string[] }>();
  const teamId = Array.isArray(rawTeamId) ? rawTeamId[0] ?? null : rawTeamId ?? null;
  const teamDetailQuery = useTeamDetailQuery(teamId, Boolean(teamId));
  const { matches, isMatchesLoading, matchErrorMessage, loadTeamMatches } = useTeamMatches(teamId, { enabled: Boolean(teamId) });

  const groups = useMemo(() => buildGroups(matches, locale), [matches, locale]);
  const teamName = teamDetailQuery.data?.team.name ?? "KickGo";

  if (isMatchesLoading && matches.length === 0) {
    return (
      <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
        <View style={styles.loadingWrap}>
          <Text style={styles.loadingText}>{copy.loading}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isMatchesLoading} onRefresh={() => void loadTeamMatches()} tintColor={BRAND} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSection}>
          <View style={styles.heroCard}>
            <Text style={styles.heroTitle}>{teamName}</Text>
            <Text style={styles.heroSubtitle}>{copy.subtitle}</Text>
          </View>
        </View>

        <View style={styles.bodyWrap}>
          {matchErrorMessage ? (
            <View style={styles.errorCard}>
              <Text style={styles.errorTitle}>{copy.scheduleError}</Text>
              <Text style={styles.errorBody}>{matchErrorMessage}</Text>
            </View>
          ) : null}

          {groups.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons color="#94a3b8" name="calendar-clear-outline" size={44} />
              <Text style={styles.emptyTitle}>{copy.emptyTitle}</Text>
              <Text style={styles.emptyBody}>{copy.emptyBody}</Text>
              <View style={styles.emptyActions}>
                <Pressable style={styles.primaryButton} onPress={() => router.replace({ pathname: "/(team)/[teamId]", params: { teamId: teamId ?? "" } })}>
                  <Text style={styles.primaryButtonLabel}>{copy.backToTeam}</Text>
                </Pressable>
                <Pressable style={styles.secondaryButton} onPress={() => void loadTeamMatches()}>
                  <Text style={styles.secondaryButtonLabel}>{copy.refresh}</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            groups.map((group) => (
              <View key={group.key} style={styles.groupWrap}>
                <Text style={styles.groupTitle}>{group.label}</Text>
                <View style={styles.groupList}>
                  {group.items.map((matchSummary) => (
                    <MatchCard key={matchSummary.match.id} language={locale} matchSummary={matchSummary} />
                  ))}
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: PAGE_BG },
  scrollContent: { paddingBottom: 40 },
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PAGE_BG,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "600",
    color: TEXT_SOFT,
  },
  heroSection: {
    backgroundColor: HEADER_BG,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 84,
  },
  heroCard: {
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.08)",
    padding: 20,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#ffffff",
  },
  heroSubtitle: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 22,
    color: "#d7dbec",
  },
  bodyWrap: {
    marginTop: -52,
    paddingHorizontal: 20,
    gap: 18,
  },
  errorCard: {
    borderRadius: 22,
    backgroundColor: CARD_BG,
    padding: 18,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#b91c1c",
  },
  errorBody: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 22,
    color: TEXT_SOFT,
  },
  emptyCard: {
    minHeight: 420,
    borderRadius: 24,
    backgroundColor: CARD_BG,
    paddingHorizontal: 24,
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    marginTop: 14,
    fontSize: 24,
    fontWeight: "800",
    color: TEXT_DARK,
    textAlign: "center",
  },
  emptyBody: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 22,
    color: TEXT_SOFT,
    textAlign: "center",
  },
  emptyActions: {
    width: "100%",
    gap: 12,
    marginTop: 24,
  },
  primaryButton: {
    minHeight: 54,
    borderRadius: 14,
    backgroundColor: BRAND,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#ffffff",
  },
  secondaryButton: {
    minHeight: 54,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: TEXT_DARK,
  },
  groupWrap: {
    gap: 12,
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: TEXT_DARK,
  },
  groupList: {
    gap: 12,
  },
  matchCard: {
    borderRadius: 22,
    backgroundColor: CARD_BG,
    padding: 18,
    borderWidth: 1,
    borderColor: BORDER,
  },
  matchTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  matchDate: {
    fontSize: 14,
    fontWeight: "700",
    color: TEXT_DARK,
  },
  matchTime: {
    marginTop: 6,
    fontSize: 22,
    fontWeight: "800",
    color: TEXT_DARK,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  statusBadgeLabel: {
    fontSize: 12,
    fontWeight: "700",
  },
  opponentRow: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  opponentLabel: {
    fontSize: 13,
    color: TEXT_SOFT,
  },
  opponentName: {
    flex: 1,
    textAlign: "right",
    fontSize: 17,
    fontWeight: "700",
    color: TEXT_DARK,
  },
  metaWrap: {
    marginTop: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  metaPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    backgroundColor: "#f6f7fb",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  metaPillLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: TEXT_SOFT,
  },
  attendanceCard: {
    marginTop: 18,
    borderRadius: 18,
    backgroundColor: "#f8fafc",
    padding: 14,
  },
  attendanceHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  attendanceTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: TEXT_DARK,
  },
  summaryButton: {
    fontSize: 13,
    fontWeight: "700",
    color: BRAND,
  },
  attendanceSummary: {
    marginTop: 10,
    fontSize: 13,
    lineHeight: 20,
    color: TEXT_SOFT,
  },
  noticeWrap: {
    marginTop: 16,
  },
  noticeText: {
    fontSize: 13,
    lineHeight: 20,
    color: TEXT_SOFT,
  },
});
