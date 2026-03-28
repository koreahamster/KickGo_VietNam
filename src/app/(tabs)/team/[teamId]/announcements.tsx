import { router, useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { TeamAnnouncementListItem } from "@/features/team-announcements/components/TeamAnnouncementListItem";
import { getTeamAnnouncementsCopy } from "@/features/team-announcements/team-announcements.copy";
import { useI18n } from "@/core/i18n/LanguageProvider";
import { useTeamAnnouncements } from "@/hooks/useTeamAnnouncementsQuery";
import { useTeamMembersQuery } from "@/hooks/useTeamMembersQuery";

export default function TeamAnnouncementsScreen(): JSX.Element {
  const { language } = useI18n();
  const copy = getTeamAnnouncementsCopy(language);
  const params = useLocalSearchParams<{ teamId?: string | string[] }>();
  const teamId = Array.isArray(params.teamId) ? params.teamId[0] ?? null : params.teamId ?? null;
  const announcementsQuery = useTeamAnnouncements(teamId, Boolean(teamId));
  const membersQuery = useTeamMembersQuery(teamId, Boolean(teamId));
  const canWrite = membersQuery.data?.currentRole === "owner" || membersQuery.data?.currentRole === "manager";

  const rows = useMemo(() => {
    const announcements = announcementsQuery.data ?? [];
    let nonPinnedCount = 0;

    return announcements.map((announcement) => {
      if (announcement.is_pinned) {
        return { announcement, nonPinnedIndex: null };
      }

      nonPinnedCount += 1;
      return { announcement, nonPinnedIndex: nonPinnedCount };
    });
  }, [announcementsQuery.data]);

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>{copy.sectionTitle}</Text>
          {canWrite && teamId ? (
            <Pressable
              hitSlop={10}
              onPress={() => router.push({ pathname: "/(tabs)/team/[teamId]/announcement-create", params: { teamId } })}
              style={({ pressed }) => [styles.writeButton, pressed ? styles.writeButtonPressed : null]}
            >
              <Text style={styles.writeButtonLabel}>{copy.writeAction}</Text>
            </Pressable>
          ) : null}
        </View>

        {announcementsQuery.isLoading ? (
          <View style={styles.loadingWrap}>
            <Text style={styles.loadingText}>{copy.loading}</Text>
          </View>
        ) : announcementsQuery.isError ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyTitle}>{copy.emptyTitle}</Text>
            <Text style={styles.emptyBody}>{announcementsQuery.error instanceof Error ? announcementsQuery.error.message : copy.emptyBody}</Text>
          </View>
        ) : rows.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyTitle}>{copy.emptyTitle}</Text>
            <Text style={styles.emptyBody}>{copy.emptyBody}</Text>
          </View>
        ) : (
          <FlatList
            contentContainerStyle={styles.listContent}
            data={rows}
            keyExtractor={(item) => item.announcement.id}
            renderItem={({ item }) => (
              <TeamAnnouncementListItem
                announcement={item.announcement}
                nonPinnedIndex={item.nonPinnedIndex}
                noticeBadgeLabel={copy.pinnedBadge}
                onPress={() =>
                  router.push({
                    pathname: "/(tabs)/team/[teamId]/announcement/[announcementId]",
                    params: { teamId: item.announcement.team_id, announcementId: item.announcement.id },
                  })
                }
              />
            )}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#111827",
  },
  writeButton: {
    minHeight: 36,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#d1d5db",
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  writeButtonPressed: {
    opacity: 0.82,
  },
  writeButtonLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  listContent: {
    paddingBottom: 40,
  },
  loadingWrap: {
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
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
  },
  emptyBody: {
    marginTop: 12,
    fontSize: 15,
    lineHeight: 22,
    color: "#6b7280",
  },
});