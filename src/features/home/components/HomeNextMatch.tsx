import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { HomeSectionHeader } from "@/features/home/components/HomeSectionHeader";
import { HomeInlineError, HomeSectionSkeleton } from "@/features/home/components/HomeSectionSkeleton";
import type { HomeCopy } from "@/features/home/home-copy";
import { formatHomeDateTime } from "@/features/home/home-utils";
import { useNextMatch } from "@/hooks/home/useNextMatch";
import type { SupportedLanguage } from "@/types/profile.types";

type HomeNextMatchProps = {
  userId: string | null;
  enabled: boolean;
  language: SupportedLanguage;
  copy: HomeCopy;
};

function getDdayLabel(daysUntil: number, copy: HomeCopy): string {
  if (daysUntil <= 0) {
    return copy.today;
  }

  if (daysUntil === 1) {
    return copy.tomorrow;
  }

  return `D-${daysUntil}`;
}

function getResponsePill(copy: HomeCopy, response: "yes" | "no" | "maybe" | "late" | "unknown" | null): {
  label: string;
  backgroundColor: string;
  color: string;
} {
  if (response === "yes") {
    return { label: copy.attendanceYes, backgroundColor: "#dcfce7", color: "#166534" };
  }

  if (response === "late") {
    return { label: copy.attendanceLate, backgroundColor: "#fef3c7", color: "#b45309" };
  }

  if (response === "no") {
    return { label: copy.attendanceNo, backgroundColor: "#fee2e2", color: "#b91c1c" };
  }

  return { label: copy.attendancePending, backgroundColor: "rgba(255,255,255,0.12)", color: "#ffffff" };
}

export function HomeNextMatch(props: HomeNextMatchProps): JSX.Element | null {
  const { userId, enabled, language, copy } = props;
  const nextMatchQuery = useNextMatch(userId, enabled);

  if (!enabled) {
    return null;
  }

  if (nextMatchQuery.isLoading) {
    return (
      <View style={styles.section}>
        <HomeSectionHeader title={copy.nextMatch} />
        <HomeSectionSkeleton height={184} />
      </View>
    );
  }

  if (nextMatchQuery.isError) {
    return (
      <View style={styles.section}>
        <HomeSectionHeader title={copy.nextMatch} />
        <View style={styles.errorWrap}>
          <HomeInlineError />
          <Pressable onPress={() => void nextMatchQuery.refetch()} style={styles.retryButton}>
            <Text style={styles.retryLabel}>{copy.retrySection}</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const nextMatch = nextMatchQuery.data;

  if (!nextMatch) {
    return null;
  }

  const responsePill = getResponsePill(copy, nextMatch.my_response);
  const attendanceLabel = `${nextMatch.responded_count} / ${nextMatch.active_member_count} responded`;

  return (
    <View style={styles.section}>
      <HomeSectionHeader
        title={copy.nextMatch}
        onPress={() =>
          router.push({
            pathname: "/(match)/[matchId]",
            params: { matchId: nextMatch.summary.match.id },
          })
        }
      />
      <View style={styles.card}>
        <Pressable
          onPress={() =>
            router.push({
              pathname: "/(match)/[matchId]",
              params: { matchId: nextMatch.summary.match.id },
            })
          }
          style={styles.cardBody}
        >
          <View style={styles.leftColumn}>
            <View style={styles.ddayPill}>
              <Text style={styles.ddayLabel}>{getDdayLabel(nextMatch.days_until, copy)}</Text>
            </View>
            <Text numberOfLines={2} style={styles.title}>{`${nextMatch.membership?.team.name ?? "KickGo"} VS ${nextMatch.summary.opponentDisplayName}`}</Text>
            <Text style={styles.meta}>{formatHomeDateTime(nextMatch.summary.match.scheduled_at, language)}</Text>
            <Text numberOfLines={1} style={styles.meta}>{nextMatch.summary.match.venue_name?.trim() || nextMatch.summary.match.opponent_name || copy.noUpcomingMatch}</Text>
          </View>

          <View style={styles.rightColumn}>
            <View style={styles.attendanceCircle}>
              <Text style={styles.attendanceCount}>{nextMatch.responded_count}</Text>
              <Text style={styles.attendanceSub}>/ {nextMatch.active_member_count}</Text>
            </View>
            <Text style={styles.attendanceLabel}>{attendanceLabel}</Text>
          </View>
        </Pressable>

        {nextMatch.my_response && nextMatch.my_response !== "unknown" ? (
          <View style={[styles.statusPill, { backgroundColor: responsePill.backgroundColor }]}>
            <Text style={[styles.statusPillLabel, { color: responsePill.color }]}>{responsePill.label}</Text>
          </View>
        ) : (
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/(match)/[matchId]/vote",
                params: { matchId: nextMatch.summary.match.id },
              })
            }
            style={styles.voteButton}
          >
            <Ionicons color="#ffffff" name="checkmark-circle-outline" size={18} />
            <Text style={styles.voteButtonLabel}>{copy.attendanceVote}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
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
  card: {
    borderRadius: 24,
    backgroundColor: "#161827",
    padding: 18,
    gap: 14,
  },
  cardBody: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  leftColumn: {
    flex: 1,
    gap: 8,
  },
  rightColumn: {
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  ddayPill: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(29, 158, 117, 0.18)",
  },
  ddayLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#35d399",
  },
  title: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "800",
    color: "#ffffff",
  },
  meta: {
    fontSize: 13,
    lineHeight: 18,
    color: "#d1d5db",
  },
  attendanceCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  attendanceCount: {
    fontSize: 20,
    fontWeight: "800",
    color: "#ffffff",
  },
  attendanceSub: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: "600",
    color: "#cbd5e1",
  },
  attendanceLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#cbd5e1",
  },
  voteButton: {
    minHeight: 48,
    borderRadius: 16,
    backgroundColor: "#1d9e75",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  voteButtonLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#ffffff",
  },
  statusPill: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
  },
  statusPillLabel: {
    fontSize: 13,
    fontWeight: "800",
  },
});