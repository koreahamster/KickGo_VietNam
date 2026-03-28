import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { useI18n } from "@/core/i18n/LanguageProvider";
import { getTeamRecruitmentCopy } from "@/features/team-recruitment/team-recruitment.copy";
import { getRecruitmentStatusTone, getTeamRecruitmentLabel } from "@/features/team-shell/team-shell.helpers";
import type { TeamRecord, TeamRecruitmentStatus } from "@/types/team.types";

type TeamRecruitmentManagerCardProps = {
  team: Pick<TeamRecord, "is_recruiting" | "recruitment_status">;
  pendingCount: number;
  isUpdating: boolean;
  onChangeStatus: (status: TeamRecruitmentStatus) => void;
  onPressApplicants: () => void;
};

type StatusOption = {
  key: TeamRecruitmentStatus;
  label: string;
  hint: string;
};

export default function TeamRecruitmentManagerCard(props: TeamRecruitmentManagerCardProps): JSX.Element {
  const { team, pendingCount, isUpdating, onChangeStatus, onPressApplicants } = props;
  const { language } = useI18n();
  const copy = getTeamRecruitmentCopy(language);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const statusLabel = getTeamRecruitmentLabel(language, team);
  const statusTone = getRecruitmentStatusTone(team);

  const options = useMemo<StatusOption[]>(
    () => [
      { key: "open", label: copy.statusOpen, hint: copy.statusOpenHint },
      { key: "closed", label: copy.statusClosed, hint: copy.statusClosedHint },
      { key: "invite_only", label: copy.statusInviteOnly, hint: copy.statusInviteOnlyHint },
    ],
    [copy.statusClosed, copy.statusClosedHint, copy.statusInviteOnly, copy.statusInviteOnlyHint, copy.statusOpen, copy.statusOpenHint],
  );

  return (
    <>
      <View style={styles.card}>
        <Text style={styles.title}>{copy.managerTitle}</Text>
        <Text style={styles.subtitle}>{copy.managerSubtitle}</Text>

        <View style={styles.section}>
          <View style={styles.row}>
            <View>
              <Text style={styles.label}>{copy.statusLabel}</Text>
              <View style={[styles.statusBadge, { backgroundColor: statusTone.backgroundColor }]}> 
                <Text style={[styles.statusBadgeLabel, { color: statusTone.color }]}>{statusLabel}</Text>
              </View>
            </View>
            <Pressable
              disabled={isUpdating}
              onPress={() => setIsSheetOpen(true)}
              style={({ pressed }) => [styles.actionButton, pressed ? styles.pressed : null, isUpdating ? styles.disabled : null]}
            >
              <Text style={styles.actionButtonLabel}>{copy.statusSheetTitle}</Text>
            </Pressable>
          </View>
        </View>

        <View style={[styles.section, styles.applicantSection]}>
          <View>
            <Text style={styles.label}>{copy.pendingApplicants}</Text>
            <Text style={styles.pendingCount}>{pendingCount}</Text>
          </View>
          <Pressable onPress={onPressApplicants} style={({ pressed }) => [styles.manageButton, pressed ? styles.pressed : null]}>
            <Text style={styles.manageButtonLabel}>{copy.manageApplicants}</Text>
            <Ionicons color="#0f766e" name="chevron-forward" size={16} />
          </Pressable>
        </View>
      </View>

      <Modal animationType="slide" onRequestClose={() => setIsSheetOpen(false)} transparent visible={isSheetOpen}>
        <View style={styles.backdrop}>
          <Pressable onPress={() => setIsSheetOpen(false)} style={StyleSheet.absoluteFillObject} />
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>{copy.statusSheetTitle}</Text>
            <View style={styles.options}>
              {options.map((option) => {
                const selected = team.recruitment_status === option.key;
                return (
                  <Pressable
                    key={option.key}
                    disabled={isUpdating}
                    onPress={() => {
                      setIsSheetOpen(false);
                      onChangeStatus(option.key);
                    }}
                    style={({ pressed }) => [
                      styles.option,
                      selected ? styles.optionSelected : null,
                      pressed ? styles.pressed : null,
                    ]}
                  >
                    <Text style={[styles.optionTitle, selected ? styles.optionTitleSelected : null]}>{option.label}</Text>
                    <Text style={styles.optionHint}>{option.hint}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    backgroundColor: "#ffffff",
    padding: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: "#6b7280",
  },
  section: {
    marginTop: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 16,
  },
  applicantSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6b7280",
  },
  statusBadge: {
    marginTop: 8,
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusBadgeLabel: {
    fontSize: 12,
    fontWeight: "800",
  },
  actionButton: {
    minHeight: 42,
    borderRadius: 12,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111827",
  },
  actionButtonLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#ffffff",
  },
  pendingCount: {
    marginTop: 6,
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
  },
  manageButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 12,
    backgroundColor: "#ecfdf5",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  manageButtonLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0f766e",
  },
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(15, 23, 42, 0.42)",
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: "#ffffff",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 28,
  },
  handle: {
    alignSelf: "center",
    width: 48,
    height: 5,
    borderRadius: 999,
    backgroundColor: "#dbe3ef",
    marginBottom: 18,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
  },
  options: {
    marginTop: 16,
    gap: 10,
  },
  option: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    padding: 16,
  },
  optionSelected: {
    borderColor: "#3b82f6",
    backgroundColor: "#eff6ff",
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#111827",
  },
  optionTitleSelected: {
    color: "#2563eb",
  },
  optionHint: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 19,
    color: "#6b7280",
  },
  pressed: {
    opacity: 0.82,
  },
  disabled: {
    opacity: 0.55,
  },
});