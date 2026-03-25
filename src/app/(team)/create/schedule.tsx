import { zodResolver } from "@hookform/resolvers/zod";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { z } from "zod";

import {
  getMatchDayOptions,
  getMatchTimeOptions,
  getTeamCreateCopy,
} from "@/constants/team-create";
import { useI18n } from "@/core/i18n/LanguageProvider";
import { getSelectedImageContentType, getSelectedImageFileName } from "@/lib/image-upload";
import { uploadTeamAsset } from "@/services/team.service";
import { useTeamCreateStore } from "@/store/team-create.store";
import type { TeamMatchDay, TeamMatchTime } from "@/types/team.types";
import { TeamCreateScreenFrame } from "@/shared/components/TeamCreateScreenFrame";

const MATCH_DAY_VALUES = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
const MATCH_TIME_VALUES = ["dawn", "morning", "day", "evening", "night"] as const;

function getStepTwoSchema(monthlyFeeValidation: string) {
  return z
    .object({
      matchDays: z.array(z.enum(MATCH_DAY_VALUES)).min(1),
      matchTimes: z.array(z.enum(MATCH_TIME_VALUES)).min(1),
      description: z.string().max(255),
      hasMonthlyFee: z.boolean(),
      monthlyFeeInput: z.string(),
    })
    .superRefine((value, ctx) => {
      if (!value.hasMonthlyFee) {
        return;
      }

      if (!/^\d+$/.test(value.monthlyFeeInput.trim())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: monthlyFeeValidation,
          path: ["monthlyFeeInput"],
        });
      }
    });
}

type StepTwoFormValues = z.infer<ReturnType<typeof getStepTwoSchema>>;

