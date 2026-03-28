import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useI18n } from "@/core/i18n/LanguageProvider";
import { useTeamAnnouncements } from "@/hooks/useTeamAnnouncementsQuery";
import { getTeamAnnouncementsCopy } from "@/features/team-announcements/team-announcements.copy";

type TeamAnnouncementPreviewProps = {
  teamId: string;
};

function formatAnnouncementDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
}

export function TeamAnnouncementPreview(props: TeamAnnouncementPreviewProps): JSX.Element | null {
  const { teamId } = props;
  const { language } = useI18n();
  const copy = getTeamAnnouncementsCopy(language);
  const announcementQuery = useTeamAnnouncements(teamId, true);

  if (announcementQuery.isLoading) {
    return (
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>{copy.sectionTitle}</Text>
        </View>
        <View style={styles.skeletonTitle} />
        <View style={styles.skeletonBodyShort} />
        <View style={styles.skeletonBodyLong} />
      </View>
    );
  }

  if (announcementQuery.isError) {
    return null;
  }

  const topAnnouncement = announcementQuery.data?.[0] ?? null;

  if (!topAnnouncement) {
    return null;
  }

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>{copy.sectionTitle}</Text>
        <Pressable hitSlop={10} onPress={() => router.push({ pathname: "/(tabs)/team/[teamId]/announcements", params: { teamId } })}>
          <Text style={styles.linkText}>{copy.allView}</Text>
        </Pressable>
      </View>
      <Pressable
        onPress={() =>
          router.push({
            pathname: "/(tabs)/team/[teamId]/announcement/[announcementId]",
            params: { teamId, announcementId: topAnnouncement.id },
          })
        }
        style={({ pressed }) => [styles.previewCard, topAnnouncement.is_pinned ? styles.previewCardPinned : null, pressed ? styles.previewCardPressed : null]}
      >
        <View style={styles.labelRow}>
          {topAnnouncement.is_pinned ? (
            <View style={styles.pinnedBadge}>
              <Ionicons color="#f59e0b" name="pin" size={12} />
              <Text style={styles.pinnedBadgeText}>{copy.pinnedBadge}</Text>
            </View>
          ) : (
            <Text style={styles.label}>{copy.latestLabel}</Text>
          )}
          <Text style={styles.dateText}>{formatAnnouncementDate(topAnnouncement.created_at)}</Text>
        </View>
        <Text numberOfLines={1} style={styles.title}>{topAnnouncement.title}</Text>
        <Text numberOfLines={2} style={styles.body}>{topAnnouncement.body}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    backgroundColor: "#ffffff",
    padding: 20,
    shadowColor: "#111827",
    shadowOpacity: 0.05,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },
  linkText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2563eb",
  },
  previewCard: {
    marginTop: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 16,
    gap: 8,
    backgroundColor: "#f8fafc",
  },
  previewCardPinned: {
    backgroundColor: "#fffbeb",
    borderColor: "#fde68a",
  },
  previewCardPressed: {
    opacity: 0.86,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: "#3b82f6",
  },
  pinnedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 999,
    backgroundColor: "#fff7ed",
    borderWidth: 1,
    borderColor: "#fdba74",
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  pinnedBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#c2410c",
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },
  body: {
    fontSize: 14,
    lineHeight: 21,
    color: "#4b5563",
  },
  dateText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#9ca3af",
  },
  skeletonTitle: {
    marginTop: 16,
    height: 20,
    width: "55%",
    borderRadius: 999,
    backgroundColor: "#e5e7eb",
  },
  skeletonBodyShort: {
    marginTop: 12,
    height: 14,
    width: "80%",
    borderRadius: 999,
    backgroundColor: "#e5e7eb",
  },
  skeletonBodyLong: {
    marginTop: 8,
    height: 14,
    width: "68%",
    borderRadius: 999,
    backgroundColor: "#e5e7eb",
  },
});