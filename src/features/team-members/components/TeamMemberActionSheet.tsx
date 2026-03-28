import { Ionicons } from "@expo/vector-icons";
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useMemo, useState } from "react";

import { getManageableRoleLabel, type TeamMembersLocale, TEAM_MEMBERS_COPY } from "@/features/team-members/team-members.copy";
import type { ManageableTeamMemberRole } from "@/types/team.types";

type SquadNumberOption = {
  value: number | null;
  label: string;
  assigneeName: string | null;
  disabled: boolean;
};

type TeamMemberActionSheetProps = {
  locale: TeamMembersLocale;
  visible: boolean;
  canKick: boolean;
  canAssignManager: boolean;
  selectedRole: ManageableTeamMemberRole;
  selectedSquadNumber: number | null;
  squadNumberOptions: SquadNumberOption[];
  isSaving: boolean;
  onSelectRole: (role: ManageableTeamMemberRole) => void;
  onSelectSquadNumber: (value: number | null) => void;
  onApply: () => void;
  onKick: () => void;
  onClose: () => void;
};

export default function TeamMemberActionSheet(props: TeamMemberActionSheetProps): JSX.Element {
  const {
    locale,
    visible,
    canKick,
    canAssignManager,
    selectedRole,
    selectedSquadNumber,
    squadNumberOptions,
    isSaving,
    onSelectRole,
    onSelectSquadNumber,
    onApply,
    onKick,
    onClose,
  } = props;
  const copy = TEAM_MEMBERS_COPY[locale];
  const [isNumberListOpen, setIsNumberListOpen] = useState(false);

  const roleOptions = useMemo(
    () => (canAssignManager ? (["manager", "captain", "player"] as ManageableTeamMemberRole[]) : (["captain", "player"] as ManageableTeamMemberRole[])),
    [canAssignManager],
  );

  const selectedNumberOption = squadNumberOptions.find((option) => option.value === selectedSquadNumber) ?? squadNumberOptions[0];

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>{copy.roleSheetTitle}</Text>
          <Text style={styles.subtitle}>{copy.roleSheetSubtitle}</Text>

          <View style={styles.options}>
            {roleOptions.map((role) => {
              const active = selectedRole === role;
              return (
                <Pressable key={role} onPress={() => onSelectRole(role)} style={[styles.optionButton, active ? styles.optionButtonActive : null]}>
                  <Text style={[styles.optionLabel, active ? styles.optionLabelActive : null]}>{getManageableRoleLabel(locale, role)}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.numberSection}>
            <Text style={styles.numberSectionTitle}>{copy.squadNumberLabel}</Text>
            <Text style={styles.numberSectionSubtitle}>{copy.squadNumberSheetSubtitle}</Text>
            <Pressable onPress={() => setIsNumberListOpen((prev) => !prev)} style={styles.numberTrigger}>
              <Text style={styles.numberTriggerLabel}>{selectedNumberOption?.label ?? copy.squadNumberPlaceholder}</Text>
              <Ionicons color="#6b7280" name={isNumberListOpen ? "chevron-up" : "chevron-down"} size={18} />
            </Pressable>

            {isNumberListOpen ? (
              <View style={styles.numberListWrap}>
                <FlatList
                  data={squadNumberOptions}
                  keyExtractor={(item) => `${item.value ?? "none"}`}
                  renderItem={({ item }) => {
                    const active = item.value === selectedSquadNumber;
                    return (
                      <Pressable
                        disabled={item.disabled}
                        onPress={() => {
                          onSelectSquadNumber(item.value);
                          setIsNumberListOpen(false);
                        }}
                        style={[styles.numberRow, item.disabled ? styles.numberRowDisabled : null]}
                      >
                        <View style={styles.numberRowLeading}>
                          <Text style={[styles.numberValue, item.disabled ? styles.numberValueDisabled : null]}>{item.label}</Text>
                          <Text style={[styles.numberAssignee, item.disabled ? styles.numberAssigneeDisabled : null]}>
                            {item.assigneeName ?? copy.squadNumberAvailable}
                          </Text>
                        </View>
                        {active ? <Ionicons color="#16a34a" name="checkmark-circle" size={18} /> : null}
                      </Pressable>
                    );
                  }}
                  style={styles.numberList}
                />
              </View>
            ) : null}
          </View>

          <View style={styles.actions}>
            <Pressable disabled={isSaving} onPress={onClose} style={styles.cancelButton}>
              <Text style={styles.cancelButtonLabel}>{copy.cancel}</Text>
            </Pressable>
            <Pressable disabled={isSaving} onPress={onApply} style={[styles.applyButton, isSaving ? styles.buttonDisabled : null]}>
              <Text style={styles.applyButtonLabel}>{copy.applyRole}</Text>
            </Pressable>
          </View>

          {canKick ? (
            <Pressable onPress={onKick} style={styles.kickButton}>
              <Text style={styles.kickButtonLabel}>{copy.kickAction}</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
    paddingBottom: 30,
  },
  handle: {
    alignSelf: "center",
    width: 48,
    height: 5,
    borderRadius: 999,
    backgroundColor: "#dbe3ef",
    marginBottom: 18,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: "#6b7280",
  },
  options: {
    marginTop: 18,
    gap: 10,
  },
  optionButton: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  optionButtonActive: {
    borderColor: "#3b82f6",
    backgroundColor: "#eff6ff",
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  optionLabelActive: {
    color: "#2563eb",
  },
  numberSection: {
    marginTop: 18,
    gap: 10,
  },
  numberSectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#111827",
  },
  numberSectionSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: "#6b7280",
  },
  numberTrigger: {
    minHeight: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#d1d5db",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  numberTriggerLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  numberListWrap: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    overflow: "hidden",
  },
  numberList: {
    maxHeight: 240,
  },
  numberRow: {
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e7eb",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  numberRowDisabled: {
    opacity: 0.45,
  },
  numberRowLeading: {
    gap: 4,
  },
  numberValue: {
    fontSize: 14,
    fontWeight: "800",
    color: "#111827",
  },
  numberValueDisabled: {
    color: "#6b7280",
  },
  numberAssignee: {
    fontSize: 12,
    color: "#6b7280",
  },
  numberAssigneeDisabled: {
    color: "#9ca3af",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 22,
  },
  cancelButton: {
    flex: 1,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: "#eef2f7",
  },
  cancelButtonLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  applyButton: {
    flex: 1,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: "#3b82f6",
  },
  applyButtonLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: "#ffffff",
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  kickButton: {
    marginTop: 14,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: "#fee2e2",
  },
  kickButtonLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: "#dc2626",
  },
});
