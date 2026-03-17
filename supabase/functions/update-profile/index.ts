import { createUserClient, requireUser } from "../_shared/auth.ts";
import { errorResponse, handleOptionsRequest, parseJsonBody, successResponse } from "../_shared/http.ts";
import {
  assertBirthYear,
  assertLanguage,
  assertRegion,
  readOptionalNullableNumber,
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

    const displayName = readOptionalString(body, "display_name");
    const birthYear = assertBirthYear(readOptionalNullableNumber(body, "birth_year"));
    const countryCode = readOptionalString(body, "country_code");
    const provinceCode = readOptionalString(body, "province_code");
    const districtCode = readOptionalString(body, "district_code");
    const preferredLanguageRaw = readOptionalString(body, "preferred_language");
    const bio = readOptionalString(body, "bio");

    if (preferredLanguageRaw) {
      assertLanguage(preferredLanguageRaw);
    }

    if (countryCode || provinceCode || districtCode) {
      if (!countryCode || !provinceCode || !districtCode) {
        return errorResponse(
          "invalid_region_update",
          "country_code, province_code, district_code 는 함께 전달되어야 합니다.",
          400
        );
      }

      assertRegion(countryCode, provinceCode, districtCode);
    }

    const updatePayload: Record<string, string | number | null> = {};

    if (displayName !== undefined) {
      updatePayload.display_name = displayName;
    }

    if (birthYear !== undefined) {
      updatePayload.birth_year = birthYear;
    }

    if (countryCode !== undefined) {
      updatePayload.country_code = countryCode;
    }

    if (provinceCode !== undefined) {
      updatePayload.province_code = provinceCode;
    }

    if (districtCode !== undefined) {
      updatePayload.district_code = districtCode;
    }

    if (preferredLanguageRaw !== undefined) {
      updatePayload.preferred_language = preferredLanguageRaw;
    }

    if (bio !== undefined) {
      updatePayload.bio = bio;
    }

    if (Object.keys(updatePayload).length === 0) {
      return errorResponse("empty_update", "수정할 값이 없습니다.", 400);
    }

    const { data: existingProfile, error: existingProfileError } = await client
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (existingProfileError) {
      throw new Error(existingProfileError.message);
    }

    if (!existingProfile) {
      return errorResponse("profile_missing", "공통 프로필이 존재하지 않습니다.", 404);
    }

    const { data: updatedProfile, error: updateError } = await client
      .from("profiles")
      .update(updatePayload)
      .eq("id", user.id)
      .select("id")
      .single();

    if (updateError) {
      throw new Error(updateError.message);
    }

    return successResponse({
      profile_id: updatedProfile.id,
    });
  } catch (error: unknown) {
    return errorResponse(
      "update_profile_failed",
      error instanceof Error ? error.message : "프로필 수정에 실패했습니다.",
      400
    );
  }
});
