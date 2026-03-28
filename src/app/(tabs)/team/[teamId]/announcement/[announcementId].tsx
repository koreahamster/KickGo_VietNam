import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getTeamAnnouncementsCopy } from "@/features/team-announcements/team-announcements.copy";
import { useI18n } from "@/core/i18n/LanguageProvider";
import { useTeamAnnouncementDetail, useTogglePin } from "@/hooks/useTeamAnnouncementsQuery";
import { useTeamMembersQuery } from "@/hooks/useTeamMembersQuery";

function formatAnnouncementDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export default function TeamAnnouncementDetailScreen(): JSX.Element {
  const { language } = useI18n();
  const copy = getTeamAnnouncementsCopy(language);
  const params = useLocalSearchParams<{ teamId?: string | string[]; announcementId?: string | string[] }>();
  const teamId = Array.isArray(params.teamId) ? params.teamId[0] ?? null : params.teamId ?? null;
  const announcementId = Array.isArray(params.announcementId) ? params.announcementId[0] ?? null : params.announcementId ?? null;
  const announcementQuery = useTeamAnnouncementDetail(teamId, announcementId, Boolean(teamId && announcementId));
  const membersQuery = useTeamMembersQuery(teamId, Boolean(teamId));
  const togglePinMutation = useTogglePin();
  const canManage = membersQuery.data?.currentRole === "owner" || membersQuery.data?.currentRole === "manager";

  const handleTogglePin = async (): Promise<void> => {
    if (!teamId || !announcementId || !announcementQuery.data) {
      return;
    }

    try {
      const updated = await togglePinMutation.mutateAsync({
        teamId,
        request: { announcement_id: announcementId },
      });

      Alert.alert("KickGo", updated.is_pinned ? copy.pinTogglePinnedSuccess : copy.pinToggleUnpinnedSuccess);
    } catch (error) {
      Alert.alert("KickGo", error instanceof Error ? error.message : copy.pinToggleErrorFallback);
    }
  };

  if (announcementQuery.isLoading) {
    return (
      <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
        <View style={styles.centerWrap}>
          <Text style={styles.loadingText}>{copy.loading}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (announcementQuery.isError || !announcementQuery.data) {
    return (
      <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
        <View style={styles.centerWrap}>
          <Text style={styles.errorTitle}>{copy.emptyTitle}</Text>
          <Text style={styles.errorBody}>{announcementQuery.error instanceof Error ? announcementQuery.error.message : copy.emptyBody}</Text>
          <Text onPress={() => router.back()} style={styles.backLink}>{copy.allView}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const announcement = announcementQuery.data;

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {announcement.is_pinned ? (
          <View style={styles.pinnedBadge}>
            <Ionicons color="#f59e0b" name="pin" size={14} />
            <Text style={styles.pinnedBadgeText}>{copy.pinnedDetailBadge}</Text>
          </View>
        ) : null}
        <Text style={styles.title}>{announcement.title}</Text>
        <View style={styles.metaWrap}>
          <Text style={styles.metaText}>{`${copy.createdAtLabel}${copy.bylineSeparator}${formatAnnouncementDate(announcement.created_at)}`}</Text>
          <Text style={styles.metaText}>{announcement.author_display_name ?? copy.detailFallbackAuthor}</Text>
        </View>
        <View style={styles.divider} />
        <Text style={styles.body}>{announcement.body}</Text>
        {canManage ? (
          <Pressable
            disabled={togglePinMutation.isPending}
            onPress={() => void handleTogglePin()}
            style={({ pressed }) => [styles.togglePinButton, togglePinMutation.isPending ? styles.togglePinButtonDisabled : null, pressed ? styles.togglePinButtonPressed : null]}
          >
            <Text style={styles.togglePinButtonLabel}>{announcement.is_pinned ? copy.pinOffLabel : copy.pinOnLabel}</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  centerWrap: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  loadingText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6b7280",
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
  },
  errorBody: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
    color: "#6b7280",
  },
  backLink: {
    marginTop: 18,
    fontSize: 14,
    fontWeight: "700",
    color: "#2563eb",
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  pinnedBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    backgroundColor: "#fff7ed",
    borderWidth: 1,
    borderColor: "#fdba74",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  pinnedBadgeText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#c2410c",
  },
  title: {
    marginTop: 12,
    fontSize: 28,
    lineHeight: 36,
    fontWeight: "800",
    color: "#111827",
  },
  metaWrap: {
    marginTop: 16,
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
  },
  divider: {
    marginTop: 20,
    height: 1,
    backgroundColor: "#e5e7eb",
  },
  body: {
    marginTop: 24,
    fontSize: 16,
    lineHeight: 28,
    color: "#1f2937",
  },
  togglePinButton: {
    marginTop: 28,
    minHeight: 52,
    borderRadius: 12,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },
  togglePinButtonDisabled: {
    opacity: 0.6,
  },
  togglePinButtonPressed: {
    opacity: 0.84,
  },
  togglePinButtonLabel: {
    fontSize: 16,
    fontWeight: "800",
    color: "#ffffff",
  },
});