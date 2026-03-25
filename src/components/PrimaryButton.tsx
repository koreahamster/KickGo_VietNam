import { Pressable, StyleSheet, Text } from "react-native";

import { COLORS } from "@/constants/colors";
import { SPACING } from "@/constants/spacing";
import { withAppFont } from "@/constants/typography";

type ButtonVariant = "primary" | "secondary" | "outline";

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  isDisabled?: boolean;
};

export function PrimaryButton(props: PrimaryButtonProps): JSX.Element {
  const { label, onPress, variant = "primary", isDisabled = false } = props;

  return (
    <Pressable
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        variantStyles[variant],
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
      ]}
    >
      <Text style={withAppFont([styles.label, labelStyles[variant]])}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SPACING.lg,
    borderWidth: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.88,
  },
  disabled: {
    opacity: 0.55,
  },
});

const variantStyles = StyleSheet.create({
  primary: {
    borderColor: COLORS.brand,
    backgroundColor: COLORS.brand,
  },
  secondary: {
    borderColor: COLORS.brandSoft,
    backgroundColor: COLORS.brandSoft,
  },
  outline: {
    borderColor: COLORS.borderStrong,
    backgroundColor: COLORS.surface,
  },
});

const labelStyles = StyleSheet.create({
  primary: {
    color: COLORS.brandOn,
  },
  secondary: {
    color: COLORS.textPrimary,
  },
  outline: {
    color: COLORS.textPrimary,
  },
});