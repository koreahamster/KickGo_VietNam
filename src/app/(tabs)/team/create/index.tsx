import { zodResolver } from "@hookform/resolvers/zod";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { useMemo, useState } from "react";
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
  getAgeGroupOptions,
  getDefaultTeamVisibility,
  getGenderOptions,
  getSportTypeOptions,
  getTeamCreateCopy,
  getUniformColorOptions,
} from "@/constants/team-create";
import { useI18n } from "@/core/i18n/LanguageProvider";
import { getSelectedImageContentType, getSelectedImageFileName } from "@/lib/image-upload";
import { uploadTeamAsset } from "@/services/team.service";
import { useTeamCreateStore } from "@/store/team-create.store";
import type { TeamAgeGroup, TeamGenderType, TeamSportType, TeamUniformColor } from "@/types/team.types";
import { TeamCreateScreenFrame } from "@/shared/components/TeamCreateScreenFrame";
import { TeamCreateSelectField } from "@/shared/components/TeamCreateSelectField";
import { getVietnamDistrictOptions, getVietnamProvinceOptions } from "@/shared/regions/vietnam-regions";

const SPORT_VALUES = ["soccer", "futsal", "both"] as const;
const GENDER_VALUES = ["male", "female", "mixed"] as const;
const AGE_GROUP_VALUES = ["10s", "20s", "30s", "40s", "50s", "60_plus"] as const;
const UNIFORM_COLOR_VALUES = [
  "dark_red",
  "red",
  "orange",
  "yellow",
  "dark_green",
  "green",
  "light_green",
  "navy",
  "blue",
  "sky",
  "purple",
  "black",
  "gray",
  "white",
] as const;

const stepOneSchema = z.object({
  sportType: z.enum(SPORT_VALUES),
  name: z.string().trim().min(2).max(40),
  foundedDate: z.string().regex(/^\d{8}$/),
  provinceCode: z.string().min(1),
  districtCode: z.string().min(1),
  homeGround: z.string().max(80),
  genderType: z.enum(GENDER_VALUES),
  ageGroups: z.array(z.enum(AGE_GROUP_VALUES)).min(1),
  uniformColors: z.array(z.enum(UNIFORM_COLOR_VALUES)).min(1).max(3),
});

type StepOneFormValues = z.infer<typeof stepOneSchema>;

