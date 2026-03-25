import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { HomeSectionHeader } from "@/features/home/components/HomeSectionHeader";
import { HomeInlineError, HomeSectionSkeleton } from "@/features/home/components/HomeSectionSkeleton";
import type { HomeCopy } from "@/features/home/home-copy";
import { useRegionRank } from "@/hooks/home/useRegionRank";

type HomeRegionRankProps = {
  userId: string | null;
  enabled: boolean;
  copy: HomeCopy;
};

export function HomeRegionRank(props: HomeRegionRankProps): JSX.Element | null {
  const { userId, enabled, copy } = props;
  const rankQuery = useRegionRank(userId, enabled);

  if (!enabled) {
    return null;
  }

  if (rankQuery.isLoading) {
    return (
      <View style={styles.section}>
        <HomeSectionHeader actionLabel={copy.fullView} onPress={() => router.push("/(league)/region-stats")} title={copy.regionRank} />
        <HomeSectionSkeleton height={132} />
      </View>
    );
  }

  if (rankQuery.isError) {
    return (
      <View style={styles.section}>
        <HomeSectionHeader actionLabel={copy.fullView} onPress={() => router.push("/(league)/region-stats")} title={copy.regionRank} />
        <View style={styles.errorWrap}>
          <HomeInlineError />
          <Pressable onPress={() => void rankQuery.refetch()} style={styles.retryButton}>
            <Text style={styles.retryLabel}>{copy.retrySection}</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const rank = rankQuery.data;

  if (!rank) {
    return null;
  }

  return (
    <View style={styles.section}>
      <HomeSectionHeader actionLabel={copy.fullView} onPress={() => router.push("/(league)/region-stats")} title={copy.regionRank} />
      <Pressable onPress={() => router.push("/(league)/region-stats")} style={styles.card}>
        <View style={styles.topRow}>
          <Text style={styles.teamName}>{rank.team_name}</Text>
          <View style={styles.tierPill}>
            <Text style={styles.tierLabel}>{rank.tier_label}</Text>
          </View>
        </View>
        <Text style={styles.rankLabel}>{`${rank.tier_label} ${rank.rank}위 / ${rank.total_teams}팀 · ${rank.points}pt`}</Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.max(4, Math.min(100, rank.progress))}%` }]} />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    padding: 18,
    gap: 14,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  teamName: {
    flex: 1,
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },
  tierPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#ecfdf5",
  },
  tierLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0f766e",
  },
  rankLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4b5563",
  },
  progressTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: "#e5e7eb",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#16a34a",
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