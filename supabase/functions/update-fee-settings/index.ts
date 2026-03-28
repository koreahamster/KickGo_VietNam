import { createServiceRoleClient, createUserClient, requireUser } from "../_shared/auth.ts";
import { errorResponse, handleOptionsRequest, parseJsonBody, successResponse } from "../_shared/http.ts";

const ALLOWED_FEE_TYPES = ["monthly", "per_match", "mixed"] as const;
type FeeType = (typeof ALLOWED_FEE_TYPES)[number];

type RequestBody = {
  teamId: string;
  feeType: FeeType;
  monthlyAmount: number;
  perMatchAmount: number;
};

function readBody(body: Record<string, unknown>): RequestBody {
  const teamId = typeof body.team_id === "string" ? body.team_id.trim() : "";
  const feeType = typeof body.fee_type === "string" ? body.fee_type.trim() : "";
  const monthlyAmount = typeof body.monthly_amount === "number" ? body.monthly_amount : NaN;
  const perMatchAmount = typeof body.per_match_amount === "number" ? body.per_match_amount : NaN;

  if (!teamId) {
    throw new Error("team_id is required.");
  }

  if (!ALLOWED_FEE_TYPES.includes(feeType as FeeType)) {
    throw new Error("fee_type is invalid.");
  }

  if (!Number.isFinite(monthlyAmount) || monthlyAmount < 0) {
    throw new Error("monthly_amount must be a non-negative number.");
  }

  if (!Number.isFinite(perMatchAmount) || perMatchAmount < 0) {
    throw new Error("per_match_amount must be a non-negative number.");
  }

  return {
    teamId,
    feeType: feeType as FeeType,
    monthlyAmount,
    perMatchAmount,
  };
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
      .from("team_fee_settings")
      .upsert(
        {
          team_id: input.teamId,
          fee_type: input.feeType,
          monthly_amount: input.monthlyAmount,
          per_match_amount: input.perMatchAmount,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "team_id" },
      )
      .select("*")
      .single();

    if (error) {
      return errorResponse("update_fee_settings_failed", error.message, 400);
    }

    return successResponse(data, 200);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update fee settings.";
    const code = message === "NOT_MANAGER" ? "NOT_MANAGER" : "update_fee_settings_failed";
    const status = message === "NOT_MANAGER" ? 403 : 400;
    return errorResponse(code, message, status);
  }
});