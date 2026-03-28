import type { ReactNode } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

export function MercenaryInlineHeader(props: { title: string; backLabel: string; onBack: () => void; rightSlot?: ReactNode }): JSX.Element {
  return (
    <View style={styles.wrap}>
      <Pressable hitSlop={10} onPress={props.onBack} style={styles.backButton}>
        <Ionicons color="#10231f" name="chevron-back" size={20} />
        <Text style={styles.backLabel}>{props.backLabel}</Text>
      </Pressable>
      <Text numberOfLines={1} style={styles.title}>{props.title}</Text>
      <View style={styles.rightSlot}>{props.rightSlot}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 16,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    minHeight: 36,
  },
  backLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#10231f",
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
  },
  rightSlot: {
    minWidth: 48,
    alignItems: "flex-end",
  },
});