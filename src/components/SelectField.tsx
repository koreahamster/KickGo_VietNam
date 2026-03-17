import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useState } from "react";

import { COLORS } from "@/constants/colors";
import { SPACING } from "@/constants/spacing";
import type { SelectOption } from "@/constants/profile-options";

type SelectFieldProps = {
  label: string;
  placeholder: string;
  value: string | null;
  options: SelectOption[];
  onChange: (value: string) => void;
  isDisabled?: boolean;
};

function getLabel(options: SelectOption[], value: string | null): string | null {
  if (!value) {
    return null;
  }

  return options.find((option) => option.value === value)?.label ?? null;
}

export function SelectField(props: SelectFieldProps): JSX.Element {
  const { label, placeholder, value, options, onChange, isDisabled = false } = props;
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const selectedLabel = getLabel(options, value);

  return (
    <>
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>{label}</Text>
        <Pressable
          disabled={isDisabled}
          onPress={() => setIsVisible(true)}
          style={[styles.trigger, isDisabled && styles.disabled]}
        >
          <Text style={selectedLabel ? styles.valueText : styles.placeholderText}>
            {selectedLabel ?? placeholder}
          </Text>
        </Pressable>
      </View>

      <Modal animationType="slide" transparent visible={isVisible}>
        <View style={styles.overlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setIsVisible(false)} />
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>{label}</Text>
            <ScrollView contentContainerStyle={styles.optionList}>
              {options.map((option) => {
                const isSelected = option.value === value;

                return (
                  <Pressable
                    key={option.value}
                    onPress={() => {
                      onChange(option.value);
                      setIsVisible(false);
                    }}
                    style={[styles.option, isSelected && styles.optionSelected]}
                  >
                    <Text
                      style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
            <Pressable onPress={() => setIsVisible(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>닫기</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fieldGroup: {
    gap: SPACING.sm,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  trigger: {
    minHeight: 54,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    backgroundColor: "#fffdf8",
    justifyContent: "center",
    paddingHorizontal: SPACING.md,
  },
  disabled: {
    opacity: 0.5,
  },
  valueText: {
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  placeholderText: {
    fontSize: 15,
    color: COLORS.textMuted,
  },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.28)",
  },
  sheet: {
    maxHeight: "70%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  optionList: {
    gap: SPACING.sm,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  option: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#fffdf8",
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
  },
  optionSelected: {
    borderColor: COLORS.brand,
    backgroundColor: COLORS.brandSoft,
  },
  optionLabel: {
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  optionLabelSelected: {
    fontWeight: "700",
  },
  closeButton: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: COLORS.brand,
    paddingVertical: 14,
  },
  closeButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.brandOn,
  },
});
