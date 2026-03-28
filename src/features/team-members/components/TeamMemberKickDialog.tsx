import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { TEAM_MEMBERS_COPY, type TeamMembersLocale } from "@/features/team-members/team-members.copy";

type TeamMemberKickDialogProps = {
  locale: TeamMembersLocale;
  visible: boolean;
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function TeamMemberKickDialog(props: TeamMemberKickDialogProps): JSX.Element {
  const { locale, visible, isSubmitting, onCancel, onConfirm } = props;
  const copy = TEAM_MEMBERS_COPY[locale];

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>{copy.kickTitle}</Text>
          <Text style={styles.body}>{copy.kickBody}</Text>
          <View style={styles.actions}>
            <Pressable disabled={isSubmitting} onPress={onCancel} style={styles.cancelButton}>
              <Text style={styles.cancelLabel}>{copy.cancel}</Text>
            </Pressable>
            <Pressable
              disabled={isSubmitting}
              onPress={onConfirm}
              style={[styles.confirmButton, isSubmitting ? styles.buttonDisabled : null]}
            >
              <Text style={styles.confirmLabel}>{copy.kickAction}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "rgba(15, 23, 42, 0.42)",
  },
  card: {
    width: "100%",
    borderRadius: 24,
    backgroundColor: "#ffffff",
    paddingHorizontal: 22,
    paddingVertical: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
  },
  body: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 21,
    color: "#4b5563",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 22,
  },
  cancelButton: {
    flex: 1,
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "#f3f4f6",
  },
  cancelLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  confirmButton: {
    flex: 1,
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "#ef4444",
  },
  confirmLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: "#ffffff",
  },
  buttonDisabled: {
    opacity: 0.55,
  },
});
