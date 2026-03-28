import { createUserClient, requireUser } from "../_shared/auth.ts";
import { errorResponse, handleOptionsRequest, parseJsonBody, successResponse } from "../_shared/http.ts";
import {
  assertFoot,
  assertFootSkill,
  assertPlayStyles,
  assertPosition,
  assertStatValue,
  readOptionalNullableNumber,
  readOptionalString,
  readOptionalStringArray,
} from "../_shared/validation.ts";

function readOptionalNullableText(body: unknown, key: string): string | null | undefined {
  if (!(body instanceof Object) || !(key in body)) {
    return undefined;
  }

  const value = (body as Record<string, unknown>)[key];

  if (value === null) {
    return null;
  }

  if (typeof value === "string") {
    return value.trim();
  }

  throw new Error(`${key} must be a string or null.`);
}

function ensureUniquePositions(values: Array<string | null | undefined>): void {
  const filtered = values.filter((value): value is string => typeof value === "string" && value.length > 0);
  const unique = new Set(filtered);

  if (unique.size !== filtered.length) {
    throw new Error("Preferred positions must be unique.");
  }
}

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

    const preferredPosition = readOptionalString(body, "preferred_position");
    const positionFirst = readOptionalNullableText(body, "position_first");
    const positionSecond = readOptionalNullableText(body, "position_second");
    const positionThird = readOptionalNullableText(body, "position_third");
    const preferredFoot = readOptionalString(body, "preferred_foot");
    const dominantFoot = readOptionalString(body, "dominant_foot");
    const topSize = readOptionalNullableText(body, "top_size");
    const shoeSize = readOptionalNullableText(body, "shoe_size");
    const leftFootSkill = readOptionalNullableNumber(body, "left_foot_skill");
    const rightFootSkill = readOptionalNullableNumber(body, "right_foot_skill");
    const statStamina = readOptionalNullableNumber(body, "stat_stamina");
    const statDribble = readOptionalNullableNumber(body, "stat_dribble");
    const statShooting = readOptionalNullableNumber(body, "stat_shooting");
    const statPassing = readOptionalNullableNumber(body, "stat_passing");
    const statDefense = readOptionalNullableNumber(body, "stat_defense");
    const statSpeed = readOptionalNullableNumber(body, "stat_speed");
    const playStyles = readOptionalStringArray(body, "play_styles");

    if (
      preferredPosition === undefined &&
      positionFirst === undefined &&
      positionSecond === undefined &&
      positionThird === undefined &&
      preferredFoot === undefined &&
      dominantFoot === undefined &&
      topSize === undefined &&
      shoeSize === undefined &&
      leftFootSkill === undefined &&
      rightFootSkill === undefined &&
      statStamina === undefined &&
      statDribble === undefined &&
      statShooting === undefined &&
      statPassing === undefined &&
      statDefense === undefined &&
      statSpeed === undefined &&
      playStyles === undefined
    ) {
      return errorResponse("empty_update", "No fields were provided for update.", 400);
    }

    const { data: existing, error: existingError } = await client
      .from("player_profiles")
      .select("user_id, position_first, position_second, position_third")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingError) {
      throw new Error(existingError.message);
    }

    if (!existing) {
      return errorResponse("player_profile_missing", "Player profile does not exist.", 404);
    }

    const updatePayload: Record<string, string | string[] | number | null> = {};

    const normalizedPositionFirst = positionFirst === undefined ? preferredPosition : positionFirst;
    const nextPositionFirst = normalizedPositionFirst === undefined
      ? existing.position_first ?? null
      : normalizedPositionFirst === null || normalizedPositionFirst === ""
      ? null
      : assertPosition(normalizedPositionFirst);
    const nextPositionSecond = positionSecond === undefined
      ? existing.position_second ?? null
      : positionSecond === null || positionSecond === ""
      ? null
      : assertPosition(positionSecond);
    const nextPositionThird = positionThird === undefined
      ? existing.position_third ?? null
      : positionThird === null || positionThird === ""
      ? null
      : assertPosition(positionThird);

    ensureUniquePositions([nextPositionFirst, nextPositionSecond, nextPositionThird]);

    if (normalizedPositionFirst !== undefined) {
      if (!nextPositionFirst) {
        throw new Error("position_first is required.");
      }

      updatePayload.position_first = nextPositionFirst;
      updatePayload.preferred_position = nextPositionFirst;
    }

    if (positionSecond !== undefined) {
      updatePayload.position_second = nextPositionSecond;
    }

    if (positionThird !== undefined) {
      updatePayload.position_third = nextPositionThird;
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

    if (leftFootSkill !== undefined) {
      if (leftFootSkill === null) {
        throw new Error("left_foot_skill cannot be null.");
      }

      updatePayload.left_foot_skill = assertFootSkill(leftFootSkill);
    }

    if (rightFootSkill !== undefined) {
      if (rightFootSkill === null) {
        throw new Error("right_foot_skill cannot be null.");
      }

      updatePayload.right_foot_skill = assertFootSkill(rightFootSkill);
    }

    if (statStamina !== undefined) {
      if (statStamina === null) throw new Error("stat_stamina cannot be null.");
      updatePayload.stat_stamina = assertStatValue(statStamina, "stat_stamina");
    }

    if (statDribble !== undefined) {
      if (statDribble === null) throw new Error("stat_dribble cannot be null.");
      updatePayload.stat_dribble = assertStatValue(statDribble, "stat_dribble");
    }

    if (statShooting !== undefined) {
      if (statShooting === null) throw new Error("stat_shooting cannot be null.");
      updatePayload.stat_shooting = assertStatValue(statShooting, "stat_shooting");
    }

    if (statPassing !== undefined) {
      if (statPassing === null) throw new Error("stat_passing cannot be null.");
      updatePayload.stat_passing = assertStatValue(statPassing, "stat_passing");
    }

    if (statDefense !== undefined) {
      if (statDefense === null) throw new Error("stat_defense cannot be null.");
      updatePayload.stat_defense = assertStatValue(statDefense, "stat_defense");
    }

    if (statSpeed !== undefined) {
      if (statSpeed === null) throw new Error("stat_speed cannot be null.");
      updatePayload.stat_speed = assertStatValue(statSpeed, "stat_speed");
    }

    if (playStyles !== undefined) {
      updatePayload.play_styles = assertPlayStyles(playStyles);
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
      error instanceof Error ? error.message : "Could not update the player profile.",
      400,
    );
  }
});