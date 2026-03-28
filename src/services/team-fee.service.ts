import { supabase } from "@/lib/supabase";
import type { ApiResponse } from "@/types/profile.types";
import type {
  ConfirmFeePaymentRequest,
  RecordFeeUsageRequest,
  RegisterPaymentAccountRequest,
  TeamFeeRecord,
  TeamFeeRecordApiResponse,
  TeamFeeSettings,
  TeamFeeSettingsApiResponse,
  TeamFeeUsage,
  TeamFeeUsageApiResponse,
  TeamPaymentAccount,
  TeamPaymentAccountApiResponse,
  TeamPaymentProvider,
  UpdateFeeSettingsRequest,
  UploadFeeQrApiResponse,
  UploadFeeQrResult,
} from "@/types/team-fee.types";

type FunctionErrorContext = {
  status?: number;
  clone?: () => FunctionErrorContext;
  json?: () => Promise<unknown>;
  text?: () => Promise<string>;
};

type RawFeeRecordRow = {
  id: string;
  team_id: string;
  user_id: string;
  fee_type: "monthly" | "per_match";
  year_month: string | null;
  match_id: string | null;
  amount: number;
  is_paid: boolean;
  paid_at: string | null;
  confirmed_by: string | null;
  note: string | null;
  created_at: string;
  profile:
    | { display_name: string | null; avatar_url: string | null }
    | Array<{ display_name: string | null; avatar_url: string | null }>
    | null;
};

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getFunctionErrorContext(error: unknown): FunctionErrorContext | null {
  if (!isObjectRecord(error)) {
    return null;
  }

  const context = error.context;
  if (!isObjectRecord(context)) {
    return null;
  }

  return context as FunctionErrorContext;
}

function extractErrorMessageFromPayload(payload: unknown): string | null {
  if (!isObjectRecord(payload)) {
    return null;
  }

  const topLevelMessage = payload.message;
  if (typeof topLevelMessage === "string" && topLevelMessage.trim()) {
    return topLevelMessage;
  }

  const topLevelError = payload.error;
  if (typeof topLevelError === "string" && topLevelError.trim()) {
    return topLevelError;
  }

  if (!isObjectRecord(topLevelError)) {
    return null;
  }

  const code = topLevelError.code;
  const message = topLevelError.message;
  if (typeof code === "string" && typeof message === "string" && message.trim()) {
    return `${code}: ${message}`;
  }
  if (typeof message === "string" && message.trim()) {
    return message;
  }

  return null;
}

async function readFunctionErrorMessage(error: unknown): Promise<string> {
  const context = getFunctionErrorContext(error);

  if (context) {
    const statusLabel = typeof context.status === "number" ? `HTTP ${context.status}` : "HTTP error";
    const jsonTarget = typeof context.clone === "function" ? context.clone() : context;

    if (typeof jsonTarget.json === "function") {
      try {
        const payload = await jsonTarget.json();
        const message = extractErrorMessageFromPayload(payload);
        if (message) {
          return typeof context.status === "number" ? `${statusLabel} - ${message}` : message;
        }
      } catch {
        // fall through
      }
    }

    const textTarget = typeof context.clone === "function" ? context.clone() : context;
    if (typeof textTarget.text === "function") {
      try {
        const text = (await textTarget.text()).trim();
        if (text) {
          return `${statusLabel} - ${text}`;
        }
      } catch {
        // fall through
      }
    }

    return statusLabel;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Edge Function request failed.";
}

async function getFunctionAuthHeaders(functionName: string): Promise<Record<string, string>> {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    throw new Error(error.message);
  }

  if (!session?.access_token) {
    throw new Error("Session access token was not found.");
  }

  console.log("[team-fee] invokeFunction auth", functionName, true);

  return {
    Authorization: `Bearer ${session.access_token}`,
  };
}

async function invokeFunction<TResponse>(functionName: string, body?: Record<string, unknown>): Promise<TResponse> {
  const headers = await getFunctionAuthHeaders(functionName);
  const { data, error } = await supabase.functions.invoke<TResponse>(functionName, {
    body,
    headers,
  });

  if (error) {
    const message = await readFunctionErrorMessage(error);
    console.log("[team-fee] invokeFunction error", functionName, message);
    throw new Error(message);
  }

  if (data === null) {
    throw new Error(`Function ${functionName} returned no data.`);
  }

  return data;
}

function assertSuccess<T>(response: ApiResponse<T>, fallbackMessage: string): T {
  if (!response.success) {
    throw new Error(response.error.message);
  }
  if (!response.data) {
    throw new Error(fallbackMessage);
  }
  return response.data;
}

function normalizeProfile(
  value:
    | { display_name: string | null; avatar_url: string | null }
    | Array<{ display_name: string | null; avatar_url: string | null }>
    | null,
): { display_name: string | null; avatar_url: string | null } | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }
  return value;
}

function normalizeFeeRecord(row: RawFeeRecordRow): TeamFeeRecord {
  const profile = normalizeProfile(row.profile);
  return {
    id: row.id,
    team_id: row.team_id,
    user_id: row.user_id,
    fee_type: row.fee_type,
    year_month: row.year_month,
    match_id: row.match_id,
    amount: row.amount,
    is_paid: row.is_paid,
    paid_at: row.paid_at,
    confirmed_by: row.confirmed_by,
    note: row.note,
    created_at: row.created_at,
    user_display_name: profile?.display_name ?? null,
    user_avatar_url: profile?.avatar_url ?? null,
  };
}

