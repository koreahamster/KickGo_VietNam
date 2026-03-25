import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useEffect, useMemo } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import {
  getAttackDirectionOptions,
  getDefaultTeamVisibility,
  getDefenseStyleOptions,
  getFormationOptions,
  getTacticStyleOptions,
  getTeamCreateCopy,
} from "@/constants/team-create";
import { useI18n } from "@/core/i18n/LanguageProvider";
import { createTeam } from "@/services/team.service";
import { useTeamCreateStore } from "@/store/team-create.store";
import type {
  TeamAttackDirection,
  TeamDefenseStyle,
  TeamFormation,
  TeamTacticStyle,
} from "@/types/team.types";
import { TeamCreateScreenFrame } from "@/shared/components/TeamCreateScreenFrame";
import { TeamCreateSelectField } from "@/shared/components/TeamCreateSelectField";

const FORMATION_VALUES = ["4-3-3", "4-4-2", "4-2-3-1", "3-5-2", "5-3-2", "3-4-3", "other"] as const;
const TACTIC_STYLE_VALUES = ["build_up", "counter_attack", "balanced"] as const;
const ATTACK_DIRECTION_VALUES = ["center", "both_sides", "left_side", "right_side"] as const;
const DEFENSE_STYLE_VALUES = ["man_to_man", "zone", "balanced"] as const;

const stepThreeSchema = z.object({
  formationA: z.enum(FORMATION_VALUES),
  formationB: z.enum(FORMATION_VALUES),
  tacticStyle: z.enum(TACTIC_STYLE_VALUES),
  attackDirection: z.enum(ATTACK_DIRECTION_VALUES),
  defenseStyle: z.enum(DEFENSE_STYLE_VALUES),
});

type StepThreeFormValues = z.infer<typeof stepThreeSchema>;

