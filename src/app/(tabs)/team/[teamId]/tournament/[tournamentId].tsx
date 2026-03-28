import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useI18n } from "@/core/i18n/LanguageProvider";
import { getTeamMatchesCopy } from "@/features/team-matches.copy";
import { TeamMatchInlineHeader } from "@/features/team-matches/components/TeamMatchInlineHeader";
import {
  buildTournamentSections,
  formatMatchDateTime,
  getDisplayScore,
  getTournamentStatusLabel,
  getTournamentStatusTone,
} from "@/features/team-matches/team-matches.helpers";
import * as useMatchQuery from "@/hooks/useMatchQuery";
import type { TournamentBracket } from "@/types/match.types";

function BracketCard(props: {
  bracket: TournamentBracket;
  copy: ReturnType<typeof getTeamMatchesCopy>;
  language: "ko" | "vi" | "en";
}): JSX.Element {
  const { bracket, copy, language } = props;
  const homeName = bracket.homeTeam?.name ?? copy.bracketTbd;
  const awayName = bracket.awayTeam?.name ?? copy.bracketTbd;
  const winnerId = bracket.winner_team_id;

  return (
    <View style={styles.bracketCard}>
      <Text style={styles.bracketLabel}>{`${bracket.round === 1 ? copy.bracketSemifinal : copy.bracketFinal} ${bracket.match_order}`}</Text>
      <View style={styles.bracketTeamRow}>
        <Text style={[styles.bracketTeamName, winnerId && winnerId === bracket.home_team_id ? styles.bracketWinner : null]}>{homeName}</Text>
        <Text style={styles.bracketScore}>{bracket.match ? `${getDisplayScore(bracket.match.home_score)} : ${getDisplayScore(bracket.match.away_score)}` : copy.scorePending}</Text>
      </View>
      <View style={styles.bracketTeamRow}>
        <Text style={[styles.bracketTeamName, winnerId && winnerId === bracket.away_team_id ? styles.bracketWinner : null]}>{awayName}</Text>
        <Text style={styles.bracketMeta}>{bracket.match ? formatMatchDateTime(bracket.match.scheduled_at, language) : copy.bracketTbd}</Text>
      </View>
    </View>
  );
}

export default function TournamentDetailScreen(): JSX.Element {
  const { language } = useI18n();
  const copy = getTeamMatchesCopy(language);
  const params = useLocalSearchParams<{ teamId?: string | string[]; tournamentId?: string | string[] }>();
  const tournamentId = Array.isArray(params.tournamentId) ? params.tournamentId[0] ?? null : params.tournamentId ?? null;

  const tournamentQuery = useMatchQuery.useTournament(tournamentId, Boolean(tournamentId));
  const bracketsQuery = useMatchQuery.useTournamentBrackets(tournamentId, Boolean(tournamentId));
  const tournament = tournamentQuery.data ?? null;
  const brackets = bracketsQuery.data ?? [];
  const sections = buildTournamentSections(brackets);
  const tone = tournament ? getTournamentStatusTone(tournament.status) : null;

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TeamMatchInlineHeader title={copy.tournamentTitle} onBack={() => router.back()} />

        {tournament ? (
          <View style={styles.heroCard}>
            <View style={styles.heroTopRow}>
              <Text style={styles.heroTitle}>{tournament.name}</Text>
              {tone ? (
                <View style={[styles.statusBadge, { backgroundColor: tone.backgroundColor }]}> 
                  <Text style={[styles.statusBadgeLabel, { color: tone.color }]}>{getTournamentStatusLabel(copy, tournament.status)}</Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.heroMeta}>{`${copy.tournamentTeamsCount} ${tournament.registrations.length}`}</Text>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{copy.tournamentTeamsTitle}</Text>
          <View style={styles.teamList}>
            {(tournament?.registrations ?? []).map((registration) => (
              <View key={registration.id} style={styles.teamCard}>
                <View style={styles.teamAvatar}>
                  <Text style={styles.teamAvatarText}>{registration.team?.name?.slice(0, 1).toUpperCase() ?? "?"}</Text>
                </View>
                <View style={styles.teamInfo}>
                  <Text style={styles.teamName}>{registration.team?.name ?? copy.bracketTbd}</Text>
                  <Text style={styles.teamMeta}>{`Seed ${registration.seed_number ?? "-"}`}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{copy.tournamentTitle}</Text>
          {sections.semifinal.length === 0 && sections.final.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Ionicons color="#94a3b8" name="git-branch-outline" size={36} />
              <Text style={styles.emptyText}>{copy.bracketTbd}</Text>
            </View>
          ) : null}
          {sections.semifinal.map((bracket) => (
            <BracketCard key={bracket.id} bracket={bracket} copy={copy} language={language} />
          ))}
          {sections.final.map((bracket) => (
            <BracketCard key={bracket.id} bracket={bracket} copy={copy} language={language} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  content: {
    padding: 20,
    gap: 18,
    paddingBottom: 40,
  },
  heroCard: {
    borderRadius: 24,
    backgroundColor: "#0f172a",
    padding: 20,
    gap: 10,
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  heroTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: "800",
    color: "#ffffff",
  },
  heroMeta: {
    fontSize: 13,
    color: "#cbd5e1",
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusBadgeLabel: {
    fontSize: 11,
    fontWeight: "800",
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0f172a",
  },
  teamList: {
    gap: 10,
  },
  teamCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  teamAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e2e8f0",
  },
  teamAvatarText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
  },
  teamInfo: {
    flex: 1,
    gap: 2,
  },
  teamName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
  },
  teamMeta: {
    fontSize: 12,
    color: "#64748b",
  },
  bracketCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    padding: 16,
    gap: 10,
  },
  bracketLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0f766e",
  },
  bracketTeamRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  bracketTeamName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
  },
  bracketWinner: {
    color: "#0f766e",
  },
  bracketScore: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
  },
  bracketMeta: {
    fontSize: 12,
    color: "#64748b",
  },
  emptyWrap: {
    borderRadius: 18,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingVertical: 26,
    alignItems: "center",
    gap: 10,
  },
  emptyText: {
    fontSize: 14,
    color: "#64748b",
  },
});