export default function TeamCreateScheduleScreen(): JSX.Element {
  const { language } = useI18n();
  const copy = getTeamCreateCopy(language);
  const draft = useTeamCreateStore();
  const [isUploading, setIsUploading] = useState(false);
  const matchDayOptions = useMemo(() => getMatchDayOptions(language), [language]);
  const matchTimeOptions = useMemo(() => getMatchTimeOptions(language), [language]);

  useEffect(() => {
    if (!draft.name || !draft.foundedDate || !draft.provinceCode || !draft.districtCode) {
      Alert.alert("KickGo", copy.stepGuard, [
        { text: "OK", onPress: () => router.replace("/(team)/create") },
      ]);
    }
  }, [copy.stepGuard, draft.districtCode, draft.foundedDate, draft.name, draft.provinceCode]);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<StepTwoFormValues>({
    resolver: zodResolver(getStepTwoSchema(copy.monthlyFeeValidation)),
    defaultValues: {
      matchDays: draft.matchDays,
      matchTimes: draft.matchTimes,
      description: draft.description,
      hasMonthlyFee: draft.hasMonthlyFee,
      monthlyFeeInput: draft.monthlyFee ? String(draft.monthlyFee) : "",
    },
  });

  const selectedDays = watch("matchDays");
  const selectedTimes = watch("matchTimes");
  const hasMonthlyFee = watch("hasMonthlyFee");
  const description = watch("description");

  const toggleDay = (value: TeamMatchDay): void => {
    const nextValues = selectedDays.includes(value)
      ? selectedDays.filter((item: TeamMatchDay) => item !== value)
      : [...selectedDays, value];
    setValue("matchDays", nextValues, { shouldValidate: true });
  };

  const toggleTime = (value: TeamMatchTime): void => {
    const nextValues = selectedTimes.includes(value)
      ? selectedTimes.filter((item: TeamMatchTime) => item !== value)
      : [...selectedTimes, value];
    setValue("matchTimes", nextValues, { shouldValidate: true });
  };

  const handlePickPhoto = async (): Promise<void> => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert("KickGo", copy.imageUploadFailed);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.92,
        allowsEditing: true,
        aspect: [16, 9],
      });

      if (result.canceled || result.assets.length === 0) {
        return;
      }

      const asset = result.assets[0];
      const contentType = getSelectedImageContentType(asset);

      if (!contentType) {
        Alert.alert("KickGo", copy.imageUploadFailed);
        return;
      }

      setIsUploading(true);
      const uploadResult = await uploadTeamAsset({
        uri: asset.uri,
        fileName: getSelectedImageFileName(asset, "team-photo", contentType),
        contentType,
        kind: "photo",
      });

      draft.patchDraft({ photoUrl: uploadResult.asset_url });
    } catch (error) {
      Alert.alert("KickGo", error instanceof Error ? error.message : copy.imageUploadFailed);
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = (values: StepTwoFormValues): void => {
    draft.patchDraft({
      matchDays: values.matchDays,
      matchTimes: values.matchTimes,
      description: values.description.trim(),
      hasMonthlyFee: values.hasMonthlyFee,
      monthlyFee: values.hasMonthlyFee ? Number(values.monthlyFeeInput) : null,
    });

    router.push("/(team)/create/tactics");
  };

  return (
    <TeamCreateScreenFrame
      step={2}
      footer={
        <Pressable
          disabled={isSubmitting || isUploading}
          onPress={handleSubmit(onSubmit)}
          style={({ pressed }) => [styles.ctaButton, (isSubmitting || isUploading) && styles.ctaButtonDisabled, pressed ? styles.ctaButtonPressed : null]}
        >
          <Text style={styles.ctaButtonLabel}>{copy.next}</Text>
        </Pressable>
      }
    >
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{copy.matchSchedule}</Text>
        <Text style={styles.helperText}>{copy.scheduleHint}</Text>
        <View style={styles.dayGrid}>
          {matchDayOptions.map((option) => {
            const selected = selectedDays.includes(option.value as TeamMatchDay);
            return (
              <Pressable
                key={option.value}
                onPress={() => toggleDay(option.value as TeamMatchDay)}
                style={[styles.dayPill, selected ? styles.selectedPill : styles.idlePill]}
              >
                <Text style={[styles.dayLabel, selected ? styles.selectedLabel : styles.idleLabel]}>{option.label}</Text>
              </Pressable>
            );
          })}
        </View>
        {errors.matchDays ? <Text style={styles.errorText}>{errors.matchDays.message as string}</Text> : null}

        <View style={styles.timeWrap}>
          {matchTimeOptions.map((option) => {
            const selected = selectedTimes.includes(option.value as TeamMatchTime);
            return (
              <Pressable
                key={option.value}
                onPress={() => toggleTime(option.value as TeamMatchTime)}
                style={[styles.timePill, selected ? styles.selectedPill : styles.idlePill]}
              >
                <Text style={[styles.timeLabel, selected ? styles.selectedLabel : styles.idleLabel]}>{option.label}</Text>
              </Pressable>
            );
          })}
        </View>
        {errors.matchTimes ? <Text style={styles.errorText}>{errors.matchTimes.message as string}</Text> : null}
      </View>

      <View style={styles.sectionDivider} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{copy.teamPhoto}</Text>
        <Pressable onPress={() => void handlePickPhoto()} style={styles.photoUploadCard}>
          {draft.photoUrl ? <Image source={{ uri: draft.photoUrl }} style={styles.photoPreview} /> : null}
          <View style={styles.photoOverlay}>
            <Text style={styles.photoButtonLabel}>{copy.uploadTeamPhoto}</Text>
          </View>
        </Pressable>
        <Text style={styles.helperText}>{copy.photoHint}</Text>
      </View>

      <View style={styles.sectionDivider} />

      <Controller
        control={control}
        name="description"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.section}>
            <View style={styles.descriptionHeader}>
              <Text style={styles.sectionTitle}>{copy.description}</Text>
              <Text style={styles.countLabel}>{`${value.length} / 255`}</Text>
            </View>
            <TextInput
              multiline
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder={copy.descriptionPlaceholder}
              placeholderTextColor="#9ca3af"
              style={styles.descriptionInput}
              textAlignVertical="top"
              value={value}
            />
            {errors.description ? <Text style={styles.errorText}>{errors.description.message}</Text> : null}
          </View>
        )}
      />

      <View style={styles.sectionDivider} />

      <View style={styles.feeRow}>
        <Pressable onPress={() => setValue("hasMonthlyFee", !hasMonthlyFee, { shouldValidate: true })} style={styles.feeToggleArea}>
          <View style={[styles.checkbox, hasMonthlyFee ? styles.checkboxChecked : null]}>
            {hasMonthlyFee ? <Ionicons color="#ffffff" name="checkmark" size={16} /> : null}
          </View>
          <View style={styles.feeTextWrap}>
            <Text style={styles.sectionTitle}>{copy.hasMonthlyFee}</Text>
            <Text style={styles.helperText}>{copy.monthlyFeeHelper}</Text>
          </View>
        </Pressable>

        <Controller
          control={control}
          name="monthlyFeeInput"
          render={({ field: { onChange, onBlur, value } }) => (
            <View style={[styles.feeInputWrap, !hasMonthlyFee ? styles.feeInputWrapDisabled : null]}>
              <TextInput
                editable={hasMonthlyFee}
                keyboardType="number-pad"
                onBlur={onBlur}
                onChangeText={(text) => onChange(text.replace(/\D/g, ""))}
                placeholder={copy.feePlaceholder}
                placeholderTextColor="#9ca3af"
                style={styles.feeInput}
                value={value}
              />
              <Text style={styles.feeUnit}>{copy.monthlyFeeUnit}</Text>
            </View>
          )}
        />
      </View>
      {errors.monthlyFeeInput ? <Text style={styles.errorText}>{errors.monthlyFeeInput.message}</Text> : null}
    </TeamCreateScreenFrame>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  helperText: {
    fontSize: 13,
    lineHeight: 18,
    color: "#6b7280",
  },
  dayGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  dayPill: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  timeWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  timePill: {
    minWidth: 124,
    minHeight: 52,
    borderRadius: 20,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  selectedPill: {
    backgroundColor: "#ffffff",
    borderColor: "#3b82f6",
  },
  idlePill: {
    backgroundColor: "#f5f5f5",
    borderColor: "#f5f5f5",
  },
  dayLabel: {
    fontSize: 16,
    fontWeight: "700",
  },
  timeLabel: {
    fontSize: 15,
    fontWeight: "700",
  },
  selectedLabel: {
    color: "#2563eb",
  },
  idleLabel: {
    color: "#4b5563",
  },
  sectionDivider: {
    marginVertical: 24,
    height: 1,
    backgroundColor: "#e5e7eb",
  },
  photoUploadCard: {
    height: 160,
    borderRadius: 20,
    backgroundColor: "#1f2233",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  photoPreview: {
    ...StyleSheet.absoluteFillObject,
  },
  photoOverlay: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.45)",
    backgroundColor: "rgba(17,24,39,0.45)",
  },
  photoButtonLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
  descriptionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  countLabel: {
    fontSize: 13,
    color: "#9ca3af",
  },
  descriptionInput: {
    minHeight: 144,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#111827",
  },
  feeRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  feeToggleArea: {
    flex: 1,
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  checkbox: {
    marginTop: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: "#ef4444",
    borderColor: "#ef4444",
  },
  feeTextWrap: {
    flex: 1,
    gap: 4,
  },
  feeInputWrap: {
    width: 146,
    minHeight: 80,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#ffffff",
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  feeInputWrapDisabled: {
    backgroundColor: "#f3f4f6",
    opacity: 0.7,
  },
  feeInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  feeUnit: {
    fontSize: 16,
    fontWeight: "700",
    color: "#6b7280",
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