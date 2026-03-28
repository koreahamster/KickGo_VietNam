import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { getTeamShellCopy } from "@/features/team-shell.copy";
import type { SupportedLanguage } from "@/types/profile.types";

type TeamFabSheetProps = {
  visible: boolean;
  language: SupportedLanguage;
  onClose: () => void;
  onCreate: () => void;
  onJoin: () => void;
};

export function TeamFabSheet(props: TeamFabSheetProps): JSX.Element {
  const { visible, language, onClose, onCreate, onJoin } = props;
  const copy = getTeamShellCopy(language);

  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={visible}>
      <Pressable onPress={onClose} style={styles.overlay}>
        <Pressable onPress={(event) => event.stopPropagation()} style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>{copy.sheetTitle}</Text>

          <Pressable onPress={onCreate} style={({ pressed }) => [styles.actionRow, pressed ? styles.pressed : null]}>
            <View style={styles.iconWrap}>
              <Ionicons color="#ffffff" name="add" size={20} />
            </View>
            <View style={styles.copyWrap}>
              <Text style={styles.actionTitle}>{copy.createTeam}</Text>
              <Text style={styles.actionBody}>{copy.sheetCreateHint}</Text>
            </View>
            <Ionicons color="#9ca3af" name="chevron-forward" size={18} />
          </Pressable>

          <Pressable onPress={onJoin} style={({ pressed }) => [styles.actionRow, pressed ? styles.pressed : null]}>
            <View style={[styles.iconWrap, styles.iconWrapAlt]}>
              <Ionicons color="#0f766e" name="key-outline" size={18} />
            </View>
            <View style={styles.copyWrap}>
              <Text style={styles.actionTitle}>{copy.joinByCode}</Text>
              <Text style={styles.actionBody}>{copy.sheetJoinHint}</Text>
            </View>
            <Ionicons color="#9ca3af" name="chevron-forward" size={18} />
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.32)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
    gap: 12,
  },
  handle: {
    alignSelf: "center",
    width: 48,
    height: 5,
    borderRadius: 999,
    backgroundColor: "#d1d5db",
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 4,
  },
  actionRow: {
    minHeight: 78,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  pressed: { opacity: 0.88 },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#10231f",
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapAlt: {
    backgroundColor: "#dff7ee",
  },
  copyWrap: {
    flex: 1,
    gap: 4,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },
  actionBody: {
    fontSize: 13,
    lineHeight: 18,
    color: "#6b7280",
  },
});
