import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { QueryKey } from "@tanstack/react-query";

import {
  confirmFeePayment,
  getFeeRecords,
  getFeeSettings,
  getFeeUsages,
  getPaymentAccounts,
  recordFeeUsage,
  registerPaymentAccount,
  updateFeeSettings,
} from "@/services/team-fee.service";
import type {
  ConfirmFeePaymentRequest,
  RecordFeeUsageRequest,
  RegisterPaymentAccountRequest,
  TeamFeeRecord,
  TeamFeeSettings,
  TeamFeeUsage,
  TeamPaymentAccount,
  UpdateFeeSettingsRequest,
} from "@/types/team-fee.types";

type FeeRecordsSnapshot = {
  queryKey: QueryKey;
  data: TeamFeeRecord[] | undefined;
};

type FeeRecordsContext = {
  snapshots: FeeRecordsSnapshot[];
};

type FeeUsagesContext = {
  previousUsages: TeamFeeUsage[] | undefined;
};

type ConfirmFeePaymentMutationInput = {
  teamId: string;
  yearMonth: string | null;
  request: ConfirmFeePaymentRequest;
};

function isYearPeriod(value: string | null): value is string {
  return typeof value === "string" && /^\d{4}$/.test(value);
}

function matchesPeriod(period: string | null, record: TeamFeeRecord): boolean {
  if (period === null) {
    return true;
  }

  if (isYearPeriod(period)) {
    return typeof record.year_month === "string" && record.year_month.startsWith(`${period}-`);
  }

  return record.year_month === period;
}

function buildOptimisticRecord(variables: ConfirmFeePaymentMutationInput): TeamFeeRecord | null {
  const { request } = variables;
  if (
    !request.team_id ||
    !request.user_id ||
    !request.fee_type ||
    typeof request.amount !== "number" ||
    request.amount < 0
  ) {
    return null;
  }

  return {
    id: request.fee_record_id ?? `optimistic-fee-${request.user_id}-${request.year_month ?? request.match_id ?? Date.now()}`,
    team_id: request.team_id,
    user_id: request.user_id,
    fee_type: request.fee_type,
    year_month: request.year_month ?? null,
    match_id: request.match_id ?? null,
    amount: request.amount,
    is_paid: true,
    paid_at: new Date().toISOString(),
    confirmed_by: null,
    note: request.note,
    created_at: new Date().toISOString(),
    user_display_name: null,
    user_avatar_url: null,
  };
}

export function useFeeSettings(teamId: string | null, enabled = true) {
  return useQuery({
    queryKey: ["fee-settings", teamId],
    queryFn: () => {
      if (!teamId) {
        throw new Error("Team id is required.");
      }
      return getFeeSettings(teamId);
    },
    enabled: enabled && Boolean(teamId),
  });
}

export function usePaymentAccounts(teamId: string | null, enabled = true) {
  return useQuery({
    queryKey: ["payment-accounts", teamId],
    queryFn: () => {
      if (!teamId) {
        throw new Error("Team id is required.");
      }
      return getPaymentAccounts(teamId);
    },
    enabled: enabled && Boolean(teamId),
  });
}

export function useFeeRecords(teamId: string | null, period?: string, enabled = true) {
  return useQuery({
    queryKey: ["fee-records", teamId, period ?? null],
    queryFn: () => {
      if (!teamId) {
        throw new Error("Team id is required.");
      }
      return getFeeRecords(teamId, period);
    },
    enabled: enabled && Boolean(teamId),
  });
}

export function useFeeUsages(teamId: string | null, enabled = true) {
  return useQuery({
    queryKey: ["fee-usages", teamId],
    queryFn: () => {
      if (!teamId) {
        throw new Error("Team id is required.");
      }
      return getFeeUsages(teamId);
    },
    enabled: enabled && Boolean(teamId),
  });
}

export function useUpdateFeeSettings() {
  const queryClient = useQueryClient();

  return useMutation<TeamFeeSettings, Error, UpdateFeeSettingsRequest>({
    mutationFn: (request) => updateFeeSettings(request),
    onSuccess: async (_result, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["fee-settings", variables.team_id] });
    },
  });
}

