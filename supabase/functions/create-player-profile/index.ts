import { createUserClient, requireUser } from "../_shared/auth.ts";
import { errorResponse, handleOptionsRequest, parseJsonBody, successResponse } from "../_shared/http.ts";
import {
  assertFoot,
  assertPosition,
  readOptionalString,
  readRequiredString,
} from "../_shared/validation.ts";

Deno.serve(async (request: Request): Promise<Response> => {
  const optionsResponse = handleOptionsRequest(request);

  if (optionsResponse) {
    return optionsResponse;
  }

  if (request.method !== "POST") {
    return errorResponse("method_not_allowed", "Only POST is allowed.", 405);
  }

  try {
    const client = createUserClient(request);
    const user = await requireUser(client);
    const body = await parseJsonBody(request);

    const preferredPosition = assertPosition(readRequiredString(body, "preferred_position"));
    const preferredFoot = assertFoot(readRequiredString(body, "preferred_foot"));
    const dominantFoot = assertFoot(readRequiredString(body, "dominant_foot"));
    const topSize = readOptionalString(body, "top_size") ?? "";
    const shoeSize = readOptionalString(body, "shoe_size") ?? "";

    const { data: role, error: roleError } = await client
      .from("account_types")
      .select("user_id")
      .eq("user_id", user.id)
      .eq("type", "player")
      .maybeSingle();

    if (roleError) {
      throw new Error(roleError.message);
    }

    if (!role) {
      return errorResponse("player_role_required", "Player role is required first.", 400);
    }

    const { data: existing, error: existingError } = await client
      .from("player_profiles")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingError) {
      throw new Error(existingError.message);
    }

    if (existing) {
      return errorResponse("player_profile_exists", "Player profile already exists.", 409);
    }

    const { error: insertError } = await client.from("player_profiles").insert({
      user_id: user.id,
      preferred_position: preferredPosition,
      position_first: preferredPosition,
      preferred_foot: preferredFoot,
      dominant_foot: dominantFoot,
      top_size: topSize || null,
      shoe_size: shoeSize || null,
      skill_tier: 0,
      reputation_score: 0,
      stat_stamina: 50,
      stat_dribble: 50,
      stat_shooting: 50,
      stat_passing: 50,
      stat_defense: 50,
      stat_speed: 50,
    });

    if (insertError) {
      throw new Error(insertError.message);
    }

    return successResponse(
      {
        user_id: user.id,
        existed: false,
      },
      201,
    );
  } catch (error: unknown) {
    return errorResponse(
      "create_player_profile_failed",
      error instanceof Error ? error.message : "Could not create the player profile.",
      400,
    );
  }
});