import { createServiceRoleClient, createUserClient, requireUser } from "../_shared/auth.ts";
import { errorResponse, handleOptionsRequest, successResponse } from "../_shared/http.ts";

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function parseBody(request: Request): Promise<Record<string, unknown>> {
  const body = await request.json().catch(() => null);
  if (!isObjectRecord(body)) {
    throw new Error("Request body must be a JSON object.");
  }
  return body;
}

function readRequiredString(body: Record<string, unknown>, key: string): string {
  const value = body[key];
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${key} is required.`);
  }
  return value.trim();
}

function readNullableString(body: Record<string, unknown>, key: string): string | null {
  const value = body[key];
  if (value === undefined || value === null || value === "") {
    return null;
  }
  if (typeof value !== "string") {
    throw new Error(`${key} must be a string or null.`);
  }
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
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
    const serviceClient = createServiceRoleClient();
    const body = await parseBody(request);
    const postId = readRequiredString(body, "post_id");
    const message = readNullableString(body, "message");

    const { data: post, error: postError } = await serviceClient
      .from("mercenary_posts")
      .select("id, team_id, status")
      .eq("id", postId)
      .maybeSingle();

    if (postError || !post) {
      return errorResponse("mercenary_post_not_found", postError?.message ?? "Mercenary post was not found.", 404);
    }

    if (post.status !== "open") {
      return errorResponse("MERCENARY_POST_CLOSED", "Mercenary post is not open.", 400);
    }

    const { data: ownMembership, error: ownMembershipError } = await serviceClient
      .from("team_members")
      .select("id")
      .eq("team_id", post.team_id)
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    if (ownMembershipError) {
      return errorResponse("self_apply_check_failed", ownMembershipError.message, 400);
    }

    if (ownMembership) {
      return errorResponse("SELF_APPLY_NOT_ALLOWED", "Self apply is not allowed.", 400);
    }

    const { data: existing, error: existingError } = await serviceClient
      .from("mercenary_applications")
      .select("id")
      .eq("post_id", postId)
      .eq("applicant_id", user.id)
      .maybeSingle();

    if (existingError) {
      return errorResponse("application_check_failed", existingError.message, 400);
    }

    if (existing) {
      return errorResponse("ALREADY_APPLIED", "Already applied.", 400);
    }

    const { data, error } = await serviceClient
      .from("mercenary_applications")
      .insert({
        post_id: postId,
        applicant_id: user.id,
        message,
        status: "pending",
      })
      .select("id, post_id, applicant_id, message, status, created_at")
      .single();

    if (error || !data) {
      return errorResponse("apply_mercenary_failed", error?.message ?? "Failed to apply mercenary.", 400);
    }

    return successResponse(data, 201);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to apply mercenary.";
    return errorResponse("apply_mercenary_failed", message, 400);
  }
});