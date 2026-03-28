import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, Image, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useI18n } from "@/core/i18n/LanguageProvider";
import { getMercenaryCopy } from "@/features/mercenary/mercenary.copy";
import { MercenaryInlineHeader } from "@/features/mercenary/components/MercenaryInlineHeader";
import { MercenaryPositionChips } from "@/features/mercenary/components/MercenaryPositionChips";
import { formatRelativeTime, getApplicationStatusTone } from "@/features/mercenary/mercenary.helpers";
import { useMercenaryPostDetail, useRespondMercenaryApplication } from "@/hooks/useMercenaryQuery";
import type { MercenaryApplicationStatus } from "@/types/mercenary.types";

const FILTERS: Array<MercenaryApplicationStatus | "all"> = ["all", "pending", "accepted", "rejected"];

function getInitial(value: string | undefined): string {
  return value?.trim().slice(0, 1).toUpperCase() || "K";
}

function getFilterLabel(copy: ReturnType<typeof getMercenaryCopy>, value: MercenaryApplicationStatus | "all"): string {
  if (value === "pending") {
    return copy.applicantsFilterPending;
  }
  if (value === "accepted") {
    return copy.applicantsFilterAccepted;
  }
  if (value === "rejected") {
    return copy.applicantsFilterRejected;
  }
  return copy.applicantsFilterAll;
}

