import { createServiceRoleClient, createUserClient, requireUser } from "../_shared/auth.ts";
import { errorResponse, handleOptionsRequest, successResponse } from "../_shared/http.ts";
import { readRequiredString } from "../_shared/validation.ts";

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function parseBody(request: Request): Promise<Record<string, unknown>> {
  const body = await request.json().catch(() => null);
  if (!isObjectRecord(body)) {
    throw new Error("INVALID_BODY");
  }
  return body;
}

function readFeeAmount(body: Record<string, unknown>): number {
  const value = typeof body.fee_amount === "number" ? Math.trunc(body.fee_amount) : typeof body.fee_amount === "string" ? Number.parseInt(body.fee_amount, 10) : Number.NaN;
  if (!Number.isFinite(value) || value < 0) {
    throw new Error("INVALID_FEE_AMOUNT");
  }
  return value;
}

async function getAssignment(client: ReturnType<typeof createServiceRoleClient>, assignmentId: string) {
  const { data, error } = await client
    .from("referee_assignments")
    .select("id, match_id, referee_id, requesting_team_id, status")
    .eq("id", assignmentId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }
  if (!data) {
    throw new Error("ASSIGNMENT_NOT_FOUND");
  }
  return data;
}

async function assertManagerRole(client: ReturnType<typeof createServiceRoleClient>, teamId: string, userId: string): Promise<void> {
  const { data, error } = await client
    .from("team_members")
    .select("role")
    .eq("team_id", teamId)
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }
  if (!data || (data.role !== "owner" && data.role !== "manager")) {
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
    const serviceClient = createServiceRoleClient();
    const body = await parseBody(request);
    const assignmentId = readRequiredString(body, "assignment_id");
    const note = typeof body.note === "string" && body.note.trim() ? body.note.trim() : null;
    const feeAmount = readFeeAmount(body);

    const assignment = await getAssignment(serviceClient, assignmentId);
    await assertManagerRole(serviceClient, assignment.requesting_team_id, user.id);

    const { data, error } = await serviceClient
      .from("referee_payment_records")
      .insert({
        assignment_id: assignmentId,
        fee_amount: feeAmount,
        note,
        created_by: user.id,
      })
      .select("id, assignment_id, fee_amount, note, paid_at, created_by")
      .single();

    if (error || !data) {
      return errorResponse("record_referee_payment_failed", error?.message ?? "Failed to record referee payment.", 400);
    }

    const updateResult = await serviceClient
      .from("referee_assignments")
      .update({ status: "completed", responded_at: new Date().toISOString() })
      .eq("id", assignmentId);

    if (updateResult.error) {
      return errorResponse("record_referee_payment_failed", updateResult.error.message, 400);
    }

    return successResponse(data, 201);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to record referee payment.";
    const code = ["ASSIGNMENT_NOT_FOUND", "NOT_MANAGER", "INVALID_FEE_AMOUNT"].includes(message)
      ? message
      : "record_referee_payment_failed";
    const status = message === "NOT_MANAGER" ? 403 : message === "ASSIGNMENT_NOT_FOUND" ? 404 : 400;
    return errorResponse(code, message, status);
  }
});