export default function TeamCreateBasicScreen(): JSX.Element {
  const { language } = useI18n();
  const copy = getTeamCreateCopy(language);
  const draft = useTeamCreateStore();
  const [isUploading, setIsUploading] = useState(false);
  const provinceOptions = useMemo(() => getVietnamProvinceOptions(), []);
  const sportOptions = useMemo(() => getSportTypeOptions(language), [language]);
  const genderOptions = useMemo(() => getGenderOptions(language), [language]);
  const ageOptions = useMemo(() => getAgeGroupOptions(language), [language]);
  const uniformOptions = useMemo(() => getUniformColorOptions(language), [language]);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<StepOneFormValues>({
    resolver: zodResolver(stepOneSchema),
    defaultValues: {
      sportType: draft.sportType,
      name: draft.name,
      foundedDate: draft.foundedDate,
      provinceCode: draft.provinceCode,
      districtCode: draft.districtCode,
      homeGround: draft.homeGround,
      genderType: draft.genderType,
      ageGroups: draft.ageGroups,
      uniformColors: draft.uniformColors,
    },
  });

  const selectedProvinceCode = watch("provinceCode");
  const selectedAgeGroups = watch("ageGroups");
  const selectedUniformColors = watch("uniformColors");
  const selectedSportType = watch("sportType");
  const selectedGenderType = watch("genderType");
  const districtOptions = useMemo(
    () => getVietnamDistrictOptions(selectedProvinceCode || null),
    [selectedProvinceCode],
  );

  const toggleAgeGroup = (value: TeamAgeGroup): void => {
    const nextValues = selectedAgeGroups.includes(value)
      ? selectedAgeGroups.filter((item) => item !== value)
      : [...selectedAgeGroups, value];
    setValue("ageGroups", nextValues, { shouldValidate: true });
  };

  const toggleUniformColor = (value: TeamUniformColor): void => {
    const nextValues = selectedUniformColors.includes(value)
      ? selectedUniformColors.filter((item) => item !== value)
      : selectedUniformColors.length >= 3
        ? selectedUniformColors
        : [...selectedUniformColors, value];

    if (!selectedUniformColors.includes(value) && selectedUniformColors.length >= 3) {
      Alert.alert("KickGo", copy.uniformColorHint);
      return;
    }

    setValue("uniformColors", nextValues, { shouldValidate: true });
  };

  const handlePickEmblem = async (): Promise<void> => {
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
        aspect: [1, 1],
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
        fileName: getSelectedImageFileName(asset, "team-emblem", contentType),
        contentType,
        kind: "emblem",
      });

      draft.patchDraft({ emblemUrl: uploadResult.asset_url });
    } catch (error) {
      Alert.alert("KickGo", error instanceof Error ? error.message : copy.imageUploadFailed);
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = (values: StepOneFormValues): void => {
    draft.patchDraft({
      sportType: values.sportType,
      name: values.name.trim(),
      foundedDate: values.foundedDate,
      provinceCode: values.provinceCode,
      districtCode: values.districtCode,
      homeGround: values.homeGround.trim(),
      genderType: values.genderType,
      ageGroups: values.ageGroups,
      uniformColors: values.uniformColors,
    });

    router.push("/(tabs)/team/create/schedule");
  };

  return (
    <TeamCreateScreenFrame
      step={1}
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
      <View style={styles.heroRow}>
        <View style={styles.headingWrap}>
          <Text style={styles.heading}>{copy.basicHeading}</Text>
        </View>
        <Pressable onPress={() => void handlePickEmblem()} style={styles.emblemButton}>
          {draft.emblemUrl ? <Image source={{ uri: draft.emblemUrl }} style={styles.emblemImage} /> : null}
          <View style={styles.cameraBadge}>
            <Ionicons color="#111827" name="camera" size={16} />
          </View>
        </Pressable>
      </View>
      <Text style={styles.helperText}>{copy.emblemUploadHint}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>{copy.sportType}</Text>
        <View style={styles.pillRow}>
          {sportOptions.map((option) => {
            const selected = selectedSportType === option.value;
            return (
              <Pressable
                key={option.value}
                onPress={() => setValue("sportType", option.value as TeamSportType, { shouldValidate: true })}
                style={[styles.pillButton, selected ? styles.pillButtonSelected : styles.pillButtonIdle]}
              >
                <Text style={[styles.pillLabel, selected ? styles.pillLabelSelected : styles.pillLabelIdle]}>{option.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.gridTwo}>
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>{`${copy.fieldRequiredMark}${copy.teamName}`}</Text>
              <TextInput
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder={copy.teamName}
                placeholderTextColor="#9ca3af"
                style={styles.input}
                value={value}
              />
              {errors.name ? <Text style={styles.errorText}>{errors.name.message}</Text> : null}
            </View>
          )}
        />
        <Controller
          control={control}
          name="foundedDate"
          render={({ field: { onChange, onBlur, value } }) => (
            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>{`${copy.fieldRequiredMark}${copy.foundedDate}`}</Text>
              <TextInput
                keyboardType="number-pad"
                maxLength={8}
                onBlur={onBlur}
                onChangeText={(text) => onChange(text.replace(/\D/g, ""))}
                placeholder={copy.foundedDatePlaceholder}
                placeholderTextColor="#9ca3af"
                style={styles.input}
                value={value}
              />
              {errors.foundedDate ? <Text style={styles.errorText}>{errors.foundedDate.message}</Text> : null}
            </View>
          )}
        />
      </View>

      <View style={styles.gridTwo}>
        <Controller
          control={control}
          name="provinceCode"
          render={({ field: { onChange, value } }) => (
            <TeamCreateSelectField
              label={`${copy.fieldRequiredMark}${copy.province}`}
              onChange={(nextValue) => {
                onChange(nextValue);
                setValue("districtCode", "", { shouldValidate: true });
              }}
              options={provinceOptions}
              placeholder={copy.selectPlaceholder}
              value={value}
            />
          )}
        />
        <Controller
          control={control}
          name="districtCode"
          render={({ field: { onChange, value } }) => (
            <TeamCreateSelectField
              isDisabled={!selectedProvinceCode}
              label={`${copy.fieldRequiredMark}${copy.district}`}
              onChange={onChange}
              options={districtOptions}
              placeholder={copy.selectPlaceholder}
              value={value}
            />
          )}
        />
      </View>
      {(errors.provinceCode || errors.districtCode) ? (
        <Text style={styles.errorText}>{errors.provinceCode?.message ?? errors.districtCode?.message}</Text>
      ) : null}

      <Controller
        control={control}
        name="homeGround"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.inputWrap}>
            <Text style={styles.inputLabel}>{copy.homeGround}</Text>
            <View style={styles.searchField}>
              <TextInput
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder={copy.activityGroundPlaceholder}
                placeholderTextColor="#9ca3af"
                style={styles.searchInput}
                value={value}
              />
              <Ionicons color="#9ca3af" name="search" size={20} />
            </View>
          </View>
        )}
      />

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>{`${copy.fieldRequiredMark}${copy.genderType}`}</Text>
        <View style={styles.pillRow}>
          {genderOptions.map((option) => {
            const selected = selectedGenderType === option.value;
            return (
              <Pressable
                key={option.value}
                onPress={() => setValue("genderType", option.value as TeamGenderType, { shouldValidate: true })}
                style={[styles.pillButton, selected ? styles.pillButtonSelected : styles.pillButtonIdle]}
              >
                <Text style={[styles.pillLabel, selected ? styles.pillLabelSelected : styles.pillLabelIdle]}>{option.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.sectionDivider} />

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>{`${copy.fieldRequiredMark}${copy.ageGroups}`}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalWrap}>
          {ageOptions.map((option) => {
            const selected = selectedAgeGroups.includes(option.value as TeamAgeGroup);
            return (
              <Pressable
                key={option.value}
                onPress={() => toggleAgeGroup(option.value as TeamAgeGroup)}
                style={[styles.squarePill, selected ? styles.squarePillSelected : styles.squarePillIdle]}
              >
                <Text style={[styles.squarePillLabel, selected ? styles.pillLabelSelected : styles.pillLabelIdle]}>{option.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
        {errors.ageGroups ? <Text style={styles.errorText}>{errors.ageGroups.message as string}</Text> : null}
      </View>

      <View style={styles.sectionDivider} />

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>{copy.uniformColors}</Text>
        <Text style={styles.helperText}>{copy.uniformColorHint}</Text>
        <View style={styles.uniformGrid}>
          {uniformOptions.map((option) => {
            const selected = selectedUniformColors.includes(option.value as TeamUniformColor);
            const disabled = !selected && selectedUniformColors.length >= 3;
            return (
              <Pressable
                key={option.value}
                disabled={disabled}
                onPress={() => toggleUniformColor(option.value as TeamUniformColor)}
                style={[styles.uniformCard, selected ? styles.uniformCardSelected : null, disabled ? styles.uniformCardDisabled : null]}
              >
                <Ionicons color={option.color} name="shirt" size={26} />
                {selected ? (
                  <View style={styles.uniformCheckBadge}>
                    <Ionicons color="#ffffff" name="checkmark" size={12} />
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>
        {errors.uniformColors ? <Text style={styles.errorText}>{errors.uniformColors.message as string}</Text> : null}
      </View>
    </TeamCreateScreenFrame>
  );
}

const styles = StyleSheet.create({
  heroRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
  },
  headingWrap: {
    flex: 1,
  },
  heading: {
    fontSize: 34,
    lineHeight: 42,
    fontWeight: "800",
    color: "#111827",
  },
  helperText: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 18,
    color: "#6b7280",
  },
  emblemButton: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "#1f2937",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
  },
  emblemImage: {
    width: "100%",
    height: "100%",
  },
  cameraBadge: {
    position: "absolute",
    right: 2,
    bottom: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  section: {
    marginTop: 22,
    gap: 12,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  pillButton: {
    minHeight: 44,
    borderRadius: 22,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  pillButtonIdle: {
    backgroundColor: "#f5f5f5",
    borderColor: "#f5f5f5",
  },
  pillButtonSelected: {
    backgroundColor: "#ffffff",
    borderColor: "#3b82f6",
  },
  pillLabel: {
    fontSize: 16,
    fontWeight: "700",
  },
  pillLabelIdle: {
    color: "#4b5563",
  },
  pillLabelSelected: {
    color: "#2563eb",
  },
  gridTwo: {
    marginTop: 22,
    flexDirection: "row",
    gap: 12,
  },
  inputWrap: {
    flex: 1,
    gap: 8,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  input: {
    minHeight: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d1d5db",
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#111827",
    backgroundColor: "#ffffff",
  },
  searchField: {
    minHeight: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d1d5db",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
  },
  sectionDivider: {
    marginTop: 24,
    height: 1,
    backgroundColor: "#e5e7eb",
  },
  horizontalWrap: {
    gap: 10,
    paddingRight: 24,
  },
  squarePill: {
    minWidth: 74,
    minHeight: 54,
    borderRadius: 20,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  squarePillIdle: {
    backgroundColor: "#f5f5f5",
    borderColor: "#f5f5f5",
  },
  squarePillSelected: {
    backgroundColor: "#ffffff",
    borderColor: "#3b82f6",
  },
  squarePillLabel: {
    fontSize: 15,
    fontWeight: "700",
  },
  uniformGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  uniformCard: {
    width: "13%",
    minWidth: 44,
    aspectRatio: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  uniformCardSelected: {
    borderWidth: 1.5,
    borderColor: "#3b82f6",
    backgroundColor: "#eff6ff",
  },
  uniformCardDisabled: {
    opacity: 0.35,
  },
  uniformCheckBadge: {
    position: "absolute",
    right: 4,
    bottom: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    marginTop: 4,
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