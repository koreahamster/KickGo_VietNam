import { createServiceRoleClient, createUserClient, getSupabaseUrl, requireUser } from "../_shared/auth.ts";
import { errorResponse, handleOptionsRequest, parseJsonBody, successResponse } from "../_shared/http.ts";

const ALLOWED_PROVIDERS = ["momo", "zalopay", "bank"] as const;
type Provider = (typeof ALLOWED_PROVIDERS)[number];
const ALLOWED_CONTENT_TYPES = ["image/jpeg", "image/png"] as const;
type ContentType = (typeof ALLOWED_CONTENT_TYPES)[number];
const MAX_BYTES = 2 * 1024 * 1024;

function readBody(body: Record<string, unknown>): {
  teamId: string;
  provider: Provider;
  fileName: string;
  contentType: ContentType;
  base64Data: string;
} {
  const teamId = typeof body.team_id === "string" ? body.team_id.trim() : "";
  const provider = typeof body.provider === "string" ? body.provider.trim() : "";
  const fileName = typeof body.file_name === "string" ? body.file_name.trim() : "";
  const contentType = typeof body.content_type === "string" ? body.content_type.trim() : "";
  const base64Data = typeof body.base64_data === "string" ? body.base64_data.trim() : "";

  if (!teamId) {
    throw new Error("team_id is required.");
  }
  if (!ALLOWED_PROVIDERS.includes(provider as Provider)) {
    throw new Error("provider is invalid.");
  }
  if (!fileName) {
    throw new Error("file_name is required.");
  }
  if (!ALLOWED_CONTENT_TYPES.includes(contentType as ContentType)) {
    throw new Error("content_type is invalid.");
  }
  if (!base64Data) {
    throw new Error("base64_data is required.");
  }

  return {
    teamId,
    provider: provider as Provider,
    fileName,
    contentType: contentType as ContentType,
    base64Data,
  };
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function getExtension(contentType: ContentType): string {
  return contentType === "image/png" ? "png" : "jpg";
}

async function assertManagerRole(teamId: string, userId: string): Promise<void> {
  const serviceClient = createServiceRoleClient();
  const { data, error } = await serviceClient
    .from("team_members")
    .select("role")
    .eq("team_id", teamId)
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data || !["owner", "manager"].includes(String(data.role))) {
    throw new Error("NOT_MANAGER");
  }
}

function buildPublicUrl(path: string): string {
  return `${getSupabaseUrl()}/storage/v1/object/public/team-assets/${path}`;
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
    const input = readBody(body);

    await assertManagerRole(input.teamId, user.id);

    const bytes = base64ToUint8Array(input.base64Data);
    if (bytes.byteLength > MAX_BYTES) {
      return errorResponse("QR_IMAGE_TOO_LARGE", "QR image must be 2MB or smaller.", 400);
    }

    const serviceClient = createServiceRoleClient();
    const extension = getExtension(input.contentType);
    const storagePath = `${input.teamId}/qr/${input.provider}.${extension}`;

    const { error: uploadError } = await serviceClient.storage
      .from("team-assets")
      .upload(storagePath, bytes, {
        contentType: input.contentType,
        upsert: true,
      });

    if (uploadError) {
      return errorResponse("upload_fee_qr_failed", uploadError.message, 400);
    }

    return successResponse(
      {
        qr_image_url: buildPublicUrl(storagePath),
        storage_path: storagePath,
        provider: input.provider,
      },
      200,
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to upload fee QR image.";
    const code = message === "NOT_MANAGER" ? "NOT_MANAGER" : "upload_fee_qr_failed";
    const status = message === "NOT_MANAGER" ? 403 : 400;
    return errorResponse(code, message, status);
  }
});