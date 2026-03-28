import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { getTeamShellCopy } from "@/features/team-shell.copy";
import type { SupportedLanguage } from "@/types/profile.types";

type TeamListEmptyStateProps = {
  language: SupportedLanguage;
  onCreate: () => void;
  onJoin: () => void;
};

export function TeamListEmptyState(props: TeamListEmptyStateProps): JSX.Element {
  const { language, onCreate, onJoin } = props;
  const copy = getTeamShellCopy(language);

  return (
    <View style={styles.wrap}>
      <View style={styles.iconWrap}>
        <Ionicons color="#8b9fa3" name="shield-outline" size={42} />
      </View>
      <Text style={styles.title}>{copy.emptyTitle}</Text>
      <Text style={styles.body}>{copy.emptyBody}</Text>
      <View style={styles.actions}>
        <Pressable onPress={onCreate} style={({ pressed }) => [styles.primaryButton, pressed ? styles.pressed : null]}>
          <Text style={styles.primaryLabel}>{copy.createTeam}</Text>
        </Pressable>
        <Pressable onPress={onJoin} style={({ pressed }) => [styles.secondaryButton, pressed ? styles.pressed : null]}>
          <Text style={styles.secondaryLabel}>{copy.joinByCode}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 40,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  iconWrap: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    marginTop: 20,
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
  },
  body: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 22,
    color: "#6b7280",
    textAlign: "center",
  },
  actions: {
    marginTop: 24,
    width: "100%",
    gap: 12,
  },
  primaryButton: {
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: "#10231f",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButton: {
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryLabel: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
  },
  secondaryLabel: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "800",
  },
  pressed: {
    opacity: 0.88,
  },
});
