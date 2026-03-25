import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

type HomeSectionHeaderProps = {
  title: string;
  actionLabel?: string;
  onPress?: () => void;
  badgeCount?: number;
};

export function HomeSectionHeader(props: HomeSectionHeaderProps): JSX.Element {
  const { title, actionLabel, onPress, badgeCount } = props;

  return (
    <View style={styles.row}>
      <Pressable disabled={!onPress} onPress={onPress} style={styles.titleWrap}>
        <Text style={styles.title}>{title}</Text>
        {onPress ? <Ionicons color="#111827" name="chevron-forward" size={16} /> : null}
      </Pressable>
      {typeof badgeCount === "number" && badgeCount > 0 ? (
        <View style={styles.badge}>
          <Text style={styles.badgeLabel}>{badgeCount}</Text>
        </View>
      ) : actionLabel ? (
        <Pressable disabled={!onPress} onPress={onPress} style={styles.actionWrap}>
          <Text style={styles.actionLabel}>{actionLabel}</Text>
          <Ionicons color="#6b7280" name="chevron-forward" size={14} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  titleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  actionWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },
  badge: {
    minWidth: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    backgroundColor: "#ef4444",
  },
  badgeLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#ffffff",
  },
});