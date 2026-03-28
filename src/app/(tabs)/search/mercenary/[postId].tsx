import { useMemo, useState } from "react";
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "react-native";
import { useLocalSearchParams } from "expo-router";

import { useI18n } from "@/core/i18n/LanguageProvider";
import { getMercenaryCopy } from "@/features/mercenary/mercenary.copy";
import { MercenaryPositionChips } from "@/features/mercenary/components/MercenaryPositionChips";
import { formatMercenaryDateTime, getMercenaryRegionLabel, getPostStatusTone } from "@/features/mercenary/mercenary.helpers";
import { useAuth } from "@/hooks/useAuth";
import { useApplyMercenary, useMercenaryPostDetail, useMyApplications } from "@/hooks/useMercenaryQuery";
import { useTeams } from "@/hooks/useTeams";

function getInitial(value: string | undefined): string {
  return value?.trim().slice(0, 1).toUpperCase() || "K";
}

export default function MercenaryPostDetailScreen(): JSX.Element {
  const { language } = useI18n();
  const copy = getMercenaryCopy(language);
  const params = useLocalSearchParams<{ postId?: string | string[] }>();
  const postId = Array.isArray(params.postId) ? params.postId[0] ?? null : params.postId ?? null;
  const { user } = useAuth();
  const detailQuery = useMercenaryPostDetail(postId, Boolean(postId));
  const teams = useTeams({ enabled: Boolean(user) });
  const applicationsQuery = useMyApplications(user?.id ?? null, Boolean(user?.id));
  const applyMutation = useApplyMercenary();
  const [message, setMessage] = useState("");
  const [applyVisible, setApplyVisible] = useState(false);

  const post = detailQuery.data?.post ?? null;
  const ownTeamIds = useMemo(() => new Set(teams.teams.map((item) => item.team.id)), [teams.teams]);
  const appliedPostIds = useMemo(() => new Set((applicationsQuery.data ?? []).map((item) => item.post_id)), [applicationsQuery.data]);
  const isOwnPost = post ? ownTeamIds.has(post.team_id) : false;
  const isApplied = post ? appliedPostIds.has(post.id) : false;
  const statusTone = getPostStatusTone(post?.status ?? "open");

  const handleApply = async (): Promise<void> => {
    if (!post) {
      return;
    }
    try {
      await applyMutation.mutateAsync({ post_id: post.id, message: message.trim() || null });
      setApplyVisible(false);
      setMessage("");
      Alert.alert("KickGo", copy.applySuccess);
    } catch (error) {
      Alert.alert("KickGo", error instanceof Error ? error.message : copy.requestFailed);
    }
  };

  if (!post) {
    return (
      <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
        <View style={styles.stateWrap}>
          <Text style={styles.stateText}>{copy.requestFailed}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.teamCard}>
          <View style={styles.teamRow}>
            {post.team_emblem_url ? <Image source={{ uri: post.team_emblem_url }} style={styles.emblem} /> : <View style={styles.emblemFallback}><Text style={styles.emblemFallbackLabel}>{getInitial(post.team_name)}</Text></View>}
            <View style={styles.teamCopy}>
              <Text style={styles.teamName}>{post.team_name ?? "KickGo Team"}</Text>
              <Text style={styles.teamMeta}>{getMercenaryRegionLabel(post.province_code, post.team_district_code)}</Text>
            </View>
            <View style={[styles.statusPill, { backgroundColor: statusTone.backgroundColor }]}>
              <Text style={[styles.statusLabel, { color: statusTone.color }]}>{post.status === "open" ? copy.statusOpen : post.status === "closed" ? copy.statusClosed : copy.statusCancelled}</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{copy.positionsLabel}</Text>
          <MercenaryPositionChips language={language} positions={post.needed_positions} />
          <View style={styles.metaList}>
            <Text style={styles.metaItem}>{`${copy.neededCountLabel}: ${post.needed_count}`}</Text>
            <Text style={styles.metaItem}>{`${copy.acceptedCountLabel}: ${post.accepted_count ?? 0}`}</Text>
            {post.match_scheduled_at ? <Text style={styles.metaItem}>{`${copy.matchInfoLabel}: ${formatMercenaryDateTime(post.match_scheduled_at, language)}`}</Text> : null}
            <Text style={styles.metaItem}>{`${copy.matchInfoLabel}: ${post.match_venue_name?.trim() || copy.venueFallback}`}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{copy.descriptionLabel}</Text>
          <Text style={styles.description}>{post.description?.trim() || "-"}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{`${copy.applicantsCount}: ${detailQuery.data?.applications.length ?? 0}`}</Text>
          <Text style={styles.description}>{copy.detailTitle}</Text>
        </View>
      </ScrollView>

      {!isOwnPost ? (
        <View style={styles.footer}>
          <Pressable disabled={isApplied || applyMutation.isPending} onPress={() => setApplyVisible(true)} style={[styles.applyButton, (isApplied || applyMutation.isPending) && styles.applyButtonDisabled]}>
            <Text style={styles.applyButtonLabel}>{isApplied ? copy.applied : copy.apply}</Text>
          </Pressable>
        </View>
      ) : null}

      <Modal animationType="slide" onRequestClose={() => setApplyVisible(false)} transparent visible={applyVisible}>
        <Pressable onPress={() => setApplyVisible(false)} style={styles.modalBackdrop}>
          <Pressable style={styles.sheetCard}>
            <Text style={styles.sheetTitle}>{copy.applySheetTitle}</Text>
            <TextInput multiline onChangeText={setMessage} placeholder={copy.applyMessagePlaceholder} style={styles.messageInput} value={message} />
            <View style={styles.sheetActions}>
              <Pressable onPress={() => setApplyVisible(false)} style={styles.sheetSecondaryButton}><Text style={styles.sheetSecondaryLabel}>Cancel</Text></Pressable>
              <Pressable disabled={applyMutation.isPending} onPress={() => void handleApply()} style={[styles.sheetPrimaryButton, applyMutation.isPending ? styles.sheetPrimaryButtonDisabled : null]}><Text style={styles.sheetPrimaryLabel}>{copy.applySubmit}</Text></Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#ffffff" },
  content: { padding: 20, gap: 16, paddingBottom: 120 },
  stateWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  stateText: { fontSize: 15, fontWeight: "700", color: "#6b7280" },
  teamCard: { borderRadius: 22, borderWidth: 1, borderColor: "#e5e7eb", backgroundColor: "#ffffff", padding: 18 },
  teamRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  emblem: { width: 52, height: 52, borderRadius: 18, backgroundColor: "#e5e7eb" },
  emblemFallback: { width: 52, height: 52, borderRadius: 18, backgroundColor: "#dcfce7", alignItems: "center", justifyContent: "center" },
  emblemFallbackLabel: { fontSize: 18, fontWeight: "800", color: "#166534" },
  teamCopy: { flex: 1, gap: 4 },
  teamName: { fontSize: 20, fontWeight: "800", color: "#111827" },
  teamMeta: { fontSize: 13, color: "#6b7280" },
  statusPill: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  statusLabel: { fontSize: 12, fontWeight: "800" },
  card: { borderRadius: 22, borderWidth: 1, borderColor: "#e5e7eb", backgroundColor: "#ffffff", padding: 18, gap: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: "#111827" },
  metaList: { gap: 6 },
  metaItem: { fontSize: 14, color: "#4b5563" },
  description: { fontSize: 14, lineHeight: 22, color: "#4b5563" },
  footer: { position: "absolute", left: 0, right: 0, bottom: 0, padding: 20, backgroundColor: "#ffffff" },
  applyButton: { minHeight: 52, borderRadius: 16, backgroundColor: "#111827", alignItems: "center", justifyContent: "center" },
  applyButtonDisabled: { backgroundColor: "#d1d5db" },
  applyButtonLabel: { fontSize: 15, fontWeight: "800", color: "#ffffff" },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(15, 23, 42, 0.32)", justifyContent: "flex-end", padding: 20 },
  sheetCard: { borderRadius: 24, backgroundColor: "#ffffff", padding: 20, gap: 14 },
  sheetTitle: { fontSize: 20, fontWeight: "800", color: "#111827" },
  messageInput: { minHeight: 120, borderRadius: 18, borderWidth: 1, borderColor: "#d1d5db", paddingHorizontal: 14, paddingVertical: 14, textAlignVertical: "top", fontSize: 14, color: "#111827" },
  sheetActions: { flexDirection: "row", gap: 10 },
  sheetSecondaryButton: { flex: 1, minHeight: 48, borderRadius: 16, borderWidth: 1, borderColor: "#d1d5db", alignItems: "center", justifyContent: "center" },
  sheetSecondaryLabel: { fontSize: 14, fontWeight: "700", color: "#111827" },
  sheetPrimaryButton: { flex: 1, minHeight: 48, borderRadius: 16, backgroundColor: "#111827", alignItems: "center", justifyContent: "center" },
  sheetPrimaryButtonDisabled: { opacity: 0.5 },
  sheetPrimaryLabel: { fontSize: 14, fontWeight: "800", color: "#ffffff" },
});