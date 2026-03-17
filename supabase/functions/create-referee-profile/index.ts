import { createUserClient, requireUser } from "../_shared/auth.ts";
import { errorResponse, handleOptionsRequest, successResponse } from "../_shared/http.ts";

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

    const { data: role, error: roleError } = await client
      .from("account_types")
      .select("user_id")
      .eq("user_id", user.id)
      .eq("type", "referee")
      .maybeSingle();

    if (roleError) {
      throw new Error(roleError.message);
    }

    if (!role) {
      return errorResponse("referee_role_required", "referee 역할이 먼저 필요합니다.", 400);
    }

    const { data: existing, error: existingError } = await client
      .from("referee_profiles")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingError) {
      throw new Error(existingError.message);
    }

    if (existing) {
      return successResponse({
        user_id: user.id,
        existed: true,
      });
    }

    const { error: insertError } = await client.from("referee_profiles").insert({
      user_id: user.id,
    });

    if (insertError) {
      throw new Error(insertError.message);
    }

    return successResponse({
      user_id: user.id,
      existed: false,
    }, 201);
  } catch (error: unknown) {
    return errorResponse(
      "create_referee_profile_failed",
      error instanceof Error ? error.message : "심판 프로필 생성에 실패했습니다.",
      400
    );
  }
});
