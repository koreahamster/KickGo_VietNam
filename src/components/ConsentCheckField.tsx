import { Pressable, StyleSheet, Text, View } from "react-native";

import { COLORS } from "@/constants/colors";
import { SPACING } from "@/constants/spacing";

type ConsentCheckFieldProps = {
  title: string;
  description: string;
  checked: boolean;
  onToggle: () => void;
  required?: boolean;
  disabled?: boolean;
};

export function ConsentCheckField(props: ConsentCheckFieldProps): JSX.Element {
  const { title, description, checked, onToggle, required = false, disabled = false } = props;

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      disabled={disabled}
      onPress={onToggle}
      style={({ pressed }) => [
        styles.container,
        checked && styles.checkedContainer,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <View style={[styles.checkbox, checked && styles.checkedCheckbox]}>
        <Text style={[styles.checkmark, checked && styles.checkedCheckmark]}>
          {checked ? "✓" : ""}
        </Text>
      </View>
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{title}</Text>
          {required ? <Text style={styles.required}>Required</Text> : <Text style={styles.optional}>Optional</Text>}
        </View>
        <Text style={styles.description}>{description}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    backgroundColor: "#fffdf8",
    padding: SPACING.md,
    alignItems: "flex-start",
  },
  checkedContainer: {
    borderColor: COLORS.brand,
    backgroundColor: "#f3fbf6",
  },
  pressed: { opacity: 0.88 },
  disabled: { opacity: 0.55 },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  checkedCheckbox: {
    borderColor: COLORS.brand,
    backgroundColor: COLORS.brand,
  },
  checkmark: {
    fontSize: 14,
    fontWeight: "800",
    color: "transparent",
  },
  checkedCheckmark: {
    color: COLORS.brandOn,
  },
  content: { flex: 1, gap: SPACING.sm },
  titleRow: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
  title: { fontSize: 15, fontWeight: "700", color: COLORS.textPrimary },
  required: { fontSize: 12, fontWeight: "700", color: "#b83a3a" },
  optional: { fontSize: 12, fontWeight: "700", color: COLORS.textMuted },
  description: { fontSize: 13, lineHeight: 19, color: COLORS.textSecondary },
});