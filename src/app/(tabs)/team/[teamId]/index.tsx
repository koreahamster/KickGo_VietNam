import { useMutation } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { Alert, Pressable, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useI18n } from "@/core/i18n/LanguageProvider";
import { TeamAnnouncementPreview } from "@/features/team-announcements/components/TeamAnnouncementPreview";
import { getTeamShellCopy } from "@/features/team-shell.copy";
import { getTeamRoleLabel, getTeamSportLabel } from "@/features/team-shell/team-shell.helpers";
import { useTeamDetailQuery } from "@/hooks/useTeamDetailQuery";
import { useTeamMatches } from "@/hooks/useTeamMatches";
import { createTeamInvite } from "@/services/team.service";
import type { TeamMatchSummaryRecord } from "@/types/match.types";

function getNextMatch(matches: TeamMatchSummaryRecord[]): TeamMatchSummaryRecord | null {
  const filtered = matches.filter((item) => !["finalized", "auto_finalized", "cancelled"].includes(item.match.status));
  const sorted = [...filtered].sort((left, right) => left.match.scheduled_at.localeCompare(right.match.scheduled_at));
  return sorted[0] ?? null;
}

function getDdayLabel(value: string, copy: ReturnType<typeof getTeamShellCopy>): string {
  const target = new Date(value);
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const targetStart = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();
  const diff = Math.round((targetStart - start) / 86400000);

  if (diff <= 0) {
    return copy.nextMatchToday;
  }
  if (diff == 1) {
    return copy.nextMatchTomorrow;
  }
  return `${copy.nextMatchDdayPrefix}${diff}`;
}

function formatMatchDate(value: string, language: string): string {
  const locale = language === "ko" ? "ko-KR" : language === "vi" ? "vi-VN" : "en-US";
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function QuickActionCard(props: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  disabled?: boolean;
  accent?: "default" | "green";
}): JSX.Element {
  const { label, icon, onPress, disabled = false, accent = "default" } = props;

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.quickCard, accent === "green" ? styles.quickCardAccent : null, disabled ? styles.quickCardDisabled : null, pressed ? styles.quickCardPressed : null]}
    >
      <Ionicons color={accent === "green" ? "#0f766e" : "#111827"} name={icon} size={20} />
      <Text style={styles.quickCardLabel}>{label}</Text>
    </Pressable>
  );
}

