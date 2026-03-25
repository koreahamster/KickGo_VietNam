import { supabase } from "@/lib/supabase";
import type {
  AccountType,
  AddAccountTypeResult,
  ApiResponse,
  AvatarUploadBinary,
  CommonProfileRecord,
  CreateCommonProfileInput,
  CreatePlayerProfileInput,
  CreateProfileResult,
  PlayerProfileRecord,
  ProfileBundle,
  RefereeProfileRecord,
  RequestAvatarUploadInput,
  RequestAvatarUploadResult,
  RoleProfileResult,
  SupportedAvatarContentType,
  SupportedVisibility,
  UpdateCommonProfileInput,
  UpdatePlayerProfileInput,
  UpdateProfileResult,
  UpdateProfileVisibilityResult,
  UploadAvatarInput,
} from "@/types/profile.types";

type FunctionErrorContext = {
  status?: number;
  clone?: () => FunctionErrorContext;
  json?: () => Promise<unknown>;
  text?: () => Promise<string>;
};

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

  console.log("[profile] invokeFunction auth", functionName, true);

  return {
    Authorization: `Bearer ${session.access_token}`,
  };
}

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
        // fall through to text parsing
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
        // fall through to status-only fallback
      }
    }

    return statusLabel;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Edge Function request failed.";
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
    const errorName = error instanceof Error ? error.name : typeof error;
    const errorKeys = typeof error === "object" && error !== null ? Object.keys(error) : [];
    const context = getFunctionErrorContext(error);
    const status = typeof context?.status === "number" ? context.status : null;

    console.log("[profile] invokeFunction error", functionName, errorName, status, message, errorKeys);
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

async function readAvatarFile(uri: string): Promise<Blob> {
  const response = await fetch(uri);

  if (!response.ok) {
    throw new Error(`Failed to read avatar file with HTTP ${response.status}.`);
  }

  return response.blob();
}

export async function getMyProfileBundle(): Promise<ProfileBundle> {
  const userId = await getAuthenticatedUserId();

  const [profileResult, accountTypesResult, playerProfileResult, refereeProfileResult] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "id, display_name, birth_year, avatar_url, bio, phone, is_phone_verified, country_code, province_code, district_code, preferred_language, visibility",
      )
      .eq("id", userId)
      .maybeSingle(),
    supabase.from("account_types").select("type").eq("user_id", userId),
    supabase
      .from("player_profiles")
      .select(
        "user_id, preferred_position, preferred_foot, dominant_foot, top_size, shoe_size, skill_tier, reputation_score, left_foot_skill, right_foot_skill, play_styles",
      )
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("referee_profiles")
      .select("user_id, average_rating, rating_count")
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  if (profileResult.error) {
    throw new Error(profileResult.error.message);
  }

  if (accountTypesResult.error) {
    throw new Error(accountTypesResult.error.message);
  }

  if (playerProfileResult.error) {
    throw new Error(playerProfileResult.error.message);
  }

  if (refereeProfileResult.error) {
    throw new Error(refereeProfileResult.error.message);
  }

  const profile = (profileResult.data ?? null) as CommonProfileRecord | null;
  const accountTypeRows = (accountTypesResult.data ?? []) as Array<{ type: AccountType }>;
  const playerProfile = (playerProfileResult.data ?? null) as PlayerProfileRecord | null;
  const refereeProfile = (refereeProfileResult.data ?? null) as RefereeProfileRecord | null;

  return {
    profile,
    accountTypes: accountTypeRows.map((item) => item.type),
    playerProfile,
    refereeProfile,
  };
}

export async function createProfile(input: CreateCommonProfileInput): Promise<CreateProfileResult> {
  const response = await invokeFunction<ApiResponse<CreateProfileResult>>("create-profile", {
    display_name: input.displayName,
    birth_year: input.birthYear,
    country_code: input.countryCode,
    province_code: input.provinceCode,
    district_code: input.districtCode,
    preferred_language: input.preferredLanguage,
    bio: input.bio,
    initial_account_type: input.initialAccountType,
    visibility: input.visibility ?? "members_only",
  });

  return assertSuccess(response, "Failed to create common profile.");
}

