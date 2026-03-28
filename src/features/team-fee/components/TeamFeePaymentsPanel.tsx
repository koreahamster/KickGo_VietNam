import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import {
  buildMonthlyMemberRows,
  formatVnd,
  formatYearMonthLabel,
  getCurrentYearMonth,
  groupPerMatchRecords,
} from "@/features/team-fee.helpers";
import type { TeamFeeCopy } from "@/features/team-fee.copy";
import type { TeamMatchSummaryRecord } from "@/types/match.types";
import type { TeamFeeRecord, TeamFeeSettings } from "@/types/team-fee.types";
import type { TeamRosterMemberRecord } from "@/types/team.types";

type TeamFeePaymentsPanelProps = {
  copy: TeamFeeCopy;
  language: string;
  teamId: string;
  currentUserId: string | null;
  settings: TeamFeeSettings | null;
  records: TeamFeeRecord[];
  members: TeamRosterMemberRecord[];
  matches: TeamMatchSummaryRecord[];
  yearMonth: string;
  onChangeYearMonth: (next: string) => void;
  canManage: boolean;
  isConfirming: boolean;
  onConfirmPayment: (recordId: string) => Promise<void>;
  onConfirmPayments: (recordIds: string[]) => Promise<void>;
};

type MonthlyMemberRow = ReturnType<typeof buildMonthlyMemberRows>[number];

function MemberBadge(props: { paid: boolean; label: string }): JSX.Element {
  return (
    <View style={[styles.statusBadge, props.paid ? styles.statusPaid : styles.statusUnpaid]}>
      <Text style={[styles.statusLabel, props.paid ? styles.statusLabelPaid : styles.statusLabelUnpaid]}>{props.label}</Text>
    </View>
  );
}

