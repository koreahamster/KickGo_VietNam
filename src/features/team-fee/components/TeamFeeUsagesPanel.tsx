import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { formatVnd } from "@/features/team-fee.helpers";
import type { TeamFeeCopy } from "@/features/team-fee.copy";
import type { TeamFeeUsage } from "@/types/team-fee.types";

type TeamFeeUsagesPanelProps = {
  copy: TeamFeeCopy;
  usages: TeamFeeUsage[];
  canManage: boolean;
  isSubmitting: boolean;
  onSubmitUsage: (input: { amount: number; description: string; usedAt: string }) => Promise<void>;
};

type UsageDraft = {
  amount: string;
  description: string;
  usedAt: string;
};

const TODAY = new Date().toISOString().slice(0, 10);

export function TeamFeeUsagesPanel(props: TeamFeeUsagesPanelProps): JSX.Element {
  const { copy, usages, canManage, isSubmitting, onSubmitUsage } = props;
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [draft, setDraft] = useState<UsageDraft>({ amount: "", description: "", usedAt: TODAY });

  const totalUsage = useMemo(() => usages.reduce((sum, item) => sum + item.amount, 0), [usages]);

  const resetDraft = (): void => {
    setDraft({ amount: "", description: "", usedAt: TODAY });
  };

  const closeComposer = (): void => {
    if (isSubmitting) {
      return;
    }
    setIsComposerOpen(false);
    resetDraft();
  };

  const handleSave = async (): Promise<void> => {
    const amount = Number(draft.amount.replace(/[^0-9]/g, ""));
    if (!Number.isFinite(amount) || amount <= 0) {
      return;
    }
    if (!draft.description.trim()) {
      return;
    }
    if (!draft.usedAt.trim()) {
      return;
    }

    await onSubmitUsage({
      amount,
      description: draft.description.trim(),
      usedAt: draft.usedAt.trim(),
    });
    closeComposer();
  };

  return (
    <View style={styles.panelWrap}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>{copy.usageTitle}</Text>
        {canManage ? (
          <Pressable onPress={() => setIsComposerOpen(true)} style={({ pressed }) => [styles.addButton, pressed ? styles.pressed : null]}>
            <Ionicons color="#ffffff" name="add" size={16} />
            <Text style={styles.addButtonLabel}>{copy.usageAdd}</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.cardList}>
        {usages.length === 0 ? <Text style={styles.emptyLabel}>{copy.usageEmpty}</Text> : null}
        {usages.map((usage) => (
          <View key={usage.id} style={styles.usageRow}>
            <View style={styles.usageCopy}>
              <Text style={styles.usageDate}>{usage.used_at}</Text>
              <Text style={styles.usageDescription}>{usage.description}</Text>
            </View>
            <Text style={styles.usageAmount}>-{formatVnd(usage.amount)} VND</Text>
          </View>
        ))}
      </View>

      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>{copy.usageTotal}</Text>
        <Text style={styles.totalValue}>{formatVnd(totalUsage)} VND</Text>
      </View>

      <Modal animationType="slide" onRequestClose={closeComposer} transparent visible={isComposerOpen}>
        <Pressable onPress={closeComposer} style={styles.overlay}>
          <Pressable onPress={(event) => event.stopPropagation()} style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{copy.expenseFormTitle}</Text>
              <Pressable onPress={closeComposer} style={({ pressed }) => [styles.closeButton, pressed ? styles.pressed : null]}>
                <Ionicons color="#111827" name="close" size={18} />
              </Pressable>
            </View>

            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>{copy.usageAmount}</Text>
                <TextInput
                  keyboardType="number-pad"
                  onChangeText={(value) => setDraft((current) => ({ ...current, amount: value }))}
                  placeholder="0"
                  placeholderTextColor="#9ca3af"
                  style={styles.input}
                  value={draft.amount}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>{copy.usageDescription}</Text>
                <TextInput
                  onChangeText={(value) => setDraft((current) => ({ ...current, description: value }))}
                  placeholder={copy.usageDescription}
                  placeholderTextColor="#9ca3af"
                  style={[styles.input, styles.textarea]}
                  multiline
                  textAlignVertical="top"
                  value={draft.description}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>{copy.usageDate}</Text>
                <TextInput
                  onChangeText={(value) => setDraft((current) => ({ ...current, usedAt: value }))}
                  placeholder={copy.expenseDatePlaceholder}
                  placeholderTextColor="#9ca3af"
                  style={styles.input}
                  value={draft.usedAt}
                />
              </View>

              <Pressable disabled={isSubmitting} onPress={() => void handleSave()} style={({ pressed }) => [styles.submitButton, (pressed || isSubmitting) ? styles.pressed : null]}>
                <Text style={styles.submitButtonLabel}>{copy.usageSubmit}</Text>
              </Pressable>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  panelWrap: { gap: 16 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: "#111827" },
  addButton: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 999, backgroundColor: "#111827", paddingHorizontal: 12, paddingVertical: 8 },
  addButtonLabel: { fontSize: 12, fontWeight: "700", color: "#ffffff" },
  cardList: { borderRadius: 20, backgroundColor: "#ffffff", padding: 18, gap: 12 },
  emptyLabel: { fontSize: 14, color: "#6b7280", lineHeight: 20 },
  usageRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 12, borderRadius: 16, backgroundColor: "#f9fafb", padding: 14 },
  usageCopy: { flex: 1, gap: 4 },
  usageDate: { fontSize: 12, fontWeight: "700", color: "#6b7280" },
  usageDescription: { fontSize: 14, fontWeight: "700", color: "#111827", lineHeight: 20 },
  usageAmount: { fontSize: 14, fontWeight: "800", color: "#dc2626" },
  totalCard: { borderRadius: 20, backgroundColor: "#111827", paddingHorizontal: 18, paddingVertical: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  totalLabel: { fontSize: 13, fontWeight: "700", color: "#d1d5db" },
  totalValue: { fontSize: 18, fontWeight: "800", color: "#ffffff" },
  overlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(15,23,42,0.36)" },
  sheet: { maxHeight: "86%", borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: "#ffffff", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 28 },
  sheetHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 18 },
  sheetTitle: { fontSize: 18, fontWeight: "800", color: "#111827" },
  closeButton: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center", backgroundColor: "#f3f4f6" },
  fieldGroup: { marginBottom: 16, gap: 8 },
  fieldLabel: { fontSize: 14, fontWeight: "700", color: "#111827" },
  input: { minHeight: 52, borderRadius: 14, borderWidth: 1, borderColor: "#d1d5db", backgroundColor: "#ffffff", paddingHorizontal: 14, fontSize: 15, color: "#111827" },
  textarea: { minHeight: 120, paddingVertical: 12 },
  submitButton: { marginTop: 8, minHeight: 52, borderRadius: 14, backgroundColor: "#ef4444", alignItems: "center", justifyContent: "center" },
  submitButtonLabel: { fontSize: 15, fontWeight: "800", color: "#ffffff" },
  pressed: { opacity: 0.88 },
});
