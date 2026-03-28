import { zodResolver } from "@hookform/resolvers/zod";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

import { useI18n } from "@/core/i18n/LanguageProvider";
import { getTeamFeeCopy } from "@/features/team-fee.copy";
import { useFeeSettings, useUpdateFeeSettings } from "@/hooks/useTeamFeeQuery";
import { useTeamDetailQuery } from "@/hooks/useTeamDetailQuery";
import type { TeamFeeType } from "@/types/team-fee.types";

type FeeSettingsForm = {
  feeType: TeamFeeType;
  monthlyAmount: string;
  perMatchAmount: string;
};

export default function TeamFeeSettingsScreen(): JSX.Element {
  const { language } = useI18n();
  const copy = getTeamFeeCopy(language);
  const params = useLocalSearchParams<{ teamId?: string | string[] }>();
  const teamId = Array.isArray(params.teamId) ? params.teamId[0] ?? null : params.teamId ?? null;
  const detailQuery = useTeamDetailQuery(teamId, Boolean(teamId));
  const settingsQuery = useFeeSettings(teamId, Boolean(teamId));
  const updateMutation = useUpdateFeeSettings();
  const membership = detailQuery.data?.currentMembership ?? null;
  const canManage = membership?.role === "owner" || membership?.role === "manager";

  const schema = useMemo(
    () =>
      z.object({
        feeType: z.enum(["monthly", "per_match", "mixed"]),
        monthlyAmount: z.string(),
        perMatchAmount: z.string(),
      }),
    [],
  );

  const { control, handleSubmit, reset, watch } = useForm<FeeSettingsForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      feeType: "monthly",
      monthlyAmount: "0",
      perMatchAmount: "0",
    },
  });

  useEffect(() => {
    if (!settingsQuery.data) {
      return;
    }

    reset({
      feeType: settingsQuery.data.fee_type,
      monthlyAmount: String(settingsQuery.data.monthly_amount),
      perMatchAmount: String(settingsQuery.data.per_match_amount),
    });
  }, [reset, settingsQuery.data]);

  const feeType = watch("feeType");

  const backToFee = (): void => {
    if (!teamId) {
      router.back();
      return;
    }
    router.replace({ pathname: "/(tabs)/team/[teamId]/fee", params: { teamId } });
  };

  const handleSave = handleSubmit(async (values) => {
    if (!teamId) {
      return;
    }

    try {
      await updateMutation.mutateAsync({
        team_id: teamId,
        fee_type: values.feeType,
        monthly_amount: Number(values.monthlyAmount.replace(/[^0-9]/g, "") || "0"),
        per_match_amount: Number(values.perMatchAmount.replace(/[^0-9]/g, "") || "0"),
      });
      Alert.alert("KickGo", copy.saveSuccess, [{ text: "OK", onPress: backToFee }]);
    } catch (error) {
      Alert.alert("KickGo", error instanceof Error ? error.message : copy.genericError);
    }
  });

  if (!canManage) {
    return (
      <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.inlineHeader}>
            <Pressable hitSlop={10} onPress={backToFee} style={styles.backBtn}>
              <Ionicons color="#111827" name="chevron-back" size={22} />
            </Pressable>
            <Text style={styles.inlineTitle}>{copy.settingsTitle}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.description}>{copy.noPermission}</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.inlineHeader}>
          <Pressable hitSlop={10} onPress={backToFee} style={styles.backBtn}>
            <Ionicons color="#111827" name="chevron-back" size={22} />
          </Pressable>
          <Text style={styles.inlineTitle}>{copy.settingsTitle}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.description}>{copy.settingsIntro}</Text>

          <Controller
            control={control}
            name="feeType"
            render={({ field: { onChange, value } }) => (
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>{copy.feeModeLabel}</Text>
                <View style={styles.pillWrap}>
                  {(["monthly", "per_match", "mixed"] as TeamFeeType[]).map((option) => {
                    const selected = value === option;
                    const label = option === "monthly" ? copy.feeTypeMonthly : option === "per_match" ? copy.feeTypePerMatch : copy.feeTypeMixed;
                    return (
                      <Pressable key={option} onPress={() => onChange(option)} style={({ pressed }) => [styles.pill, selected ? styles.pillActive : null, pressed ? styles.pressed : null]}>
                        <Text style={[styles.pillLabel, selected ? styles.pillLabelActive : null]}>{label}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}
          />

          {(feeType === "monthly" || feeType === "mixed") ? (
            <Controller
              control={control}
              name="monthlyAmount"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>{copy.monthlyAmount}</Text>
                  <TextInput
                    keyboardType="number-pad"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    placeholder="0"
                    placeholderTextColor="#9ca3af"
                    style={styles.input}
                    value={value}
                  />
                </View>
              )}
            />
          ) : null}

          {(feeType === "per_match" || feeType === "mixed") ? (
            <Controller
              control={control}
              name="perMatchAmount"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>{copy.perMatchAmount}</Text>
                  <TextInput
                    keyboardType="number-pad"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    placeholder="0"
                    placeholderTextColor="#9ca3af"
                    style={styles.input}
                    value={value}
                  />
                </View>
              )}
            />
          ) : null}

          <Pressable disabled={updateMutation.isPending} onPress={() => void handleSave()} style={({ pressed }) => [styles.submitButton, (pressed || updateMutation.isPending) ? styles.pressed : null]}>
            <Text style={styles.submitButtonLabel}>{copy.submitSettings}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#ffffff" },
  content: { padding: 20, paddingBottom: 40 },
  inlineHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 },
  backBtn: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center", backgroundColor: "#e5e7eb" },
  inlineTitle: { fontSize: 20, fontWeight: "800", color: "#111827" },
  card: { borderRadius: 20, borderWidth: 1, borderColor: "#e5e7eb", backgroundColor: "#ffffff", padding: 20, gap: 18 },
  description: { fontSize: 14, lineHeight: 22, color: "#6b7280" },
  fieldGroup: { gap: 8 },
  label: { fontSize: 14, fontWeight: "700", color: "#111827" },
  pillWrap: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  pill: { minHeight: 44, borderRadius: 999, borderWidth: 1, borderColor: "#d1d5db", backgroundColor: "#ffffff", alignItems: "center", justifyContent: "center", paddingHorizontal: 14 },
  pillActive: { borderColor: "#16a34a", backgroundColor: "#ecfdf5" },
  pillLabel: { fontSize: 14, fontWeight: "700", color: "#4b5563" },
  pillLabelActive: { color: "#166534" },
  input: { minHeight: 52, borderRadius: 14, borderWidth: 1, borderColor: "#d1d5db", backgroundColor: "#ffffff", paddingHorizontal: 14, fontSize: 15, color: "#111827" },
  submitButton: { marginTop: 8, minHeight: 52, borderRadius: 14, backgroundColor: "#ef4444", alignItems: "center", justifyContent: "center" },
  submitButtonLabel: { fontSize: 15, fontWeight: "800", color: "#ffffff" },
  pressed: { opacity: 0.88 },
});
