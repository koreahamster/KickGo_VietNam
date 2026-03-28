import { createServiceRoleClient, createUserClient, requireUser } from "../_shared/auth.ts";
import { errorResponse, handleOptionsRequest, parseJsonBody, successResponse } from "../_shared/http.ts";

type RequestBody = {
  teamId: string;
  amount: number;
  description: string;
  usedAt: string;
};

function readBody(body: Record<string, unknown>): RequestBody {
  const teamId = typeof body.team_id === "string" ? body.team_id.trim() : "";
  const amount = typeof body.amount === "number" ? body.amount : NaN;
  const description = typeof body.description === "string" ? body.description.trim() : "";
  const usedAt = typeof body.used_at === "string" ? body.used_at.trim() : "";

  if (!teamId) {
    throw new Error("team_id is required.");
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("amount must be greater than zero.");
  }
  if (!description) {
    throw new Error("description is required.");
  }
  if (!usedAt || Number.isNaN(Date.parse(usedAt))) {
    throw new Error("used_at must be a valid date.");
  }

  return { teamId, amount, description, usedAt };
}

async function assertManagerRole(teamId: string, userId: string): Promise<void> {
  const serviceClient = createServiceRoleClient();
  const { data, error } = await serviceClient
    .from("team_members")
    .select("role")
    .eq("team_id", teamId)
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data || !["owner", "manager"].includes(String(data.role))) {
    throw new Error("NOT_MANAGER");
  }
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
    const body = await parseJsonBody(request);
    const input = readBody(body);

    await assertManagerRole(input.teamId, user.id);

    const serviceClient = createServiceRoleClient();
    const { data, error } = await serviceClient
      .from("team_fee_usages")
      .insert({
        team_id: input.teamId,
        amount: input.amount,
        description: input.description,
        used_at: input.usedAt,
        created_by: user.id,
      })
      .select("*")
      .single();

    if (error) {
      return errorResponse("record_fee_usage_failed", error.message, 400);
    }

    return successResponse(data, 201);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to record fee usage.";
    const code = message === "NOT_MANAGER" ? "NOT_MANAGER" : "record_fee_usage_failed";
    const status = message === "NOT_MANAGER" ? 403 : 400;
    return errorResponse(code, message, status);
  }
});