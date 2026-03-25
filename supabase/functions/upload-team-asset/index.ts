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

const TEAM_ASSET_KINDS = ["emblem", "photo"] as const;
type TeamAssetKind = (typeof TEAM_ASSET_KINDS)[number];

function assertContentType(value: string): SupportedAvatarContentType {
  if ((ALLOWED_CONTENT_TYPES as readonly string[]).includes(value)) {
    return value as SupportedAvatarContentType;
  }

  throw new Error("Unsupported team asset content_type.");
}

function assertAssetKind(value: string): TeamAssetKind {
  if ((TEAM_ASSET_KINDS as readonly string[]).includes(value)) {
    return value as TeamAssetKind;
  }

  throw new Error("Unsupported team asset kind.");
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
    const contentType = assertContentType(readRequiredString(body, "content_type"));
    const kind = assertAssetKind(readRequiredString(body, "kind"));

    const { data: profile, error: profileError } = await userClient
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      throw new Error(profileError.message);
    }

    if (!profile) {
      return errorResponse("profile_missing", "Common profile is required before team asset upload.", 404);
    }

    const extension = getExtension(contentType);
    const storagePath = `${user.id}/${kind}/${crypto.randomUUID()}.${extension}`;
    const serviceClient = createServiceRoleClient();

    const { data: signedUpload, error: signedUploadError } = await serviceClient.storage
      .from("team-assets")
      .createSignedUploadUrl(storagePath);

    if (signedUploadError || !signedUpload) {
      throw new Error(signedUploadError?.message ?? "Failed to create signed upload URL.");
    }

    const { data: publicUrlData } = serviceClient.storage.from("team-assets").getPublicUrl(storagePath);

    return successResponse(
      {
        upload_url: toAbsoluteUploadUrl(signedUpload.signedUrl),
        asset_url: publicUrlData.publicUrl,
        storage_path: storagePath,
        file_name: fileName,
        kind,
      },
      200,
    );
  } catch (error: unknown) {
    return errorResponse(
      "upload_team_asset_failed",
      error instanceof Error ? error.message : "Team asset upload preparation failed.",
      400,
    );
  }
});