async function readFileBlob(uri: string): Promise<Blob> {
  const response = await fetch(uri);
  if (!response.ok) {
    throw new Error(`Failed to read file with HTTP ${response.status}.`);
  }
  return response.blob();
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let output = "";

  for (let index = 0; index < bytes.length; index += 3) {
    const byte1 = bytes[index] ?? 0;
    const byte2 = bytes[index + 1] ?? 0;
    const byte3 = bytes[index + 2] ?? 0;

    const combined = (byte1 << 16) | (byte2 << 8) | byte3;
    const enc1 = (combined >> 18) & 63;
    const enc2 = (combined >> 12) & 63;
    const enc3 = (combined >> 6) & 63;
    const enc4 = combined & 63;

    output += chars[enc1];
    output += chars[enc2];
    output += index + 1 < bytes.length ? chars[enc3] : "=";
    output += index + 2 < bytes.length ? chars[enc4] : "=";
  }

  return output;
}

function inferImageContentType(uri: string, blobType: string): "image/jpeg" | "image/png" {
  if (blobType === "image/png") {
    return "image/png";
  }

  const lowerUri = uri.toLowerCase();
  if (lowerUri.endsWith(".png")) {
    return "image/png";
  }

  return "image/jpeg";
}

function isYearPeriod(value: string): boolean {
  return /^\d{4}$/.test(value);
}

export async function getFeeSettings(teamId: string): Promise<TeamFeeSettings | null> {
  const result = await supabase.from("team_fee_settings").select("*").eq("team_id", teamId).maybeSingle();
  if (result.error) {
    throw new Error(result.error.message);
  }
  return (result.data ?? null) as TeamFeeSettings | null;
}

export async function getPaymentAccounts(teamId: string): Promise<TeamPaymentAccount[]> {
  const result = await supabase
    .from("team_payment_accounts")
    .select("*")
    .eq("team_id", teamId)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (result.error) {
    throw new Error(result.error.message);
  }

  return (result.data ?? []) as TeamPaymentAccount[];
}

export async function getFeeRecords(teamId: string, period?: string): Promise<TeamFeeRecord[]> {
  let query = supabase
    .from("team_fee_records")
    .select("id, team_id, user_id, fee_type, year_month, match_id, amount, is_paid, paid_at, confirmed_by, note, created_at, profile:profiles!team_fee_records_user_id_fkey(display_name, avatar_url)")
    .eq("team_id", teamId)
    .order("created_at", { ascending: false });

  if (period) {
    if (isYearPeriod(period)) {
      query = query.like("year_month", `${period}-%`);
    } else {
      query = query.or(`year_month.eq.${period},year_month.is.null`);
    }
  }

  const result = await query;
  if (result.error) {
    throw new Error(result.error.message);
  }

  return ((result.data ?? []) as RawFeeRecordRow[]).map(normalizeFeeRecord);
}

export async function getFeeUsages(teamId: string): Promise<TeamFeeUsage[]> {
  const result = await supabase
    .from("team_fee_usages")
    .select("*")
    .eq("team_id", teamId)
    .order("used_at", { ascending: false })
    .order("created_at", { ascending: false });

  if (result.error) {
    throw new Error(result.error.message);
  }

  return (result.data ?? []) as TeamFeeUsage[];
}

export async function updateFeeSettings(request: UpdateFeeSettingsRequest): Promise<TeamFeeSettings> {
  const response = await invokeFunction<TeamFeeSettingsApiResponse>("update-fee-settings", request);
  return assertSuccess(response, "Failed to update fee settings.");
}

export async function registerPaymentAccount(request: RegisterPaymentAccountRequest): Promise<TeamPaymentAccount> {
  const response = await invokeFunction<TeamPaymentAccountApiResponse>("register-payment-account", request);
  return assertSuccess(response, "Failed to register payment account.");
}

export async function uploadFeeQr(teamId: string, provider: TeamPaymentProvider, imageUri: string): Promise<UploadFeeQrResult> {
  const blob = await readFileBlob(imageUri);
  if (blob.size > 2 * 1024 * 1024) {
    throw new Error("QR_IMAGE_TOO_LARGE");
  }

  const contentType = inferImageContentType(imageUri, blob.type);
  const arrayBuffer = await blob.arrayBuffer();
  const base64Data = arrayBufferToBase64(arrayBuffer);
  const fileName = `${provider}.${contentType === "image/png" ? "png" : "jpg"}`;

  const response = await invokeFunction<UploadFeeQrApiResponse>("upload-fee-qr", {
    team_id: teamId,
    provider,
    file_name: fileName,
    content_type: contentType,
    base64_data: base64Data,
  });

  return assertSuccess(response, "Failed to upload fee QR image.");
}

export async function confirmFeePayment(request: ConfirmFeePaymentRequest): Promise<TeamFeeRecord> {
  const response = await invokeFunction<TeamFeeRecordApiResponse>("confirm-fee-payment", request);
  return assertSuccess(response, "Failed to confirm fee payment.");
}

export async function recordFeeUsage(request: RecordFeeUsageRequest): Promise<TeamFeeUsage> {
  const response = await invokeFunction<TeamFeeUsageApiResponse>("record-fee-usage", request);
  return assertSuccess(response, "Failed to record fee usage.");
}

