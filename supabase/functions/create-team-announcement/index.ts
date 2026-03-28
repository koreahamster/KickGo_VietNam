import { createServiceRoleClient, createUserClient, requireUser } from "../_shared/auth.ts";
import { errorResponse, handleOptionsRequest, successResponse } from "../_shared/http.ts";
import { readRequiredString } from "../_shared/validation.ts";

async function parseBody(request: Request): Promise<Record<string, unknown>> {
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new Error("Request body must be a JSON object.");
  }

  return body as Record<string, unknown>;
}

async function assertManagerRole(
  client: ReturnType<typeof createServiceRoleClient>,
  teamId: string,
  userId: string,
): Promise<void> {
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

  if (!data || !["owner", "manager"].includes(String(data.role))) {
    throw new Error("NOT_MANAGER");
  }
}

function readOptionalBoolean(body: Record<string, unknown>, key: string): boolean {
  const value = body[key];

  if (value === undefined) {
    return false;
  }

  if (typeof value !== "boolean") {
    throw new Error(`${key} must be a boolean.`);
  }

  return value;
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

    const teamId = readRequiredString(body, "team_id");
    const title = readRequiredString(body, "title");
    const messageBody = readRequiredString(body, "body");
    const isPinned = readOptionalBoolean(body, "is_pinned");

    if (title.length > 100) {
      return errorResponse("invalid_title", "title must be 100 characters or fewer.", 400);
    }

    if (messageBody.length > 2000) {
      return errorResponse("invalid_body", "body must be 2000 characters or fewer.", 400);
    }

    await assertManagerRole(serviceClient, teamId, user.id);

    const { data, error } = await serviceClient
      .from("team_announcements")
      .insert({
        team_id: teamId,
        title,
        body: messageBody,
        is_pinned: isPinned,
        author_id: user.id,
      })
      .select("id, team_id, author_id, title, body, is_pinned, created_at")
      .single();

    if (error) {
      return errorResponse("create_team_announcement_failed", error.message, 400);
    }

    return successResponse(data, 201);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create team announcement.";
    const code = message === "NOT_MANAGER" ? "NOT_MANAGER" : "create_team_announcement_failed";
    const status = message === "NOT_MANAGER" ? 403 : 400;
    return errorResponse(code, message, status);
  }
});