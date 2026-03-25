import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { HomeSectionHeader } from "@/features/home/components/HomeSectionHeader";
import { HomeInlineError, HomeSectionSkeleton } from "@/features/home/components/HomeSectionSkeleton";
import type { HomeCopy } from "@/features/home/home-copy";
import { formatShortDate } from "@/features/home/home-utils";
import { useRecentResults } from "@/hooks/home/useRecentResults";
import type { SupportedLanguage } from "@/types/profile.types";

type HomeRecentResultsProps = {
  userId: string | null;
  enabled: boolean;
  language: SupportedLanguage;
  copy: HomeCopy;
};

export function HomeRecentResults(props: HomeRecentResultsProps): JSX.Element | null {
  const { userId, enabled, language, copy } = props;
  const resultsQuery = useRecentResults(userId, enabled);

  if (!enabled) {
    return null;
  }

  if (resultsQuery.isLoading) {
    return (
      <View style={styles.section}>
        <HomeSectionHeader title={copy.recentResults} />
        <HomeSectionSkeleton count={2} height={104} />
      </View>
    );
  }

  if (resultsQuery.isError) {
    return (
      <View style={styles.section}>
        <HomeSectionHeader title={copy.recentResults} />
        <View style={styles.errorWrap}>
          <HomeInlineError />
          <Pressable onPress={() => void resultsQuery.refetch()} style={styles.retryButton}>
            <Text style={styles.retryLabel}>{copy.retrySection}</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const results = resultsQuery.data ?? [];

  if (results.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <HomeSectionHeader actionLabel={copy.seeMore} onPress={() => router.push("/(tabs)/team")} title={copy.recentResults} />
      <View style={styles.listWrap}>
        {results.map((result) => {
          const badgeLabel = result.summary.match.status === "auto_finalized" ? copy.finalizedAuto : copy.finalized;
          const badgeColor = result.summary.match.status === "auto_finalized" ? "#6b7280" : "#16a34a";

          return (
            <Pressable
              key={result.id}
              onPress={() => router.push({ pathname: "/(match)/[matchId]", params: { matchId: result.id } })}
              style={styles.card}
            >
              <View style={styles.rowTop}>
                <Text style={styles.date}>{formatShortDate(result.summary.match.scheduled_at, language)}</Text>
                <View style={[styles.badge, { backgroundColor: `${badgeColor}18` }]}>
                  <Text style={[styles.badgeLabel, { color: badgeColor }]}>{badgeLabel}</Text>
                </View>
              </View>
              <View style={styles.scoreRow}>
                <Text numberOfLines={1} style={styles.teamName}>{result.summary.homeTeam?.name ?? "Home"}</Text>
                <Text style={styles.scoreLabel}>{result.score_label}</Text>
                <Text numberOfLines={1} style={[styles.teamName, styles.teamNameRight]}>{result.summary.awayTeam?.name ?? result.summary.opponentDisplayName}</Text>
              </View>
              <View style={styles.footerRow}>
                <Text style={styles.meta}>{result.summary.match.sport_type === "futsal" ? "Futsal" : "Football"}</Text>
                <Ionicons color="#9ca3af" name="chevron-forward" size={18} />
              </View>
            </Pressable>
          );
        })}
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
    gap: 12,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    padding: 18,
    gap: 12,
  },
  rowTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  date: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeLabel: {
    fontSize: 12,
    fontWeight: "800",
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  teamName: {
    flex: 1,
    fontSize: 17,
    fontWeight: "800",
    color: "#111827",
  },
  teamNameRight: {
    textAlign: "right",
  },
  scoreLabel: {
    minWidth: 52,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "900",
    color: "#111827",
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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