export default function TeamMercenaryApplicantsScreen(): JSX.Element {
  const { language } = useI18n();
  const copy = getMercenaryCopy(language);
  const params = useLocalSearchParams<{ teamId?: string | string[]; postId?: string | string[] }>();
  const teamId = Array.isArray(params.teamId) ? params.teamId[0] ?? null : params.teamId ?? null;
  const postId = Array.isArray(params.postId) ? params.postId[0] ?? null : params.postId ?? null;
  const detailQuery = useMercenaryPostDetail(postId, Boolean(postId));
  const respondMutation = useRespondMercenaryApplication();
  const [filter, setFilter] = useState<MercenaryApplicationStatus | "all">("all");

  const filteredApplications = useMemo(() => {
    const items = detailQuery.data?.applications ?? [];
    if (filter === "all") {
      return items;
    }
    return items.filter((item) => item.status === filter);
  }, [detailQuery.data?.applications, filter]);

  const handleDecision = async (applicationId: string, decision: "accept" | "reject"): Promise<void> => {
    if (!postId) {
      return;
    }
    try {
      await respondMutation.mutateAsync({ postId, request: { application_id: applicationId, decision } });
    } catch (error) {
      Alert.alert("KickGo", error instanceof Error ? error.message : copy.requestFailed);
    }
  };

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={detailQuery.isRefetching} onRefresh={() => void detailQuery.refetch()} />} showsVerticalScrollIndicator={false}>
        <MercenaryInlineHeader backLabel={copy.inlineBack} onBack={() => router.replace({ pathname: "/(tabs)/team/[teamId]/mercenary", params: { teamId: teamId ?? "" } })} title={copy.applicantsTitle} />

        {detailQuery.data?.post ? (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>{detailQuery.data.post.team_name ?? "KickGo Team"}</Text>
            <Text style={styles.summaryMeta}>{`${copy.positionsLabel}: ${detailQuery.data.post.needed_positions.join(", ")}`}</Text>
            <Text style={styles.summaryMeta}>{`${copy.applicantsCount}: ${detailQuery.data.applications.length}`}</Text>
          </View>
        ) : null}

        <View style={styles.filterRow}>
          {FILTERS.map((value) => {
            const selected = filter === value;
            return (
              <Pressable key={value} onPress={() => setFilter(value)} style={[styles.filterChip, selected ? styles.filterChipActive : null]}>
                <Text style={[styles.filterChipLabel, selected ? styles.filterChipLabelActive : null]}>{getFilterLabel(copy, value)}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.listWrap}>
          {filteredApplications.map((application) => {
            const tone = getApplicationStatusTone(application.status);
            return (
              <View key={application.id} style={styles.applicationCard}>
                <View style={styles.applicantRow}>
                  {application.applicant_avatar_url ? <Image source={{ uri: application.applicant_avatar_url }} style={styles.avatar} /> : <View style={styles.avatarFallback}><Text style={styles.avatarFallbackLabel}>{getInitial(application.applicant_name)}</Text></View>}
                  <View style={styles.applicantCopy}>
                    <Text style={styles.applicantName}>{application.applicant_name ?? "KickGo Player"}</Text>
                    {application.applicant_positions && application.applicant_positions.length > 0 ? <MercenaryPositionChips language={language} positions={application.applicant_positions} /> : null}
                    <Text style={styles.metaText}>{formatRelativeTime(application.created_at, language)}</Text>
                  </View>
                  <View style={[styles.statusPill, { backgroundColor: tone.backgroundColor }]}>
                    <Text style={[styles.statusLabel, { color: tone.color }]}>{getFilterLabel(copy, application.status)}</Text>
                  </View>
                </View>
                {application.message ? <Text style={styles.messageText}>{application.message}</Text> : null}
                <View style={styles.actionRow}>
                  <Pressable disabled={application.status === "accepted" || respondMutation.isPending} onPress={() => void handleDecision(application.id, "accept")} style={[styles.acceptButton, application.status === "accepted" ? styles.actionDisabled : null]}>
                    <Text style={styles.acceptLabel}>{copy.accept}</Text>
                  </Pressable>
                  <Pressable disabled={application.status === "rejected" || respondMutation.isPending} onPress={() => void handleDecision(application.id, "reject")} style={[styles.rejectButton, application.status === "rejected" ? styles.actionDisabled : null]}>
                    <Text style={styles.rejectLabel}>{copy.reject}</Text>
                  </Pressable>
                </View>
              </View>
            );
          })}
          {!detailQuery.isLoading && filteredApplications.length === 0 ? (
            <View style={styles.emptyCard}><Text style={styles.emptyTitle}>{copy.applicationsSectionEmpty}</Text></View>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#ffffff" },
  content: { padding: 20, gap: 16, paddingBottom: 32 },
  summaryCard: { borderRadius: 22, borderWidth: 1, borderColor: "#e5e7eb", backgroundColor: "#ffffff", padding: 18, gap: 6 },
  summaryTitle: { fontSize: 18, fontWeight: "800", color: "#111827" },
  summaryMeta: { fontSize: 13, color: "#6b7280" },
  filterRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  filterChip: { borderRadius: 999, borderWidth: 1, borderColor: "#d1d5db", paddingHorizontal: 14, paddingVertical: 10 },
  filterChipActive: { borderColor: "#111827", backgroundColor: "#111827" },
  filterChipLabel: { fontSize: 13, fontWeight: "700", color: "#4b5563" },
  filterChipLabelActive: { color: "#ffffff" },
  listWrap: { gap: 14 },
  applicationCard: { borderRadius: 22, borderWidth: 1, borderColor: "#e5e7eb", backgroundColor: "#ffffff", padding: 18, gap: 12 },
  applicantRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: "#e5e7eb" },
  avatarFallback: { width: 46, height: 46, borderRadius: 23, backgroundColor: "#e0f2fe", alignItems: "center", justifyContent: "center" },
  avatarFallbackLabel: { fontSize: 16, fontWeight: "800", color: "#0369a1" },
  applicantCopy: { flex: 1, gap: 6 },
  applicantName: { fontSize: 16, fontWeight: "800", color: "#111827" },
  metaText: { fontSize: 12, color: "#6b7280" },
  statusPill: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  statusLabel: { fontSize: 12, fontWeight: "800" },
  messageText: { fontSize: 14, lineHeight: 22, color: "#4b5563" },
  actionRow: { flexDirection: "row", gap: 10 },
  acceptButton: { flex: 1, minHeight: 44, borderRadius: 14, backgroundColor: "#dcfce7", alignItems: "center", justifyContent: "center" },
  rejectButton: { flex: 1, minHeight: 44, borderRadius: 14, backgroundColor: "#fee2e2", alignItems: "center", justifyContent: "center" },
  acceptLabel: { fontSize: 14, fontWeight: "800", color: "#166534" },
  rejectLabel: { fontSize: 14, fontWeight: "800", color: "#b91c1c" },
  actionDisabled: { opacity: 0.4 },
  emptyCard: { borderRadius: 22, borderWidth: 1, borderColor: "#e5e7eb", backgroundColor: "#f8fafc", padding: 22, alignItems: "center" },
  emptyTitle: { fontSize: 15, fontWeight: "700", color: "#6b7280" },
});