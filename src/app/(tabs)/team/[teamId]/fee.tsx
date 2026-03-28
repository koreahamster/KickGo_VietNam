import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useI18n } from "@/core/i18n/LanguageProvider";
import { getTeamFeeCopy } from "@/features/team-fee.copy";
import { buildFeeStats, getCurrentYearMonth, getFeeTypeLabel } from "@/features/team-fee.helpers";
import { TeamFeeAccountsPanel } from "@/features/team-fee/components/TeamFeeAccountsPanel";
import { TeamFeePaymentsPanel } from "@/features/team-fee/components/TeamFeePaymentsPanel";
import { TeamFeeSegmentTabs } from "@/features/team-fee/components/TeamFeeSegmentTabs";
import { TeamFeeUsagesPanel } from "@/features/team-fee/components/TeamFeeUsagesPanel";
import { useAuth } from "@/hooks/useAuth";
import {
  useConfirmFeePayment,
  useFeeRecords,
  useFeeSettings,
  useFeeUsages,
  usePaymentAccounts,
  useRecordFeeUsage,
  useRegisterPaymentAccount,
} from "@/hooks/useTeamFeeQuery";
import { useTeamDetailQuery } from "@/hooks/useTeamDetailQuery";
import { useTeamMatches } from "@/hooks/useTeamMatches";
import { uploadFeeQr } from "@/services/team-fee.service";
import type { TeamPaymentProvider } from "@/types/team-fee.types";

type FeeSegmentKey = "records" | "usages" | "accounts";

