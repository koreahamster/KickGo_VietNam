import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useI18n } from "@/core/i18n/LanguageProvider";
import { getTeamFeeCopy } from "@/features/team-fee.copy";
import { formatVnd } from "@/features/team-fee.helpers";
import { useConfirmFeePayment, useFeeRecords, useFeeSettings } from "@/hooks/useTeamFeeQuery";
import { useTeamDetailQuery } from "@/hooks/useTeamDetailQuery";
import type { TeamFeeRecord, TeamFeeSettings } from "@/types/team-fee.types";
import type { TeamRosterMemberRecord } from "@/types/team.types";

type MonthStatus = {
  month: number;
  yearMonth: string | null;
  status: "paid" | "unpaid" | "na";
  record: TeamFeeRecord | null;
  amount: number;
};

type MemberYearRow = {
  memberId: string;
  displayName: string;
  avatarUrl: string | null;
  squadNumber: number | null;
  months: MonthStatus[];
  paidCount: number;
  applicableCount: number;
  unpaidMonths: number[];
};

const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;
const HEADER_HEIGHT = 42;
const ROW_HEIGHT = 68;
const FIXED_MEMBER_WIDTH = 148;
const MONTH_CELL_WIDTH = 32;
const RATE_CELL_WIDTH = 62;

function buildYearMonth(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

function getUnpaidSelectionKeys(row: MemberYearRow): string[] {
  return row.months.filter((item) => item.status === "unpaid" && item.yearMonth).map((item) => item.yearMonth as string);
}

function getSelectedUnpaidItems(row: MemberYearRow, selectedKeys: string[]): MonthStatus[] {
  return row.months.filter((item) => item.status === "unpaid" && item.yearMonth && selectedKeys.includes(item.yearMonth));
}

export default function TeamFeeHistoryScreen(): JSX.Element {
  const { language } = useI18n();
  const copy = getTeamFeeCopy(language);
  const params = useLocalSearchParams<{ teamId?: string | string[]; memberId?: string | string[] }>();
  const teamId = Array.isArray(params.teamId) ? params.teamId[0] ?? null : params.teamId ?? null;
  const focusedMemberId = Array.isArray(params.memberId) ? params.memberId[0] ?? null : params.memberId ?? null;
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [unpaidOnly, setUnpaidOnly] = useState(false);
  const [activeMember, setActiveMember] = useState<MemberYearRow | null>(null);
  const [selectedMonthKeys, setSelectedMonthKeys] = useState<string[]>([]);
  const autoOpenedMemberIdRef = useRef<string | null>(null);

  const detailQuery = useTeamDetailQuery(teamId, Boolean(teamId));
  const settingsQuery = useFeeSettings(teamId, Boolean(teamId));
  const recordsQuery = useFeeRecords(teamId, String(year), Boolean(teamId));
  const confirmMutation = useConfirmFeePayment();

  const membership = detailQuery.data?.currentMembership ?? null;
  const canManage = membership?.role === "owner" || membership?.role === "manager";
  const members = detailQuery.data?.members ?? [];
  const settings = settingsQuery.data ?? null;
  const records = recordsQuery.data ?? [];

  const rows = useMemo(() => buildYearRows(members, records, year, settings), [members, records, year, settings]);
  const filteredRows = useMemo(
    () => (unpaidOnly ? rows.filter((row) => row.unpaidMonths.length > 0) : rows),
    [rows, unpaidOnly],
  );

  useEffect(() => {
    if (!focusedMemberId) {
      autoOpenedMemberIdRef.current = null;
      return;
    }

    if (rows.length === 0 || autoOpenedMemberIdRef.current === focusedMemberId) {
      return;
    }

    const member = rows.find((row) => row.memberId === focusedMemberId);
    if (!member) {
      return;
    }

    autoOpenedMemberIdRef.current = focusedMemberId;
    setActiveMember(member);
    setSelectedMonthKeys(getUnpaidSelectionKeys(member));
  }, [focusedMemberId, rows]);

  const activeUnpaidItems = useMemo(
    () => (activeMember ? getSelectedUnpaidItems(activeMember, selectedMonthKeys) : []),
    [activeMember, selectedMonthKeys],
  );

  const handleOpenMember = (row: MemberYearRow): void => {
    setActiveMember(row);
    setSelectedMonthKeys(getUnpaidSelectionKeys(row));
  };

  const handleCloseModal = (): void => {
    setActiveMember(null);
    setSelectedMonthKeys([]);
  };

  const handleConfirmSelected = async (): Promise<void> => {
    if (!teamId || !activeMember || activeUnpaidItems.length === 0) {
      return;
    }

    try {
      await Promise.all(
        activeUnpaidItems.map((item) =>
          confirmMutation.mutateAsync({
            teamId,
            yearMonth: String(year),
            request: item.record
              ? {
                  fee_record_id: item.record.id,
                  note: "",
                }
              : {
                  team_id: teamId,
                  user_id: activeMember.memberId,
                  fee_type: "monthly",
                  year_month: item.yearMonth,
                  amount: item.amount,
                  note: "",
                },
          }),
        ),
      );
      handleCloseModal();
    } catch (error) {
      Alert.alert(copy.tabTitle, error instanceof Error ? error.message : copy.genericError);
    }
  };

  if (!teamId) {
    return (
      <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
        <View style={styles.stateWrap}>
          <Text style={styles.stateText}>{copy.genericError}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.inlineHeader}>
          <Pressable onPress={() => router.replace({ pathname: "/(tabs)/team/[teamId]/fee", params: { teamId } })} style={styles.backButton}>
            <Ionicons color="#111827" name="chevron-back" size={18} />
            <Text style={styles.backLabel}>{copy.annualHistoryTitle}</Text>
          </Pressable>
        </View>

        <View style={styles.yearCard}>
          <View style={styles.yearRow}>
            <Pressable onPress={() => setYear((current) => current - 1)} style={styles.navButton}>
              <Ionicons color="#111827" name="chevron-back" size={18} />
            </Pressable>
            <Text style={styles.yearLabel}>{year}</Text>
            <Pressable onPress={() => setYear((current) => current + 1)} style={styles.navButton}>
              <Ionicons color="#111827" name="chevron-forward" size={18} />
            </Pressable>
          </View>

          <View style={styles.toggleRow}>
            <Pressable onPress={() => setUnpaidOnly(false)} style={[styles.toggleButton, !unpaidOnly ? styles.toggleButtonActive : null]}>
              <Text style={[styles.toggleLabel, !unpaidOnly ? styles.toggleLabelActive : null]}>{copy.filterAllMembers}</Text>
            </Pressable>
            <Pressable onPress={() => setUnpaidOnly(true)} style={[styles.toggleButton, unpaidOnly ? styles.toggleButtonActive : null]}>
              <Text style={[styles.toggleLabel, unpaidOnly ? styles.toggleLabelActive : null]}>{copy.filterUnpaidOnly}</Text>
            </Pressable>
          </View>
        </View>

        {filteredRows.length === 0 ? <Text style={styles.emptyLabel}>{copy.noAnnualRecords}</Text> : null}

        {filteredRows.length > 0 ? (
          <View style={styles.tableCard}>
            <View style={styles.tableContainer}>
              <View style={styles.fixedColumn}>
                <View style={[styles.fixedHeaderCell, { height: HEADER_HEIGHT }]} />
                {filteredRows.map((row) => (
                  <Pressable key={`${row.memberId}-fixed`} onPress={() => handleOpenMember(row)} style={({ pressed }) => [styles.fixedMemberCell, { height: ROW_HEIGHT }, pressed ? styles.memberRowPressed : null]}>
                    <View style={styles.avatarWrap}>
                      <Text style={styles.avatarLabel}>{row.displayName.slice(0, 1).toUpperCase()}</Text>
                    </View>
                    <View style={styles.memberCopy}>
                      <Text numberOfLines={1} style={styles.memberName}>{row.displayName}</Text>
                      {row.squadNumber ? <Text style={styles.memberMeta}>#{row.squadNumber}</Text> : null}
                    </View>
                  </Pressable>
                ))}
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.monthScroll}>
                <View>
                  <View style={[styles.monthHeaderRow, { height: HEADER_HEIGHT }]}>
                    {MONTHS.map((month) => (
                      <Text key={month} style={styles.monthHeaderText}>{month}</Text>
                    ))}
                    <Text style={styles.rateHeaderText}>{copy.annualPaidRate}</Text>
                  </View>

                  {filteredRows.map((row) => (
                    <Pressable key={`${row.memberId}-months`} onPress={() => handleOpenMember(row)} style={({ pressed }) => [styles.monthsRow, { height: ROW_HEIGHT }, pressed ? styles.memberRowPressed : null]}>
                      {row.months.map((item) => (
                        <View key={`${row.memberId}-${item.month}`} style={styles.monthCell}>
                          {item.status === "paid" ? <View style={[styles.statusDot, styles.statusDotPaid]} /> : null}
                          {item.status === "unpaid" ? <View style={[styles.statusDot, styles.statusDotUnpaid]} /> : null}
                          {item.status === "na" ? <Text style={styles.naLabel}>{copy.noApplicableMonth}</Text> : null}
                        </View>
                      ))}
                      <Text style={styles.rateValue}>{row.paidCount}/{row.applicableCount}</Text>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>
        ) : null}
      </ScrollView>

      <Modal animationType="slide" onRequestClose={handleCloseModal} transparent visible={Boolean(activeMember)}>
        <Pressable onPress={handleCloseModal} style={styles.modalOverlay}>
          <Pressable onPress={(event) => event.stopPropagation()} style={styles.modalSheet}>
            <Text style={styles.modalTitle}>{copy.memberDetailTitle}</Text>
            <View style={styles.modalProfileRow}>
              <View style={styles.avatarWrap}>
                <Text style={styles.avatarLabel}>{activeMember?.displayName.slice(0, 1).toUpperCase() ?? "K"}</Text>
              </View>
              <View style={styles.memberCopy}>
                <Text style={styles.memberName}>{activeMember?.displayName ?? ""}</Text>
                <Text style={styles.memberMeta}>{copy.unpaidMonths}</Text>
              </View>
            </View>

            {activeMember && activeMember.unpaidMonths.length > 0 ? (
              <View style={styles.unpaidMonthList}>
                {activeMember.months.filter((item) => item.status === "unpaid" && item.yearMonth).map((item) => {
                  const selectionKey = item.yearMonth as string;
                  const selected = selectedMonthKeys.includes(selectionKey);
                  return (
                    <Pressable
                      key={selectionKey}
                      disabled={!canManage}
                      onPress={() => {
                        if (!canManage) {
                          return;
                        }
                        setSelectedMonthKeys((current) =>
                          current.includes(selectionKey) ? current.filter((value) => value !== selectionKey) : [...current, selectionKey],
                        );
                      }}
                      style={[styles.unpaidMonthRow, selected ? styles.unpaidMonthRowSelected : null, !canManage ? styles.unpaidMonthRowDisabled : null]}
                    >
                      <Text style={styles.unpaidMonthLabel}>{item.month}</Text>
                      <Text style={styles.unpaidMonthAmount}>{formatVnd(item.amount)} VND</Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : (
              <Text style={styles.emptyLabel}>{copy.noUnpaidMonths}</Text>
            )}

            <View style={styles.totalCard}>
              <Text style={styles.totalLabel}>{copy.unpaidTotal}</Text>
              <Text style={styles.totalValue}>
                {formatVnd((activeMember?.months ?? []).filter((item) => item.status === "unpaid").reduce((sum, item) => sum + item.amount, 0))} VND
              </Text>
            </View>

            {canManage ? (
              <Pressable
                disabled={activeUnpaidItems.length === 0 || confirmMutation.isPending}
                onPress={() => void handleConfirmSelected()}
                style={[
                  styles.confirmButton,
                  activeUnpaidItems.length === 0 || confirmMutation.isPending ? styles.confirmButtonDisabled : null,
                ]}
              >
                <Text style={styles.confirmButtonLabel}>{copy.confirmSelectedMonths}</Text>
              </Pressable>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

function buildYearRows(members: TeamRosterMemberRecord[], records: TeamFeeRecord[], year: number, settings: TeamFeeSettings | null): MemberYearRow[] {
  const feeType = settings?.fee_type ?? "monthly";
  const monthlyAmount = Math.max(0, settings?.monthly_amount ?? 0);
  const monthlyRecords = records.filter((record) => record.fee_type === "monthly");

  return members.map((member) => {
    const displayName = member.profile?.display_name?.trim() || "KickGo Member";
    const joinedAt = member.joined_at ? new Date(member.joined_at) : null;
    const recordMap = new Map<number, TeamFeeRecord>();

    for (const record of monthlyRecords) {
      if (record.user_id !== member.user_id || !record.year_month) {
        continue;
      }
      const [recordYear, recordMonth] = record.year_month.split("-").map(Number);
      if (recordYear === year) {
        recordMap.set(recordMonth, record);
      }
    }

    const months = MONTHS.map((month) => {
      const yearMonth = buildYearMonth(year, month);
      const isApplicable = !joinedAt || joinedAt.getFullYear() < year || (joinedAt.getFullYear() === year && joinedAt.getMonth() + 1 <= month);
      if (feeType === "per_match") {
        return { month, yearMonth, status: "na" as const, record: null, amount: 0 };
      }
      if (!isApplicable) {
        return { month, yearMonth, status: "na" as const, record: null, amount: 0 };
      }
      const record = recordMap.get(month) ?? null;
      if (record?.is_paid) {
        return { month, yearMonth, status: "paid" as const, record, amount: record.amount };
      }
      return { month, yearMonth, status: "unpaid" as const, record, amount: record?.amount ?? monthlyAmount };
    });

    const applicableMonths = months.filter((item) => item.status !== "na");

    return {
      memberId: member.user_id,
      displayName,
      avatarUrl: member.profile?.avatar_url ?? null,
      squadNumber: member.squad_number,
      months,
      paidCount: months.filter((item) => item.status === "paid").length,
      applicableCount: applicableMonths.length,
      unpaidMonths: months.filter((item) => item.status === "unpaid").map((item) => item.month),
    };
  });
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  content: {
    padding: 20,
    paddingBottom: 40,
    gap: 16,
  },
  inlineHeader: {
    marginBottom: 4,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  backLabel: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },
  yearCard: {
    borderRadius: 20,
    backgroundColor: "#ffffff",
    padding: 18,
    gap: 14,
  },
  yearRow: {
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
  yearLabel: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
  },
  toggleRow: {
    flexDirection: "row",
    gap: 8,
  },
  toggleButton: {
    flex: 1,
    borderRadius: 999,
    backgroundColor: "#f3f4f6",
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  toggleButtonActive: {
    backgroundColor: "#111827",
  },
  toggleLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#4b5563",
  },
  toggleLabelActive: {
    color: "#ffffff",
  },
  tableCard: {
    borderRadius: 20,
    backgroundColor: "#ffffff",
    paddingVertical: 8,
  },
  tableContainer: {
    flexDirection: "row",
  },
  fixedColumn: {
    width: FIXED_MEMBER_WIDTH,
    borderRightWidth: 1,
    borderRightColor: "#e5e7eb",
  },
  fixedHeaderCell: {
    justifyContent: "center",
  },
  fixedMemberCell: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  monthScroll: {
    flex: 1,
  },
  monthHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  monthsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  memberRowPressed: {
    opacity: 0.92,
  },
  avatarWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#dbeafe",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1d4ed8",
  },
  memberCopy: {
    flex: 1,
    gap: 2,
  },
  memberName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
  },
  memberMeta: {
    fontSize: 11,
    color: "#6b7280",
  },
  monthHeaderText: {
    width: MONTH_CELL_WIDTH,
    minWidth: MONTH_CELL_WIDTH,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "700",
    color: "#6b7280",
  },
  monthCell: {
    width: MONTH_CELL_WIDTH,
    minWidth: MONTH_CELL_WIDTH,
    alignItems: "center",
    justifyContent: "center",
  },
  rateHeaderText: {
    width: RATE_CELL_WIDTH,
    minWidth: RATE_CELL_WIDTH,
    textAlign: "right",
    fontSize: 11,
    fontWeight: "700",
    color: "#6b7280",
  },
  rateValue: {
    width: RATE_CELL_WIDTH,
    minWidth: RATE_CELL_WIDTH,
    textAlign: "right",
    fontSize: 12,
    fontWeight: "700",
    color: "#111827",
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusDotPaid: {
    backgroundColor: "#16a34a",
  },
  statusDotUnpaid: {
    backgroundColor: "#ef4444",
  },
  naLabel: {
    fontSize: 12,
    color: "#9ca3af",
  },
  emptyLabel: {
    fontSize: 14,
    lineHeight: 22,
    color: "#6b7280",
  },
  stateWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  stateText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6b7280",
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
    gap: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },
  modalProfileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  unpaidMonthList: {
    gap: 8,
  },
  unpaidMonthRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 14,
    backgroundColor: "#f9fafb",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  unpaidMonthRowSelected: {
    backgroundColor: "#dcfce7",
  },
  unpaidMonthRowDisabled: {
    opacity: 0.6,
  },
  unpaidMonthLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  unpaidMonthAmount: {
    fontSize: 13,
    fontWeight: "700",
    color: "#b91c1c",
  },
  totalCard: {
    borderRadius: 16,
    backgroundColor: "#f3f4f6",
    padding: 14,
    gap: 6,
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6b7280",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },
  confirmButton: {
    borderRadius: 16,
    backgroundColor: "#16a34a",
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmButtonDisabled: {
    backgroundColor: "#9ca3af",
  },
  confirmButtonLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: "#ffffff",
  },
});
