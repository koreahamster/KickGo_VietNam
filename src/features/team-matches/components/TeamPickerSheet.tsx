import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { PrimaryButton } from "@/components/PrimaryButton";
import type { TeamMatchesCopy } from "@/features/team-matches.copy";
import type { TeamRecord } from "@/types/team.types";

type TeamPickerSheetProps = {
  visible: boolean;
  title: string;
  keyword: string;
  onKeywordChange: (value: string) => void;
  teams: TeamRecord[];
  emptyText: string;
  closeLabel: string;
  copy: TeamMatchesCopy;
  onSelect: (team: TeamRecord) => void;
  onClose: () => void;
};

export function TeamPickerSheet(props: TeamPickerSheetProps): JSX.Element {
  const { visible, title, keyword, onKeywordChange, teams, emptyText, closeLabel, copy, onSelect, onClose } = props;

  return (
    <Modal animationType="slide" transparent visible={visible}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          <TextInput
            onChangeText={onKeywordChange}
            placeholder={copy.opponentSearchPlaceholder}
            placeholderTextColor="#9ca3af"
            style={styles.searchInput}
            value={keyword}
          />
          <ScrollView contentContainerStyle={styles.list} keyboardShouldPersistTaps="handled">
            {teams.map((team) => (
              <Pressable key={team.id} onPress={() => onSelect(team)} style={styles.item}>
                <Text style={styles.itemTitle}>{team.name}</Text>
                <Text style={styles.itemMeta}>{team.home_ground?.trim() || copy.venueFallback}</Text>
              </Pressable>
            ))}
            {keyword.trim().length > 0 && teams.length === 0 ? <Text style={styles.emptyText}>{emptyText}</Text> : null}
          </ScrollView>
          <PrimaryButton label={closeLabel} onPress={onClose} variant="outline" />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(15, 23, 42, 0.35)",
  },
  content: {
    maxHeight: "80%",
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    gap: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
  },
  searchInput: {
    minHeight: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    paddingHorizontal: 14,
    fontSize: 14,
    color: "#0f172a",
  },
  list: {
    gap: 10,
    paddingBottom: 8,
  },
  item: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    padding: 14,
    gap: 4,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
  },
  itemMeta: {
    fontSize: 13,
    color: "#64748b",
  },
  emptyText: {
    textAlign: "center",
    fontSize: 14,
    color: "#64748b",
    paddingVertical: 12,
  },
});