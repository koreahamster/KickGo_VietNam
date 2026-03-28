import { createServiceRoleClient, createUserClient, requireUser } from "../_shared/auth.ts";
import { errorResponse, handleOptionsRequest, parseJsonBody, successResponse } from "../_shared/http.ts";

const ALLOWED_STATUSES = ["open", "closed", "invite_only"] as const;
type RecruitmentStatus = (typeof ALLOWED_STATUSES)[number];

function readRequestBody(body: unknown): { teamId: string; recruitmentStatus: RecruitmentStatus } {
  if (!body || typeof body !== "object") {
    throw new Error("request body must be an object.");
  }

  const record = body as Record<string, unknown>;
  const teamId = typeof record.team_id === "string" ? record.team_id.trim() : "";
  const recruitmentStatus = typeof record.recruitment_status === "string" ? record.recruitment_status.trim() : "";

  if (!teamId) {
    throw new Error("team_id is required.");
  }

  if (!ALLOWED_STATUSES.includes(recruitmentStatus as RecruitmentStatus)) {
    throw new Error("recruitment_status is invalid.");
  }

  return { teamId, recruitmentStatus: recruitmentStatus as RecruitmentStatus };
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
    const body = await parseJsonBody(request);
    const { teamId, recruitmentStatus } = readRequestBody(body);

    const { data: membership, error: membershipError } = await serviceClient
      .from("team_members")
      .select("role")
      .eq("team_id", teamId)
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    if (membershipError) {
      return errorResponse("membership_lookup_failed", membershipError.message, 400);
    }

    if (!membership || !["owner", "manager"].includes(membership.role)) {
      return errorResponse("NOT_MANAGER", "Manager permission is required.", 403);
    }

    const { data: team, error: updateError } = await serviceClient
      .from("teams")
      .update({
        recruitment_status: recruitmentStatus,
        is_recruiting: recruitmentStatus === "open",
      })
      .eq("id", teamId)
      .select("*")
      .single();

    if (updateError) {
      return errorResponse("team_update_failed", updateError.message, 400);
    }

    return successResponse(team, 200);
  } catch (error: unknown) {
    return errorResponse(
      "update_team_recruitment_status_failed",
      error instanceof Error ? error.message : "Failed to update recruitment status.",
      400,
    );
  }
});