export default function TeamFeeScreen(): JSX.Element {
  const { language } = useI18n();
  const { user } = useAuth();
  const copy = getTeamFeeCopy(language);
  const params = useLocalSearchParams<{ teamId?: string | string[] }>();
  const teamId = Array.isArray(params.teamId) ? params.teamId[0] ?? null : params.teamId ?? null;
  const [activeSegment, setActiveSegment] = useState<FeeSegmentKey>("records");
  const [yearMonth, setYearMonth] = useState<string>(getCurrentYearMonth());
  const [isQrUploading, setIsQrUploading] = useState(false);

  const detailQuery = useTeamDetailQuery(teamId, Boolean(teamId));
  const team = detailQuery.data?.team ?? null;
  const membership = detailQuery.data?.currentMembership ?? null;
  const members = detailQuery.data?.members ?? [];
  const canManage = membership?.role === "owner" || membership?.role === "manager";

  const settingsQuery = useFeeSettings(teamId, Boolean(teamId));
  const recordsQuery = useFeeRecords(teamId, yearMonth, Boolean(teamId));
  const usagesQuery = useFeeUsages(teamId, Boolean(teamId));
  const accountsQuery = usePaymentAccounts(teamId, Boolean(teamId));
  const confirmMutation = useConfirmFeePayment();
  const usageMutation = useRecordFeeUsage();
  const accountMutation = useRegisterPaymentAccount();
  const { matches } = useTeamMatches(teamId, { enabled: Boolean(teamId) });

  const stats = useMemo(
    () => buildFeeStats(recordsQuery.data ?? [], usagesQuery.data ?? []),
    [recordsQuery.data, usagesQuery.data],
  );

  const paidSummary = `${stats.paid_count}${copy.feeStatusDivider}${members.length}`;
  const feeTypeLabel = settingsQuery.data ? getFeeTypeLabel(copy, settingsQuery.data.fee_type) : copy.noSettings;

  const handleConfirmPayment = async (recordId: string): Promise<void> => {
    if (!teamId) {
      return;
    }

    try {
      await confirmMutation.mutateAsync({ teamId, yearMonth, request: { fee_record_id: recordId, note: "" } });
    } catch (error) {
      Alert.alert(copy.tabTitle, error instanceof Error ? error.message : copy.genericError);
      throw error;
    }
  };

  const handleConfirmPayments = async (recordIds: string[]): Promise<void> => {
    if (!teamId || recordIds.length === 0) {
      return;
    }

    try {
      await Promise.all(recordIds.map((recordId) => confirmMutation.mutateAsync({ teamId, yearMonth, request: { fee_record_id: recordId, note: "" } })));
    } catch (error) {
      Alert.alert(copy.tabTitle, error instanceof Error ? error.message : copy.genericError);
      throw error;
    }
  };

  const handleRecordUsage = async (input: { amount: number; description: string; usedAt: string }): Promise<void> => {
    if (!teamId) {
      return;
    }

    try {
      await usageMutation.mutateAsync({
        team_id: teamId,
        amount: input.amount,
        description: input.description,
        used_at: input.usedAt,
      });
      Alert.alert(copy.tabTitle, copy.usageSaveSuccess);
    } catch (error) {
      Alert.alert(copy.tabTitle, error instanceof Error ? error.message : copy.genericError);
      throw error;
    }
  };

  const handleUploadQr = async (provider: TeamPaymentProvider, imageUri: string): Promise<string> => {
    if (!teamId) {
      throw new Error(copy.genericError);
    }

    try {
      setIsQrUploading(true);
      const result = await uploadFeeQr(teamId, provider, imageUri);
      return result.qr_image_url;
    } catch (error) {
      Alert.alert(copy.tabTitle, error instanceof Error ? error.message : copy.uploadError);
      throw error;
    } finally {
      setIsQrUploading(false);
    }
  };

  const handleRegisterAccount = async (input: {
    provider: TeamPaymentProvider;
    accountName: string;
    accountNumber: string;
    qrImageUrl: string;
  }): Promise<void> => {
    if (!teamId) {
      return;
    }

    try {
      await accountMutation.mutateAsync({
        team_id: teamId,
        provider: input.provider,
        account_name: input.accountName,
        account_number: input.accountNumber,
        qr_image_url: input.qrImageUrl,
      });
      Alert.alert(copy.tabTitle, copy.accountSaveSuccess);
    } catch (error) {
      Alert.alert(copy.tabTitle, error instanceof Error ? error.message : copy.genericError);
      throw error;
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

  if (detailQuery.isLoading) {
    return (
      <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
        <View style={styles.stateWrap}>
          <Text style={styles.stateText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!team) {
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
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <View style={styles.summaryCopyWrap}>
              <Text style={styles.summaryLabel}>{copy.monthlySummary}</Text>
              <Text style={styles.summaryValue}>{paidSummary}</Text>
            </View>
            <View style={styles.summaryCopyWrap}>
              <Text style={styles.summaryLabel}>{copy.balanceSummary}</Text>
              <Text style={styles.summaryValue}>{new Intl.NumberFormat("en-US").format(stats.balance)} VND</Text>
            </View>
          </View>
          <View style={styles.summaryFooter}>
            <View style={styles.feeTypeBadge}>
              <Text style={styles.feeTypeLabel}>{feeTypeLabel}</Text>
            </View>
            {canManage ? (
              <Pressable
                onPress={() => router.push({ pathname: "/(tabs)/team/[teamId]/fee-settings", params: { teamId } })}
                style={({ pressed }) => [styles.settingsButton, pressed ? styles.pressed : null]}
              >
                <Ionicons color="#111827" name="settings-outline" size={16} />
                <Text style={styles.settingsButtonLabel}>{copy.settingsAction}</Text>
              </Pressable>
            ) : null}
          </View>
        </View>

        <TeamFeeSegmentTabs
          labels={{ records: copy.segmentRecords, usages: copy.segmentUsages, accounts: copy.segmentAccounts }}
          onChange={setActiveSegment}
          value={activeSegment}
        />

        {activeSegment === "records" ? (
          <TeamFeePaymentsPanel
            canManage={canManage}
            copy={copy}
            currentUserId={user?.id ?? null}
            isConfirming={confirmMutation.isPending}
            language={language}
            matches={matches}
            members={members}
            onChangeYearMonth={setYearMonth}
            onConfirmPayment={handleConfirmPayment}
            onConfirmPayments={handleConfirmPayments}
            records={recordsQuery.data ?? []}
            settings={settingsQuery.data ?? null}
            teamId={teamId}
            yearMonth={yearMonth}
          />
        ) : null}

        {activeSegment === "usages" ? (
          <TeamFeeUsagesPanel
            canManage={canManage}
            copy={copy}
            isSubmitting={usageMutation.isPending}
            onSubmitUsage={handleRecordUsage}
            usages={usagesQuery.data ?? []}
          />
        ) : null}

        {activeSegment === "accounts" ? (
          <TeamFeeAccountsPanel
            accounts={accountsQuery.data ?? []}
            canManage={canManage}
            copy={copy}
            isSubmitting={accountMutation.isPending}
            isUploading={isQrUploading}
            onSubmitAccount={handleRegisterAccount}
            onUploadQr={handleUploadQr}
          />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  content: {
    padding: 20,
    paddingBottom: 40,
    gap: 18,
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
  summaryCard: {
    borderRadius: 24,
    backgroundColor: "#111827",
    padding: 18,
    gap: 16,
  },
  summaryHeader: {
    flexDirection: "row",
    gap: 16,
  },
  summaryCopyWrap: {
    flex: 1,
    gap: 6,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#9ca3af",
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: "800",
    color: "#ffffff",
  },
  summaryFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  feeTypeBadge: {
    flex: 1,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  feeTypeLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#ffffff",
  },
  settingsButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    backgroundColor: "#ffffff",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  settingsButtonLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#111827",
  },
  pressed: {
    opacity: 0.88,
  },
});