export default function TeamCreateTacticsScreen(): JSX.Element {
  const { language } = useI18n();
  const copy = getTeamCreateCopy(language);
  const draft = useTeamCreateStore();
  const formationOptions = useMemo(() => getFormationOptions(language), [language]);
  const tacticOptions = useMemo(() => getTacticStyleOptions(language), [language]);
  const attackOptions = useMemo(() => getAttackDirectionOptions(language), [language]);
  const defenseOptions = useMemo(() => getDefenseStyleOptions(language), [language]);

  useEffect(() => {
    if (!draft.name || !draft.foundedDate || !draft.provinceCode || !draft.districtCode || draft.matchDays.length === 0 || draft.matchTimes.length === 0) {
      Alert.alert("KickGo", copy.stepGuard, [
        { text: "OK", onPress: () => router.replace("/(team)/create") },
      ]);
    }
  }, [copy.stepGuard, draft.districtCode, draft.foundedDate, draft.matchDays.length, draft.matchTimes.length, draft.name, draft.provinceCode]);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<StepThreeFormValues>({
    resolver: zodResolver(stepThreeSchema),
    defaultValues: {
      formationA: draft.formationA || undefined,
      formationB: draft.formationB || undefined,
      tacticStyle: draft.tacticStyle || undefined,
      attackDirection: draft.attackDirection || undefined,
      defenseStyle: draft.defenseStyle || undefined,
    },
  });

  const selectedTactic = watch("tacticStyle");
  const selectedAttack = watch("attackDirection");
  const selectedDefense = watch("defenseStyle");

  const onSubmit = async (values: StepThreeFormValues): Promise<void> => {
    try {
      draft.patchDraft(values);
      const created = await createTeam({
        name: draft.name,
        sportType: draft.sportType,
        foundedDate: draft.foundedDate,
        provinceCode: draft.provinceCode,
        districtCode: draft.districtCode,
        homeGround: draft.homeGround,
        genderType: draft.genderType,
        ageGroups: draft.ageGroups,
        uniformColors: draft.uniformColors,
        emblemUrl: draft.emblemUrl,
        matchDays: draft.matchDays,
        matchTimes: draft.matchTimes,
        photoUrl: draft.photoUrl,
        description: draft.description,
        monthlyFee: draft.hasMonthlyFee ? draft.monthlyFee : null,
        formationA: values.formationA,
        formationB: values.formationB,
        tacticStyle: values.tacticStyle,
        attackDirection: values.attackDirection,
        defenseStyle: values.defenseStyle,
        visibility: getDefaultTeamVisibility(),
      });

      draft.setCreatedTeam(created);
      draft.setCreatedInviteCode(null);
      router.replace("/(team)/create/complete");
    } catch (error) {
      Alert.alert("KickGo", error instanceof Error ? error.message : "Failed to create team.");
    }
  };

  return (
    <TeamCreateScreenFrame
      step={3}
      footer={
        <Pressable
          disabled={isSubmitting}
          onPress={handleSubmit((values) => void onSubmit(values))}
          style={({ pressed }) => [styles.ctaButton, isSubmitting && styles.ctaButtonDisabled, pressed ? styles.ctaButtonPressed : null]}
        >
          <Text style={styles.ctaButtonLabel}>{copy.register}</Text>
        </Pressable>
      }
    >
      <View style={styles.heroWrap}>
        <Text style={styles.heading}>{copy.tacticsHeading}</Text>
      </View>

      <View style={styles.gridTwo}>
        <Controller
          control={control}
          name="formationA"
          render={({ field: { onChange, value } }) => (
            <TeamCreateSelectField
              label={copy.formationA}
              onChange={onChange}
              options={formationOptions}
              placeholder={copy.selectPlaceholder}
              value={value ?? null}
            />
          )}
        />
        <Controller
          control={control}
          name="formationB"
          render={({ field: { onChange, value } }) => (
            <TeamCreateSelectField
              label={copy.formationB}
              onChange={onChange}
              options={formationOptions}
              placeholder={copy.selectPlaceholder}
              value={value ?? null}
            />
          )}
        />
      </View>
      {(errors.formationA || errors.formationB) ? (
        <Text style={styles.errorText}>{errors.formationA?.message ?? errors.formationB?.message}</Text>
      ) : null}

      <View style={styles.sectionDivider} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{copy.tacticStyle}</Text>
        <View style={styles.pillRow}>
          {tacticOptions.map((option) => {
            const selected = selectedTactic === option.value;
            return (
              <Pressable
                key={option.value}
                onPress={() => setValue("tacticStyle", option.value as TeamTacticStyle, { shouldValidate: true })}
                style={[styles.pillButton, selected ? styles.selectedPill : styles.idlePill]}
              >
                <Text style={[styles.pillLabel, selected ? styles.selectedLabel : styles.idleLabel]}>{option.label}</Text>
              </Pressable>
            );
          })}
        </View>
        {errors.tacticStyle ? <Text style={styles.errorText}>{errors.tacticStyle.message}</Text> : null}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{copy.attackDirection}</Text>
        <View style={styles.pillRow}>
          {attackOptions.map((option) => {
            const selected = selectedAttack === option.value;
            return (
              <Pressable
                key={option.value}
                onPress={() => setValue("attackDirection", option.value as TeamAttackDirection, { shouldValidate: true })}
                style={[styles.pillButton, selected ? styles.selectedPill : styles.idlePill]}
              >
                <Text style={[styles.pillLabel, selected ? styles.selectedLabel : styles.idleLabel]}>{option.label}</Text>
              </Pressable>
            );
          })}
        </View>
        {errors.attackDirection ? <Text style={styles.errorText}>{errors.attackDirection.message}</Text> : null}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{copy.defenseStyle}</Text>
        <View style={styles.pillRow}>
          {defenseOptions.map((option) => {
            const selected = selectedDefense === option.value;
            return (
              <Pressable
                key={option.value}
                onPress={() => setValue("defenseStyle", option.value as TeamDefenseStyle, { shouldValidate: true })}
                style={[styles.pillButton, selected ? styles.selectedPill : styles.idlePill]}
              >
                <Text style={[styles.pillLabel, selected ? styles.selectedLabel : styles.idleLabel]}>{option.label}</Text>
              </Pressable>
            );
          })}
        </View>
        {errors.defenseStyle ? <Text style={styles.errorText}>{errors.defenseStyle.message}</Text> : null}
      </View>
    </TeamCreateScreenFrame>
  );
}

const styles = StyleSheet.create({
  heroWrap: {
    gap: 10,
  },
  heading: {
    fontSize: 34,
    lineHeight: 42,
    fontWeight: "800",
    color: "#111827",
  },
  gridTwo: {
    marginTop: 24,
    flexDirection: "row",
    gap: 12,
  },
  sectionDivider: {
    marginVertical: 24,
    height: 1,
    backgroundColor: "#e5e7eb",
  },
  section: {
    gap: 12,
    marginBottom: 26,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  pillButton: {
    minHeight: 46,
    borderRadius: 20,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  idlePill: {
    backgroundColor: "#f5f5f5",
    borderColor: "#f5f5f5",
  },
  selectedPill: {
    backgroundColor: "#ffffff",
    borderColor: "#3b82f6",
  },
  pillLabel: {
    fontSize: 15,
    fontWeight: "700",
  },
  idleLabel: {
    color: "#4b5563",
  },
  selectedLabel: {
    color: "#2563eb",
  },
  errorText: {
    marginTop: 6,
    fontSize: 13,
    color: "#dc2626",
  },
  ctaButton: {
    minHeight: 56,
    borderRadius: 12,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
  },
  ctaButtonDisabled: {
    opacity: 0.6,
  },
  ctaButtonPressed: {
    opacity: 0.88,
  },
  ctaButtonLabel: {
    fontSize: 17,
    fontWeight: "800",
    color: "#ffffff",
  },
});