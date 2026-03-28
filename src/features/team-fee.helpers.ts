import type { TeamFeeRecord, TeamFeeSettings, TeamFeeType, TeamFeeUsage, TeamPaymentAccount, TeamPaymentProvider, FeeStats } from "@/types/team-fee.types";

export function formatVnd(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export function getFeeTypeLabel(copy: {
  feeTypeMonthly: string;
  feeTypePerMatch: string;
  feeTypeMixed: string;
}, feeType: TeamFeeType): string {
  if (feeType === "monthly") {
    return copy.feeTypeMonthly;
  }
  if (feeType === "per_match") {
    return copy.feeTypePerMatch;
  }
  return copy.feeTypeMixed;
}

export function getPaymentProviderLabel(copy: {
  providerMomo: string;
  providerZaloPay: string;
  providerBank: string;
}, provider: TeamPaymentProvider): string {
  if (provider === "momo") {
    return copy.providerMomo;
  }
  if (provider === "zalopay") {
    return copy.providerZaloPay;
  }
  return copy.providerBank;
}

export function getPaymentProviderColors(provider: TeamPaymentProvider): { backgroundColor: string; accentColor: string } {
  if (provider === "momo") {
    return { backgroundColor: "#fce7f3", accentColor: "#db2777" };
  }
  if (provider === "zalopay") {
    return { backgroundColor: "#dbeafe", accentColor: "#2563eb" };
  }
  return { backgroundColor: "#f3f4f6", accentColor: "#4b5563" };
}

export function getCurrentYearMonth(baseDate = new Date()): string {
  return `${baseDate.getFullYear()}-${String(baseDate.getMonth() + 1).padStart(2, "0")}`;
}

export function moveYearMonth(value: string, offset: number): string {
  const [yearPart, monthPart] = value.split("-");
  const year = Number(yearPart);
  const month = Number(monthPart);
  const nextDate = new Date(year, month - 1 + offset, 1);
  return getCurrentYearMonth(nextDate);
}

export function formatYearMonthLabel(value: string, language: string): string {
  const [yearPart, monthPart] = value.split("-");
  const year = Number(yearPart);
  const month = Number(monthPart);
  const locale = language === "ko" ? "ko-KR" : language === "vi" ? "vi-VN" : "en-US";
  return new Intl.DateTimeFormat(locale, { year: "numeric", month: "long" }).format(new Date(year, month - 1, 1));
}

export function buildFeeStats(records: TeamFeeRecord[], usages: TeamFeeUsage[]): FeeStats {
  const paidRecords = records.filter((record) => record.is_paid);
  const totalCollected = paidRecords.reduce((sum, record) => sum + record.amount, 0);
  const totalUsage = usages.reduce((sum, usage) => sum + usage.amount, 0);
  return {
    total_collected: totalCollected,
    total_usage: totalUsage,
    balance: totalCollected - totalUsage,
    paid_count: paidRecords.length,
    unpaid_count: records.length - paidRecords.length,
  };
}

export function buildMonthlyMemberRows(
  members: Array<{ user_id: string; squad_number: number | null; profile: { display_name: string | null; avatar_url: string | null } | null }>,
  records: TeamFeeRecord[],
): Array<{ memberId: string; displayName: string; avatarUrl: string | null; squadNumber: number | null; record: TeamFeeRecord | null }> {
  return members.map((member) => ({
    memberId: member.user_id,
    displayName: member.profile?.display_name?.trim() || "KickGo Member",
    avatarUrl: member.profile?.avatar_url ?? null,
    squadNumber: member.squad_number,
    record: records.find((record) => record.user_id === member.user_id && record.fee_type === "monthly") ?? null,
  }));
}

export function groupPerMatchRecords(records: TeamFeeRecord[]): Array<{ matchId: string; items: TeamFeeRecord[] }> {
  const grouped = new Map<string, TeamFeeRecord[]>();
  for (const record of records.filter((item) => item.fee_type === "per_match" && item.match_id)) {
    const key = record.match_id as string;
    const current = grouped.get(key) ?? [];
    current.push(record);
    grouped.set(key, current);
  }

  return Array.from(grouped.entries()).map(([matchId, items]) => ({
    matchId,
    items: items.sort((left, right) => right.created_at.localeCompare(left.created_at)),
  }));
}

export function getActivePaymentAccount(accounts: TeamPaymentAccount[], provider: TeamPaymentProvider): TeamPaymentAccount | null {
  return accounts.find((item) => item.provider === provider && item.is_active) ?? null;
}

export function buildFeeSettingsDraft(settings: TeamFeeSettings | null): {
  feeType: TeamFeeType;
  monthlyAmount: string;
  perMatchAmount: string;
} {
  return {
    feeType: settings?.fee_type ?? "monthly",
    monthlyAmount: settings ? String(settings.monthly_amount) : "0",
    perMatchAmount: settings ? String(settings.per_match_amount) : "0",
  };
}