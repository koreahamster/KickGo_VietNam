import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useI18n } from "@/core/i18n/LanguageProvider";
import { getRefereeSystemCopy } from "@/features/referee/referee.copy";
import { TeamMatchInlineHeader } from "@/features/team-matches/components/TeamMatchInlineHeader";
import { useAcceptedMercenaries } from "@/hooks/useMercenaryQuery";
import { useMatchDetail } from "@/hooks/useMatchQuery";
import { useMatchRosters, useSubmitRoster } from "@/hooks/useRefereeQuery";
import { useTeamDetailQuery } from "@/hooks/useTeamDetailQuery";
import { useTeamMembersQuery } from "@/hooks/useTeamMembersQuery";
import type { PlayerPosition } from "@/types/profile.types";

type SelectedPlayer = {
  userId: string;
  name: string;
  squadNumber: number | null;
  isMercenary: boolean;
  selected: boolean;
  position: PlayerPosition | null;
};

const POSITIONS: PlayerPosition[] = ["GK", "CB", "LB", "RB", "CDM", "CM", "CAM", "LM", "RM", "LW", "RW", "CF", "ST"];

function getInitial(value: string): string {
  return value.trim().slice(0, 1).toUpperCase() || "K";
}

export default function MatchRosterSubmitScreen(): JSX.Element {
  const { language } = useI18n();
  const copy = getRefereeSystemCopy(language);
  const params = useLocalSearchParams<{ teamId?: string | string[]; matchId?: string | string[] }>();
  const teamId = Array.isArray(params.teamId) ? params.teamId[0] ?? null : params.teamId ?? null;
  const matchId = Array.isArray(params.matchId) ? params.matchId[0] ?? null : params.matchId ?? null;

  const teamQuery = useTeamDetailQuery(teamId, Boolean(teamId));
  const membersQuery = useTeamMembersQuery(teamId, Boolean(teamId));
  const matchQuery = useMatchDetail(matchId, Boolean(matchId));
  const rostersQuery = useMatchRosters(matchId, Boolean(matchId));
  const mercenariesQuery = useAcceptedMercenaries(teamId, matchId, Boolean(teamId && matchId));
  const submitMutation = useSubmitRoster();

  const canManage = teamQuery.data?.currentMembership?.role === "owner" || teamQuery.data?.currentMembership?.role === "manager";
  const existingRoster = useMemo(
    () => (rostersQuery.data ?? []).filter((item) => item.team_id === teamId),
    [rostersQuery.data, teamId],
  );
  const rosterMap = useMemo(
    () =>
      new Map(
        existingRoster.map((item) => [item.user_id, { selected: true, position: (item.position as PlayerPosition | null) ?? null, squadNumber: item.squad_number ?? null }]),
      ),
    [existingRoster],
  );

  const initialSelection = useMemo<Record<string, SelectedPlayer>>(() => {
    const next: Record<string, SelectedPlayer> = {};
    (membersQuery.data?.members ?? []).forEach((member) => {
      const name = member.profile?.display_name?.trim() || "KickGo Player";
      const existing = rosterMap.get(member.user_id);
      next[member.user_id] = {
        userId: member.user_id,
        name,
        squadNumber: member.squad_number,
        isMercenary: false,
        selected: existing?.selected ?? false,
        position: existing?.position ?? null,
      };
    });

    (mercenariesQuery.data ?? []).forEach((item) => {
      const existing = rosterMap.get(item.applicant_id);
      next[item.applicant_id] = {
        userId: item.applicant_id,
        name: item.applicant_name?.trim() || "KickGo Mercenary",
        squadNumber: null,
        isMercenary: true,
        selected: existing?.selected ?? false,
        position: existing?.position ?? (item.applicant_positions?.[0] ?? null),
      };
    });

    return next;
  }, [membersQuery.data?.members, mercenariesQuery.data, rosterMap]);

  const signature = useMemo(() => JSON.stringify(initialSelection), [initialSelection]);
  const [selection, setSelection] = useState<Record<string, SelectedPlayer>>({});

  useEffect(() => {
    setSelection(initialSelection);
  }, [signature]);

  const selectedPlayers = useMemo(
    () => Object.values(selection).filter((item) => item.selected),
    [selection],
  );

  const handleTogglePlayer = (userId: string): void => {
    setSelection((current) => {
      const target = current[userId];
      if (!target) {
        return current;
      }
      return {
        ...current,
        [userId]: {
          ...target,
          selected: !target.selected,
          position: !target.selected ? target.position ?? null : target.position,
        },
      };
    });
  };

  const handleSelectPosition = (userId: string, position: PlayerPosition): void => {
    setSelection((current) => ({
      ...current,
      [userId]: {
        ...current[userId],
        position,
      },
    }));
  };

  const submitRoster = async (): Promise<void> => {
    if (!teamId || !matchId) {
      return;
    }
    if (selectedPlayers.length === 0) {
      Alert.alert("KickGo", copy.rosterEmpty);
      return;
    }
    if (selectedPlayers.some((item) => !item.position)) {
      Alert.alert("KickGo", copy.rosterPositionRequired);
      return;
    }

    try {
      await submitMutation.mutateAsync({
        match_id: matchId,
        team_id: teamId,
        players: selectedPlayers.map((item) => ({
          user_id: item.userId,
          squad_number: item.squadNumber,
          position: item.position,
          is_mercenary: item.isMercenary,
        })),
      });
      Alert.alert("KickGo", copy.rosterSubmitSuccess);
      router.replace({ pathname: "/(tabs)/team/[teamId]/match/[matchId]", params: { teamId, matchId } });
    } catch (error) {
      Alert.alert("KickGo", error instanceof Error ? error.message : copy.requestFailed);
    }
  };

  const title = matchQuery.data?.match ? `${matchQuery.data.homeTeam?.name ?? "KickGo"} vs ${matchQuery.data.awayTeam?.name ?? matchQuery.data.match.opponent_name ?? "TBD"}` : copy.rosterTitle;

  if (!canManage) {
    return (
      <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
        <View style={styles.stateWrap}><Text style={styles.stateText}>{copy.requestFailed}</Text></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TeamMatchInlineHeader title={copy.rosterTitle} onBack={() => router.back()} />

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>{title}</Text>
          <Text style={styles.summaryMeta}>{`${selectedPlayers.length}${copy.rosterSelectCount}`}</Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>{copy.rosterMembersTitle}</Text>
          {(membersQuery.data?.members ?? []).map((member) => {
            const name = member.profile?.display_name?.trim() || "KickGo Player";
            const current = selection[member.user_id];
            return (
              <View key={member.id} style={styles.playerCard}>
                <Pressable onPress={() => handleTogglePlayer(member.user_id)} style={styles.playerRow}>
                  <View style={styles.checkbox}>{current?.selected ? <Text style={styles.checkboxLabel}>✓</Text> : null}</View>
                  <View style={styles.avatar}><Text style={styles.avatarLabel}>{getInitial(name)}</Text></View>
                  <View style={styles.playerCopy}>
                    <Text style={styles.playerName}>{name}</Text>
                    {member.squad_number ? <Text style={styles.playerMeta}>{`#${member.squad_number}`}</Text> : null}
                  </View>
                </Pressable>
                {current?.selected ? (
                  <View style={styles.positionWrap}>
                    {POSITIONS.map((position) => {
                      const selected = current.position === position;
                      return (
                        <Pressable key={position} onPress={() => handleSelectPosition(member.user_id, position)} style={[styles.positionChip, selected ? styles.positionChipActive : null]}>
                          <Text style={[styles.positionChipLabel, selected ? styles.positionChipLabelActive : null]}>{position}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>{copy.rosterMercenariesTitle}</Text>
          {(mercenariesQuery.data ?? []).length > 0 ? (
            (mercenariesQuery.data ?? []).map((item) => {
              const current = selection[item.applicant_id];
              return (
                <View key={item.id} style={styles.playerCard}>
                  <Pressable onPress={() => handleTogglePlayer(item.applicant_id)} style={styles.playerRow}>
                    <View style={styles.checkbox}>{current?.selected ? <Text style={styles.checkboxLabel}>✓</Text> : null}</View>
                    <View style={styles.avatar}><Text style={styles.avatarLabel}>{getInitial(item.applicant_name ?? "M")}</Text></View>
                    <View style={styles.playerCopy}>
                      <Text style={styles.playerName}>{item.applicant_name ?? "KickGo Mercenary"}</Text>
                      <Text style={styles.playerMeta}>{(item.applicant_positions ?? []).join(" / ") || "Mercenary"}</Text>
                    </View>
                  </Pressable>
                  {current?.selected ? (
                    <View style={styles.positionWrap}>
                      {POSITIONS.map((position) => {
                        const selected = current.position === position;
                        return (
                          <Pressable key={position} onPress={() => handleSelectPosition(item.applicant_id, position)} style={[styles.positionChip, selected ? styles.positionChipActive : null]}>
                            <Text style={[styles.positionChipLabel, selected ? styles.positionChipLabelActive : null]}>{position}</Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  ) : null}
                </View>
              );
            })
          ) : (
            <Text style={styles.emptyText}>{copy.rosterNoMercenaries}</Text>
          )}
        </View>

        <Pressable disabled={submitMutation.isPending} onPress={() => void submitRoster()} style={[styles.submitButton, submitMutation.isPending ? styles.submitButtonDisabled : null]}>
          <Text style={styles.submitButtonLabel}>{existingRoster.length > 0 ? copy.rosterUpdate : copy.rosterSubmit}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#ffffff" },
  content: { padding: 20, gap: 16, paddingBottom: 40 },
  stateWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  stateText: { fontSize: 15, fontWeight: "700", color: "#6b7280" },
  summaryCard: { borderRadius: 20, borderWidth: 1, borderColor: "#e5e7eb", backgroundColor: "#ffffff", padding: 18, gap: 6 },
  summaryTitle: { fontSize: 18, fontWeight: "800", color: "#111827" },
  summaryMeta: { fontSize: 13, color: "#16a34a", fontWeight: "700" },
  sectionCard: { borderRadius: 20, borderWidth: 1, borderColor: "#e5e7eb", backgroundColor: "#ffffff", padding: 18, gap: 12 },
  sectionTitle: { fontSize: 17, fontWeight: "800", color: "#111827" },
  playerCard: { gap: 10, borderRadius: 16, backgroundColor: "#f8fafc", padding: 14 },
  playerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  checkbox: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: "#16a34a", alignItems: "center", justifyContent: "center", backgroundColor: "#ffffff" },
  checkboxLabel: { color: "#16a34a", fontSize: 13, fontWeight: "800" },
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#dbeafe", alignItems: "center", justifyContent: "center" },
  avatarLabel: { fontSize: 14, fontWeight: "800", color: "#1d4ed8" },
  playerCopy: { flex: 1, gap: 3 },
  playerName: { fontSize: 14, fontWeight: "800", color: "#111827" },
  playerMeta: { fontSize: 12, color: "#64748b" },
  positionWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  positionChip: { borderRadius: 999, borderWidth: 1, borderColor: "#d1d5db", backgroundColor: "#ffffff", paddingHorizontal: 10, paddingVertical: 8 },
  positionChipActive: { borderColor: "#16a34a", backgroundColor: "#dcfce7" },
  positionChipLabel: { fontSize: 12, fontWeight: "700", color: "#475569" },
  positionChipLabelActive: { color: "#166534" },
  emptyText: { fontSize: 14, color: "#64748b" },
  submitButton: { minHeight: 54, borderRadius: 16, backgroundColor: "#16a34a", alignItems: "center", justifyContent: "center" },
  submitButtonDisabled: { opacity: 0.55 },
  submitButtonLabel: { fontSize: 15, fontWeight: "800", color: "#ffffff" },
});
