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
    const announcementId = readRequiredString(body, "announcement_id");

    const announcementResult = await serviceClient
      .from("team_announcements")
      .select("id, team_id, author_id, title, body, is_pinned, created_at")
      .eq("id", announcementId)
      .maybeSingle();

    if (announcementResult.error) {
      return errorResponse("toggle_announcement_pin_failed", announcementResult.error.message, 400);
    }

    if (!announcementResult.data) {
      return errorResponse("announcement_not_found", "Announcement was not found.", 404);
    }

    await assertManagerRole(serviceClient, announcementResult.data.team_id, user.id);

    const updateResult = await serviceClient
      .from("team_announcements")
      .update({ is_pinned: !announcementResult.data.is_pinned })
      .eq("id", announcementId)
      .select("id, team_id, author_id, title, body, is_pinned, created_at")
      .single();

    if (updateResult.error) {
      return errorResponse("toggle_announcement_pin_failed", updateResult.error.message, 400);
    }

    return successResponse(updateResult.data, 200);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to toggle announcement pin.";
    const code = message === "NOT_MANAGER" ? "NOT_MANAGER" : "toggle_announcement_pin_failed";
    const status = message === "NOT_MANAGER" ? 403 : 400;
    return errorResponse(code, message, status);
  }
});