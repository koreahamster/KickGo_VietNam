import { Pressable, StyleSheet, Text, View } from "react-native";

type TeamFeeSegmentTabsProps = {
  labels: {
    records: string;
    usages: string;
    accounts: string;
  };
  value: "records" | "usages" | "accounts";
  onChange: (next: "records" | "usages" | "accounts") => void;
};

const SEGMENTS: Array<{ key: "records" | "usages" | "accounts"; labelKey: keyof TeamFeeSegmentTabsProps["labels"] }> = [
  { key: "records", labelKey: "records" },
  { key: "usages", labelKey: "usages" },
  { key: "accounts", labelKey: "accounts" },
];

export function TeamFeeSegmentTabs(props: TeamFeeSegmentTabsProps): JSX.Element {
  const { labels, value, onChange } = props;

  return (
    <View style={styles.wrap}>
      {SEGMENTS.map((segment) => {
        const isActive = segment.key === value;
        return (
          <Pressable
            key={segment.key}
            onPress={() => onChange(segment.key)}
            style={({ pressed }) => [styles.button, isActive ? styles.buttonActive : null, pressed ? styles.buttonPressed : null]}
          >
            <Text style={[styles.label, isActive ? styles.labelActive : null]}>{labels[segment.labelKey]}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    borderRadius: 16,
    backgroundColor: "#f3f4f6",
    padding: 4,
    gap: 4,
  },
  button: {
    flex: 1,
    minHeight: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonActive: {
    backgroundColor: "#ffffff",
    shadowColor: "#111827",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  buttonPressed: {
    opacity: 0.92,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6b7280",
  },
  labelActive: {
    color: "#111827",
  },
});
