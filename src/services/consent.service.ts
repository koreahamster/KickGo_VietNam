import { supabase } from "@/lib/supabase";
import type {
  ConsentApiResponse,
  ConsentBundle,
  RecordConsentInput,
  RecordConsentResult,
  UserConsentRecord,
} from "@/types/consent.types";

async function getAuthenticatedUserId(): Promise<string> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw new Error(error.message);
  }

  if (!user) {
    throw new Error("Authenticated user was not found.");
  }

  return user.id;
}

type FunctionErrorContext = {
  status?: number;
  clone?: () => FunctionErrorContext;
  json?: () => Promise<unknown>;
  text?: () => Promise<string>;
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

  console.log("[consent] invokeFunction auth", functionName, true);

  return {
    Authorization: `Bearer ${session.access_token}`,
  };
}

async function invokeFunction<TResponse>(
  functionName: string,
  body?: Record<string, unknown>,
): Promise<TResponse> {
  const headers = await getFunctionAuthHeaders(functionName);
  const { data, error } = await supabase.functions.invoke<TResponse>(functionName, {
    body,
    headers,
  });

  if (error) {
    const message = await readFunctionErrorMessage(error);
    console.log("[consent] invokeFunction error", functionName, message);
    throw new Error(message);
  }

  if (data === null) {
    throw new Error(`Function ${functionName} returned no data.`);
  }

  return data;
}

function assertSuccess<T>(response: ConsentApiResponse<T>, fallbackMessage: string): T {
  if (!response.success) {
    throw new Error(response.error.message);
  }

  if (!response.data) {
    throw new Error(fallbackMessage);
  }

  return response.data;
}

export async function getMyConsentBundle(): Promise<ConsentBundle> {
  const userId = await getAuthenticatedUserId();
  const { data, error } = await supabase
    .from("user_consents")
    .select("id, user_id, consent_type, is_agreed, policy_version, agreed_at, ip_address, created_at")
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as UserConsentRecord[];

  return {
    privacyPolicy: rows.find((item) => item.consent_type === "privacy_policy") ?? null,
    marketing: rows.find((item) => item.consent_type === "marketing") ?? null,
  };
}

export async function recordConsent(input: RecordConsentInput): Promise<RecordConsentResult> {
  const response = await invokeFunction<ConsentApiResponse<RecordConsentResult>>("record-consent", {
    consent_type: input.consentType,
    is_agreed: input.isAgreed,
    policy_version: input.policyVersion,
  });

  return assertSuccess(response, "Failed to record consent.");
}