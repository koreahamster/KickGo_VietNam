import { createServiceRoleClient, createUserClient, requireUser } from "../_shared/auth.ts";
import { errorResponse, handleOptionsRequest, parseJsonBody, successResponse } from "../_shared/http.ts";
import { assertRegion, readOptionalString, readRequiredString } from "../_shared/validation.ts";

function assertTeamName(value: string): string {
  const trimmed = value.trim();

  if (trimmed.length < 2 || trimmed.length > 40) {
    throw new Error("name must be between 2 and 40 characters.");
  }

  return trimmed;
}

function assertDescriptionLength(value: string | undefined): string | null {
  if (!value) {
    return null;
  }

  if (value.length > 255) {
    throw new Error("description must be 255 characters or fewer.");
  }

  return value;
}

function assertOptionalUrl(value: string | undefined): string | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = new URL(value);
    return parsed.toString();
  } catch {
    throw new Error("emblem_url must be a valid URL.");
  }
}

function assertBoolean(value: unknown, fieldName: string): boolean {
  if (typeof value !== "boolean") {
    throw new Error(`${fieldName} must be a boolean.`);
  }

  return value;
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
    const name = assertTeamName(readRequiredString(body, "name"));
    const description = assertDescriptionLength(readOptionalString(body, "description"));
    const emblemUrl = assertOptionalUrl(readOptionalString(body, "emblem_url"));
    const isRecruiting = assertBoolean(body.is_recruiting, "is_recruiting");
    const provinceCode = readRequiredString(body, "province_code");
    const districtCode = readRequiredString(body, "district_code");

    assertRegion("VN", provinceCode, districtCode);

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

    if (!membership || (membership.role !== "owner" && membership.role !== "manager")) {
      return errorResponse("NOT_MANAGER", "Manager or owner role is required.", 403);
    }

    const { data: updatedTeam, error: updateError } = await serviceClient
      .from("teams")
      .update({
        name,
        description,
        emblem_url: emblemUrl,
        is_recruiting: isRecruiting,
        province_code: provinceCode,
        district_code: districtCode,
        country_code: "VN",
      })
      .eq("id", teamId)
      .select("id, name, description, emblem_url, is_recruiting, recruitment_status, province_code, district_code")
      .single();

    if (updateError) {
      return errorResponse("team_update_failed", updateError.message, 400);
    }

    return successResponse({
      team_id: updatedTeam.id,
      name: updatedTeam.name,
      description: updatedTeam.description,
      emblem_url: updatedTeam.emblem_url,
      is_recruiting: updatedTeam.is_recruiting,
      recruitment_status: updatedTeam.recruitment_status,
      province_code: updatedTeam.province_code,
      district_code: updatedTeam.district_code,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unexpected error.";
    return errorResponse("update_team_failed", message, 400);
  }
});
