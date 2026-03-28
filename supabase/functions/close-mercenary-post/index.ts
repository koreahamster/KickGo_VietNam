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

async function assertManagerRole(client: ReturnType<typeof createServiceRoleClient>, teamId: string, userId: string): Promise<void> {
  const { data, error } = await client
    .from("team_members")
    .select("role")
    .eq("team_id", teamId)
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data || (data.role !== "owner" && data.role !== "manager")) {
    throw new Error("NOT_MANAGER");
  }
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

    const { data: post, error: postError } = await serviceClient
      .from("mercenary_posts")
      .select("id, team_id")
      .eq("id", postId)
      .maybeSingle();

    if (postError || !post) {
      return errorResponse("mercenary_post_not_found", postError?.message ?? "Mercenary post was not found.", 404);
    }

    await assertManagerRole(serviceClient, post.team_id, user.id);

    const { data, error } = await serviceClient
      .from("mercenary_posts")
      .update({ status: "cancelled" })
      .eq("id", postId)
      .select("id, team_id, match_id, needed_positions, needed_count, province_code, description, status, created_by, created_at, updated_at")
      .single();

    if (error || !data) {
      return errorResponse("close_mercenary_post_failed", error?.message ?? "Failed to close mercenary post.", 400);
    }

    return successResponse(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to close mercenary post.";
    const status = message === "NOT_MANAGER" ? 403 : 400;
    const code = message === "NOT_MANAGER" ? "NOT_MANAGER" : "close_mercenary_post_failed";
    return errorResponse(code, message, status);
  }
});