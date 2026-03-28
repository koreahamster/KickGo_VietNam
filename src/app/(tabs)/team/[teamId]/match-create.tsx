import { zodResolver } from "@hookform/resolvers/zod";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

import { PrimaryButton } from "@/components/PrimaryButton";
import { SelectField } from "@/components/SelectField";
import { useI18n } from "@/core/i18n/LanguageProvider";
import { getTeamMatchesCopy } from "@/features/team-matches.copy";
import { TeamMatchInlineHeader } from "@/features/team-matches/components/TeamMatchInlineHeader";
import { TeamPickerSheet } from "@/features/team-matches/components/TeamPickerSheet";
import { buildDateOptions, buildTimeOptions, combineScheduledAt, isFutureScheduledAt } from "@/features/team-matches/team-matches.helpers";
import * as useMatchQuery from "@/hooks/useMatchQuery";
import { useTeamDetailQuery } from "@/hooks/useTeamDetailQuery";
import { useTeamSearchQuery } from "@/hooks/useTeamSearchQuery";
import type { MatchType } from "@/types/match.types";
import type { TeamRecord } from "@/types/team.types";

const MATCH_TYPE_OPTIONS = [
  { value: "friendly", icon: "people-outline" as const, disabled: false },
  { value: "league", icon: "trophy-outline" as const, disabled: true },
  { value: "tournament", icon: "medal-outline" as const, disabled: false },
] satisfies Array<{ value: MatchType; icon: keyof typeof Ionicons.glyphMap; disabled: boolean }>;

type PickerMode = "opponent" | "tournament" | null;

type MatchCreateFormValues = {
  match_type: MatchType;
  away_team_id: string | null;
  opponent_tbd: boolean;
  date_value: string;
  time_value: string;
  venue_name: string;
  tournament_name: string;
  tournament_team_ids: string[];
};

