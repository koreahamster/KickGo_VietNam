import { createServiceRoleClient, createUserClient, requireUser } from "../_shared/auth.ts";
import {
  errorResponse,
  handleOptionsRequest,
  parseJsonBody,
  successResponse,
} from "../_shared/http.ts";
import { readRequiredString } from "../_shared/validation.ts";

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

    const inviteCode = readRequiredString(body, "invite_code").toUpperCase();

    const { data: profile, error: profileError } = await serviceClient
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      return errorResponse("profile_lookup_failed", profileError.message, 400);
    }

    if (!profile) {
      return errorResponse("profile_required", "Common profile is required before joining a team.", 400);
    }

    const { data: invite, error: inviteError } = await serviceClient
      .from("team_invites")
      .select("id, team_id, expires_at, used_by, used_at")
      .eq("invite_code", inviteCode)
      .maybeSingle();

    if (inviteError) {
      return errorResponse("team_invite_lookup_failed", inviteError.message, 400);
    }

    if (!invite) {
      return errorResponse("invite_not_found", "Invite code was not found.", 404);
    }

    if (invite.used_at || invite.used_by) {
      return errorResponse("invite_already_used", "Invite code has already been used.", 409);
    }

    if (invite.expires_at && new Date(invite.expires_at).getTime() < Date.now()) {
      return errorResponse("invite_expired", "Invite code has expired.", 409);
    }

    const { data: existingMembership, error: membershipLookupError } = await serviceClient
      .from("team_members")
      .select("id, status")
      .eq("team_id", invite.team_id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (membershipLookupError) {
      return errorResponse("team_membership_lookup_failed", membershipLookupError.message, 400);
    }

    if (existingMembership?.status === "active") {
      return errorResponse("already_joined", "You are already an active member of this team.", 409);
    }

    if (existingMembership) {
      const { error: updateMembershipError } = await serviceClient
        .from("team_members")
        .update({
          role: "player",
          status: "active",
          kicked_by: null,
          kicked_at: null,
          joined_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingMembership.id);

      if (updateMembershipError) {
        return errorResponse("team_membership_update_failed", updateMembershipError.message, 400);
      }
    } else {
      const { error: insertMembershipError } = await serviceClient.from("team_members").insert({
        team_id: invite.team_id,
        user_id: user.id,
        role: "player",
        status: "active",
        joined_at: new Date().toISOString(),
      });

      if (insertMembershipError) {
        return errorResponse("team_membership_insert_failed", insertMembershipError.message, 400);
      }
    }

    const { error: consumeInviteError } = await serviceClient
      .from("team_invites")
      .update({
        used_by: user.id,
        used_at: new Date().toISOString(),
      })
      .eq("id", invite.id);

    if (consumeInviteError) {
      return errorResponse("team_invite_consume_failed", consumeInviteError.message, 400);
    }

    return successResponse(
      {
        team_id: invite.team_id,
        joined_role: "player",
      },
      200,
    );
  } catch (error: unknown) {
    return errorResponse(
      "join_team_failed",
      error instanceof Error ? error.message : "Failed to join team.",
      400,
    );
  }
});
