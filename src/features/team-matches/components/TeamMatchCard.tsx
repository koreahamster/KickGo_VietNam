import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import type { TeamMatchesCopy } from "@/features/team-matches.copy";
import {
  formatScoreboardDateTime,
  getDisplayScore,
  getMatchStatusLabel,
  getMatchStatusTone,
  getMatchTypeLabel,
} from "@/features/team-matches/team-matches.helpers";
import type { TeamMatchSummaryRecord } from "@/types/match.types";
import type { SupportedLanguage } from "@/types/profile.types";

type TeamMatchCardProps = {
  item: TeamMatchSummaryRecord;
  language: SupportedLanguage;
  copy: TeamMatchesCopy;
  onPress: () => void;
};

function TeamBadge(props: { imageUrl?: string | null; fallback: string }): JSX.Element {
  const { imageUrl, fallback } = props;

  if (imageUrl?.trim()) {
    return <Image source={{ uri: imageUrl }} style={styles.teamBadgeImage} />;
  }

  return (
    <View style={styles.teamBadgeFallback}>
      <Text style={styles.teamBadgeFallbackText}>{fallback.slice(0, 1).toUpperCase()}</Text>
    </View>
  );
}

export function TeamMatchCard(props: TeamMatchCardProps): JSX.Element {
  const { item, language, copy, onPress } = props;
  const tone = getMatchStatusTone(item.match.status);
  const opponentName = item.awayTeam?.name ?? item.match.opponent_name?.trim() ?? copy.awayUnknownLabel;
  const homeName = item.homeTeam?.name ?? copy.thisTeam;
  const homeScore = getDisplayScore(item.match.home_score);
  const awayScore = getDisplayScore(item.match.away_score);

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed ? styles.cardPressed : null]}>
      <Text style={styles.dateText}>{formatScoreboardDateTime(item.match.scheduled_at, language)}</Text>

      <View style={styles.scoreRow}>
        <View style={styles.teamColumn}>
          <TeamBadge fallback={homeName} imageUrl={item.homeTeam?.emblem_url ?? null} />
          <Text numberOfLines={2} style={styles.teamName}>{homeName}</Text>
        </View>

        <View style={styles.scoreColumn}>
          <Text style={styles.scoreText}>{`${homeScore} : ${awayScore}`}</Text>
          <View style={styles.typeBadge}>
            <Text style={styles.typeLabel}>{getMatchTypeLabel(copy, item.match.match_type)}</Text>
          </View>
        </View>

        <View style={styles.teamColumn}>
          {item.awayTeam?.emblem_url?.trim() ? (
            <TeamBadge fallback={opponentName} imageUrl={item.awayTeam.emblem_url} />
          ) : item.awayTeam ? (
            <TeamBadge fallback={opponentName} imageUrl={null} />
          ) : (
            <View style={styles.teamBadgeUnknown}>
              <Ionicons color="#64748b" name="help" size={18} />
            </View>
          )}
          <Text numberOfLines={2} style={styles.teamName}>{opponentName}</Text>
        </View>
      </View>

      <Text style={styles.venueText}>{item.match.venue_name?.trim() || copy.venueFallback}</Text>

      <View style={styles.footerRow}>
        <Text style={styles.attendanceText}>{`✅${item.attendanceSummary.yes_count}   ❌${item.attendanceSummary.no_count}   ❓${item.attendanceSummary.maybe_count}`}</Text>
        <View style={[styles.statusBadge, { backgroundColor: tone.backgroundColor }]}>
          <Text style={[styles.statusLabel, { color: tone.color }]}>{getMatchStatusLabel(copy, item.match.status)}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingHorizontal: 18,
    paddingVertical: 18,
    gap: 14,
  },
  cardPressed: {
    opacity: 0.92,
  },
  dateText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
    textAlign: "center",
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  teamColumn: {
    flex: 1,
    alignItems: "center",
    gap: 10,
  },
  teamBadgeImage: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#f8fafc",
  },
  teamBadgeFallback: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e2e8f0",
  },
  teamBadgeUnknown: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f1f5f9",
  },
  teamBadgeFallbackText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
  },
  teamName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
    textAlign: "center",
  },
  scoreColumn: {
    width: 96,
    alignItems: "center",
    gap: 8,
  },
  scoreText: {
    fontSize: 30,
    fontWeight: "900",
    color: "#0f172a",
  },
  typeBadge: {
    borderRadius: 999,
    backgroundColor: "#eef2ff",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  typeLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#4338ca",
  },
  venueText: {
    fontSize: 13,
    color: "#64748b",
    textAlign: "center",
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  attendanceText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: "800",
  },
});