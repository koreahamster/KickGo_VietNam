import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PrimaryButton } from "@/components/PrimaryButton";
import { SelectField } from "@/components/SelectField";
import { COLORS } from "@/constants/colors";
import type { SelectOption } from "@/constants/profile-options";
import { SPACING } from "@/constants/spacing";
import { getTeamHubCopy } from "@/constants/team-hub";
import { useI18n } from "@/core/i18n/LanguageProvider";
import { useTeamMatches } from "@/hooks/useTeamMatches";
import type { MatchDeadlineOption, MatchSportType, MatchTeamSide } from "@/types/match.types";

const SCHEDULE_OPTIONS: SelectOption[] = [
  { label: "2026.03.24 Tue 17:00", value: "2026-03-24T17:00:00" },
  { label: "2026.03.26 Thu 20:00", value: "2026-03-26T20:00:00" },
  { label: "2026.03.28 Sat 09:00", value: "2026-03-28T09:00:00" },
];

const DEADLINE_OPTIONS: SelectOption[] = [
  { label: "24h before", value: "24h" },
  { label: "12h before", value: "12h" },
  { label: "Before kickoff", value: "0h" },
];

const QUARTER_OPTIONS: SelectOption[] = [
  { label: "2", value: "2" },
  { label: "3", value: "3" },
  { label: "4", value: "4" },
];

const QUARTER_MINUTE_OPTIONS: SelectOption[] = [
  { label: "15", value: "15" },
  { label: "20", value: "20" },
  { label: "25", value: "25" },
  { label: "30", value: "30" },
];

function getSportType(value: "football" | "futsal"): MatchSportType {
  return value === "football" ? "soccer" : "futsal";
}

function getMatchSide(value: "home" | "away"): MatchTeamSide {
  return value;
}

function getDeadlineOption(value: string | null): MatchDeadlineOption {
  if (value === "24h" || value === "12h" || value === "0h") {
    return value;
  }

  return "0h";
}

