import { createServiceRoleClient, createUserClient, requireUser } from "../_shared/auth.ts";
import {
  errorResponse,
  handleOptionsRequest,
  parseJsonBody,
  successResponse,
} from "../_shared/http.ts";
import { readRequiredString } from "../_shared/validation.ts";

function buildInviteCode(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();
}

async function isTeamManager(
  client: ReturnType<typeof createServiceRoleClient>,
  teamId: string,
  userId: string,
): Promise<boolean> {
  const { data, error } = await client
    .from("team_members")
    .select("id")
    .eq("team_id", teamId)
    .eq("user_id", userId)
    .in("role", ["owner", "manager"])
    .eq("status", "active")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return Boolean(data);
}

async function createUniqueInviteCode(client: ReturnType<typeof createServiceRoleClient>): Promise<string> {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const inviteCode = buildInviteCode();
    const { data, error } = await client
      .from("team_invites")
      .select("id")
      .eq("invite_code", inviteCode)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      return inviteCode;
    }
  }

  throw new Error("Failed to generate a unique invite code.");
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
    const canManageTeam = await isTeamManager(serviceClient, teamId, user.id);

    if (!canManageTeam) {
      return errorResponse("team_manager_required", "Only team owner or manager can create invites.", 403);
    }

    const inviteCode = await createUniqueInviteCode(serviceClient);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString();

    const { data: invite, error: inviteError } = await serviceClient
      .from("team_invites")
      .insert({
        team_id: teamId,
        invited_by: user.id,
        invite_code: inviteCode,
        invite_type: "code",
        expires_at: expiresAt,
      })
      .select("id, team_id, invite_code, expires_at")
      .single();

    if (inviteError) {
      return errorResponse("team_invite_insert_failed", inviteError.message, 400);
    }

    return successResponse(
      {
        invite_id: invite.id,
        team_id: invite.team_id,
        invite_code: invite.invite_code,
        expires_at: invite.expires_at,
      },
      201,
    );
  } catch (error: unknown) {
    return errorResponse(
      "create_team_invite_failed",
      error instanceof Error ? error.message : "Failed to create team invite.",
      400,
    );
  }
});
