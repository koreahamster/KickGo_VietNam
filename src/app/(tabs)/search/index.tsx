import { useMemo, useState } from "react";
import { Alert, Modal, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import { getProvinceOptions } from "@/constants/profile-options";
import { useI18n } from "@/core/i18n/LanguageProvider";
import { getMercenaryCopy } from "@/features/mercenary/mercenary.copy";
import { MercenaryPostCard } from "@/features/mercenary/components/MercenaryPostCard";
import { useAuth } from "@/hooks/useAuth";
import { useMercenaryPosts, useApplyMercenary, useMyApplications } from "@/hooks/useMercenaryQuery";
import { useProfile } from "@/hooks/useProfile";
import { useTeams } from "@/hooks/useTeams";
import type { MercenaryPositionFilter, MercenaryPost } from "@/types/mercenary.types";

const POSITION_FILTERS: Array<MercenaryPositionFilter | null> = [null, "GK", "DF", "MF", "FW"];

function getFilterLabel(copy: ReturnType<typeof getMercenaryCopy>, value: MercenaryPositionFilter | null): string {
  if (value === "GK") {
    return copy.filterGk;
  }
  if (value === "DF") {
    return copy.filterDf;
  }
  if (value === "MF") {
    return copy.filterMf;
  }
  if (value === "FW") {
    return copy.filterFw;
  }
  return copy.filterAll;
}

export default function SearchMercenaryScreen(): JSX.Element {
  const { language } = useI18n();
  const copy = getMercenaryCopy(language);
  const { user } = useAuth();
  const profile = useProfile({ enabled: Boolean(user) });
  const teams = useTeams({ enabled: Boolean(user) });
  const [provinceCode, setProvinceCode] = useState<string | null>(null);
  const [positionFilter, setPositionFilter] = useState<MercenaryPositionFilter | null>(null);
  const [selectedPost, setSelectedPost] = useState<MercenaryPost | null>(null);
  const [message, setMessage] = useState("");

  const initialProvinceCode = profile.profileBundle.profile?.province_code ?? null;
  const resolvedProvinceCode = provinceCode ?? initialProvinceCode;
  const postsQuery = useMercenaryPosts(resolvedProvinceCode, positionFilter ?? undefined);
  const applicationsQuery = useMyApplications(user?.id ?? null, Boolean(user?.id));
  const applyMutation = useApplyMercenary();

  const ownedTeamIds = useMemo(() => new Set(teams.teams.map((item) => item.team.id)), [teams.teams]);
  const appliedPostIds = useMemo(() => new Set((applicationsQuery.data ?? []).map((item) => item.post_id)), [applicationsQuery.data]);
  const provinces = getProvinceOptions("VN");

  const handleOpenApply = (post: MercenaryPost): void => {
    setSelectedPost(post);
    setMessage("");
  };

  const handleSubmitApply = async (): Promise<void> => {
    if (!selectedPost) {
      return;
    }
    try {
      await applyMutation.mutateAsync({ post_id: selectedPost.id, message: message.trim() || null });
      setSelectedPost(null);
      setMessage("");
      Alert.alert("KickGo", copy.applySuccess);
    } catch (error) {
      Alert.alert("KickGo", error instanceof Error ? error.message : copy.requestFailed);
    }
  };

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={postsQuery.isRefetching || applicationsQuery.isRefetching} onRefresh={() => { void postsQuery.refetch(); void applicationsQuery.refetch(); }} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.filterCard}>
          <Text style={styles.sectionTitle}>{copy.exploreTitle}</Text>
          <Text style={styles.sectionBody}>{copy.teamSearchTitle}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalRow} contentContainerStyle={styles.filterRow}>
            {provinces.map((option) => {
              const selected = resolvedProvinceCode === option.value;
              return (
                <Pressable key={option.value} onPress={() => setProvinceCode(option.value)} style={[styles.filterChip, selected ? styles.filterChipActive : null]}>
                  <Text style={[styles.filterChipLabel, selected ? styles.filterChipLabelActive : null]}>{option.label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
          <View style={styles.filterRowWrap}>
            {POSITION_FILTERS.map((value) => {
              const selected = positionFilter === value;
              return (
                <Pressable key={value ?? "all"} onPress={() => setPositionFilter(value)} style={[styles.filterChip, selected ? styles.filterChipActive : null]}>
                  <Text style={[styles.filterChipLabel, selected ? styles.filterChipLabelActive : null]}>{getFilterLabel(copy, value)}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.listWrap}>
          {(postsQuery.data ?? []).map((post) => {
            const isOwnPost = ownedTeamIds.has(post.team_id);
            const isApplied = appliedPostIds.has(post.id);
            return (
              <MercenaryPostCard
                key={post.id}
                actionDisabled={isApplied}
                actionLabel={isOwnPost ? copy.ownPost : isApplied ? copy.applied : copy.apply}
                hideAction={isOwnPost}
                language={language}
                onActionPress={() => handleOpenApply(post)}
                onPress={() => router.push({ pathname: "/(tabs)/search/mercenary/[postId]", params: { postId: post.id } })}
                post={post}
              />
            );
          })}
          {!postsQuery.isLoading && (postsQuery.data ?? []).length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>{copy.emptyTitle}</Text>
              <Text style={styles.emptyBody}>{copy.emptyBody}</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>

      <Modal animationType="slide" onRequestClose={() => setSelectedPost(null)} transparent visible={selectedPost !== null}>
        <Pressable onPress={() => setSelectedPost(null)} style={styles.modalBackdrop}>
          <Pressable style={styles.sheetCard}>
            <Text style={styles.sheetTitle}>{copy.applySheetTitle}</Text>
            <Text style={styles.sheetHint}>{selectedPost?.team_name ?? "KickGo Team"}</Text>
            <TextInput multiline onChangeText={setMessage} placeholder={copy.applyMessagePlaceholder} style={styles.messageInput} value={message} />
            <View style={styles.sheetActions}>
              <Pressable onPress={() => setSelectedPost(null)} style={styles.sheetSecondaryButton}>
                <Text style={styles.sheetSecondaryLabel}>Cancel</Text>
              </Pressable>
              <Pressable disabled={applyMutation.isPending} onPress={() => void handleSubmitApply()} style={[styles.sheetPrimaryButton, applyMutation.isPending ? styles.sheetPrimaryButtonDisabled : null]}>
                <Text style={styles.sheetPrimaryLabel}>{copy.applySubmit}</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#ffffff" },
  content: { padding: 20, gap: 16, paddingBottom: 32 },
  filterCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    padding: 18,
    gap: 12,
  },
  sectionTitle: { fontSize: 24, fontWeight: "800", color: "#111827" },
  sectionBody: { fontSize: 14, lineHeight: 21, color: "#6b7280" },
  horizontalRow: { marginHorizontal: -2 },
  filterRow: { gap: 10, paddingHorizontal: 2 },
  filterRowWrap: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  filterChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#ffffff",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  filterChipActive: { borderColor: "#059669", backgroundColor: "#ecfdf5" },
  filterChipLabel: { fontSize: 13, fontWeight: "700", color: "#4b5563" },
  filterChipLabelActive: { color: "#047857" },
  listWrap: { gap: 12 },
  emptyCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#f8fafc",
    padding: 22,
    alignItems: "center",
    gap: 8,
  },
  emptyTitle: { fontSize: 18, fontWeight: "800", color: "#111827", textAlign: "center" },
  emptyBody: { fontSize: 14, color: "#6b7280", textAlign: "center" },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(15, 23, 42, 0.32)", justifyContent: "flex-end", padding: 20 },
  sheetCard: {
    borderRadius: 24,
    backgroundColor: "#ffffff",
    padding: 20,
    gap: 14,
  },
  sheetTitle: { fontSize: 20, fontWeight: "800", color: "#111827" },
  sheetHint: { fontSize: 14, color: "#6b7280" },
  messageInput: {
    minHeight: 120,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#ffffff",
    paddingHorizontal: 14,
    paddingVertical: 14,
    textAlignVertical: "top",
    fontSize: 14,
    color: "#111827",
  },
  sheetActions: { flexDirection: "row", gap: 10 },
  sheetSecondaryButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#d1d5db",
    alignItems: "center",
    justifyContent: "center",
  },
  sheetSecondaryLabel: { fontSize: 14, fontWeight: "700", color: "#111827" },
  sheetPrimaryButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 16,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },
  sheetPrimaryButtonDisabled: { opacity: 0.5 },
  sheetPrimaryLabel: { fontSize: 14, fontWeight: "800", color: "#ffffff" },
});