export function TeamFeePaymentsPanel(props: TeamFeePaymentsPanelProps): JSX.Element {
  const { copy, language, teamId, currentUserId, settings, records, members, matches, yearMonth, onChangeYearMonth, canManage, isConfirming, onConfirmPayment, onConfirmPayments } = props;
  const feeType = settings?.fee_type ?? "monthly";
  const monthlyRows = useMemo(
    () => buildMonthlyMemberRows(members, records.filter((record) => record.year_month === yearMonth || record.year_month === null)),
    [members, records, yearMonth],
  );
  const monthlyPaidCount = monthlyRows.filter((row) => row.record?.is_paid).length;
  const monthlyUnpaidCount = monthlyRows.length - monthlyPaidCount;
  const progressRatio = monthlyRows.length > 0 ? monthlyPaidCount / monthlyRows.length : 0;
  const progressPercent = Math.round(progressRatio * 100);
  const perMatchGroups = useMemo(() => groupPerMatchRecords(records), [records]);
  const matchMap = useMemo(() => new Map(matches.map((item) => [item.match.id, item])), [matches]);
  const showMonthly = feeType === "monthly" || feeType === "mixed";
  const showPerMatch = feeType === "per_match" || feeType === "mixed";
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedRecordIds, setSelectedRecordIds] = useState<string[]>([]);
  const [confirmingRow, setConfirmingRow] = useState<MonthlyMemberRow | null>(null);

  const unpaidSelectableRows = useMemo(
    () => monthlyRows.filter((row) => row.record && !row.record.is_paid),
    [monthlyRows],
  );

  const handleRowPress = (row: MonthlyMemberRow): void => {
    const isPaid = row.record?.is_paid ?? false;
    if (selectionMode) {
      toggleSelection(row);
      return;
    }
    if (row.record && !isPaid) {
      if (canManage) {
        setConfirmingRow(row);
        return;
      }
      if (currentUserId === row.memberId) {
        Alert.alert(copy.tabTitle, copy.requestManagerConfirm);
      }
      return;
    }

    router.push({ pathname: "/(tabs)/team/[teamId]/fee-history", params: { teamId, memberId: row.memberId } });
  };

  const toggleSelection = (row: MonthlyMemberRow): void => {
    const recordId = row.record?.id ?? null;
    const isPaid = row.record?.is_paid ?? false;
    if (!recordId || isPaid) {
      return;
    }

    setSelectedRecordIds((current) =>
      current.includes(recordId) ? current.filter((value) => value !== recordId) : [...current, recordId],
    );
  };

  const handleBulkConfirm = async (): Promise<void> => {
    if (selectedRecordIds.length === 0) {
      return;
    }

    await onConfirmPayments(selectedRecordIds);
    setSelectedRecordIds([]);
    setSelectionMode(false);
  };

  const handleSelectAll = (): void => {
    setSelectedRecordIds(unpaidSelectableRows.map((row) => row.record!.id));
  };

  const handleHistoryPress = (memberId?: string): void => {
    router.push({ pathname: "/(tabs)/team/[teamId]/fee-history", params: memberId ? { teamId, memberId } : { teamId } });
  };

  return (
    <View style={styles.panelWrap}>
      {showMonthly ? (
        <View style={styles.sectionCard}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.sectionTitle}>{formatYearMonthLabel(yearMonth, language)}</Text>
              <Text style={styles.sectionCaption}>{copy.monthlyMembersLabel}</Text>
            </View>
            <View style={styles.headerActions}>
              <Pressable onPress={() => handleHistoryPress()} style={styles.ghostButton}>
                <Text style={styles.ghostButtonLabel}>{copy.yearViewAction}</Text>
              </Pressable>
              {canManage ? (
                <Pressable
                  onPress={() => {
                    setSelectionMode((current) => {
                      if (current) {
                        setSelectedRecordIds([]);
                      }
                      return !current;
                    });
                  }}
                  style={styles.ghostButton}
                >
                  <Text style={styles.ghostButtonLabel}>{selectionMode ? copy.cancelSelection : copy.selectionMode}</Text>
                </Pressable>
              ) : null}
            </View>
          </View>

          <View style={styles.monthRow}>
            <Pressable onPress={() => onChangeYearMonth(moveMonth(yearMonth, -1))} style={styles.navButton}>
              <Ionicons color="#111827" name="chevron-back" size={18} />
            </Pressable>
            <Text style={styles.monthLabel}>{formatYearMonthLabel(yearMonth, language)}</Text>
            <Pressable onPress={() => onChangeYearMonth(moveMonth(yearMonth, 1))} style={styles.navButton}>
              <Ionicons color="#111827" name="chevron-forward" size={18} />
            </Pressable>
          </View>

          <View style={styles.progressCard}>
            <View style={styles.progressHeaderRow}>
              <Text style={styles.progressTitle}>{copy.progressTitle}</Text>
              <Text style={styles.progressPercent}>{progressPercent}%</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${Math.max(progressPercent, monthlyRows.length > 0 ? 8 : 0)}%` }]} />
            </View>
            <View style={styles.progressStatsRow}>
              <View style={styles.progressStatItem}>
                <Text style={styles.progressPaidText}>✅ {copy.progressPaidLabel} {monthlyPaidCount}</Text>
              </View>
              <View style={styles.progressStatItem}>
                <Text style={styles.progressUnpaidText}>❌ {copy.progressUnpaidLabel} {monthlyUnpaidCount}</Text>
              </View>
            </View>
            <Text style={styles.progressMeta}>
              {copy.progressTotalLabel} {monthlyRows.length} · {copy.progressPaidLabel} {monthlyPaidCount}
            </Text>
          </View>

          {selectionMode && canManage ? (
            <View style={styles.selectionToolbar}>
              <Pressable onPress={handleSelectAll} style={styles.inlineTextButton}>
                <Text style={styles.inlineTextButtonLabel}>{copy.selectAllUnpaid}</Text>
              </Pressable>
            </View>
          ) : null}

          {monthlyRows.length === 0 ? <Text style={styles.emptyLabel}>{copy.noMonthlyFeeRecords}</Text> : null}
          {monthlyRows.map((row) => {
            const paid = row.record?.is_paid ?? false;
            const isSelectable = Boolean(row.record) && !paid;
            const isSelected = row.record ? selectedRecordIds.includes(row.record.id) : false;
            return (
              <Pressable key={row.memberId} onPress={() => handleRowPress(row)} style={({ pressed }) => [styles.memberRow, pressed ? styles.memberRowPressed : null]}>
                <View style={styles.memberMeta}>
                  {selectionMode && canManage ? (
                    <View style={[styles.checkboxWrap, !isSelectable ? styles.checkboxDisabled : null, isSelected ? styles.checkboxSelected : null]}>
                      {isSelected ? <Ionicons color="#ffffff" name="checkmark" size={14} /> : null}
                    </View>
                  ) : null}
                  <View style={styles.avatarWrap}>
                    <Text style={styles.avatarLabel}>{row.displayName.slice(0, 1).toUpperCase()}</Text>
                  </View>
                  <View style={styles.memberCopy}>
                    <Text style={styles.memberName}>
                      {row.displayName}
                      {row.squadNumber ? `  #${row.squadNumber}` : ""}
                    </Text>
                    <Text style={styles.memberSub}>{row.record ? `${formatVnd(row.record.amount)} VND` : `0 VND`}</Text>
                  </View>
                </View>
                <View style={styles.memberActions}>
                  <MemberBadge paid={paid} label={paid ? copy.paid : copy.unpaid} />
                  {!selectionMode ? (
                    <Pressable onPress={() => handleHistoryPress(row.memberId)} style={styles.arrowButton}>
                      <Ionicons color="#6b7280" name="chevron-forward" size={18} />
                    </Pressable>
                  ) : null}
                </View>
              </Pressable>
            );
          })}

          {selectionMode && canManage ? (
            <View style={styles.bulkActionBar}>
              <Text style={styles.bulkActionText}>{selectedRecordIds.length} {copy.selectedCount}</Text>
              <Pressable disabled={selectedRecordIds.length === 0 || isConfirming} onPress={() => void handleBulkConfirm()} style={[styles.bulkActionButton, selectedRecordIds.length === 0 || isConfirming ? styles.bulkActionButtonDisabled : null]}>
                <Text style={styles.bulkActionButtonLabel}>{copy.bulkConfirm}</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      ) : null}

      {showPerMatch ? (
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>{copy.perMatchSection}</Text>
          {perMatchGroups.length === 0 ? <Text style={styles.emptyLabel}>{copy.noMatchFeeRecords}</Text> : null}
          {perMatchGroups.map((group) => {
            const summary = matchMap.get(group.matchId);
            const title = summary ? `${summary.homeTeam?.name ?? "KickGo"} vs ${summary.opponentDisplayName}` : group.matchId.slice(0, 8);
            return (
              <View key={group.matchId} style={styles.matchGroup}>
                <Text style={styles.matchTitle}>{title}</Text>
                {group.items.map((record) => (
                  <View key={record.id} style={styles.matchRecordRow}>
                    <View>
                      <Text style={styles.memberName}>{record.user_display_name ?? "KickGo Member"}</Text>
                      <Text style={styles.memberSub}>{formatVnd(record.amount)} VND</Text>
                    </View>
                    <MemberBadge paid={record.is_paid} label={record.is_paid ? copy.paid : copy.unpaid} />
                  </View>
                ))}
              </View>
            );
          })}
        </View>
      ) : null}

      <Modal animationType="slide" onRequestClose={() => setConfirmingRow(null)} transparent visible={Boolean(confirmingRow)}>
        <Pressable onPress={() => setConfirmingRow(null)} style={styles.modalOverlay}>
          <Pressable onPress={(event) => event.stopPropagation()} style={styles.modalSheet}>
            <Text style={styles.modalTitle}>{copy.confirmSheetTitle}</Text>
            <Text style={styles.modalMemberName}>{confirmingRow?.displayName ?? ""}</Text>
            <Text style={styles.modalBody}>{copy.confirmSheetBody}</Text>
            <View style={styles.modalActions}>
              <Pressable onPress={() => setConfirmingRow(null)} style={styles.modalSecondaryButton}>
                <Text style={styles.modalSecondaryLabel}>{copy.confirmSheetCancel}</Text>
              </Pressable>
              <Pressable
                disabled={!confirmingRow?.record || isConfirming}
                onPress={async () => {
                  if (!confirmingRow?.record) {
                    return;
                  }
                  await onConfirmPayment(confirmingRow.record.id);
                  setConfirmingRow(null);
                }}
                style={[styles.modalPrimaryButton, isConfirming ? styles.bulkActionButtonDisabled : null]}
              >
                <Text style={styles.modalPrimaryLabel}>{copy.confirmSheetConfirm}</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function moveMonth(value: string, offset: number): string {
  const [year, month] = value.split("-").map(Number);
  const next = new Date(year, month - 1 + offset, 1);
  return getCurrentYearMonth(next);
}

