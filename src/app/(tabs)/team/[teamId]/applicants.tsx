import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useI18n } from "@/core/i18n/LanguageProvider";
import RecruitmentApplicantCard from "@/features/team-recruitment/components/RecruitmentApplicantCard";
import { getTeamRecruitmentCopy } from "@/features/team-recruitment/team-recruitment.copy";
import {
  useRecruitmentApplications,
  useRecruitmentPosts,
  useRespondRecruitmentApplication,
} from "@/hooks/useTeamRecruitmentQuery";
import { useTeamMembersQuery } from "@/hooks/useTeamMembersQuery";

export default function TeamApplicantsScreen(): JSX.Element {
  const { language } = useI18n();
  const copy = getTeamRecruitmentCopy(language);
  const params = useLocalSearchParams<{ teamId?: string | string[] }>();
  const teamId = Array.isArray(params.teamId) ? params.teamId[0] ?? null : params.teamId ?? null;
  const membersQuery = useTeamMembersQuery(teamId, Boolean(teamId));
  const canManage = membersQuery.data?.currentRole === "owner" || membersQuery.data?.currentRole === "manager";
  const postsQuery = useRecruitmentPosts(teamId, Boolean(teamId) && canManage);
  const latestPost = postsQuery.data?.[0] ?? null;
  const applicationsQuery = useRecruitmentApplications(latestPost?.id ?? null, Boolean(latestPost?.id) && canManage);
  const respondMutation = useRespondRecruitmentApplication(teamId, latestPost?.id ?? null);
  const applications = (applicationsQuery.data ?? []).filter((item) => item.status === "pending");

  const backToMembers = (): void => {
    router.replace({ pathname: "/(tabs)/team/[teamId]/members", params: { teamId: teamId ?? undefined } });
  };

  const handleRespond = async (applicationId: string, decision: "accepted" | "rejected") => {
    try {
      const result = await respondMutation.mutateAsync({ applicationId, decision });
      Alert.alert("KickGo", decision === "accepted" ? copy.acceptedSuccess : copy.rejectedSuccess);
      return result;
    } catch (error) {
      Alert.alert("KickGo", error instanceof Error ? error.message : copy.respondError);
      return null;
    }
  };

  if (!canManage) {
    return (
      <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.inlineHeader}>
            <Pressable hitSlop={10} onPress={backToMembers} style={styles.backBtn}>
              <Ionicons color="#111827" name="chevron-back" size={22} />
            </Pressable>
            <Text style={styles.inlineTitle}>{copy.applicantsTitle}</Text>
          </View>
          <View style={styles.centerWrap}>
            <Text style={styles.emptyTitle}>{copy.applicantsTitle}</Text>
            <Text style={styles.emptyBody}>{copy.applicantsEmptyBody}</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (postsQuery.isLoading || applicationsQuery.isLoading) {
    return (
      <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.inlineHeader}>
            <Pressable hitSlop={10} onPress={backToMembers} style={styles.backBtn}>
              <Ionicons color="#111827" name="chevron-back" size={22} />
            </Pressable>
            <Text style={styles.inlineTitle}>{copy.applicantsTitle}</Text>
          </View>
          <View style={styles.centerWrap}>
            <Text style={styles.loadingText}>{copy.loading}</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <FlatList
        contentContainerStyle={styles.content}
        data={applications}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={styles.inlineHeader}>
            <Pressable hitSlop={10} onPress={backToMembers} style={styles.backBtn}>
              <Ionicons color="#111827" name="chevron-back" size={22} />
            </Pressable>
            <Text style={styles.inlineTitle}>{copy.applicantsTitle}</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyTitle}>{copy.applicantsEmpty}</Text>
            <Text style={styles.emptyBody}>{copy.applicantsEmptyBody}</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.cardWrap}>
            <RecruitmentApplicantCard
              application={item}
              isSubmitting={respondMutation.isPending}
              onAccept={() => void handleRespond(item.id, "accepted")}
              onReject={() => void handleRespond(item.id, "rejected")}
            />
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  inlineHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e5e7eb",
  },
  inlineTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
  },
  cardWrap: {
    marginBottom: 12,
  },
  centerWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  loadingText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6b7280",
  },
  emptyWrap: {
    borderRadius: 20,
    backgroundColor: "#ffffff",
    padding: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
  },
  emptyBody: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 21,
    color: "#6b7280",
    textAlign: "center",
  },
});
