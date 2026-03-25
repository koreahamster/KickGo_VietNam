import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type SelectOption = {
  label: string;
  value: string;
};

type TeamCreateSelectFieldProps = {
  label?: string;
  placeholder: string;
  value: string | null;
  options: SelectOption[];
  onChange: (value: string) => void;
  isDisabled?: boolean;
};

export function TeamCreateSelectField(props: TeamCreateSelectFieldProps): JSX.Element {
  const [visible, setVisible] = useState(false);

  const selectedLabel = useMemo(
    () => props.options.find((option) => option.value === props.value)?.label ?? null,
    [props.options, props.value],
  );

  return (
    <View style={styles.wrap}>
      {props.label ? <Text style={styles.label}>{props.label}</Text> : null}
      <Pressable
        disabled={props.isDisabled}
        onPress={() => setVisible(true)}
        style={({ pressed }) => [styles.field, props.isDisabled ? styles.fieldDisabled : null, pressed ? styles.fieldPressed : null]}
      >
        <Text style={selectedLabel ? styles.valueText : styles.placeholderText}>
          {selectedLabel ?? props.placeholder}
        </Text>
        <Ionicons color="#9ca3af" name="chevron-down" size={18} />
      </Pressable>

      <Modal animationType="slide" transparent visible={visible} onRequestClose={() => setVisible(false)}>
        <View style={styles.modalBackdrop}>
          <Pressable style={StyleSheet.absoluteFillObject} onPress={() => setVisible(false)} />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <ScrollView showsVerticalScrollIndicator={false}>
              {props.options.map((option) => {
                const isSelected = option.value === props.value;

                return (
                  <Pressable
                    key={option.value}
                    onPress={() => {
                      props.onChange(option.value);
                      setVisible(false);
                    }}
                    style={[styles.optionRow, isSelected ? styles.optionRowSelected : null]}
                  >
                    <Text style={[styles.optionText, isSelected ? styles.optionTextSelected : null]}>{option.label}</Text>
                    {isSelected ? <Ionicons color="#3b82f6" name="checkmark" size={18} /> : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  field: {
    minHeight: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
  },
  fieldDisabled: {
    backgroundColor: "#f9fafb",
    opacity: 0.6,
  },
  fieldPressed: {
    opacity: 0.9,
  },
  placeholderText: {
    fontSize: 16,
    color: "#9ca3af",
  },
  valueText: {
    fontSize: 16,
    color: "#111827",
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(15, 23, 42, 0.32)",
  },
  sheet: {
    maxHeight: "72%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
  },
  sheetHandle: {
    alignSelf: "center",
    width: 44,
    height: 5,
    borderRadius: 999,
    backgroundColor: "#d1d5db",
    marginBottom: 14,
  },
  optionRow: {
    minHeight: 52,
    borderRadius: 14,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  optionRowSelected: {
    backgroundColor: "#eff6ff",
  },
  optionText: {
    fontSize: 16,
    color: "#111827",
  },
  optionTextSelected: {
    color: "#2563eb",
    fontWeight: "700",
  },
});