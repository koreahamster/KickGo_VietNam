import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { TeamAnnouncement } from "@/types/team.types";

type TeamAnnouncementListItemProps = {
  announcement: TeamAnnouncement;
  nonPinnedIndex: number | null;
  noticeBadgeLabel: string;
  onPress: () => void;
};

function formatBoardDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return `${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}`;
}

export function TeamAnnouncementListItem(props: TeamAnnouncementListItemProps): JSX.Element {
  const { announcement, nonPinnedIndex, noticeBadgeLabel, onPress } = props;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, announcement.is_pinned ? styles.pinnedRow : null, pressed ? styles.rowPressed : null]}>
      <View style={styles.leftColumn}>
        {announcement.is_pinned ? (
          <View style={styles.pinnedWrap}>
            <Ionicons color="#f59e0b" name="pin" size={14} />
            <View style={styles.noticeBadge}>
              <Text style={styles.noticeBadgeText}>{noticeBadgeLabel}</Text>
            </View>
          </View>
        ) : (
          <Text style={styles.numberText}>{nonPinnedIndex ?? "-"}</Text>
        )}
      </View>
      <View style={styles.centerColumn}>
        <Text numberOfLines={1} style={styles.title}>{announcement.title}</Text>
      </View>
      <View style={styles.rightColumn}>
        <Text style={styles.dateText}>{formatBoardDate(announcement.created_at)}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eceff3",
    backgroundColor: "#ffffff",
    paddingHorizontal: 12,
  },
  pinnedRow: {
    backgroundColor: "#fffbeb",
  },
  rowPressed: {
    opacity: 0.86,
  },
  leftColumn: {
    width: 72,
    alignItems: "center",
    justifyContent: "center",
  },
  centerColumn: {
    flex: 1,
    justifyContent: "center",
  },
  rightColumn: {
    width: 58,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  pinnedWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  noticeBadge: {
    borderRadius: 999,
    backgroundColor: "#fff7ed",
    borderWidth: 1,
    borderColor: "#fdba74",
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  noticeBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#c2410c",
  },
  numberText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#6b7280",
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  dateText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#9ca3af",
  },
});