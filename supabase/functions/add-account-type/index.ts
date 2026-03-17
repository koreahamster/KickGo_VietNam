import { createUserClient, requireUser } from "../_shared/auth.ts";
import { errorResponse, handleOptionsRequest, parseJsonBody, successResponse } from "../_shared/http.ts";
import { assertAccountType, readRequiredString } from "../_shared/validation.ts";

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
    const type = assertAccountType(readRequiredString(body, "type"));

    const { data: profile, error: profileError } = await client
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      throw new Error(profileError.message);
    }

    if (!profile) {
      return errorResponse("profile_required", "공통 프로필 생성이 먼저 필요합니다.", 400);
    }

    const { data: existing, error: existingError } = await client
      .from("account_types")
      .select("user_id, type")
      .eq("user_id", user.id)
      .eq("type", type)
      .maybeSingle();

    if (existingError) {
      throw new Error(existingError.message);
    }

    if (existing) {
      return successResponse({
        user_id: user.id,
        type,
        existed: true,
      });
    }

    const { error: insertError } = await client.from("account_types").insert({
      user_id: user.id,
      type,
    });

    if (insertError) {
      throw new Error(insertError.message);
    }

    return successResponse({
      user_id: user.id,
      type,
      existed: false,
    }, 201);
  } catch (error: unknown) {
    return errorResponse(
      "add_account_type_failed",
      error instanceof Error ? error.message : "계정 역할 추가에 실패했습니다.",
      400
    );
  }
});