export function useRegisterPaymentAccount() {
  const queryClient = useQueryClient();

  return useMutation<TeamPaymentAccount, Error, RegisterPaymentAccountRequest>({
    mutationFn: (request) => registerPaymentAccount(request),
    onSuccess: async (_result, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["payment-accounts", variables.team_id] });
    },
  });
}

export function useConfirmFeePayment() {
  const queryClient = useQueryClient();

  return useMutation<TeamFeeRecord, Error, ConfirmFeePaymentMutationInput, FeeRecordsContext>({
    mutationFn: ({ request }) => confirmFeePayment(request),
    onMutate: async (variables) => {
      const partialKey: QueryKey = ["fee-records", variables.teamId];
      await queryClient.cancelQueries({ queryKey: partialKey });
      const matchingQueries = queryClient
        .getQueryCache()
        .findAll({ queryKey: partialKey })
        .filter((query) => Array.isArray(query.queryKey) && query.queryKey[0] === "fee-records" && query.queryKey[1] === variables.teamId);

      const snapshots: FeeRecordsSnapshot[] = matchingQueries.map((query) => ({
        queryKey: query.queryKey,
        data: query.state.data as TeamFeeRecord[] | undefined,
      }));

      const optimisticRecord = buildOptimisticRecord(variables);

      for (const snapshot of snapshots) {
        queryClient.setQueryData<TeamFeeRecord[]>(snapshot.queryKey, (current) => {
          const currentRecords = current ?? [];
          const period = Array.isArray(snapshot.queryKey) ? ((snapshot.queryKey[2] as string | null | undefined) ?? null) : null;

          if (variables.request.fee_record_id) {
            const hasMatch = currentRecords.some((record) => record.id === variables.request.fee_record_id);
            if (hasMatch) {
              return currentRecords.map((record) =>
                record.id === variables.request.fee_record_id
                  ? {
                      ...record,
                      is_paid: true,
                      paid_at: new Date().toISOString(),
                      note: variables.request.note,
                    }
                  : record,
              );
            }
          }

          if (!optimisticRecord || !matchesPeriod(period, optimisticRecord)) {
            return currentRecords;
          }

          const existingIndex = currentRecords.findIndex(
            (record) =>
              record.user_id === optimisticRecord.user_id &&
              record.fee_type === optimisticRecord.fee_type &&
              record.year_month === optimisticRecord.year_month &&
              record.match_id === optimisticRecord.match_id,
          );

          if (existingIndex >= 0) {
            return currentRecords.map((record, index) => (index === existingIndex ? { ...record, ...optimisticRecord } : record));
          }

          return [optimisticRecord, ...currentRecords];
        });
      }

      return { snapshots };
    },
    onError: (_error, _variables, context) => {
      for (const snapshot of context?.snapshots ?? []) {
        queryClient.setQueryData(snapshot.queryKey, snapshot.data);
      }
    },
    onSettled: async (_result, _error, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["fee-records", variables.teamId] });
    },
  });
}

export function useRecordFeeUsage() {
  const queryClient = useQueryClient();

  return useMutation<TeamFeeUsage, Error, RecordFeeUsageRequest, FeeUsagesContext>({
    mutationFn: (request) => recordFeeUsage(request),
    onMutate: async (variables) => {
      const queryKey = ["fee-usages", variables.team_id];
      await queryClient.cancelQueries({ queryKey });
      const previousUsages = queryClient.getQueryData<TeamFeeUsage[]>(queryKey);
      const optimisticUsage: TeamFeeUsage = {
        id: `optimistic-${Date.now()}`,
        team_id: variables.team_id,
        amount: variables.amount,
        description: variables.description,
        used_at: variables.used_at,
        created_by: null,
        created_at: new Date().toISOString(),
      };
      queryClient.setQueryData<TeamFeeUsage[]>(queryKey, (current) => [optimisticUsage, ...(current ?? [])]);
      return { previousUsages };
    },
    onError: (_error, variables, context) => {
      queryClient.setQueryData(["fee-usages", variables.team_id], context?.previousUsages);
    },
    onSettled: async (_result, _error, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["fee-usages", variables.team_id] });
    },
  });
}
