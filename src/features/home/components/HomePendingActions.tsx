import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { HomeSectionHeader } from "@/features/home/components/HomeSectionHeader";
import { HomeInlineError, HomeSectionSkeleton } from "@/features/home/components/HomeSectionSkeleton";
import type { HomeCopy } from "@/features/home/home-copy";
import { usePendingActions } from "@/hooks/home/usePendingActions";

type HomePendingActionsProps = {
  userId: string | null;
  enabled: boolean;
  copy: HomeCopy;
};

function getActionMeta(copy: HomeCopy, type: "attendance" | "result" | "mvp", hoursLeft: number | null): string {
  if (type === "attendance") {
    return hoursLeft === null ? copy.attendanceVote : `${copy.attendanceVote} · ${hoursLeft}h`;
  }

  if (type === "result") {
    return copy.resultWaiting;
  }

  return hoursLeft === null ? copy.mvpVoting : `${copy.mvpVoting} · ${hoursLeft}h`;
}

function getActionRoute(type: "attendance" | "result" | "mvp", matchId: string) {
  if (type === "attendance") {
    return { pathname: "/(match)/[matchId]/vote" as const, params: { matchId } };
  }

  if (type === "result") {
    return { pathname: "/(match)/[matchId]/result" as const, params: { matchId } };
  }

  return { pathname: "/(match)/[matchId]/vote" as const, params: { matchId } };
}

export function HomePendingActions(props: HomePendingActionsProps): JSX.Element | null {
  const { userId, enabled, copy } = props;
  const actionsQuery = usePendingActions(userId, enabled);

  if (!enabled) {
    return null;
  }

  if (actionsQuery.isLoading) {
    return (
      <View style={styles.section}>
        <HomeSectionHeader title={copy.pendingActions} />
        <HomeSectionSkeleton count={2} height={88} />
      </View>
    );
  }

  if (actionsQuery.isError) {
    return (
      <View style={styles.section}>
        <HomeSectionHeader title={copy.pendingActions} />
        <View style={styles.errorWrap}>
          <HomeInlineError />
          <Pressable onPress={() => void actionsQuery.refetch()} style={styles.retryButton}>
            <Text style={styles.retryLabel}>{copy.retrySection}</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const items = actionsQuery.data ?? [];

  if (items.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <HomeSectionHeader badgeCount={items.length} title={copy.pendingActions} />
      <View style={styles.listWrap}>
        {items.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => router.push(getActionRoute(item.type, item.match_id))}
            style={styles.row}
          >
            <View style={styles.line} />
            <View style={styles.content}>
              <Text numberOfLines={1} style={styles.title}>{`${item.team_name} VS ${item.opponent_name}`}</Text>
              <Text numberOfLines={1} style={styles.meta}>{getActionMeta(copy, item.type, item.hours_left)}</Text>
            </View>
            <Ionicons color="#9ca3af" name="chevron-forward" size={18} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  listWrap: {
    borderRadius: 18,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#eef2f7",
    overflow: "hidden",
  },
  row: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 12,
    backgroundColor: "#ffffff",
  },
  line: {
    width: 4,
    alignSelf: "stretch",
    borderRadius: 999,
    backgroundColor: "#ef4444",
  },
  content: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  meta: {
    fontSize: 13,
    color: "#6b7280",
  },
  errorWrap: {
    gap: 10,
  },
  retryButton: {
    alignSelf: "flex-start",
  },
  retryLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
  },
});