export default function MatchCreateScreen(): JSX.Element {
  const { teamId, teamName } = useLocalSearchParams<{ teamId?: string; teamName?: string }>();
  const normalizedTeamId = typeof teamId === "string" ? teamId : null;
  const normalizedTeamName = typeof teamName === "string" && teamName.trim() ? teamName : "My Club";
  const { language } = useI18n();
  const copy = getTeamHubCopy(language);
  const { createMatch, isSubmittingMatch, matchErrorMessage, matchStatusMessage } = useTeamMatches(normalizedTeamId, {
    enabled: false,
  });

  const [sportType, setSportType] = useState<"football" | "futsal">("football");
  const [homeAway, setHomeAway] = useState<"home" | "away">("home");
  const [schedule, setSchedule] = useState<string | null>(SCHEDULE_OPTIONS[0]?.value ?? null);
  const [deadline, setDeadline] = useState<string | null>(DEADLINE_OPTIONS[2]?.value ?? null);
  const [quarterCount, setQuarterCount] = useState<string | null>(QUARTER_OPTIONS[0]?.value ?? null);
  const [quarterMinutes, setQuarterMinutes] = useState<string | null>(QUARTER_MINUTE_OPTIONS[2]?.value ?? null);
  const [opponentName, setOpponentName] = useState<string>("");
  const [venueName, setVenueName] = useState<string>("");
  const [notice, setNotice] = useState<string>("");

  const previewLabel = useMemo(() => {
    const scheduleLabel = SCHEDULE_OPTIONS.find((option) => option.value === schedule)?.label ?? "-";
    const quarterLabel = `${quarterCount ?? "-"}${copy.quarterPrefix} / ${quarterMinutes ?? "-"}${copy.perQuarterSuffix}`;
    return `${normalizedTeamName} vs ${opponentName.trim() || copy.opponentPlaceholder} / ${scheduleLabel} / ${quarterLabel}`;
  }, [copy.opponentPlaceholder, copy.perQuarterSuffix, copy.quarterPrefix, normalizedTeamName, opponentName, quarterCount, quarterMinutes, schedule]);

  const handleCreateMatch = async (): Promise<void> => {
    if (!normalizedTeamId || !schedule || !quarterCount || !quarterMinutes) {
      return;
    }

    try {
      const result = await createMatch({
        teamId: normalizedTeamId,
        scheduledAt: schedule,
        sportType: getSportType(sportType),
        side: getMatchSide(homeAway),
        deadlineOption: getDeadlineOption(deadline),
        quarterCount: Number.parseInt(quarterCount, 10),
        quarterMinutes: Number.parseInt(quarterMinutes, 10),
        opponentName: opponentName.trim(),
        venueName: venueName.trim(),
        notice: notice.trim(),
      });

      router.replace({
        pathname: "/(team)/match-detail",
        params: {
          teamId: normalizedTeamId,
          teamName: normalizedTeamName,
          matchId: result.match_id,
        },
      });
    } catch {
      // handled by hook state
    }
  };

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.safeArea} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.container}>
              <Text style={styles.title}>{copy.matchCreateTitle}</Text>
              <Text style={styles.subtitle}>{copy.matchCreateSubtitle}</Text>

              <View style={styles.previewCard}>
                <Text style={styles.previewCaption}>{copy.previewOnly}</Text>
                <Text style={styles.previewTitle}>{previewLabel}</Text>
              </View>

              <View style={styles.segmentRow}>
                <Pressable style={[styles.segmentButton, sportType === "football" && styles.segmentButtonActive]} onPress={() => setSportType("football")}>
                  <Text style={[styles.segmentText, sportType === "football" && styles.segmentTextActive]}>{copy.footballOption}</Text>
                </Pressable>
                <Pressable style={[styles.segmentButton, sportType === "futsal" && styles.segmentButtonActive]} onPress={() => setSportType("futsal")}>
                  <Text style={[styles.segmentText, sportType === "futsal" && styles.segmentTextActive]}>{copy.futsalOption}</Text>
                </Pressable>
              </View>

              <View style={styles.card}>
                <Text style={styles.label}>{copy.clubLabel}</Text>
                <View style={styles.readOnlyBox}>
                  <Text style={styles.readOnlyText}>{normalizedTeamName}</Text>
                </View>

                <Text style={styles.label}>{copy.sideLabel}</Text>
                <View style={styles.segmentRow}>
                  <Pressable style={[styles.segmentButton, homeAway === "home" && styles.segmentButtonActive]} onPress={() => setHomeAway("home")}>
                    <Text style={[styles.segmentText, homeAway === "home" && styles.segmentTextActive]}>{copy.homeOption}</Text>
                  </Pressable>
                  <Pressable style={[styles.segmentButton, homeAway === "away" && styles.segmentButtonActive]} onPress={() => setHomeAway("away")}>
                    <Text style={[styles.segmentText, homeAway === "away" && styles.segmentTextActive]}>{copy.awayOption}</Text>
                  </Pressable>
                </View>

                <SelectField label={copy.scheduleLabel} placeholder={copy.scheduleLabel} value={schedule} options={SCHEDULE_OPTIONS} onChange={setSchedule} />
                <SelectField label={copy.deadlineLabel} placeholder={copy.deadlineLabel} value={deadline} options={DEADLINE_OPTIONS} onChange={setDeadline} />
                <SelectField label={copy.quarterCountLabel} placeholder={copy.quarterCountLabel} value={quarterCount} options={QUARTER_OPTIONS} onChange={setQuarterCount} />
                <SelectField label={copy.quarterMinutesLabel} placeholder={copy.quarterMinutesLabel} value={quarterMinutes} options={QUARTER_MINUTE_OPTIONS} onChange={setQuarterMinutes} />

                <Text style={styles.label}>{copy.opponentLabel}</Text>
                <TextInput
                  style={styles.input}
                  value={opponentName}
                  onChangeText={setOpponentName}
                  placeholder={copy.opponentPlaceholder}
                  placeholderTextColor={COLORS.textMuted}
                />

                <Text style={styles.label}>{copy.venueLabel}</Text>
                <TextInput
                  style={styles.input}
                  value={venueName}
                  onChangeText={setVenueName}
                  placeholder={copy.venuePlaceholder}
                  placeholderTextColor={COLORS.textMuted}
                />

                <Text style={styles.label}>{copy.noticeLabel}</Text>
                <TextInput
                  style={styles.textArea}
                  multiline
                  textAlignVertical="top"
                  value={notice}
                  onChangeText={setNotice}
                  placeholder={copy.noticePlaceholder}
                  placeholderTextColor={COLORS.textMuted}
                />

                {matchErrorMessage ? <Text style={styles.errorText}>{matchErrorMessage}</Text> : null}
                {matchStatusMessage ? <Text style={styles.statusText}>{matchStatusMessage}</Text> : null}

                <PrimaryButton label={copy.createMatchButton} isDisabled={isSubmittingMatch} onPress={() => void handleCreateMatch()} />
                <PrimaryButton label={copy.cancelLabel} variant="outline" onPress={() => router.back()} />
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f6f4ef" },
  scrollContent: { flexGrow: 1, paddingBottom: 48 },
  container: { paddingHorizontal: SPACING.screenHorizontal, paddingVertical: SPACING.xl, gap: SPACING.lg },
  title: { fontSize: 32, fontWeight: "800", color: COLORS.textPrimary },
  subtitle: { fontSize: 15, lineHeight: 22, color: COLORS.textSecondary },
  previewCard: { borderRadius: 26, backgroundColor: "#171c2a", padding: SPACING.lg, gap: SPACING.sm },
  previewCaption: { fontSize: 13, lineHeight: 20, color: "#c5cfdf" },
  previewTitle: { fontSize: 22, fontWeight: "800", color: "#ffffff" },
  segmentRow: { flexDirection: "row", gap: SPACING.sm },
  segmentButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  segmentButtonActive: { borderColor: "#2f76ff", backgroundColor: "#eef4ff" },
  segmentText: { fontSize: 16, fontWeight: "700", color: COLORS.textSecondary },
  segmentTextActive: { color: "#2f76ff" },
  card: { borderRadius: 28, backgroundColor: "#ffffff", padding: SPACING.lg, gap: SPACING.md },
  label: { fontSize: 15, fontWeight: "700", color: COLORS.textPrimary },
  readOnlyBox: {
    minHeight: 54,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    backgroundColor: "#f4f7fb",
    justifyContent: "center",
    paddingHorizontal: SPACING.md,
  },
  readOnlyText: { fontSize: 16, fontWeight: "700", color: COLORS.textPrimary },
  input: {
    minHeight: 54,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    backgroundColor: "#fffdf8",
    paddingHorizontal: SPACING.md,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  textArea: {
    minHeight: 120,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    backgroundColor: "#fffdf8",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  errorText: { fontSize: 14, lineHeight: 20, color: "#b83a3a" },
  statusText: { fontSize: 14, lineHeight: 20, color: "#0c7a43" },
});