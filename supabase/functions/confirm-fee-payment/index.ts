import { createServiceRoleClient, createUserClient, requireUser } from "../_shared/auth.ts";
import { errorResponse, handleOptionsRequest, parseJsonBody, successResponse } from "../_shared/http.ts";

type ConfirmFeeInput = {
  feeRecordId: string | null;
  teamId: string | null;
  userId: string | null;
  feeType: "monthly" | "per_match" | null;
  yearMonth: string | null;
  matchId: string | null;
  amount: number | null;
  note: string | null;
};

type FeeRecordRow = {
  id: string;
  team_id: string;
  user_id: string;
  fee_type: "monthly" | "per_match";
  year_month: string | null;
  match_id: string | null;
  amount: number;
};

function isUuidLike(value: string | null): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

function readBody(body: Record<string, unknown>): ConfirmFeeInput {
  const feeRecordId = typeof body.fee_record_id === "string" && body.fee_record_id.trim().length > 0 ? body.fee_record_id.trim() : null;
  const teamId = typeof body.team_id === "string" && body.team_id.trim().length > 0 ? body.team_id.trim() : null;
  const userId = typeof body.user_id === "string" && body.user_id.trim().length > 0 ? body.user_id.trim() : null;
  const feeType = body.fee_type === "monthly" || body.fee_type === "per_match" ? body.fee_type : null;
  const yearMonth = typeof body.year_month === "string" && body.year_month.trim().length > 0 ? body.year_month.trim() : null;
  const matchId = typeof body.match_id === "string" && body.match_id.trim().length > 0 ? body.match_id.trim() : null;
  const amount = typeof body.amount === "number" && Number.isFinite(body.amount) ? body.amount : null;
  const note = typeof body.note === "string" && body.note.trim().length > 0 ? body.note.trim() : null;

  if (!feeRecordId && (!teamId || !userId || !feeType || amount === null)) {
    throw new Error("MISSING_FEE_RECORD_CONTEXT");
  }

  if (feeType === "monthly" && !feeRecordId && !yearMonth) {
    throw new Error("YEAR_MONTH_REQUIRED");
  }

  if (feeType === "per_match" && !feeRecordId && !matchId) {
    throw new Error("MATCH_ID_REQUIRED");
  }

  if (amount !== null && amount < 0) {
    throw new Error("INVALID_AMOUNT");
  }

  return {
    feeRecordId,
    teamId,
    userId,
    feeType,
    yearMonth,
    matchId,
    amount,
    note,
  };
}

async function assertManagerForTeam(teamId: string, userId: string): Promise<void> {
  const serviceClient = createServiceRoleClient();
  const { data: membership, error } = await serviceClient
    .from("team_members")
    .select("role")
    .eq("team_id", teamId)
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!membership || !["owner", "manager"].includes(String(membership.role))) {
    throw new Error("NOT_MANAGER");
  }
}

async function getExistingFeeRecord(input: ConfirmFeeInput): Promise<FeeRecordRow | null> {
  const serviceClient = createServiceRoleClient();

  if (input.feeRecordId) {
    const { data, error } = await serviceClient
      .from("team_fee_records")
      .select("id, team_id, user_id, fee_type, year_month, match_id, amount")
      .eq("id", input.feeRecordId)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (data) {
      return data as FeeRecordRow;
    }
  }

  if (!input.teamId || !input.userId || !input.feeType) {
    return null;
  }

  let query = serviceClient
    .from("team_fee_records")
    .select("id, team_id, user_id, fee_type, year_month, match_id, amount")
    .eq("team_id", input.teamId)
    .eq("user_id", input.userId)
    .eq("fee_type", input.feeType);

  if (input.feeType === "monthly") {
    query = query.eq("year_month", input.yearMonth);
  } else {
    query = query.eq("match_id", input.matchId);
  }

  const { data, error } = await query.maybeSingle();
  if (error) {
    throw new Error(error.message);
  }

  return (data as FeeRecordRow | null) ?? null;
}

async function createMissingFeeRecord(input: ConfirmFeeInput): Promise<FeeRecordRow> {
  if (!input.teamId || !input.userId || !input.feeType || input.amount === null) {
    throw new Error("MISSING_FEE_RECORD_CONTEXT");
  }

  const serviceClient = createServiceRoleClient();
  const { data, error } = await serviceClient
    .from("team_fee_records")
    .insert({
      team_id: input.teamId,
      user_id: input.userId,
      fee_type: input.feeType,
      year_month: input.feeType === "monthly" ? input.yearMonth : null,
      match_id: input.feeType === "per_match" ? input.matchId : null,
      amount: input.amount,
      is_paid: false,
    })
    .select("id, team_id, user_id, fee_type, year_month, match_id, amount")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "CREATE_FEE_RECORD_FAILED");
  }

  return data as FeeRecordRow;
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

    let feeRecord = await getExistingFeeRecord(input);

    const targetTeamId = feeRecord?.team_id ?? input.teamId;
    if (!isUuidLike(targetTeamId)) {
      throw new Error("TEAM_ID_REQUIRED");
    }

    await assertManagerForTeam(targetTeamId, user.id);

    if (!feeRecord) {
      feeRecord = await createMissingFeeRecord(input);
    }

    const serviceClient = createServiceRoleClient();
    const { data, error } = await serviceClient
      .from("team_fee_records")
      .update({
        is_paid: true,
        paid_at: new Date().toISOString(),
        confirmed_by: user.id,
        note: input.note,
      })
      .eq("id", feeRecord.id)
      .select("*")
      .single();

    if (error || !data) {
      return errorResponse("confirm_fee_payment_failed", error?.message ?? "Failed to confirm fee payment.", 400);
    }

    return successResponse(data, 200);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to confirm fee payment.";
    const code = message === "NOT_MANAGER" ? "NOT_MANAGER" : "confirm_fee_payment_failed";
    const status = message === "NOT_MANAGER" ? 403 : 400;
    return errorResponse(code, message, status);
  }
});
