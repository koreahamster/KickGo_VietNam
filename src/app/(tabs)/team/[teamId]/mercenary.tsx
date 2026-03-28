import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useI18n } from "@/core/i18n/LanguageProvider";
import { getMercenaryCopy } from "@/features/mercenary/mercenary.copy";
import { MercenaryInlineHeader } from "@/features/mercenary/components/MercenaryInlineHeader";
import { MercenaryPostCard } from "@/features/mercenary/components/MercenaryPostCard";
import { useCloseMercenaryPost, useTeamMercenaryPosts } from "@/hooks/useMercenaryQuery";
import { useTeamDetailQuery } from "@/hooks/useTeamDetailQuery";

export default function TeamMercenaryManageScreen(): JSX.Element {
  const { language } = useI18n();
  const copy = getMercenaryCopy(language);
  const params = useLocalSearchParams<{ teamId?: string | string[] }>();
  const teamId = Array.isArray(params.teamId) ? params.teamId[0] ?? null : params.teamId ?? null;
  const detailQuery = useTeamDetailQuery(teamId, Boolean(teamId));
  const postsQuery = useTeamMercenaryPosts(teamId, Boolean(teamId));
  const closeMutation = useCloseMercenaryPost();

  const canManage = detailQuery.data?.currentMembership?.role === "owner" || detailQuery.data?.currentMembership?.role === "manager";

  const handleClose = (postId: string): void => {
    if (!teamId) {
      return;
    }
    Alert.alert("KickGo", copy.managerActionConfirm, [
      { text: "Cancel", style: "cancel" },
      {
        text: copy.closePost,
        style: "destructive",
        onPress: () => {
          void closeMutation.mutateAsync({ postId, teamId }).catch((error) => {
            Alert.alert("KickGo", error instanceof Error ? error.message : copy.requestFailed);
          });
        },
      },
    ]);
  };

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={postsQuery.isRefetching} onRefresh={() => void postsQuery.refetch()} />}
        showsVerticalScrollIndicator={false}
      >
        <MercenaryInlineHeader backLabel={copy.inlineBack} onBack={() => router.replace({ pathname: "/(tabs)/team/[teamId]", params: { teamId: teamId ?? "" } })} rightSlot={canManage ? <Pressable onPress={() => router.push({ pathname: "/(tabs)/team/[teamId]/mercenary-create", params: { teamId: teamId ?? "" } })}><Ionicons color="#111827" name="add-circle-outline" size={24} /></Pressable> : null} title={copy.manageTitle} />

        <View style={styles.listWrap}>
          {(postsQuery.data ?? []).map((post) => (
            <View key={post.id} style={styles.cardWrap}>
              <MercenaryPostCard actionLabel={copy.viewApplicants} actionDisabled={false} hideAction={false} language={language} onActionPress={() => router.push({ pathname: "/(tabs)/team/[teamId]/mercenary-applicants", params: { teamId: teamId ?? "", postId: post.id } })} onPress={() => router.push({ pathname: "/(tabs)/search/mercenary/[postId]", params: { postId: post.id } })} post={post} />
              {canManage ? (
                <Pressable disabled={post.status !== "open" || closeMutation.isPending} onPress={() => handleClose(post.id)} style={[styles.closeButton, post.status !== "open" ? styles.closeButtonDisabled : null]}>
                  <Text style={[styles.closeButtonLabel, post.status !== "open" ? styles.closeButtonLabelDisabled : null]}>{copy.closePost}</Text>
                </Pressable>
              ) : null}
            </View>
          ))}
          {!postsQuery.isLoading && (postsQuery.data ?? []).length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>{copy.manageEmpty}</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>

      {canManage ? (
        <Pressable onPress={() => router.push({ pathname: "/(tabs)/team/[teamId]/mercenary-create", params: { teamId: teamId ?? "" } })} style={styles.fab}>
          <Ionicons color="#ffffff" name="add" size={26} />
        </Pressable>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#ffffff" },
  content: { padding: 20, paddingBottom: 120 },
  listWrap: { gap: 14 },
  cardWrap: { gap: 10 },
  closeButton: {
    minHeight: 42,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#fecaca",
    backgroundColor: "#fff1f2",
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonDisabled: { opacity: 0.45 },
  closeButtonLabel: { fontSize: 13, fontWeight: "800", color: "#be123c" },
  closeButtonLabelDisabled: { color: "#9ca3af" },
  emptyCard: { borderRadius: 22, borderWidth: 1, borderColor: "#e5e7eb", backgroundColor: "#f8fafc", padding: 22, alignItems: "center" },
  emptyTitle: { fontSize: 16, fontWeight: "800", color: "#111827", textAlign: "center" },
  fab: {
    position: "absolute",
    right: 24,
    bottom: 28,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#111827",
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
});