export default function TeamHomeTabScreen(): JSX.Element {
  const { language } = useI18n();
  const copy = getTeamShellCopy(language);
  const params = useLocalSearchParams<{ teamId?: string | string[] }>();
  const teamId = Array.isArray(params.teamId) ? params.teamId[0] ?? null : params.teamId ?? null;
  const detailQuery = useTeamDetailQuery(teamId, Boolean(teamId));
  const { matches, isMatchesLoading, loadTeamMatches } = useTeamMatches(teamId, { enabled: Boolean(teamId) });
  const inviteMutation = useMutation({
    mutationFn: async () => {
      if (!teamId) {
        throw new Error(copy.inviteCodeCreateError);
      }
      return createTeamInvite(teamId);
    },
  });

  const team = detailQuery.data?.team ?? null;
  const currentMembership = detailQuery.data?.currentMembership ?? null;
  const members = detailQuery.data?.members ?? [];
  const canEdit = currentMembership?.role === "owner" || currentMembership?.role === "manager";
  const nextMatch = useMemo(() => getNextMatch(matches), [matches]);
  const attendanceTotal = nextMatch
    ? nextMatch.attendanceSummary.yes + nextMatch.attendanceSummary.late + nextMatch.attendanceSummary.no
    : 0;

  const handleShareInvite = async (): Promise<void> => {
    try {
      const result = await inviteMutation.mutateAsync();
      await Share.share({
        message: `${team?.name ?? "KickGo"}
${copy.joinByCode}: ${result.invite_code}`,
      });
    } catch (error) {
      Alert.alert("KickGo", error instanceof Error ? error.message : copy.inviteCodeCreateError);
    }
  };

  if (detailQuery.isLoading) {
    return (
      <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
        <View style={styles.stateWrap}>
          <Text style={styles.stateText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!team || !currentMembership) {
    return (
      <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
        <View style={styles.stateWrap}>
          <Text style={styles.errorTitle}>{copy.detailError}</Text>
          <Pressable onPress={() => void detailQuery.refetch()} style={styles.retryButton}>
            <Text style={styles.retryLabel}>{copy.retry}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>{team.name}</Text>
          <Text style={styles.summarySubtitle}>{getTeamSportLabel(language, team.sport_type)}</Text>
          <View style={styles.summaryMetaRow}>
            <View style={styles.summaryBadge}>
              <Text style={styles.summaryBadgeLabel}>{getTeamRoleLabel(language, currentMembership.role)}</Text>
            </View>
            <Text style={styles.summaryMetaText}>{`${members.length}${copy.membersCount}`}</Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>{copy.introTitle}</Text>
            {canEdit ? (
              <Pressable onPress={() => router.push({ pathname: "/(tabs)/team/[teamId]/edit", params: { teamId: team.id } })}>
                <Text style={styles.sectionLink}>{copy.introCta}</Text>
              </Pressable>
            ) : null}
          </View>
          <Text style={styles.sectionBody}>{team.description?.trim() || copy.introEmpty}</Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>{copy.quickActionsTitle}</Text>
          <View style={styles.quickGrid}>
            <QuickActionCard label={copy.quickChat} icon="chatbubble-ellipses-outline" onPress={() => router.push({ pathname: "/(tabs)/team/[teamId]/chat", params: { teamId: team.id } })} />
            <QuickActionCard label={copy.quickInvite} icon="link-outline" onPress={() => void handleShareInvite()} accent="green" />
            <QuickActionCard label={copy.quickEdit} icon="create-outline" onPress={() => router.push({ pathname: "/(tabs)/team/[teamId]/edit", params: { teamId: team.id } })} disabled={!canEdit} />
            <QuickActionCard label={copy.quickMercenary} icon="megaphone-outline" onPress={() => router.push({ pathname: "/(tabs)/team/[teamId]/mercenary", params: { teamId: team.id } })} disabled={!canEdit} />
          </View>
        </View>

        <TeamAnnouncementPreview teamId={team.id} />

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>{copy.nextMatchTitle}</Text>
            <Pressable onPress={() => router.push({ pathname: "/(tabs)/team/[teamId]/matches", params: { teamId: team.id } })}>
              <Text style={styles.sectionLink}>{copy.nextMatchCta}</Text>
            </Pressable>
          </View>

          {nextMatch ? (
            <Pressable
              onPress={() => router.push({ pathname: "/(tabs)/team/[teamId]/matches", params: { teamId: team.id } })}
              style={({ pressed }) => [styles.nextMatchCard, pressed ? styles.nextMatchCardPressed : null]}
            >
              <View style={styles.nextMatchRow}>
                <View style={styles.nextMatchLeft}>
                  <Text style={styles.nextMatchBadge}>{getDdayLabel(nextMatch.match.scheduled_at, copy)}</Text>
                  <Text style={styles.nextMatchTitleText}>{`${team.name} VS ${nextMatch.opponentDisplayName}`}</Text>
                  <Text style={styles.nextMatchMeta}>{formatMatchDate(nextMatch.match.scheduled_at, language)}</Text>
                  <Text style={styles.nextMatchMeta}>{nextMatch.match.venue_name?.trim() || copy.venueFallback}</Text>
                </View>
                <View style={styles.nextMatchRight}>
                  <Text style={styles.nextMatchAttendanceLabel}>{copy.nextMatchAttendance}</Text>
                  <Text style={styles.nextMatchAttendanceValue}>{`${attendanceTotal}/${members.length}${copy.membersCount}`}</Text>
                </View>
              </View>
            </Pressable>
          ) : (
            <View style={styles.emptyMatchCard}>
              <Text style={styles.sectionBody}>{copy.nextMatchEmpty}</Text>
              <Pressable onPress={() => router.push({ pathname: "/(tabs)/team/[teamId]/matches", params: { teamId: team.id } })} style={styles.inlineButton}>
                <Text style={styles.inlineButtonLabel}>{copy.nextMatchCta}</Text>
              </Pressable>
              {isMatchesLoading ? <Text style={styles.loadingHint}>Loading...</Text> : null}
              {!isMatchesLoading && matches.length === 0 ? null : null}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#ffffff" },
  content: { padding: 20, gap: 16, paddingBottom: 40 },
  stateWrap: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },
  stateText: { fontSize: 15, fontWeight: "600", color: "#6b7280" },
  errorTitle: { fontSize: 18, fontWeight: "800", color: "#111827", textAlign: "center" },
  retryButton: {
    marginTop: 16,
    minHeight: 46,
    borderRadius: 12,
    paddingHorizontal: 18,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },
  retryLabel: { color: "#ffffff", fontWeight: "700", fontSize: 14 },
  summaryCard: {
    borderRadius: 20,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 18,
  },
  summaryTitle: { fontSize: 24, fontWeight: "800", color: "#111827" },
  summarySubtitle: { marginTop: 6, fontSize: 14, color: "#6b7280" },
  summaryMetaRow: { marginTop: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  summaryBadge: { borderRadius: 999, backgroundColor: "#fef3c7", paddingHorizontal: 10, paddingVertical: 6 },
  summaryBadgeLabel: { fontSize: 12, fontWeight: "800", color: "#92400e" },
  summaryMetaText: { fontSize: 13, fontWeight: "600", color: "#6b7280" },
  sectionCard: {
    borderRadius: 20,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 18,
  },
  sectionHeaderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: "#111827" },
  sectionLink: { fontSize: 13, fontWeight: "700", color: "#2563eb" },
  sectionBody: { marginTop: 12, fontSize: 14, lineHeight: 21, color: "#6b7280" },
  quickGrid: { marginTop: 14, flexDirection: "row", flexWrap: "wrap", gap: 12 },
  quickCard: {
    width: "48%",
    minHeight: 88,
    borderRadius: 18,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingHorizontal: 14,
    paddingVertical: 16,
    justifyContent: "space-between",
  },
  quickCardAccent: { backgroundColor: "#ecfdf5", borderColor: "#bbf7d0" },
  quickCardDisabled: { opacity: 0.5 },
  quickCardPressed: { opacity: 0.84 },
  quickCardLabel: { marginTop: 14, fontSize: 14, fontWeight: "700", color: "#111827" },
  nextMatchCard: {
    marginTop: 14,
    borderRadius: 18,
    backgroundColor: "#161827",
    padding: 18,
  },
  nextMatchCardPressed: { opacity: 0.92 },
  nextMatchRow: { flexDirection: "row", justifyContent: "space-between", gap: 16 },
  nextMatchLeft: { flex: 1, gap: 6 },
  nextMatchRight: { alignItems: "flex-end", justifyContent: "center", gap: 4 },
  nextMatchBadge: { fontSize: 12, fontWeight: "800", color: "#86efac" },
  nextMatchTitleText: { fontSize: 18, fontWeight: "800", color: "#ffffff" },
  nextMatchMeta: { fontSize: 13, lineHeight: 19, color: "#cbd5e1" },
  nextMatchAttendanceLabel: { fontSize: 12, fontWeight: "700", color: "#86efac" },
  nextMatchAttendanceValue: { fontSize: 18, fontWeight: "800", color: "#ffffff" },
  emptyMatchCard: {
    marginTop: 14,
    borderRadius: 18,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 16,
  },
  inlineButton: {
    marginTop: 14,
    alignSelf: "flex-start",
    minHeight: 40,
    borderRadius: 999,
    paddingHorizontal: 14,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },
  inlineButtonLabel: { color: "#ffffff", fontSize: 13, fontWeight: "700" },
  loadingHint: { marginTop: 10, fontSize: 12, color: "#9ca3af" },
});