export default function MatchCreateScreen(): JSX.Element {
  const { language } = useI18n();
  const copy = getTeamMatchesCopy(language);
  const params = useLocalSearchParams<{ teamId?: string | string[] }>();
  const teamId = Array.isArray(params.teamId) ? params.teamId[0] ?? null : params.teamId ?? null;
  const teamQuery = useTeamDetailQuery(teamId, Boolean(teamId));
  const currentRole = teamQuery.data?.currentMembership?.role ?? null;
  const canCreate = currentRole === "owner" || currentRole === "manager";
  const [pickerMode, setPickerMode] = useState<PickerMode>(null);
  const [teamKeyword, setTeamKeyword] = useState("");
  const [selectedOpponent, setSelectedOpponent] = useState<TeamRecord | null>(null);
  const [selectedTournamentTeams, setSelectedTournamentTeams] = useState<TeamRecord[]>([]);

  const dateOptions = useMemo(() => buildDateOptions(language, 90), [language]);
  const timeOptions = useMemo(() => buildTimeOptions(), []);

  const schema = useMemo(
    () =>
      z
        .object({
          match_type: z.enum(["friendly", "league", "tournament"], { message: copy.validationMatchType }),
          away_team_id: z.string().nullable(),
          opponent_tbd: z.boolean(),
          date_value: z.string(),
          time_value: z.string(),
          venue_name: z.string(),
          tournament_name: z.string(),
          tournament_team_ids: z.array(z.string()),
        })
        .superRefine((value, context) => {
          if (value.match_type === "friendly") {
            if (!value.away_team_id && !value.opponent_tbd) {
              context.addIssue({ code: z.ZodIssueCode.custom, message: copy.validationOpponent, path: ["away_team_id"] });
            }
            if (!value.date_value) {
              context.addIssue({ code: z.ZodIssueCode.custom, message: copy.validationDate, path: ["date_value"] });
            }
            if (!value.time_value) {
              context.addIssue({ code: z.ZodIssueCode.custom, message: copy.validationTime, path: ["time_value"] });
            }
            if (value.date_value && value.time_value && !isFutureScheduledAt(combineScheduledAt(value.date_value, value.time_value))) {
              context.addIssue({ code: z.ZodIssueCode.custom, message: copy.validationFuture, path: ["date_value"] });
            }
          }

          if (value.match_type === "tournament") {
            if (!value.tournament_name.trim()) {
              context.addIssue({ code: z.ZodIssueCode.custom, message: copy.tournamentValidationName, path: ["tournament_name"] });
            }
            if (value.tournament_team_ids.length < 2 || value.tournament_team_ids.length > 4) {
              context.addIssue({ code: z.ZodIssueCode.custom, message: copy.tournamentValidationTeams, path: ["tournament_team_ids"] });
            }
          }
        }),
    [
      copy.tournamentValidationName,
      copy.tournamentValidationTeams,
      copy.validationDate,
      copy.validationFuture,
      copy.validationMatchType,
      copy.validationOpponent,
      copy.validationTime,
    ],
  );

  const form = useForm<MatchCreateFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      match_type: "friendly",
      away_team_id: null,
      opponent_tbd: true,
      date_value: dateOptions[0]?.value ?? "",
      time_value: timeOptions[0]?.value ?? "",
      venue_name: "",
      tournament_name: "",
      tournament_team_ids: [],
    },
  });

  const watchedType = form.watch("match_type");
  const watchedErrors = form.formState.errors;

  useEffect(() => {
    const hostTeam = teamQuery.data?.team;
    if (!hostTeam) {
      return;
    }

    setSelectedTournamentTeams((current) => {
      if (current.some((team) => team.id === hostTeam.id)) {
        return current;
      }
      return [hostTeam, ...current];
    });
  }, [teamQuery.data?.team]);

  useEffect(() => {
    form.setValue(
      "tournament_team_ids",
      selectedTournamentTeams.map((team) => team.id),
      { shouldValidate: watchedType === "tournament" },
    );
  }, [form, selectedTournamentTeams, watchedType]);

  const teamSearchQuery = useTeamSearchQuery(teamKeyword, Boolean(pickerMode) && teamKeyword.trim().length > 0);
  const createMatchMutation = useMatchQuery.useCreateMatch();
  const createTournamentMutation = useMatchQuery.useCreateTournament();

  const filteredTeams = useMemo(() => {
    const rows = teamSearchQuery.data ?? [];
    if (pickerMode === "opponent") {
      return rows.filter((team) => team.id !== teamId);
    }

    const selectedIds = new Set(selectedTournamentTeams.map((team) => team.id));
    return rows.filter((team) => !selectedIds.has(team.id));
  }, [pickerMode, selectedTournamentTeams, teamId, teamSearchQuery.data]);

  const openPicker = (mode: PickerMode): void => {
    setTeamKeyword("");
    setPickerMode(mode);
  };

  const closePicker = (): void => {
    setPickerMode(null);
    setTeamKeyword("");
  };

  const selectOpponent = (team: TeamRecord): void => {
    setSelectedOpponent(team);
    form.setValue("away_team_id", team.id, { shouldValidate: true });
    form.setValue("opponent_tbd", false, { shouldValidate: true });
    closePicker();
  };

  const addTournamentTeam = (team: TeamRecord): void => {
    setSelectedTournamentTeams((current) => [...current, team]);
    closePicker();
  };

  const removeTournamentTeam = (teamIdToRemove: string): void => {
    const hostTeamId = teamQuery.data?.team?.id ?? null;
    if (teamIdToRemove === hostTeamId) {
      return;
    }
    setSelectedTournamentTeams((current) => current.filter((team) => team.id !== teamIdToRemove));
  };

  const handleSubmit = form.handleSubmit(async (values) => {
    if (!teamId) {
      return;
    }

    try {
      if (values.match_type === "tournament") {
        const provinceCode = teamQuery.data?.team?.province_code;
        if (!provinceCode) {
          throw new Error("Team region is required.");
        }

        const tournament = await createTournamentMutation.mutateAsync({
          name: values.tournament_name.trim(),
          host_team_id: teamId,
          province_code: provinceCode,
          team_ids: values.tournament_team_ids,
        });

        router.replace({
          pathname: "/(tabs)/team/[teamId]/tournament/[tournamentId]",
          params: { teamId, tournamentId: tournament.id },
        });
        return;
      }

      await createMatchMutation.mutateAsync({
        home_team_id: teamId,
        away_team_id: values.opponent_tbd ? null : values.away_team_id,
        scheduled_at: combineScheduledAt(values.date_value, values.time_value),
        venue_name: values.venue_name.trim() || null,
        sport_type: "soccer",
        match_type: values.match_type,
        tier_id: null,
      });

      router.replace({ pathname: "/(tabs)/team/[teamId]/matches", params: { teamId } });
    } catch (error) {
      Alert.alert("KickGo", error instanceof Error ? error.message : copy.createLoading);
    }
  });

  if (!canCreate) {
    return (
      <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
        <View style={styles.container}>
          <TeamMatchInlineHeader title={copy.createTitle} onBack={() => router.back()} />
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>{copy.validationOpponent}</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <TeamMatchInlineHeader title={copy.createTitle} onBack={() => router.back()} />

        <Text style={styles.sectionTitle}>{copy.matchTypeLabel}</Text>
        <View style={styles.typeRow}>
          {MATCH_TYPE_OPTIONS.map((option) => {
            const isSelected = watchedType === option.value;
            const optionLabel =
              option.value === "friendly" ? copy.typeFriendly : option.value === "league" ? copy.typeLeague : copy.typeTournament;

            return (
              <Pressable
                key={option.value}
                disabled={option.disabled}
                onPress={() => form.setValue("match_type", option.value, { shouldValidate: true })}
                style={[styles.typePill, isSelected ? styles.typePillActive : null, option.disabled ? styles.typePillDisabled : null]}
              >
                {option.disabled ? (
                  <View style={styles.soonBadge}>
                    <Text style={styles.soonBadgeLabel}>{copy.leagueSoonBadge}</Text>
                  </View>
                ) : null}
                <Ionicons color={isSelected ? "#0f766e" : "#64748b"} name={option.icon} size={18} />
                <Text style={[styles.typeLabel, isSelected ? styles.typeLabelActive : null]}>{optionLabel}</Text>
              </Pressable>
            );
          })}
        </View>

        {watchedType === "friendly" ? (
          <>
            <Text style={styles.sectionTitle}>{copy.opponentLabel}</Text>
            <Pressable onPress={() => openPicker("opponent")} style={styles.searchTrigger}>
              <Text style={selectedOpponent ? styles.triggerValue : styles.triggerPlaceholder}>{selectedOpponent?.name ?? copy.opponentSearch}</Text>
              <Ionicons color="#64748b" name="search-outline" size={18} />
            </Pressable>
            <Pressable
              onPress={() => {
                const next = !form.watch("opponent_tbd");
                form.setValue("opponent_tbd", next, { shouldValidate: true });
                if (next) {
                  setSelectedOpponent(null);
                  form.setValue("away_team_id", null, { shouldValidate: true });
                }
              }}
              style={styles.toggleRow}
            >
              <Ionicons color={form.watch("opponent_tbd") ? "#0f766e" : "#94a3b8"} name={form.watch("opponent_tbd") ? "checkmark-circle" : "ellipse-outline"} size={20} />
              <Text style={styles.toggleLabel}>{copy.opponentUnknownToggle}</Text>
            </Pressable>
            {watchedErrors.away_team_id ? <Text style={styles.errorText}>{watchedErrors.away_team_id.message}</Text> : null}

            <View style={styles.gridRow}>
              <View style={styles.gridField}>
                <SelectField
                  label={copy.dateLabel}
                  onChange={(value) => form.setValue("date_value", value, { shouldValidate: true })}
                  options={dateOptions}
                  placeholder={copy.dateLabel}
                  value={form.watch("date_value")}
                />
              </View>
              <View style={styles.gridField}>
                <SelectField
                  label={copy.timeLabel}
                  onChange={(value) => form.setValue("time_value", value, { shouldValidate: true })}
                  options={timeOptions}
                  placeholder={copy.timeLabel}
                  value={form.watch("time_value")}
                />
              </View>
            </View>
            {watchedErrors.date_value ? <Text style={styles.errorText}>{watchedErrors.date_value.message}</Text> : null}
            {watchedErrors.time_value ? <Text style={styles.errorText}>{watchedErrors.time_value.message}</Text> : null}

            <Text style={styles.sectionTitle}>{copy.venueLabel}</Text>
            <TextInput
              onChangeText={(value) => form.setValue("venue_name", value)}
              placeholder={copy.venueFallback}
              placeholderTextColor="#9ca3af"
              style={styles.input}
              value={form.watch("venue_name")}
            />
          </>
        ) : null}

        {watchedType === "tournament" ? (
          <>
            <Text style={styles.sectionTitle}>{copy.tournamentNameLabel}</Text>
            <TextInput
              onChangeText={(value) => form.setValue("tournament_name", value, { shouldValidate: true })}
              placeholder={copy.tournamentNamePlaceholder}
              placeholderTextColor="#9ca3af"
              style={styles.input}
              value={form.watch("tournament_name")}
            />
            {watchedErrors.tournament_name ? <Text style={styles.errorText}>{watchedErrors.tournament_name.message}</Text> : null}

            <View style={styles.tournamentHeaderRow}>
              <Text style={styles.sectionTitle}>{copy.tournamentTeamsTitle}</Text>
              <Text style={styles.countHint}>{`${selectedTournamentTeams.length}/4`}</Text>
            </View>
            <Text style={styles.helperText}>{copy.tournamentTeamsHint}</Text>
            <View style={styles.teamList}>
              {selectedTournamentTeams.map((team, index) => {
                const isHost = team.id === teamQuery.data?.team?.id;
                return (
                  <View key={team.id} style={styles.selectedTeamCard}>
                    <View style={styles.selectedTeamContent}>
                      <Text style={styles.selectedTeamName}>{team.name}</Text>
                      <Text style={styles.selectedTeamMeta}>{isHost ? copy.tournamentHostBadge : `${copy.tournamentTeamsCount} ${index + 1}`}</Text>
                    </View>
                    {!isHost ? (
                      <Pressable onPress={() => removeTournamentTeam(team.id)} style={styles.removeButton}>
                        <Text style={styles.removeButtonLabel}>{copy.removeTeam}</Text>
                      </Pressable>
                    ) : null}
                  </View>
                );
              })}
            </View>
            {watchedErrors.tournament_team_ids ? <Text style={styles.errorText}>{watchedErrors.tournament_team_ids.message}</Text> : null}

            {selectedTournamentTeams.length < 4 ? (
              <Pressable onPress={() => openPicker("tournament")} style={styles.addTeamButton}>
                <Ionicons color="#0f766e" name="add-circle-outline" size={18} />
                <Text style={styles.addTeamButtonLabel}>{copy.tournamentAddTeam}</Text>
              </Pressable>
            ) : (
              <Text style={styles.helperText}>{copy.tournamentMaxTeams}</Text>
            )}

            <View style={styles.tournamentHintCard}>
              <Ionicons color="#0f766e" name="shuffle-outline" size={18} />
              <Text style={styles.tournamentHintText}>{copy.tournamentBracketHint}</Text>
            </View>
          </>
        ) : null}

        <PrimaryButton
          isDisabled={createMatchMutation.isPending || createTournamentMutation.isPending}
          label={
            watchedType === "tournament"
              ? createTournamentMutation.isPending
                ? copy.tournamentCreateLoading
                : copy.typeTournament
              : createMatchMutation.isPending
                ? copy.createLoading
                : copy.submitCreate
          }
          onPress={() => void handleSubmit()}
        />
      </ScrollView>

      <TeamPickerSheet
        closeLabel={copy.backToMatches}
        copy={copy}
        emptyText={copy.opponentSearchEmpty}
        keyword={teamKeyword}
        onClose={closePicker}
        onKeywordChange={setTeamKeyword}
        onSelect={pickerMode === "opponent" ? selectOpponent : addTournamentTeam}
        teams={filteredTeams}
        title={pickerMode === "opponent" ? copy.opponentLabel : copy.tournamentSelectTeam}
        visible={Boolean(pickerMode)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#ffffff" },
  container: { flex: 1, padding: 20 },
  content: { padding: 20, gap: 16, paddingBottom: 40 },
  sectionTitle: { fontSize: 15, fontWeight: "800", color: "#0f172a" },
  typeRow: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  typePill: {
    minWidth: 104,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    position: "relative",
  },
  typePillActive: { borderColor: "#0f766e", backgroundColor: "#ecfdf5" },
  typePillDisabled: { opacity: 0.45 },
  soonBadge: {
    position: "absolute",
    top: -6,
    right: 6,
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 3,
    backgroundColor: "#e5e7eb",
  },
  soonBadgeLabel: { fontSize: 10, fontWeight: "700", color: "#475569" },
  typeLabel: { fontSize: 13, fontWeight: "700", color: "#334155" },
  typeLabelActive: { color: "#0f766e" },
  searchTrigger: {
    minHeight: 54,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  triggerValue: { fontSize: 15, color: "#0f172a" },
  triggerPlaceholder: { fontSize: 15, color: "#9ca3af" },
  toggleRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  toggleLabel: { fontSize: 14, fontWeight: "600", color: "#334155" },
  gridRow: { flexDirection: "row", gap: 12 },
  gridField: { flex: 1 },
  input: {
    minHeight: 54,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    paddingHorizontal: 16,
    fontSize: 15,
    color: "#0f172a",
    backgroundColor: "#ffffff",
  },
  errorText: { fontSize: 12, color: "#dc2626", marginTop: -8 },
  emptyCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#f8fafc",
    padding: 20,
  },
  emptyText: { fontSize: 14, color: "#475569" },
  tournamentHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  countHint: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748b",
  },
  helperText: {
    fontSize: 13,
    color: "#64748b",
  },
  teamList: {
    gap: 10,
  },
  selectedTeamCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  selectedTeamContent: {
    flex: 1,
    gap: 4,
  },
  selectedTeamName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
  },
  selectedTeamMeta: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "600",
  },
  removeButton: {
    borderRadius: 999,
    backgroundColor: "#fee2e2",
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  removeButtonLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#b91c1c",
  },
  addTeamButton: {
    minHeight: 50,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#0f766e",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  addTeamButtonLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f766e",
  },
  tournamentHintCard: {
    borderRadius: 18,
    backgroundColor: "#ecfdf5",
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  tournamentHintText: {
    flex: 1,
    fontSize: 13,
    color: "#0f172a",
    lineHeight: 20,
  },
});