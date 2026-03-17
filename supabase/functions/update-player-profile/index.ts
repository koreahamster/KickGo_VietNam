import { createUserClient, requireUser } from "../_shared/auth.ts";
import { errorResponse, handleOptionsRequest, parseJsonBody, successResponse } from "../_shared/http.ts";
import {
  assertFoot,
  assertPosition,
  readOptionalString,
} from "../_shared/validation.ts";

Deno.serve(async (request: Request): Promise<Response> => {
  const optionsResponse = handleOptionsRequest(request);

  if (optionsResponse) {
    return optionsResponse;
  }

  if (request.method !== "POST") {
    return errorResponse("method_not_allowed", "POST 요청만 허용됩니다.", 405);
  }

  try {
    const client = createUserClient(request);
    const user = await requireUser(client);
    const body = await parseJsonBody(request);

    const preferredPosition = readOptionalString(body, "preferred_position");
    const preferredFoot = readOptionalString(body, "preferred_foot");
    const dominantFoot = readOptionalString(body, "dominant_foot");
    const topSize = readOptionalString(body, "top_size");
    const shoeSize = readOptionalString(body, "shoe_size");

    if (
      preferredPosition === undefined &&
      preferredFoot === undefined &&
      dominantFoot === undefined &&
      topSize === undefined &&
      shoeSize === undefined
    ) {
      return errorResponse("empty_update", "수정할 값이 없습니다.", 400);
    }

    const { data: existing, error: existingError } = await client
      .from("player_profiles")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingError) {
      throw new Error(existingError.message);
    }

    if (!existing) {
      return errorResponse("player_profile_missing", "선수 프로필이 존재하지 않습니다.", 404);
    }

    const updatePayload: Record<string, string | null> = {};

    if (preferredPosition !== undefined) {
      updatePayload.preferred_position = assertPosition(preferredPosition);
    }

    if (preferredFoot !== undefined) {
      updatePayload.preferred_foot = assertFoot(preferredFoot);
    }

    if (dominantFoot !== undefined) {
      updatePayload.dominant_foot = assertFoot(dominantFoot);
    }

    if (topSize !== undefined) {
      updatePayload.top_size = topSize || null;
    }

    if (shoeSize !== undefined) {
      updatePayload.shoe_size = shoeSize || null;
    }

    const { error: updateError } = await client
      .from("player_profiles")
      .update(updatePayload)
      .eq("user_id", user.id);

    if (updateError) {
      throw new Error(updateError.message);
    }

    return successResponse({
      user_id: user.id,
      existed: true,
    });
  } catch (error: unknown) {
    return errorResponse(
      "update_player_profile_failed",
      error instanceof Error ? error.message : "선수 프로필 수정에 실패했습니다.",
      400
    );
  }
});
