import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { useI18n } from "@/core/i18n/LanguageProvider";
import { getTeamRecruitmentCopy } from "@/features/team-recruitment/team-recruitment.copy";
import type { RecruitmentApplication } from "@/types/team.types";

type RecruitmentApplicantCardProps = {
  application: RecruitmentApplication;
  isSubmitting: boolean;
  onAccept: () => void;
  onReject: () => void;
};

function buildInitial(name: string): string {
  return name.trim().slice(0, 1).toUpperCase() || "A";
}

function formatAppliedDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
}

export default function RecruitmentApplicantCard(props: RecruitmentApplicantCardProps): JSX.Element {
  const { application, isSubmitting, onAccept, onReject } = props;
  const { language } = useI18n();
  const copy = getTeamRecruitmentCopy(language);

  return (
    <View style={styles.card}>
      {application.applicant_avatar_url ? (
        <Image source={{ uri: application.applicant_avatar_url }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarFallback}>
          <Text style={styles.avatarFallbackLabel}>{buildInitial(application.applicant_name)}</Text>
        </View>
      )}
      <View style={styles.content}>
        <Text style={styles.name}>{application.applicant_name}</Text>
        <Text style={styles.message}>{application.message || "-"}</Text>
        <Text style={styles.date}>{formatAppliedDate(application.created_at)}</Text>
      </View>
      <View style={styles.actions}>
        <Pressable disabled={isSubmitting} onPress={onAccept} style={({ pressed }) => [styles.acceptButton, pressed ? styles.pressed : null, isSubmitting ? styles.disabled : null]}>
          <Text style={styles.acceptLabel}>{copy.applicantsAccept}</Text>
        </Pressable>
        <Pressable disabled={isSubmitting} onPress={onReject} style={({ pressed }) => [styles.rejectButton, pressed ? styles.pressed : null, isSubmitting ? styles.disabled : null]}>
          <Text style={styles.rejectLabel}>{copy.applicantsReject}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    padding: 16,
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#e5e7eb",
  },
  avatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#dbeafe",
  },
  avatarFallbackLabel: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1d4ed8",
  },
  content: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 15,
    fontWeight: "800",
    color: "#111827",
  },
  message: {
    fontSize: 13,
    lineHeight: 19,
    color: "#4b5563",
  },
  date: {
    fontSize: 12,
    fontWeight: "600",
    color: "#9ca3af",
  },
  actions: {
    gap: 8,
  },
  acceptButton: {
    minWidth: 72,
    minHeight: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#dcfce7",
  },
  rejectButton: {
    minWidth: 72,
    minHeight: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fee2e2",
  },
  acceptLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#15803d",
  },
  rejectLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#dc2626",
  },
  pressed: {
    opacity: 0.82,
  },
  disabled: {
    opacity: 0.55,
  },
});