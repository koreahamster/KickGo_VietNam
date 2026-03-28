import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useI18n } from "@/core/i18n/LanguageProvider";
import { getTeamMatchesCopy } from "@/features/team-matches.copy";
import { TeamMatchCard } from "@/features/team-matches/components/TeamMatchCard";
import { TeamMatchMonthGrid } from "@/features/team-matches/components/TeamMatchMonthGrid";
import {
  buildMonthGrid,
  formatMonthTitle,
  getMatchDayKey,
  groupMatchesByDate,
} from "@/features/team-matches/team-matches.helpers";
import * as useMatchQuery from "@/hooks/useMatchQuery";
import { useTeamDetailQuery } from "@/hooks/useTeamDetailQuery";
import type { TeamMatchSummaryRecord } from "@/types/match.types";

function getCurrentYearMonth(): { year: number; month: number } {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

export default function TeamMatchesScreen(): JSX.Element {
  const { language } = useI18n();
  const copy = getTeamMatchesCopy(language);
  const params = useLocalSearchParams<{ teamId?: string | string[] }>();
  const teamId = Array.isArray(params.teamId) ? params.teamId[0] ?? null : params.teamId ?? null;
  const [{ year, month }, setYearMonth] = useState(getCurrentYearMonth);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const teamQuery = useTeamDetailQuery(teamId, Boolean(teamId));
  const matchesQuery = useMatchQuery.useTeamMatches(teamId, year, month, Boolean(teamId));
  const matches = matchesQuery.data ?? [];
  const groupedMatches = useMemo(() => groupMatchesByDate(matches), [matches]);
  const gridCells = useMemo(() => buildMonthGrid(year, month, matches), [matches, month, year]);
  const visibleMatches = useMemo(() => {
    if (!selectedDate) {
      return matches;
    }
    return groupedMatches[selectedDate] ?? [];
  }, [groupedMatches, matches, selectedDate]);

  const currentRole = teamQuery.data?.currentMembership?.role ?? null;
  const canCreate = currentRole === "owner" || currentRole === "manager";

  const handleMoveMonth = (direction: "prev" | "next"): void => {
    setSelectedDate(null);
    setYearMonth((current) => {
      if (direction === "prev") {
        if (current.month === 1) {
          return { year: current.year - 1, month: 12 };
        }
        return { year: current.year, month: current.month - 1 };
      }

      if (current.month === 12) {
        return { year: current.year + 1, month: 1 };
      }

      return { year: current.year, month: current.month + 1 };
    });
  };

  const renderMatch = ({ item }: { item: TeamMatchSummaryRecord }): JSX.Element => (
    <TeamMatchCard
      copy={copy}
      item={item}
      language={language}
      onPress={() =>
        router.push({
          pathname: "/(tabs)/team/[teamId]/match/[matchId]",
          params: { teamId: teamId ?? "", matchId: item.match.id },
        })
      }
    />
  );

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <View style={styles.container}>
        <FlatList
          contentContainerStyle={styles.listContent}
          data={visibleMatches}
          keyExtractor={(item) => item.match.id}
          renderItem={renderMatch}
          refreshing={matchesQuery.isLoading && matches.length === 0}
          onRefresh={() => void matchesQuery.refetch()}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.headerSection}>
              <View style={styles.monthRow}>
                <Pressable hitSlop={10} onPress={() => handleMoveMonth("prev")} style={styles.monthButton}>
                  <Ionicons color="#0f172a" name="chevron-back" size={18} />
                </Pressable>
                <Text style={styles.monthLabel}>{formatMonthTitle(year, month, language)}</Text>
                <Pressable hitSlop={10} onPress={() => handleMoveMonth("next")} style={styles.monthButton}>
                  <Ionicons color="#0f172a" name="chevron-forward" size={18} />
                </Pressable>
              </View>

              <TeamMatchMonthGrid cells={gridCells} copy={copy} onSelectDate={setSelectedDate} selectedDate={selectedDate} />

              <View style={styles.filterRow}>
                <Text style={styles.hintText}>{copy.selectDateHint}</Text>
                <Pressable onPress={() => setSelectedDate(null)} style={[styles.filterBadge, !selectedDate ? styles.filterBadgeActive : null]}>
                  <Text style={[styles.filterBadgeLabel, !selectedDate ? styles.filterBadgeLabelActive : null]}>{copy.noDateFilter}</Text>
                </Pressable>
              </View>

              {selectedDate ? <Text style={styles.selectedDateLabel}>{selectedDate}</Text> : null}

              {matchesQuery.isLoading ? (
                <View style={styles.skeletonList}>
                  <View style={styles.skeletonCard} />
                  <View style={styles.skeletonCard} />
                </View>
              ) : null}

              {!matchesQuery.isLoading && matches.length === 0 ? (
                <View style={styles.emptyWrap}>
                  <Ionicons color="#94a3b8" name="calendar-clear-outline" size={42} />
                  <Text style={styles.emptyTitle}>{copy.noMatchesInMonth}</Text>
                </View>
              ) : null}

              {!matchesQuery.isLoading && matches.length > 0 && visibleMatches.length === 0 ? (
                <View style={styles.emptyWrap}>
                  <Ionicons color="#94a3b8" name="calendar-number-outline" size={42} />
                  <Text style={styles.emptyTitle}>{copy.noMatchesForDate}</Text>
                </View>
              ) : null}
            </View>
          }
          ListEmptyComponent={null}
        />

        {canCreate ? (
          <Pressable
            onPress={() => router.push({ pathname: "/(tabs)/team/[teamId]/match-create", params: { teamId: teamId ?? "" } })}
            style={({ pressed }) => [styles.fab, pressed ? styles.fabPressed : null]}
          >
            <Ionicons color="#ffffff" name="add" size={28} />
          </Pressable>
        ) : null}
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
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 120,
  },
  headerSection: {
    gap: 16,
    paddingBottom: 18,
  },
  monthRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  monthButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f6",
  },
  monthLabel: {
    fontSize: 19,
    fontWeight: "800",
    color: "#0f172a",
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  hintText: {
    flex: 1,
    fontSize: 13,
    color: "#64748b",
  },
  filterBadge: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: "#ffffff",
  },
  filterBadgeActive: {
    borderColor: "#0f766e",
    backgroundColor: "#ecfdf5",
  },
  filterBadgeLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
  },
  filterBadgeLabelActive: {
    color: "#0f766e",
  },
  selectedDateLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a",
  },
  separator: {
    height: 12,
  },
  emptyWrap: {
    borderRadius: 20,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingVertical: 28,
    paddingHorizontal: 16,
    alignItems: "center",
    gap: 10,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#334155",
    textAlign: "center",
  },
  skeletonList: {
    gap: 12,
  },
  skeletonCard: {
    height: 172,
    borderRadius: 24,
    backgroundColor: "#e5e7eb",
  },
  fab: {
    position: "absolute",
    right: 24,
    bottom: 28,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#0f766e",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 4,
  },
  fabPressed: {
    opacity: 0.9,
  },
});