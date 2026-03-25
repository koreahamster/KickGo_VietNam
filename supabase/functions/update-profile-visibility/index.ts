import { createUserClient, requireUser } from "../_shared/auth.ts";
import { errorResponse, handleOptionsRequest, parseJsonBody, successResponse } from "../_shared/http.ts";
import { assertVisibility, readRequiredString } from "../_shared/validation.ts";

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
    const visibility = assertVisibility(readRequiredString(body, "visibility"));

    const { data: existingProfile, error: existingProfileError } = await client
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (existingProfileError) {
      throw new Error(existingProfileError.message);
    }

    if (!existingProfile) {
      return errorResponse("profile_missing", "Common profile does not exist.", 404);
    }

    const { data: updatedProfile, error: updateError } = await client
      .from("profiles")
      .update({ visibility })
      .eq("id", user.id)
      .select("id, visibility")
      .single();

    if (updateError) {
      throw new Error(updateError.message);
    }

    return successResponse(
      {
        profile_id: updatedProfile.id,
        visibility: updatedProfile.visibility,
      },
      200,
    );
  } catch (error: unknown) {
    return errorResponse(
      "update_profile_visibility_failed",
      error instanceof Error ? error.message : "Failed to update profile visibility.",
      400,
    );
  }
});