export async function updateProfile(input: UpdateCommonProfileInput): Promise<UpdateProfileResult> {
  const response = await invokeFunction<ApiResponse<UpdateProfileResult>>("update-profile", {
    display_name: input.displayName,
    birth_year: input.birthYear,
    country_code: input.countryCode,
    province_code: input.provinceCode,
    district_code: input.districtCode,
    preferred_language: input.preferredLanguage,
    bio: input.bio,
    visibility: input.visibility,
  });

  return assertSuccess(response, "Failed to update profile.");
}

export async function updateProfileVisibility(
  visibility: SupportedVisibility,
): Promise<UpdateProfileVisibilityResult> {
  const response = await invokeFunction<ApiResponse<UpdateProfileVisibilityResult>>(
    "update-profile-visibility",
    { visibility },
  );

  return assertSuccess(response, "Failed to update profile visibility.");
}

export async function requestAvatarUpload(
  input: RequestAvatarUploadInput,
): Promise<RequestAvatarUploadResult> {
  const response = await invokeFunction<ApiResponse<RequestAvatarUploadResult>>("upload-avatar", {
    file_name: input.fileName,
    content_type: input.contentType,
  });

  return assertSuccess(response, "Failed to request avatar upload URL.");
}

export async function uploadAvatarToSignedUrl(
  uploadUrl: string,
  contentType: SupportedAvatarContentType,
  fileBody: AvatarUploadBinary,
): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": contentType,
    },
    body: fileBody as unknown as BodyInit,
  });

  if (!response.ok) {
    throw new Error(`Avatar upload failed with HTTP ${response.status}.`);
  }
}

export async function uploadAvatar(input: UploadAvatarInput): Promise<RequestAvatarUploadResult> {
  const uploadRequest = await requestAvatarUpload({
    fileName: input.fileName,
    contentType: input.contentType,
  });
  const fileBody = await readAvatarFile(input.uri);

  await uploadAvatarToSignedUrl(uploadRequest.upload_url, input.contentType, fileBody);

  return uploadRequest;
}

export async function addAccountType(type: AccountType): Promise<AddAccountTypeResult> {
  const response = await invokeFunction<ApiResponse<AddAccountTypeResult>>("add-account-type", {
    type,
  });

  return assertSuccess(response, "Failed to add account type.");
}

export async function createPlayerProfile(
  input: CreatePlayerProfileInput,
): Promise<RoleProfileResult> {
  const response = await invokeFunction<ApiResponse<RoleProfileResult>>("create-player-profile", {
    preferred_position: input.preferredPosition,
    preferred_foot: input.preferredFoot,
    dominant_foot: input.dominantFoot,
    top_size: input.topSize,
    shoe_size: input.shoeSize,
  });

  return assertSuccess(response, "Failed to create player profile.");
}

export async function updatePlayerProfile(
  input: UpdatePlayerProfileInput,
): Promise<RoleProfileResult> {
  const response = await invokeFunction<ApiResponse<RoleProfileResult>>("update-player-profile", {
    preferred_position: input.preferredPosition,
    preferred_foot: input.preferredFoot,
    dominant_foot: input.dominantFoot,
    top_size: input.topSize,
    shoe_size: input.shoeSize,
    left_foot_skill: input.leftFootSkill,
    right_foot_skill: input.rightFootSkill,
    play_styles: input.playStyles,
  });

  return assertSuccess(response, "Failed to update player profile.");
}

export async function createRefereeProfile(): Promise<RoleProfileResult> {
  const response = await invokeFunction<ApiResponse<RoleProfileResult>>("create-referee-profile");

  return assertSuccess(response, "Failed to create referee profile.");
}
