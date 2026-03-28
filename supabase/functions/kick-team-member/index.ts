import { createServiceRoleClient, createUserClient, requireUser } from "../_shared/auth.ts";
import { errorResponse, handleOptionsRequest, parseJsonBody, successResponse } from "../_shared/http.ts";
import { readRequiredString } from "../_shared/validation.ts";

type TeamMemberRow = {
  id: string;
  team_id: string;
  user_id: string;
  role: string;
  status: string;
  squad_number: number | null;
  kicked_by: string | null;
  kicked_at: string | null;
};

async function assertOwner(
  client: ReturnType<typeof createServiceRoleClient>,
  teamId: string,
  userId: string,
): Promise<void> {
  const { data, error } = await client
    .from("team_members")
    .select("id")
    .eq("team_id", teamId)
    .eq("user_id", userId)
    .eq("role", "owner")
    .eq("status", "active")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Only the team owner can kick team members.");
  }
}

async function getTargetMembership(
  client: ReturnType<typeof createServiceRoleClient>,
  teamId: string,
  targetUserId: string,
): Promise<TeamMemberRow> {
  const { data, error } = await client
    .from("team_members")
    .select("id, team_id, user_id, role, status, squad_number, kicked_by, kicked_at")
    .eq("team_id", teamId)
    .eq("user_id", targetUserId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Target team member was not found.");
  }

  return data as TeamMemberRow;
}

async function insertAuditLog(
  client: ReturnType<typeof createServiceRoleClient>,
  actorUserId: string,
  entityId: string,
  reason: string,
  beforeData: Record<string, unknown>,
  afterData: Record<string, unknown>,
): Promise<void> {
  const { error } = await client.from("audit_logs").insert({
    actor_user_id: actorUserId,
    entity_type: "team_member",
    entity_id: entityId,
    action: "team_member_kicked",
    before_data: beforeData,
    after_data: {
      ...afterData,
      reason,
    },
  });

  if (error) {
    throw new Error(error.message);
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
    const body = await parseJsonBody(request);

    const teamId = readRequiredString(body, "team_id");
    const targetUserId = readRequiredString(body, "target_user_id");
    const reason = readRequiredString(body, "reason");

    if (targetUserId === user.id) {
      return errorResponse("self_kick_forbidden", "Owner cannot kick themselves.", 409);
    }

    await assertOwner(serviceClient, teamId, user.id);
    const membership = await getTargetMembership(serviceClient, teamId, targetUserId);

    if (membership.status !== "active") {
      return errorResponse("inactive_team_member", "Only active team members can be kicked.", 409);
    }

    if (membership.role === "owner") {
      return errorResponse("owner_kick_forbidden", "Owner cannot be kicked from the team.", 409);
    }

    const kickedAt = new Date().toISOString();
    const { error: updateError } = await serviceClient
      .from("team_members")
      .update({
        status: "banned",
        kicked_by: user.id,
        kicked_at: kickedAt,
        updated_at: kickedAt,
      })
      .eq("id", membership.id);

    if (updateError) {
      return errorResponse("team_member_kick_failed", updateError.message, 400);
    }

    await insertAuditLog(
      serviceClient,
      user.id,
      membership.id,
      reason,
      {
        role: membership.role,
        status: membership.status,
        squad_number: membership.squad_number,
      },
      {
        role: membership.role,
        status: "banned",
        squad_number: membership.squad_number,
        kicked_by: user.id,
        kicked_at: kickedAt,
      },
    );

    return successResponse(
      {
        team_member_id: membership.id,
        team_id: membership.team_id,
        target_user_id: membership.user_id,
        status: "banned",
        kicked_at: kickedAt,
      },
      200,
    );
  } catch (error: unknown) {
    return errorResponse(
      "kick_team_member_failed",
      error instanceof Error ? error.message : "Failed to kick the team member.",
      400,
    );
  }
});
