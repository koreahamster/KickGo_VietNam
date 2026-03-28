import { StyleSheet, Text, View } from "react-native";

import { getPositionLabel } from "@/features/mercenary/mercenary.helpers";
import type { PlayerPosition, SupportedLanguage } from "@/types/profile.types";

export function MercenaryPositionChips(props: { positions: PlayerPosition[]; language: SupportedLanguage }): JSX.Element {
  const { positions, language } = props;

  return (
    <View style={styles.wrap}>
      {positions.map((position) => (
        <View key={position} style={styles.chip}>
          <Text style={styles.code}>{position}</Text>
          <Text numberOfLines={1} style={styles.label}>{getPositionLabel(language, position)}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  code: {
    fontSize: 12,
    fontWeight: "800",
    color: "#111827",
  },
  label: {
    fontSize: 12,
    color: "#6b7280",
  },
});