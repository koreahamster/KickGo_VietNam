import { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import { useI18n } from "@/core/i18n/LanguageProvider";
import { getRefereeAssignmentStatusLabel, getRefereeAssignmentTone, getRefereeSystemCopy } from "@/features/referee/referee.copy";
import { TeamMatchInlineHeader } from "@/features/team-matches/components/TeamMatchInlineHeader";
import { useAuth } from "@/hooks/useAuth";
import { useMyAssignments, useRespondAssignment } from "@/hooks/useRefereeQuery";
import type { RefereeAssignment, RefereeAssignmentStatus } from "@/types/referee.types";

type FilterValue = RefereeAssignmentStatus;

const FILTER_ORDER: FilterValue[] = ["pending", "accepted", "completed", "rejected"];

function formatDateTime(value: string | null | undefined, language: "ko" | "en" | "vi"): string {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  if (language === "ko") {
    return date.toLocaleString("ko-KR", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  }
  if (language === "vi") {
    return date.toLocaleString("vi-VN", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  }
  return date.toLocaleString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function formatCurrency(amount: number, language: "ko" | "en" | "vi"): string {
  const locale = language === "ko" ? "ko-KR" : language === "vi" ? "vi-VN" : "en-US";
  return `${new Intl.NumberFormat(locale).format(amount)} VND`;
}

function buildMatchTitle(item: RefereeAssignment): string {
  const home = item.home_team_name?.trim() || "Home Team";
  const away = item.away_team_name?.trim() || "Away Team";
  return `${home} vs ${away}`;
}

export default function RefereeAssignmentsScreen(): JSX.Element {
  const { language } = useI18n();
  const copy = getRefereeSystemCopy(language);
  const { user } = useAuth();
  const [filter, setFilter] = useState<FilterValue>("pending");
  const query = useMyAssignments(user?.id ?? null, Boolean(user?.id));
  const respondMutation = useRespondAssignment();

  const filteredAssignments = useMemo(
    () => (query.data ?? []).filter((item) => item.status === filter),
    [filter, query.data],
  );

  const handleRespond = (item: RefereeAssignment, decision: "accept" | "reject"): void => {
    if (!user?.id) {
      return;
    }

    const isAccept = decision === "accept";
    Alert.alert(
      "KickGo",
      isAccept
        ? `${copy.assignmentsAcceptConfirmTitle}\n${copy.assignmentsAcceptConfirmBody}\n${formatCurrency(item.fee_amount, language)}`
        : copy.assignmentsRejectConfirmBody,
      [
        { text: copy.actionCancel, style: "cancel" },
        {
          text: isAccept ? copy.assignmentsAccept : copy.assignmentsReject,
          style: isAccept ? "default" : "destructive",
          onPress: () => {
            void respondMutation
              .mutateAsync({
                refereeId: user.id,
                matchId: item.match_id,
                request: { assignment_id: item.id, decision },
              })
              .then(() => {
                Alert.alert("KickGo", isAccept ? copy.assignmentsAcceptSuccess : copy.assignmentsRejectSuccess);
              })
              .catch((error: unknown) => {
                Alert.alert("KickGo", error instanceof Error ? error.message : copy.requestFailed);
              });
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TeamMatchInlineHeader title={copy.assignmentsTitle} onBack={() => router.back()} />

        <View style={styles.filterRow}>
          {FILTER_ORDER.map((item) => {
            const isActive = filter === item;
            return (
              <Pressable key={item} onPress={() => setFilter(item)} style={[styles.filterChip, isActive ? styles.filterChipActive : null]}>
                <Text style={[styles.filterChipLabel, isActive ? styles.filterChipLabelActive : null]}>
                  {getRefereeAssignmentStatusLabel(copy, item)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {filteredAssignments.length > 0 ? (
          filteredAssignments.map((item) => {
            const tone = getRefereeAssignmentTone(item.status);
            const canRespond = item.status === "pending" && Boolean(user?.id);
            const canOpenRoster = item.status === "accepted" || item.status === "completed";

            return (
              <View key={item.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.matchTitle}>{buildMatchTitle(item)}</Text>
                  <View style={[styles.statusPill, { backgroundColor: tone.backgroundColor }]}>
                    <Text style={[styles.statusLabel, { color: tone.color }]}>{getRefereeAssignmentStatusLabel(copy, item.status)}</Text>
                  </View>
                </View>
                <Text style={styles.metaText}>{formatDateTime(item.match_scheduled_at, language)}</Text>
                <Text style={styles.metaText}>{item.venue_name || copy.assignmentVenueFallback}</Text>
                <View style={styles.infoRow}><Text style={styles.infoKey}>{copy.assignmentRequestedAt}</Text><Text style={styles.infoValue}>{formatDateTime(item.requested_at, language)}</Text></View>
                <View style={styles.infoRow}><Text style={styles.infoKey}>{copy.assignmentFeeLabel}</Text><Text style={styles.infoValue}>{formatCurrency(item.fee_amount, language)}</Text></View>
                <View style={styles.infoRow}><Text style={styles.infoKey}>Team</Text><Text style={styles.infoValue}>{item.requesting_team_name ?? "KickGo Team"}</Text></View>
                {canRespond ? (
                  <View style={styles.actionRow}>
                    <Pressable disabled={respondMutation.isPending} onPress={() => handleRespond(item, "accept")} style={[styles.actionButton, styles.acceptButton, respondMutation.isPending ? styles.actionDisabled : null]}>
                      <Text style={styles.actionButtonLabel}>{copy.assignmentsAccept}</Text>
                    </Pressable>
                    <Pressable disabled={respondMutation.isPending} onPress={() => handleRespond(item, "reject")} style={[styles.actionButton, styles.rejectButton, respondMutation.isPending ? styles.actionDisabled : null]}>
                      <Text style={[styles.actionButtonLabel, styles.rejectButtonLabel]}>{copy.assignmentsReject}</Text>
                    </Pressable>
                  </View>
                ) : null}
                {canOpenRoster && item.requesting_team_id ? (
                  <Pressable
                    onPress={() =>
                      router.push({
                        pathname: "/(tabs)/team/[teamId]/match/[matchId]",
                        params: { teamId: item.requesting_team_id, matchId: item.match_id },
                      })
                    }
                    style={styles.linkButton}
                  >
                    <Text style={styles.linkButtonLabel}>{copy.assignmentsOpenRoster}</Text>
                  </Pressable>
                ) : null}
              </View>
            );
          })
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>{copy.assignmentsEmpty}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#ffffff" },
  content: { padding: 20, gap: 16, paddingBottom: 32 },
  filterRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  filterChip: { borderRadius: 999, borderWidth: 1, borderColor: "#d1d5db", paddingHorizontal: 12, paddingVertical: 8, backgroundColor: "#ffffff" },
  filterChipActive: { borderColor: "#1d4ed8", backgroundColor: "#dbeafe" },
  filterChipLabel: { fontSize: 12, fontWeight: "700", color: "#475569" },
  filterChipLabelActive: { color: "#1d4ed8" },
  card: { borderRadius: 20, borderWidth: 1, borderColor: "#e5e7eb", backgroundColor: "#ffffff", padding: 18, gap: 10 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  matchTitle: { flex: 1, fontSize: 17, fontWeight: "800", color: "#0f172a" },
  statusPill: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  statusLabel: { fontSize: 12, fontWeight: "800" },
  metaText: { fontSize: 13, color: "#64748b" },
  infoRow: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  infoKey: { fontSize: 13, fontWeight: "700", color: "#475569" },
  infoValue: { fontSize: 13, color: "#111827", flexShrink: 1, textAlign: "right" },
  actionRow: { flexDirection: "row", gap: 10, marginTop: 6 },
  actionButton: { flex: 1, minHeight: 46, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  acceptButton: { backgroundColor: "#16a34a" },
  rejectButton: { backgroundColor: "#fee2e2", borderWidth: 1, borderColor: "#fecaca" },
  actionDisabled: { opacity: 0.45 },
  actionButtonLabel: { fontSize: 14, fontWeight: "800", color: "#ffffff" },
  rejectButtonLabel: { color: "#b91c1c" },
  linkButton: { marginTop: 4, alignSelf: "flex-start", minHeight: 42, borderRadius: 12, backgroundColor: "#e0f2fe", paddingHorizontal: 14, alignItems: "center", justifyContent: "center" },
  linkButtonLabel: { fontSize: 13, fontWeight: "800", color: "#0369a1" },
  emptyCard: { borderRadius: 20, borderWidth: 1, borderColor: "#e5e7eb", backgroundColor: "#f8fafc", padding: 24, alignItems: "center", gap: 8 },
  emptyText: { fontSize: 15, fontWeight: "800", color: "#334155" },
});
