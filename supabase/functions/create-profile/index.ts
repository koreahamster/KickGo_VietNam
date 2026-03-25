import { createUserClient, requireUser } from "../_shared/auth.ts";
import {
  errorResponse,
  handleOptionsRequest,
  parseJsonBody,
  successResponse,
} from "../_shared/http.ts";
import {
  assertAccountType,
  assertBirthYear,
  assertLanguage,
  assertRegion,
  assertVisibility,
  readOptionalNullableNumber,
  readOptionalString,
  readRequiredString,
} from "../_shared/validation.ts";

Deno.serve(async (request: Request): Promise<Response> => {
  const optionsResponse = handleOptionsRequest(request);

  if (optionsResponse) {
    return optionsResponse;
  }

  if (request.method !== "POST") {
    return errorResponse("method_not_allowed", "POST requests only.", 405);
  }

  try {
    const client = createUserClient(request);
    const user = await requireUser(client);
    const body = await parseJsonBody(request);

    const displayName = readRequiredString(body, "display_name");
    const birthYear = assertBirthYear(readOptionalNullableNumber(body, "birth_year"));
    const countryCode = readRequiredString(body, "country_code");
    const provinceCode = readRequiredString(body, "province_code");
    const districtCode = readRequiredString(body, "district_code");
    const preferredLanguage = assertLanguage(readRequiredString(body, "preferred_language"));
    const bio = readOptionalString(body, "bio") ?? "";
    const initialAccountType = assertAccountType(readRequiredString(body, "initial_account_type"));
    const visibility = assertVisibility(readOptionalString(body, "visibility") ?? "members_only");

    assertRegion(countryCode, provinceCode, districtCode);

    const { data: existingProfile, error: existingProfileError } = await client
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (existingProfileError) {
      console.error("[create-profile] existing_profile_query_failed", existingProfileError);
      return errorResponse(
        "existing_profile_query_failed",
        existingProfileError.message,
        400,
      );
    }

    if (existingProfile) {
      return errorResponse("profile_exists", "Common profile already exists.", 409);
    }

    const profilePayload = {
      id: user.id,
      display_name: displayName,
      birth_year: birthYear ?? null,
      bio,
      phone: user.phone ?? null,
      is_phone_verified: false,
      country_code: countryCode,
      province_code: provinceCode,
      district_code: districtCode,
      preferred_language: preferredLanguage,
      visibility,
    };

    const { data: insertedProfile, error: insertProfileError } = await client
      .from("profiles")
      .insert(profilePayload)
      .select("id")
      .single();

    if (insertProfileError) {
      console.error("[create-profile] profile_insert_failed", {
        message: insertProfileError.message,
        details: insertProfileError.details,
        hint: insertProfileError.hint,
        code: insertProfileError.code,
        payload: profilePayload,
      });
      return errorResponse("profile_insert_failed", insertProfileError.message, 400);
    }

    const rolePayload = {
      user_id: user.id,
      type: initialAccountType,
    };

    const { error: insertRoleError } = await client.from("account_types").insert(rolePayload);

    if (insertRoleError) {
      console.error("[create-profile] account_type_insert_failed", {
        message: insertRoleError.message,
        details: insertRoleError.details,
        hint: insertRoleError.hint,
        code: insertRoleError.code,
        payload: rolePayload,
      });

      const { error: rollbackError } = await client.from("profiles").delete().eq("id", user.id);

      if (rollbackError) {
        console.error("[create-profile] rollback_profile_delete_failed", rollbackError);
      }

      return errorResponse("account_type_insert_failed", insertRoleError.message, 400);
    }

    return successResponse(
      {
        profile_id: insertedProfile.id,
        account_type: initialAccountType,
        requires_role_onboarding: true,
      },
      201,
    );
  } catch (error: unknown) {
    console.error("[create-profile] unexpected_failure", error);
    return errorResponse(
      "create_profile_failed",
      error instanceof Error ? error.message : "Failed to create common profile.",
      400,
    );
  }
});