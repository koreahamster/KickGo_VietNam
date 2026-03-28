import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

import { PrimaryButton } from "@/components/PrimaryButton";
import { useI18n } from "@/core/i18n/LanguageProvider";
import { getMercenaryCopy } from "@/features/mercenary/mercenary.copy";
import { MercenaryInlineHeader } from "@/features/mercenary/components/MercenaryInlineHeader";
import { useCreateMercenaryPost } from "@/hooks/useMercenaryQuery";
import { useTeamMatches } from "@/hooks/useMatchQuery";
import { useTeamDetailQuery } from "@/hooks/useTeamDetailQuery";
import type { PlayerPosition } from "@/types/profile.types";

const POSITIONS: PlayerPosition[] = ["GK", "CB", "LB", "RB", "CDM", "CM", "CAM", "LM", "RM", "LW", "RW", "CF", "ST"];
const COUNTS = Array.from({ length: 11 }, (_, index) => index + 1);

type FormValues = {
  needed_positions: PlayerPosition[];
  needed_count: number;
  match_id: string | null;
  description: string;
};

export default function TeamMercenaryCreateScreen(): JSX.Element {
  const { language } = useI18n();
  const copy = getMercenaryCopy(language);
  const params = useLocalSearchParams<{ teamId?: string | string[] }>();
  const teamId = Array.isArray(params.teamId) ? params.teamId[0] ?? null : params.teamId ?? null;
  const teamQuery = useTeamDetailQuery(teamId, Boolean(teamId));
  const now = new Date();
  const matchesQuery = useTeamMatches(teamId, now.getUTCFullYear(), now.getUTCMonth() + 1, Boolean(teamId));
  const mutation = useCreateMercenaryPost();

  const schema = useMemo(
    () =>
      z.object({
        needed_positions: z.array(z.enum(POSITIONS as [PlayerPosition, ...PlayerPosition[]])).min(1, copy.neededPositionsRequired),
        needed_count: z.number().min(1, copy.neededCountRequired),
        match_id: z.string().nullable(),
        description: z.string(),
      }),
    [copy.neededCountRequired, copy.neededPositionsRequired],
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      needed_positions: [],
      needed_count: 1,
      match_id: null,
      description: "",
    },
  });

  const canManage = teamQuery.data?.currentMembership?.role === "owner" || teamQuery.data?.currentMembership?.role === "manager";
  const scheduledMatches = (matchesQuery.data ?? []).filter((item) => item.match.status === "scheduled");

  const togglePosition = (position: PlayerPosition): void => {
    const current = form.getValues("needed_positions");
    form.setValue(
      "needed_positions",
      current.includes(position) ? current.filter((item) => item !== position) : [...current, position],
      { shouldValidate: true },
    );
  };

  const submit = form.handleSubmit(async (values) => {
    if (!teamId || !teamQuery.data?.team?.province_code) {
      Alert.alert("KickGo", copy.provinceRequired);
      return;
    }

    try {
      await mutation.mutateAsync({
        team_id: teamId,
        match_id: values.match_id,
        needed_positions: values.needed_positions,
        needed_count: values.needed_count,
        province_code: teamQuery.data.team.province_code,
        description: values.description.trim() || null,
      });
      Alert.alert("KickGo", copy.createSuccess);
      router.replace({ pathname: "/(tabs)/team/[teamId]/mercenary", params: { teamId } });
    } catch (error) {
      Alert.alert("KickGo", error instanceof Error ? error.message : copy.requestFailed);
    }
  });

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
        <MercenaryInlineHeader backLabel={copy.inlineBack} onBack={() => router.replace({ pathname: "/(tabs)/team/[teamId]/mercenary", params: { teamId: teamId ?? "" } })} title={copy.createTitle} />

        <View style={styles.card}>
          <Text style={styles.label}>{copy.positionsLabel}</Text>
          <View style={styles.chipWrap}>
            {POSITIONS.map((position) => {
              const selected = form.watch("needed_positions").includes(position);
              return (
                <Pressable key={position} onPress={() => togglePosition(position)} style={[styles.chip, selected ? styles.chipActive : null]}>
                  <Text style={[styles.chipLabel, selected ? styles.chipLabelActive : null]}>{position}</Text>
                </Pressable>
              );
            })}
          </View>
          {form.formState.errors.needed_positions ? <Text style={styles.errorText}>{form.formState.errors.needed_positions.message}</Text> : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>{copy.neededCountLabel}</Text>
          <View style={styles.chipWrap}>
            {COUNTS.map((count) => {
              const selected = form.watch("needed_count") === count;
              return (
                <Pressable key={count} onPress={() => form.setValue("needed_count", count, { shouldValidate: true })} style={[styles.chip, selected ? styles.chipActive : null]}>
                  <Text style={[styles.chipLabel, selected ? styles.chipLabelActive : null]}>{count}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>{copy.linkedMatchLabel}</Text>
          <Pressable onPress={() => form.setValue("match_id", null)} style={[styles.matchRow, form.watch("match_id") === null ? styles.matchRowActive : null]}>
            <Text style={[styles.matchLabel, form.watch("match_id") === null ? styles.matchLabelActive : null]}>{copy.selectMatchNone}</Text>
          </Pressable>
          {scheduledMatches.map((item) => {
            const selected = form.watch("match_id") === item.match.id;
            return (
              <Pressable key={item.match.id} onPress={() => form.setValue("match_id", item.match.id)} style={[styles.matchRow, selected ? styles.matchRowActive : null]}>
                <Text style={[styles.matchLabel, selected ? styles.matchLabelActive : null]}>{item.opponentDisplayName}</Text>
                <Text style={styles.matchMeta}>{new Date(item.match.scheduled_at).toLocaleString()}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>{copy.descriptionOptional}</Text>
          <Controller
            control={form.control}
            name="description"
            render={({ field: { onBlur, onChange, value } }) => (
              <TextInput multiline onBlur={onBlur} onChangeText={onChange} placeholder={copy.createDescriptionPlaceholder} style={styles.textArea} textAlignVertical="top" value={value} />
            )}
          />
        </View>

        <PrimaryButton isDisabled={mutation.isPending} label={mutation.isPending ? copy.createSubmit : copy.createSubmit} onPress={() => void submit()} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#ffffff" },
  content: { padding: 20, gap: 16, paddingBottom: 32 },
  stateWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  stateText: { fontSize: 15, fontWeight: "700", color: "#6b7280" },
  card: { borderRadius: 22, borderWidth: 1, borderColor: "#e5e7eb", backgroundColor: "#ffffff", padding: 18, gap: 12 },
  label: { fontSize: 16, fontWeight: "800", color: "#111827" },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  chip: { borderRadius: 999, borderWidth: 1, borderColor: "#d1d5db", backgroundColor: "#ffffff", paddingHorizontal: 14, paddingVertical: 10 },
  chipActive: { borderColor: "#059669", backgroundColor: "#ecfdf5" },
  chipLabel: { fontSize: 13, fontWeight: "700", color: "#4b5563" },
  chipLabelActive: { color: "#047857" },
  matchRow: { borderRadius: 16, borderWidth: 1, borderColor: "#e5e7eb", backgroundColor: "#ffffff", paddingHorizontal: 14, paddingVertical: 12, gap: 4 },
  matchRowActive: { borderColor: "#059669", backgroundColor: "#ecfdf5" },
  matchLabel: { fontSize: 14, fontWeight: "700", color: "#111827" },
  matchLabelActive: { color: "#047857" },
  matchMeta: { fontSize: 12, color: "#6b7280" },
  textArea: { minHeight: 130, borderRadius: 18, borderWidth: 1, borderColor: "#d1d5db", paddingHorizontal: 14, paddingVertical: 14, fontSize: 14, color: "#111827" },
  errorText: { fontSize: 12, color: "#b91c1c" },
});