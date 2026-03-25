import {
  createServiceRoleClient,
  createUserClient,
  getSupabaseUrl,
  requireUser,
} from "../_shared/auth.ts";
import {
  errorResponse,
  handleOptionsRequest,
  parseJsonBody,
  successResponse,
} from "../_shared/http.ts";
import { readRequiredString } from "../_shared/validation.ts";
import type { SupportedAvatarContentType } from "../_shared/types.ts";

const ALLOWED_CONTENT_TYPES: readonly SupportedAvatarContentType[] = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
] as const;

function assertAvatarContentType(value: string): SupportedAvatarContentType {
  if ((ALLOWED_CONTENT_TYPES as readonly string[]).includes(value)) {
    return value as SupportedAvatarContentType;
  }

  throw new Error("Unsupported avatar content_type.");
}

function getExtension(contentType: SupportedAvatarContentType): string {
  switch (contentType) {
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/heic":
      return "heic";
    case "image/heif":
      return "heif";
    case "image/jpeg":
    default:
      return "jpg";
  }
}

function toAbsoluteUploadUrl(relativeOrAbsoluteUrl: string): string {
  if (relativeOrAbsoluteUrl.startsWith("http://") || relativeOrAbsoluteUrl.startsWith("https://")) {
    return relativeOrAbsoluteUrl;
  }

  return `${getSupabaseUrl()}/storage/v1${relativeOrAbsoluteUrl}`;
}

Deno.serve(async (request: Request): Promise<Response> => {
  const optionsResponse = handleOptionsRequest(request);

  if (optionsResponse) {
    return optionsResponse;
  }

  if (request.method !== "POST") {
    return errorResponse("method_not_allowed", "POST requests only.", 405);
  }

  try {
    const userClient = createUserClient(request);
    const user = await requireUser(userClient);
    const body = await parseJsonBody(request);

    const fileName = readRequiredString(body, "file_name");
    const contentType = assertAvatarContentType(readRequiredString(body, "content_type"));

    const { data: profile, error: profileError } = await userClient
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      throw new Error(profileError.message);
    }

    if (!profile) {
      return errorResponse("profile_missing", "Common profile is required before avatar upload.", 404);
    }

    const extension = getExtension(contentType);
    const storagePath = `${user.id}/profile.${extension}`;
    const serviceClient = createServiceRoleClient();

    const { data: signedUpload, error: signedUploadError } = await serviceClient.storage
      .from("avatars")
      .createSignedUploadUrl(storagePath);

    if (signedUploadError || !signedUpload) {
      throw new Error(signedUploadError?.message ?? "Failed to create signed upload URL.");
    }

    const { data: publicUrlData } = serviceClient.storage.from("avatars").getPublicUrl(storagePath);
    const avatarUrl = publicUrlData.publicUrl;

    const { error: updateProfileError } = await serviceClient
      .from("profiles")
      .update({ avatar_url: avatarUrl })
      .eq("id", user.id);

    if (updateProfileError) {
      throw new Error(updateProfileError.message);
    }

    return successResponse(
      {
        upload_url: toAbsoluteUploadUrl(signedUpload.signedUrl),
        avatar_url: avatarUrl,
        storage_path: storagePath,
        file_name: fileName,
      },
      200,
    );
  } catch (error: unknown) {
    return errorResponse(
      "upload_avatar_failed",
      error instanceof Error ? error.message : "Avatar upload preparation failed.",
      400,
    );
  }
});
