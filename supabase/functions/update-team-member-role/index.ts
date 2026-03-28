import { createServiceRoleClient, createUserClient, requireUser } from "../_shared/auth.ts";
import { errorResponse, handleOptionsRequest, parseJsonBody, successResponse } from "../_shared/http.ts";
import { readRequiredString } from "../_shared/validation.ts";

const MANAGEABLE_ROLES = ["manager", "captain", "player"] as const;
type ManageableRole = (typeof MANAGEABLE_ROLES)[number];

type TeamMemberRow = {
  id: string;
  team_id: string;
  user_id: string;
  role: string;
  status: string;
  squad_number: number | null;
};

function assertManageableRole(value: string): ManageableRole {
  if ((MANAGEABLE_ROLES as readonly string[]).includes(value)) {
    return value as ManageableRole;
  }

  throw new Error("role must be one of manager, captain, or player.");
}

function readOptionalSquadNumber(body: Record<string, unknown>): number | null {
  const value = body.squad_number;

  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value !== "number" || !Number.isInteger(value)) {
    throw new Error("squad_number must be an integer or null.");
  }

  if (value < 1 || value > 99) {
    throw new Error("squad_number must be between 1 and 99.");
  }

  return value;
}

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
    throw new Error("Only the team owner can manage member roles.");
  }
}

async function getTargetMembership(
  client: ReturnType<typeof createServiceRoleClient>,
  teamId: string,
  targetUserId: string,
): Promise<TeamMemberRow> {
  const { data, error } = await client
    .from("team_members")
    .select("id, team_id, user_id, role, status, squad_number")
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

async function assertSquadNumberAvailable(
  client: ReturnType<typeof createServiceRoleClient>,
  teamId: string,
  memberId: string,
  squadNumber: number | null,
): Promise<void> {
  if (squadNumber === null) {
    return;
  }

  const { data, error } = await client
    .from("team_members")
    .select("id")
    .eq("team_id", teamId)
    .eq("squad_number", squadNumber)
    .neq("id", memberId)
    .eq("status", "active")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (data) {
    throw new Error("SQUAD_NUMBER_TAKEN");
  }
}

async function insertAuditLog(
  client: ReturnType<typeof createServiceRoleClient>,
  actorUserId: string,
  entityId: string,
  action: string,
  beforeData: Record<string, unknown>,
  afterData: Record<string, unknown>,
): Promise<void> {
  const { error } = await client.from("audit_logs").insert({
    actor_user_id: actorUserId,
    entity_type: "team_member",
    entity_id: entityId,
    action,
    before_data: beforeData,
    after_data: afterData,
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
    const nextRole = assertManageableRole(readRequiredString(body, "role"));
    const squadNumber = readOptionalSquadNumber(body);

    if (targetUserId === user.id) {
      return errorResponse("self_role_change_forbidden", "Owner cannot change their own role.", 409);
    }

    await assertOwner(serviceClient, teamId, user.id);
    const membership = await getTargetMembership(serviceClient, teamId, targetUserId);

    if (membership.status !== "active") {
      return errorResponse("inactive_team_member", "Only active team members can be updated.", 409);
    }

    if (membership.role === "owner") {
      return errorResponse("owner_role_locked", "Owner role cannot be changed.", 409);
    }

    await assertSquadNumberAvailable(serviceClient, teamId, membership.id, squadNumber);

    if (membership.role === nextRole && membership.squad_number === squadNumber) {
      return successResponse(
        {
          team_member_id: membership.id,
          team_id: membership.team_id,
          target_user_id: membership.user_id,
          role: membership.role,
          status: membership.status,
          squad_number: membership.squad_number,
        },
        200,
      );
    }

    const { error: updateError } = await serviceClient
      .from("team_members")
      .update({
        role: nextRole,
        squad_number: squadNumber,
        updated_at: new Date().toISOString(),
      })
      .eq("id", membership.id);

    if (updateError) {
      if (typeof updateError.message === "string" && updateError.message.includes("team_members_team_id_squad_number_unique_idx")) {
        return errorResponse("SQUAD_NUMBER_TAKEN", "SQUAD_NUMBER_TAKEN", 409);
      }

      return errorResponse("team_member_role_update_failed", updateError.message, 400);
    }

    await insertAuditLog(
      serviceClient,
      user.id,
      membership.id,
      "team_member_role_updated",
      {
        role: membership.role,
        status: membership.status,
        squad_number: membership.squad_number,
      },
      {
        role: nextRole,
        status: membership.status,
        squad_number: squadNumber,
      },
    );

    return successResponse(
      {
        team_member_id: membership.id,
        team_id: membership.team_id,
        target_user_id: membership.user_id,
        role: nextRole,
        status: membership.status,
        squad_number: squadNumber,
      },
      200,
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update team member role.";
    const code = message === "SQUAD_NUMBER_TAKEN" ? "SQUAD_NUMBER_TAKEN" : "update_team_member_role_failed";
    const status = message === "SQUAD_NUMBER_TAKEN" ? 409 : 400;

    return errorResponse(code, message, status);
  }
});