const styles = StyleSheet.create({
  panelWrap: {
    gap: 16,
  },
  sectionCard: {
    borderRadius: 20,
    backgroundColor: "#ffffff",
    padding: 18,
    gap: 14,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  ghostButton: {
    borderRadius: 999,
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  ghostButtonLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#111827",
  },
  monthRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },
  sectionCaption: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "600",
    color: "#6b7280",
  },
  monthLabel: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },
  progressCard: {
    borderRadius: 18,
    backgroundColor: "#f9fafb",
    padding: 14,
    gap: 10,
  },
  progressHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  progressTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#111827",
  },
  progressPercent: {
    fontSize: 15,
    fontWeight: "800",
    color: "#16a34a",
  },
  progressTrack: {
    height: 12,
    borderRadius: 999,
    backgroundColor: "#e5e7eb",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#16a34a",
  },
  progressStatsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  progressStatItem: {
    flex: 1,
  },
  progressPaidText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#15803d",
  },
  progressUnpaidText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#b91c1c",
    textAlign: "right",
  },
  progressMeta: {
    fontSize: 12,
    color: "#6b7280",
  },
  selectionToolbar: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  inlineTextButton: {
    paddingVertical: 4,
  },
  inlineTextButtonLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#059669",
  },
  emptyLabel: {
    fontSize: 14,
    lineHeight: 20,
    color: "#6b7280",
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    borderRadius: 16,
    backgroundColor: "#f9fafb",
    padding: 12,
  },
  memberRowPressed: {
    opacity: 0.92,
  },
  memberMeta: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  checkboxWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: "#9ca3af",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  checkboxDisabled: {
    opacity: 0.35,
  },
  checkboxSelected: {
    borderColor: "#16a34a",
    backgroundColor: "#16a34a",
  },
  avatarWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#dbeafe",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLabel: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1d4ed8",
  },
  memberCopy: {
    flex: 1,
    gap: 4,
  },
  memberName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  memberSub: {
    fontSize: 12,
    color: "#6b7280",
  },
  memberActions: {
    alignItems: "flex-end",
    gap: 8,
  },
  arrowButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusPaid: {
    backgroundColor: "#dcfce7",
  },
  statusUnpaid: {
    backgroundColor: "#fee2e2",
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: "800",
  },
  statusLabelPaid: {
    color: "#15803d",
  },
  statusLabelUnpaid: {
    color: "#b91c1c",
  },
  bulkActionBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 18,
    backgroundColor: "#111827",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  bulkActionText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },
  bulkActionButton: {
    borderRadius: 999,
    backgroundColor: "#16a34a",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bulkActionButtonDisabled: {
    opacity: 0.45,
  },
  bulkActionButtonLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#ffffff",
  },
  matchGroup: {
    gap: 8,
    borderRadius: 16,
    backgroundColor: "#f9fafb",
    padding: 14,
  },
  matchTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#111827",
  },
  matchRecordRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(15, 23, 42, 0.35)",
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 28,
    gap: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },
  modalMemberName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  modalBody: {
    fontSize: 14,
    lineHeight: 22,
    color: "#4b5563",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 6,
  },
  modalSecondaryButton: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#d1d5db",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  modalSecondaryLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  modalPrimaryButton: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  modalPrimaryLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: "#ffffff",
  },
});
