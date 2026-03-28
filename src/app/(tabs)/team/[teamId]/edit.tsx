import { zodResolver } from "@hookform/resolvers/zod";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

import { SelectField } from "@/components/SelectField";
import { getDistrictOptions, getProvinceOptions } from "@/constants/profile-options";
import { useI18n } from "@/core/i18n/LanguageProvider";
import { getTeamShellCopy } from "@/features/team-shell.copy";
import { useTeamDetailQuery } from "@/hooks/useTeamDetailQuery";
import { getSelectedImageContentType, getSelectedImageFileName } from "@/lib/image-upload";
import { updateTeam, uploadTeamAsset } from "@/services/team.service";

type EditTeamFormValues = {
  name: string;
  description: string;
  emblemUrl: string;
  isRecruiting: boolean;
  provinceCode: string;
  districtCode: string;
};

export default function TeamEditScreen(): JSX.Element {
  const { language } = useI18n();
  const copy = getTeamShellCopy(language);
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<{ teamId?: string | string[] }>();
  const teamId = Array.isArray(params.teamId) ? params.teamId[0] ?? null : params.teamId ?? null;
  const detailQuery = useTeamDetailQuery(teamId, Boolean(teamId));
  const team = detailQuery.data?.team ?? null;
  const membership = detailQuery.data?.currentMembership ?? null;
  const canEdit = membership?.role === "owner" || membership?.role === "manager";
  const [isUploading, setIsUploading] = useState(false);

  const backToHome = (): void => {
    router.replace({ pathname: "/(tabs)/team/[teamId]", params: { teamId: teamId ?? undefined } });
  };

  const schema = useMemo(
    () =>
      z.object({
        name: z.string().trim().min(2, copy.nameRequired).max(40, copy.nameTooLong),
        description: z.string().trim().max(255, copy.descriptionTooLong),
        emblemUrl: z.string(),
        isRecruiting: z.boolean(),
        provinceCode: z.string().min(1, copy.provinceRequired),
        districtCode: z.string().min(1, copy.districtRequired),
      }),
    [copy.descriptionTooLong, copy.districtRequired, copy.nameRequired, copy.nameTooLong, copy.provinceRequired],
  );

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EditTeamFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      emblemUrl: "",
      isRecruiting: true,
      provinceCode: "",
      districtCode: "",
    },
  });

  useEffect(() => {
    if (!team) {
      return;
    }

    reset({
      name: team.name,
      description: team.description ?? "",
      emblemUrl: team.emblem_url ?? "",
      isRecruiting: team.is_recruiting,
      provinceCode: team.province_code,
      districtCode: team.district_code,
    });
  }, [reset, team]);

  const provinceCode = watch("provinceCode");
  const districtCode = watch("districtCode");
  const emblemUrl = watch("emblemUrl");
  const recruitingValue = watch("isRecruiting");
  const provinceOptions = useMemo(() => getProvinceOptions("VN"), []);
  const districtOptions = useMemo(() => getDistrictOptions(provinceCode || null), [provinceCode]);

  useEffect(() => {
    if (!districtCode) {
      return;
    }

    const hasDistrict = districtOptions.some((option) => option.value === districtCode);
    if (!hasDistrict) {
      setValue("districtCode", "", { shouldValidate: true });
    }
  }, [districtCode, districtOptions, setValue]);

  const handlePickEmblem = async (): Promise<void> => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    });

    if (result.canceled) {
      return;
    }

    const asset = result.assets[0];
    const contentType = getSelectedImageContentType(asset);

    if (!contentType) {
      Alert.alert("KickGo", copy.imageUploadFailed);
      return;
    }

    try {
      setIsUploading(true);
      const uploadResult = await uploadTeamAsset({
        uri: asset.uri,
        fileName: getSelectedImageFileName(asset, "team-emblem", contentType),
        contentType,
        kind: "emblem",
      });

      setValue("emblemUrl", uploadResult.asset_url, {
        shouldDirty: true,
        shouldValidate: true,
      });
    } catch (error) {
      const message = error instanceof Error && error.message ? error.message : copy.imageUploadFailed;
      Alert.alert("KickGo", message);
    } finally {
      setIsUploading(false);
    }
  };

  const updateMutation = useMutation({
    mutationFn: async (values: EditTeamFormValues) => {
      if (!teamId) {
        throw new Error(copy.detailError);
      }

      return updateTeam({
        teamId,
        name: values.name.trim(),
        description: values.description.trim(),
        emblemUrl: values.emblemUrl.trim() || null,
        isRecruiting: values.isRecruiting,
        provinceCode: values.provinceCode,
        districtCode: values.districtCode,
      });
    },
    onSuccess: async () => {
      if (!teamId) {
        return;
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["team", teamId] }),
        queryClient.invalidateQueries({ queryKey: ["my-teams"] }),
      ]);
      Alert.alert("KickGo", copy.saveSuccess);
      backToHome();
    },
    onError: (error: Error) => {
      Alert.alert("KickGo", error.message || copy.saveError);
    },
  });

  const onSubmit = handleSubmit((values) => updateMutation.mutate(values));

  if (detailQuery.isLoading) {
    return (
      <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
        <View style={styles.stateWrap}>
          <Text style={styles.stateText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!team) {
    return (
      <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
        <View style={styles.stateWrap}>
          <Text style={styles.errorTitle}>{copy.detailError}</Text>
          <Pressable
            onPress={() => void detailQuery.refetch()}
            style={({ pressed }) => [styles.retryButton, pressed ? styles.pressed : null]}
          >
            <Text style={styles.retryButtonLabel}>{copy.retry}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (!canEdit) {
    return (
      <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.inlineHeader}>
            <Pressable hitSlop={10} onPress={backToHome} style={styles.backBtn}>
              <Ionicons color="#111827" name="chevron-back" size={22} />
            </Pressable>
            <Text style={styles.inlineTitle}>{copy.editTitle}</Text>
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
          <Pressable hitSlop={10} onPress={backToHome} style={styles.backBtn}>
            <Ionicons color="#111827" name="chevron-back" size={22} />
          </Pressable>
          <Text style={styles.inlineTitle}>{copy.editTitle}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.description}>{copy.editSubtitle}</Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>{copy.emblemLabel}</Text>
            <View style={styles.emblemSection}>
              <Pressable
                onPress={() => void handlePickEmblem()}
                style={({ pressed }) => [styles.emblemButton, (pressed || isUploading) ? styles.pressed : null]}
              >
                {emblemUrl ? (
                  <Image source={{ uri: emblemUrl }} style={styles.emblemImage} />
                ) : (
                  <View style={styles.emblemPlaceholder}>
                    <Ionicons color="#9ca3af" name="shield-outline" size={28} />
                  </View>
                )}
                <View style={styles.emblemBadge}>
                  <Ionicons color="#ffffff" name="camera" size={14} />
                </View>
              </Pressable>
              <Text style={styles.emblemHint}>
                {isUploading ? copy.imageUploadPending : copy.emblemUploadHint}
              </Text>
            </View>
          </View>

          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>{copy.nameLabel}</Text>
                <TextInput
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder={copy.namePlaceholder}
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
            name="description"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>{copy.descriptionLabel}</Text>
                <TextInput
                  multiline
                  numberOfLines={5}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder={copy.descriptionPlaceholder}
                  placeholderTextColor="#9ca3af"
                  style={[styles.input, styles.textArea]}
                  textAlignVertical="top"
                  value={value}
                />
                {errors.description ? <Text style={styles.errorText}>{errors.description.message}</Text> : null}
              </View>
            )}
          />

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>{copy.recruitingLabel}</Text>
            <View style={styles.pillRow}>
              <Pressable
                onPress={() => setValue("isRecruiting", true, { shouldValidate: true })}
                style={({ pressed }) => [styles.pill, recruitingValue ? styles.pillActive : null, pressed ? styles.pressed : null]}
              >
                <Text style={[styles.pillLabel, recruitingValue ? styles.pillLabelActive : null]}>{copy.editRecruitingOpen}</Text>
              </Pressable>
              <Pressable
                onPress={() => setValue("isRecruiting", false, { shouldValidate: true })}
                style={({ pressed }) => [styles.pill, !recruitingValue ? styles.pillActive : null, pressed ? styles.pressed : null]}
              >
                <Text style={[styles.pillLabel, !recruitingValue ? styles.pillLabelActive : null]}>{copy.editRecruitingClosed}</Text>
              </Pressable>
            </View>
          </View>

          <Controller
            control={control}
            name="provinceCode"
            render={({ field: { onChange, value } }) => (
              <View style={styles.fieldGroup}>
                <SelectField
                  label={copy.provinceLabel}
                  onChange={(nextValue) => {
                    onChange(nextValue);
                    setValue("districtCode", "", { shouldValidate: true });
                  }}
                  options={provinceOptions}
                  placeholder={copy.provinceLabel}
                  value={value || null}
                />
                {errors.provinceCode ? <Text style={styles.errorText}>{errors.provinceCode.message}</Text> : null}
              </View>
            )}
          />

          <Controller
            control={control}
            name="districtCode"
            render={({ field: { onChange, value } }) => (
              <View style={styles.fieldGroup}>
                <SelectField
                  isDisabled={!provinceCode}
                  label={copy.districtLabel}
                  onChange={onChange}
                  options={districtOptions}
                  placeholder={copy.districtLabel}
                  value={value || null}
                />
                {errors.districtCode ? <Text style={styles.errorText}>{errors.districtCode.message}</Text> : null}
              </View>
            )}
          />

          <Pressable
            disabled={updateMutation.isPending || isUploading}
            onPress={onSubmit}
            style={({ pressed }) => [
              styles.submitButton,
              (pressed || updateMutation.isPending || isUploading) ? styles.pressed : null,
            ]}
          >
            <Text style={styles.submitButtonLabel}>
              {updateMutation.isPending || isUploading ? copy.saving : copy.save}
            </Text>
          </Pressable>
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
    paddingBottom: 40,
  },
  inlineHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e5e7eb",
  },
  inlineTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
  },
  stateWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  stateText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6b7280",
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    padding: 20,
    gap: 18,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: "#6b7280",
  },
  fieldGroup: {
    gap: 8,
  },
  emblemSection: {
    gap: 12,
    alignItems: "center",
  },
  emblemButton: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#f9fafb",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  emblemPlaceholder: {
    width: "100%",
    height: "100%",
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f6",
  },
  emblemImage: {
    width: "100%",
    height: "100%",
    borderRadius: 48,
  },
  emblemBadge: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  emblemHint: {
    fontSize: 12,
    lineHeight: 18,
    color: "#6b7280",
    textAlign: "center",
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  input: {
    minHeight: 54,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#d1d5db",
    paddingHorizontal: 16,
    fontSize: 15,
    color: "#111827",
    backgroundColor: "#fffdf8",
  },
  textArea: {
    minHeight: 132,
    paddingTop: 14,
    paddingBottom: 14,
  },
  pillRow: {
    flexDirection: "row",
    gap: 10,
  },
  pill: {
    flex: 1,
    minHeight: 46,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  pillActive: {
    borderColor: "#16a34a",
    backgroundColor: "#ecfdf5",
  },
  pillLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#4b5563",
  },
  pillLabelActive: {
    color: "#166534",
  },
  errorText: {
    fontSize: 12,
    color: "#dc2626",
  },
  submitButton: {
    marginTop: 4,
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonLabel: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800",
  },
  retryButton: {
    marginTop: 16,
    minHeight: 46,
    borderRadius: 12,
    paddingHorizontal: 18,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },
  retryButtonLabel: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
  },
  pressed: {
    opacity: 0.88,
  },
});