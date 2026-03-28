import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

import { getTeamAnnouncementsCopy } from "@/features/team-announcements/team-announcements.copy";
import { useI18n } from "@/core/i18n/LanguageProvider";
import { useCreateAnnouncement } from "@/hooks/useTeamAnnouncementsQuery";

type AnnouncementFormValues = {
  title: string;
  body: string;
  is_pinned: boolean;
};

export default function TeamAnnouncementCreateScreen(): JSX.Element {
  const { language } = useI18n();
  const copy = getTeamAnnouncementsCopy(language);
  const params = useLocalSearchParams<{ teamId?: string | string[] }>();
  const teamId = Array.isArray(params.teamId) ? params.teamId[0] ?? null : params.teamId ?? null;
  const createMutation = useCreateAnnouncement();

  const schema = useMemo(
    () =>
      z.object({
        title: z.string().trim().min(1, copy.titleRequired).max(100, copy.titleTooLong),
        body: z.string().trim().min(1, copy.bodyRequired).max(2000, copy.bodyTooLong),
        is_pinned: z.boolean(),
      }),
    [copy.bodyRequired, copy.bodyTooLong, copy.titleRequired, copy.titleTooLong],
  );

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AnnouncementFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      body: "",
      is_pinned: false,
    },
  });

  const titleLength = watch("title")?.length ?? 0;
  const bodyLength = watch("body")?.length ?? 0;

  const handleCreate = async (values: AnnouncementFormValues): Promise<void> => {
    if (!teamId) {
      Alert.alert("KickGo", copy.createErrorFallback);
      return;
    }

    try {
      await createMutation.mutateAsync({
        team_id: teamId,
        title: values.title.trim(),
        body: values.body.trim(),
        is_pinned: values.is_pinned,
      });
      Alert.alert("KickGo", copy.createSuccess, [{ text: "OK", onPress: () => router.back() }]);
    } catch (error) {
      Alert.alert("KickGo", error instanceof Error ? error.message : copy.createErrorFallback);
    }
  };

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>{copy.writeTitle}</Text>

        <View style={styles.fieldGroup}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>{copy.titleLabel}</Text>
            <Text style={styles.counter}>{`${titleLength}/100`}</Text>
          </View>
          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                maxLength={100}
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder={copy.titlePlaceholder}
                placeholderTextColor="#9ca3af"
                style={styles.input}
                value={value}
              />
            )}
          />
          {errors.title ? <Text style={styles.errorText}>{errors.title.message}</Text> : null}
        </View>

        <View style={styles.fieldGroup}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>{copy.bodyLabel}</Text>
            <Text style={styles.counter}>{`${bodyLength}/2000`}</Text>
          </View>
          <Controller
            control={control}
            name="body"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                maxLength={2000}
                multiline
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder={copy.bodyPlaceholder}
                placeholderTextColor="#9ca3af"
                style={styles.textarea}
                textAlignVertical="top"
                value={value}
              />
            )}
          />
          {errors.body ? <Text style={styles.errorText}>{errors.body.message}</Text> : null}
        </View>

        <Controller
          control={control}
          name="is_pinned"
          render={({ field: { onChange, value } }) => (
            <View style={styles.pinCard}>
              <View style={styles.pinTextWrap}>
                <Text style={styles.label}>{copy.pinSwitchLabel}</Text>
                <Text style={styles.pinHint}>{copy.pinSwitchHint}</Text>
              </View>
              <Switch onValueChange={onChange} value={value} />
            </View>
          )}
        />

        <Pressable
          disabled={isSubmitting || createMutation.isPending}
          onPress={handleSubmit((values) => void handleCreate(values))}
          style={({ pressed }) => [styles.submitButton, (isSubmitting || createMutation.isPending) ? styles.submitButtonDisabled : null, pressed ? styles.submitButtonPressed : null]}
        >
          <Text style={styles.submitButtonLabel}>{copy.writeButton}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: "800",
    color: "#111827",
  },
  fieldGroup: {
    marginTop: 24,
    gap: 10,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  counter: {
    fontSize: 13,
    fontWeight: "600",
    color: "#9ca3af",
  },
  input: {
    minHeight: 54,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    fontSize: 15,
    color: "#111827",
  },
  textarea: {
    minHeight: 220,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    lineHeight: 22,
    color: "#111827",
  },
  pinCard: {
    marginTop: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  pinTextWrap: {
    flex: 1,
    gap: 4,
  },
  pinHint: {
    fontSize: 13,
    lineHeight: 18,
    color: "#6b7280",
  },
  errorText: {
    fontSize: 13,
    color: "#dc2626",
  },
  submitButton: {
    marginTop: 28,
    minHeight: 56,
    borderRadius: 12,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonPressed: {
    opacity: 0.88,
  },
  submitButtonLabel: {
    fontSize: 17,
    fontWeight: "800",
    color: "#ffffff",
  },
});